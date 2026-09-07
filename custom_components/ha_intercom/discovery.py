"""Umgebung erkennen und Voraussetzungen pruefen, fuer den Konfigurationsdialog und die Karte."""

from __future__ import annotations

import asyncio
import json
import logging
import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import (
    ASTERISK_DOMAIN,
    ASTERISK_SERVICE,
    CHECK_TIMEOUT,
    DEFAULT_AMI_CONNECTED_ENTITY,
    FFMPEG,
    FFPROBE,
    SIP_CORE_DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

_HEX_ID = re.compile(r"^[0-9a-f]{32}$")
EXTENSION = re.compile(r"^[0-9*#+]{1,24}$")
_STATE_ID = re.compile(r"^sensor\.([0-9]+)_state$")


@dataclass
class Umgebung:
    """Was auf diesem Home Assistant gefunden wurde."""

    supervisor: bool = False
    addons: list[tuple[str, str]] = field(default_factory=list)
    asterisk_service: bool = False
    asterisk_entry: bool = False
    sip_core: bool = False
    sip_extensions: list[str] = field(default_factory=list)
    sip_door: str | None = None
    asterisk_extensions: list[str] = field(default_factory=list)
    ami_entity: str | None = None

    @property
    def asterisk(self) -> bool:
        return self.asterisk_service or self.asterisk_entry

    @property
    def addon_slug(self) -> str | None:
        return self.addons[0][0] if self.addons else None

    @property
    def extensions(self) -> list[str]:
        return sorted_extensions(set(self.sip_extensions) | set(self.asterisk_extensions))


def sorted_extensions(values: Any) -> list[str]:
    return sorted((str(v) for v in values if v), key=lambda v: (len(v), v))


def _is_hassio(hass: HomeAssistant) -> bool:
    try:
        from homeassistant.helpers.hassio import is_hassio
    except ImportError:  # pragma: no cover - aeltere Versionen
        try:
            from homeassistant.components.hassio import is_hassio  # type: ignore[no-redef]
        except ImportError:
            return False
    try:
        return bool(is_hassio(hass))
    except Exception:  # noqa: BLE001
        return False


def _asterisk_addons(hass: HomeAssistant) -> list[tuple[str, str]]:
    """Installierte Apps, deren Slug oder Name Asterisk enthaelt, als (slug, name)."""
    try:
        from homeassistant.components.hassio import get_addons_info, get_supervisor_info
    except ImportError:
        return []
    candidates: list[dict[str, Any]] = []
    try:
        info = get_supervisor_info(hass) or {}
        candidates.extend(a for a in info.get("addons") or [] if isinstance(a, dict))
        addons = get_addons_info(hass) or {}
        candidates.extend(a for a in addons.values() if isinstance(a, dict))
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Supervisor-Auskunft nicht lesbar: %s", err)
        return []
    found: dict[str, str] = {}
    for addon in candidates:
        slug = str(addon.get("slug") or "")
        name = str(addon.get("name") or slug)
        if slug and ("asterisk" in slug.lower() or "asterisk" in name.lower()):
            found.setdefault(slug, name)
    return sorted(found.items())


async def _sip_core(hass: HomeAssistant) -> tuple[bool, list[str], str | None]:
    """sip-core vorhanden? Nebenstellen aus dessen Konfiguration; Nebenstelle ohne HA-Benutzer = Tuerstation."""
    entries = hass.config_entries.async_entries(SIP_CORE_DOMAIN)
    if not entries:
        return False, [], None
    known: set[str] = set()
    try:
        for user in await hass.auth.async_get_users():
            known.add(user.id)
            if user.name:
                known.add(user.name.lower())
            for cred in user.credentials:
                username = (cred.data or {}).get("username")
                if username:
                    known.add(str(username).lower())
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Benutzerliste nicht lesbar: %s", err)
    extensions: set[str] = set()
    strangers: list[str] = []
    for entry in entries:
        cfg: dict[str, Any] = {**entry.data, **entry.options}
        sip = cfg.get("sip_config") if isinstance(cfg.get("sip_config"), dict) else cfg
        for user in sip.get("users") or []:
            if not isinstance(user, dict):
                continue
            ext = str(user.get("extension") or "").strip()
            if not EXTENSION.match(ext):
                continue
            extensions.add(ext)
            owner = str(user.get("ha_username") or "")
            if owner and owner not in known and owner.lower() not in known and not _HEX_ID.match(owner):
                strangers.append(ext)
    door = strangers[0] if len(strangers) == 1 else None
    return True, sorted_extensions(extensions), door


@callback
def _registry_entity(hass: HomeAssistant, domain: str, suffix: str) -> str | None:
    registry = er.async_get(hass)
    want = f"_{suffix}"
    for entry in registry.entities.values():
        if entry.platform == ASTERISK_DOMAIN and entry.domain == domain and str(entry.unique_id or "").endswith(want):
            return entry.entity_id
    return None


@callback
def state_entity(hass: HomeAssistant, ext: str) -> str | None:
    """Zustandssensor einer Nebenstelle (Asterisk-Integration)."""
    found = _registry_entity(hass, "sensor", f"{ext}_state")
    if found:
        return found
    guess = f"sensor.{ext}_state"
    return guess if hass.states.get(guess) is not None else None


@callback
def registered_entity(hass: HomeAssistant, ext: str) -> str | None:
    found = _registry_entity(hass, "binary_sensor", f"{ext}_registered")
    if found:
        return found
    guess = f"binary_sensor.{ext}_registered"
    return guess if hass.states.get(guess) is not None else None


@callback
def ami_entity(hass: HomeAssistant) -> str | None:
    found = _registry_entity(hass, "binary_sensor", "connected")
    if found:
        return found
    return DEFAULT_AMI_CONNECTED_ENTITY if hass.states.get(DEFAULT_AMI_CONNECTED_ENTITY) is not None else None


@callback
def asterisk_extensions(hass: HomeAssistant) -> list[str]:
    """Nebenstellen, fuer die die Asterisk-Integration einen Zustandssensor fuehrt."""
    found: set[str] = set()
    registry = er.async_get(hass)
    for entry in registry.entities.values():
        if entry.platform != ASTERISK_DOMAIN or entry.domain != "sensor":
            continue
        uid = str(entry.unique_id or "")
        if not uid.endswith("_state"):
            continue
        ext = uid[: -len("_state")].rsplit("_", 1)[-1]
        if EXTENSION.match(ext):
            found.add(ext)
    for state in hass.states.async_all("sensor"):
        m = _STATE_ID.match(state.entity_id)
        if m:
            found.add(m.group(1))
    return sorted_extensions(found)


@callback
def asterisk_endpoints(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Nebenstellen mit vorhandenem Zustandssensor; Name = vom Benutzer vergebener Geraetename, sonst leer."""
    registry = er.async_get(hass)
    devices = dr.async_get(hass)
    found: dict[str, dict[str, Any]] = {}
    for entry in registry.entities.values():
        if entry.platform != ASTERISK_DOMAIN or entry.domain != "sensor":
            continue
        uid = str(entry.unique_id or "")
        if not uid.endswith("_state"):
            continue
        ext = uid[: -len("_state")].rsplit("_", 1)[-1]
        if not EXTENSION.match(ext) or hass.states.get(entry.entity_id) is None:
            continue
        name = None
        if entry.device_id and (device := devices.async_get(entry.device_id)):
            name = device.name_by_user or None
        found[ext] = {
            "extension": ext,
            "name": name,
            "state_entity": entry.entity_id,
            "registered_entity": registered_entity(hass, ext),
        }
    for state in hass.states.async_all("sensor"):
        m = _STATE_ID.match(state.entity_id)
        if m and m.group(1) not in found:
            ext = m.group(1)
            found[ext] = {
                "extension": ext,
                "name": None,
                "state_entity": state.entity_id,
                "registered_entity": registered_entity(hass, ext),
            }
    return [found[ext] for ext in sorted_extensions(found)]


async def async_discover(hass: HomeAssistant) -> Umgebung:
    """Alles einsammeln, was der Dialog vorbelegen oder pruefen kann."""
    env = Umgebung()
    env.supervisor = _is_hassio(hass)
    env.addons = _asterisk_addons(hass) if env.supervisor else []
    env.asterisk_service = hass.services.has_service(ASTERISK_DOMAIN, ASTERISK_SERVICE)
    env.asterisk_entry = bool(hass.config_entries.async_entries(ASTERISK_DOMAIN))
    env.sip_core, env.sip_extensions, env.sip_door = await _sip_core(hass)
    env.asterisk_extensions = asterisk_extensions(hass)
    env.ami_entity = ami_entity(hass)
    return env


# ------------------------------------------------------------------ Pruefungen


async def async_check_ffmpeg(hass: HomeAssistant) -> tuple[bool, str]:
    ff, fp = await hass.async_add_executor_job(lambda: (shutil.which(FFMPEG), shutil.which(FFPROBE)))
    if ff and fp:
        return True, ff
    return False, FFPROBE if ff else FFMPEG


async def async_check_stream(url: str) -> tuple[bool, str]:
    """Stream kurz mit ffprobe abfragen; liefert die gefundenen Spuren."""
    if not url:
        return False, "leer"
    cmd = [FFPROBE, "-v", "error"]
    if url.lower().startswith("rtsp"):
        cmd += ["-rtsp_transport", "tcp"]
    cmd += ["-show_entries", "stream=codec_type,codec_name,width,height,sample_rate", "-of", "json", "-i", url]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
    except OSError as err:
        return False, str(err)
    try:
        out, err = await asyncio.wait_for(proc.communicate(), CHECK_TIMEOUT)
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()
        return False, f"keine Antwort in {CHECK_TIMEOUT} s"
    if proc.returncode != 0:
        lines = [line.strip() for line in err.decode(errors="replace").splitlines() if line.strip()]
        return False, (lines[-1] if lines else f"ffprobe Rückgabe {proc.returncode}")[:160]
    parts: list[str] = []
    try:
        for stream in json.loads(out.decode(errors="replace") or "{}").get("streams") or []:
            if stream.get("codec_type") == "video":
                parts.append(f"{stream.get('codec_name')} {stream.get('width')}x{stream.get('height')}")
            elif stream.get("codec_type") == "audio":
                parts.append(f"{stream.get('codec_name')} {stream.get('sample_rate')} Hz")
    except ValueError:
        pass
    return True, ", ".join(parts) or "erreichbar"


async def async_check_dir(hass: HomeAssistant, base: str) -> tuple[bool, str]:
    def _probe() -> str:
        path = Path(base).expanduser()
        path.mkdir(parents=True, exist_ok=True)
        test = path / ".schreibtest"
        test.write_text("ok", encoding="utf-8")
        test.unlink()
        return str(path)

    try:
        return True, await hass.async_add_executor_job(_probe)
    except OSError as err:
        return False, str(err)


@callback
def ami_connected(hass: HomeAssistant, entity_id: str | None) -> bool | None:
    if not entity_id:
        return None
    state = hass.states.get(entity_id)
    if state is None:
        return None
    return state.state == "on"

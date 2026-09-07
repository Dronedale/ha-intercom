"""Konfigurationsdialog der Intercom-Integration.

Schritte: Voraussetzungen (erkannt), Quellen, Sprechanlage, ggf. Zustandssensoren, Haus, Pruefung.
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import selector

from .const import (
    CONF_ADDON_SLUG,
    CONF_ALARM_ENTITY,
    CONF_AMI_CONNECTED_ENTITY,
    CONF_BASE_DIR,
    CONF_CAMERA_ENTITY,
    CONF_DOOR_STATE_ENTITY,
    CONF_EXT_DOOR,
    CONF_EXT_TABLET,
    CONF_IDLE_STATE,
    CONF_IGNORE_STREAM,
    CONF_IN_USE_STATE,
    CONF_LOCK_ENTITY,
    CONF_MAX_CLIP_SECONDS,
    CONF_MOVE_FILES,
    DIR_ANSAGE,
    DIR_FREIZEICHEN,
    DIR_FREIZEICHEN_AKTIV,
    DIR_KLINGELTOENE,
    DIR_KONVERTIERT,
    DIR_MAILBOX,
    CONF_SNAPSHOT_DELAY,
    CONF_STREAM_URL,
    CONF_TABLET_STATE_ENTITY,
    CONF_TRIGGER_ENTITY,
    CONF_TRIGGER_STATE,
    DEFAULT_BASE_DIR,
    DEFAULT_EXT_DOOR,
    DEFAULT_EXT_TABLET,
    DEFAULT_IDLE_STATE,
    DEFAULT_IN_USE_STATE,
    DEFAULT_MAX_CLIP_SECONDS,
    DEFAULT_SNAPSHOT_DELAY,
    DEFAULT_STREAM_URL,
    DEFAULT_TRIGGER_STATE,
    DOMAIN,
)
from .discovery import (
    Umgebung,
    ami_connected,
    async_check_dir,
    async_check_ffmpeg,
    async_check_stream,
    async_discover,
    state_entity,
)

TEXT = selector.TextSelector()
BOOL = selector.BooleanSelector()
ENTITY_STATE = selector.EntitySelector(selector.EntitySelectorConfig(domain=["sensor", "binary_sensor", "event"]))
ENTITY_SENSOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor"))
ENTITY_BINARY = selector.EntitySelector(selector.EntitySelectorConfig(domain="binary_sensor"))
ENTITY_CAMERA = selector.EntitySelector(selector.EntitySelectorConfig(domain="camera"))
ENTITY_ALARM = selector.EntitySelector(selector.EntitySelectorConfig(domain="alarm_control_panel"))
ENTITY_LOCK = selector.EntitySelector(selector.EntitySelectorConfig(domain="lock"))

RING_HINTS = ("klingel", "doorbell", "tuer", "door", "vto")
CAMERA_HINTS = ("doorbell", "klingel", "tuer", "door", "vto", "haus")

OK = "✓"
BAD = "✗"
NONE = "–"


def _req(key: str, defaults: dict[str, Any], fallback: Any = None) -> vol.Required:
    value = defaults.get(key, fallback)
    if value is None:
        return vol.Required(key)
    return vol.Required(key, default=value)


def _opt(key: str, defaults: dict[str, Any], fallback: Any = None) -> vol.Optional:
    """Optionales Feld: Vorschlag statt Vorgabe, damit ein leeres Feld nicht als None validiert wird."""
    value = defaults.get(key, fallback)
    if value in (None, ""):
        return vol.Optional(key)
    return vol.Optional(key, description={"suggested_value": value})


def _select(options: list[tuple[str, str]], custom: bool = True) -> selector.SelectSelector:
    return selector.SelectSelector(
        selector.SelectSelectorConfig(
            options=[selector.SelectOptionDict(value=value, label=label) for value, label in options],
            mode=selector.SelectSelectorMode.DROPDOWN,
            custom_value=custom,
        )
    )


def _guess(hass: HomeAssistant, domains: tuple[str, ...], hints: tuple[str, ...]) -> str | None:
    """Erste Entitaet, deren ID einen der Hinweise enthaelt; Reihenfolge der Hinweise = Vorrang."""
    ids = [s.entity_id for s in hass.states.async_all(domains)]
    for hint in hints:
        for entity_id in sorted(ids):
            if hint in entity_id.lower():
                return entity_id
    return None


def _ext_label(ext: str, env: Umgebung) -> str:
    tags = []
    if ext in env.sip_extensions:
        tags.append("sip-core")
    if ext in env.asterisk_extensions:
        tags.append("Asterisk")
    return f"{ext} ({', '.join(tags)})" if tags else ext


def _schema_quellen(hass: HomeAssistant, defaults: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            _req(CONF_TRIGGER_ENTITY, defaults, _guess(hass, ("sensor", "binary_sensor", "event"), RING_HINTS)): ENTITY_STATE,
            _req(CONF_TRIGGER_STATE, defaults, DEFAULT_TRIGGER_STATE): TEXT,
            _opt(CONF_CAMERA_ENTITY, defaults, _guess(hass, ("camera",), CAMERA_HINTS)): ENTITY_CAMERA,
            _req(CONF_STREAM_URL, defaults, DEFAULT_STREAM_URL): TEXT,
        }
    )


def _schema_sip(defaults: dict[str, Any], env: Umgebung) -> vol.Schema:
    exts = env.extensions
    ext_sel: Any = _select([(e, _ext_label(e, env)) for e in exts]) if exts else TEXT
    door = defaults.get(CONF_EXT_DOOR) or env.sip_door or (DEFAULT_EXT_DOOR if not exts or DEFAULT_EXT_DOOR in exts else exts[-1])
    tablet = defaults.get(CONF_EXT_TABLET) or (
        DEFAULT_EXT_TABLET if not exts or DEFAULT_EXT_TABLET in exts else next((e for e in exts if e != door), exts[0])
    )
    fields: dict[Any, Any] = {
        vol.Required(CONF_EXT_DOOR, default=door): ext_sel,
        vol.Required(CONF_EXT_TABLET, default=tablet): ext_sel,
    }
    if env.addons:
        current = defaults.get(CONF_ADDON_SLUG)
        chosen = current if current in dict(env.addons) else env.addon_slug
        fields[vol.Required(CONF_ADDON_SLUG, default=chosen)] = _select([(s, f"{n} ({s})") for s, n in env.addons], custom=False)
    elif not env.supervisor:
        fields[_opt(CONF_ADDON_SLUG, defaults)] = TEXT
    return vol.Schema(fields)


def _schema_sensoren(defaults: dict[str, Any], missing: list[str]) -> vol.Schema:
    fields: dict[Any, Any] = {}
    if CONF_DOOR_STATE_ENTITY in missing:
        fields[_opt(CONF_DOOR_STATE_ENTITY, defaults)] = ENTITY_SENSOR
    if CONF_TABLET_STATE_ENTITY in missing:
        fields[_opt(CONF_TABLET_STATE_ENTITY, defaults)] = ENTITY_SENSOR
    if CONF_AMI_CONNECTED_ENTITY in missing:
        fields[_opt(CONF_AMI_CONNECTED_ENTITY, defaults)] = ENTITY_BINARY
    return vol.Schema(fields)


def _schema_haus(defaults: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            _opt(CONF_ALARM_ENTITY, defaults): ENTITY_ALARM,
            _opt(CONF_LOCK_ENTITY, defaults): ENTITY_LOCK,
            vol.Required(CONF_BASE_DIR, default=defaults.get(CONF_BASE_DIR, DEFAULT_BASE_DIR)): TEXT,
        }
    )


def _schema_pruefung(stream_failed: bool) -> vol.Schema:
    if not stream_failed:
        return vol.Schema({})
    return vol.Schema({vol.Optional(CONF_IGNORE_STREAM, default=False): BOOL})


def _schema_options(defaults: dict[str, Any], env: Umgebung) -> vol.Schema:
    fields: dict[Any, Any] = {_req(CONF_STREAM_URL, defaults, DEFAULT_STREAM_URL): TEXT}
    if env.addons:
        current = defaults.get(CONF_ADDON_SLUG)
        chosen = current if current in dict(env.addons) else env.addon_slug
        fields[vol.Required(CONF_ADDON_SLUG, default=chosen)] = _select([(s, f"{n} ({s})") for s, n in env.addons], custom=False)
    else:
        fields[_opt(CONF_ADDON_SLUG, defaults)] = TEXT
    fields.update(
        {
            _opt(CONF_ALARM_ENTITY, defaults): ENTITY_ALARM,
            _opt(CONF_LOCK_ENTITY, defaults): ENTITY_LOCK,
            vol.Required(CONF_BASE_DIR, default=defaults.get(CONF_BASE_DIR, DEFAULT_BASE_DIR)): TEXT,
            vol.Required(
                CONF_MAX_CLIP_SECONDS, default=defaults.get(CONF_MAX_CLIP_SECONDS, DEFAULT_MAX_CLIP_SECONDS)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=30, max=600, step=5, unit_of_measurement="s", mode=selector.NumberSelectorMode.BOX)
            ),
            vol.Required(
                CONF_SNAPSHOT_DELAY, default=defaults.get(CONF_SNAPSHOT_DELAY, DEFAULT_SNAPSHOT_DELAY)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(min=0, max=10, step=0.5, unit_of_measurement="s", mode=selector.NumberSelectorMode.BOX)
            ),
            vol.Required(CONF_IDLE_STATE, default=defaults.get(CONF_IDLE_STATE, DEFAULT_IDLE_STATE)): TEXT,
            vol.Required(CONF_IN_USE_STATE, default=defaults.get(CONF_IN_USE_STATE, DEFAULT_IN_USE_STATE)): TEXT,
        }
    )
    return vol.Schema(fields)


def _voraussetzungen(env: Umgebung) -> dict[str, str]:
    """Platzhalter fuer den ersten Schritt."""
    if env.addons:
        app = f"{OK} " + ", ".join(f"{name} ({slug})" for slug, name in env.addons)
    elif env.supervisor:
        app = f"{BAD}"
    else:
        app = f"{NONE} kein Supervisor"
    asterisk = f"{OK} asterisk.send_action" if env.asterisk_service else (f"{OK}" if env.asterisk_entry else BAD)
    if env.sip_core:
        sip = f"{OK} " + (", ".join(env.sip_extensions) if env.sip_extensions else "")
    else:
        sip = BAD
    return {"app": app, "asterisk": asterisk, "sip": sip.strip()}


_LOGGER = logging.getLogger(__name__)

MEDIA_SUBDIRS = (
    DIR_MAILBOX,
    DIR_ANSAGE,
    DIR_FREIZEICHEN,
    f"{DIR_FREIZEICHEN}/{DIR_KONVERTIERT}",
    f"{DIR_FREIZEICHEN}/{DIR_FREIZEICHEN_AKTIV}",
    DIR_KLINGELTOENE,
)


def _count_media(base: str) -> dict[str, int]:
    """Bestand im Basisordner: Nachrichten, Ansagen, Freizeichen-Quellen und alle Dateien insgesamt."""
    root = Path(base)
    mailbox, ansage, freizeichen = root / DIR_MAILBOX, root / DIR_ANSAGE, root / DIR_FREIZEICHEN
    counts = {
        DIR_MAILBOX: len(list(mailbox.glob("*.json"))) if mailbox.is_dir() else 0,
        DIR_ANSAGE: len(list(ansage.glob("*.wav"))) if ansage.is_dir() else 0,
        DIR_FREIZEICHEN: sum(1 for p in freizeichen.iterdir() if p.is_file()) if freizeichen.is_dir() else 0,
    }
    counts["gesamt"] = sum(
        1 for sub in MEDIA_SUBDIRS if (root / sub).is_dir() for p in (root / sub).iterdir() if p.is_file()
    )
    return counts


def _move_media(old: str, new: str) -> int:
    """Dateien der Medienordner in den neuen Basisordner verschieben; gleichnamige Dateien im Ziel bleiben."""
    src, dst = Path(old), Path(new)
    moved = 0
    for sub in MEDIA_SUBDIRS:
        s, d = src / sub, dst / sub
        if not s.is_dir():
            continue
        d.mkdir(parents=True, exist_ok=True)
        for f in sorted(s.iterdir()):
            if not f.is_file():
                continue
            target = d / f.name
            if target.exists():
                continue
            shutil.move(str(f), str(target))
            moved += 1
    return moved


class IntercomConfigFlow(ConfigFlow, domain=DOMAIN):
    """Dialog mit Erkennung und Pruefung."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}
        self._env: Umgebung | None = None
        self._missing: list[str] = []

    async def _umgebung(self) -> Umgebung:
        if self._env is None:
            self._env = await async_discover(self.hass)
        return self._env

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        env = await self._umgebung()
        if not env.asterisk:
            return self.async_abort(reason="asterisk_missing")
        if env.supervisor and not env.addons:
            return self.async_abort(reason="addon_missing")
        if user_input is not None:
            return await self.async_step_sources()
        return self.async_show_form(
            step_id="user", data_schema=vol.Schema({}), description_placeholders=_voraussetzungen(env)
        )

    async def async_step_sources(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._data.update(user_input)
            return await self.async_step_sip()
        return self.async_show_form(step_id="sources", data_schema=_schema_quellen(self.hass, self._data))

    async def async_step_sip(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        env = await self._umgebung()
        if user_input is not None:
            self._data.update(user_input)
            if not env.addons and env.supervisor:
                self._data.pop(CONF_ADDON_SLUG, None)
            door = str(self._data[CONF_EXT_DOOR]).strip()
            tablet = str(self._data[CONF_EXT_TABLET]).strip()
            self._data[CONF_EXT_DOOR] = door
            self._data[CONF_EXT_TABLET] = tablet
            found = {
                CONF_DOOR_STATE_ENTITY: state_entity(self.hass, door),
                CONF_TABLET_STATE_ENTITY: state_entity(self.hass, tablet),
                CONF_AMI_CONNECTED_ENTITY: env.ami_entity,
            }
            self._missing = []
            for key, entity_id in found.items():
                if entity_id:
                    self._data[key] = entity_id
                else:
                    self._data.pop(key, None)
                    self._missing.append(key)
            if self._missing:
                return await self.async_step_sensors()
            return await self.async_step_house()
        return self.async_show_form(step_id="sip", data_schema=_schema_sip(self._data, env))

    async def async_step_sensors(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._data.update(user_input)
            return await self.async_step_house()
        return self.async_show_form(
            step_id="sensors",
            data_schema=_schema_sensoren(self._data, self._missing),
            description_placeholders={
                "ext_door": self._data.get(CONF_EXT_DOOR, ""),
                "ext_tablet": self._data.get(CONF_EXT_TABLET, ""),
            },
        )

    async def async_step_house(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._data.pop(CONF_ALARM_ENTITY, None)
            self._data.pop(CONF_LOCK_ENTITY, None)
            self._data.update(user_input)
            return await self.async_step_check()
        return self.async_show_form(step_id="house", data_schema=_schema_haus(self._data))

    async def async_step_check(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        env = await self._umgebung()
        ignore_stream = bool(user_input and user_input.get(CONF_IGNORE_STREAM))
        checks = await self._pruefen()
        errors: dict[str, str] = {}
        if not checks["ffmpeg"][0]:
            errors["base"] = "ffmpeg_missing"
        elif not checks["dir"][0]:
            errors["base"] = "dir_failed"
        elif not checks["stream"][0] and not ignore_stream:
            errors["base"] = "stream_failed"
        if user_input is not None and not errors:
            data = {k: v for k, v in self._data.items() if k != CONF_IGNORE_STREAM}
            return self.async_create_entry(title="Intercom", data=data)
        if user_input is None:
            errors = {}
        return self.async_show_form(
            step_id="check",
            data_schema=_schema_pruefung(not checks["stream"][0]),
            errors=errors,
            description_placeholders=self._ergebnis(checks, env),
        )

    async def _pruefen(self) -> dict[str, tuple[bool, str]]:
        ffmpeg = await async_check_ffmpeg(self.hass)
        stream = await async_check_stream(str(self._data.get(CONF_STREAM_URL, ""))) if ffmpeg[0] else (False, "ffprobe")
        folder = await async_check_dir(self.hass, str(self._data.get(CONF_BASE_DIR, DEFAULT_BASE_DIR)))
        ami_id = self._data.get(CONF_AMI_CONNECTED_ENTITY)
        ami = ami_connected(self.hass, ami_id)
        if ami is None:
            ami_result = (False, f"{NONE}")
        else:
            ami_result = (ami, f"{OK} {ami_id}" if ami else f"{BAD} {ami_id}: off")
        return {"ffmpeg": ffmpeg, "stream": stream, "dir": folder, "ami": ami_result}

    @staticmethod
    def _ergebnis(checks: dict[str, tuple[bool, str]], env: Umgebung) -> dict[str, str]:
        def mark(item: tuple[bool, str]) -> str:
            return f"{OK if item[0] else BAD} {item[1]}"

        base = _voraussetzungen(env)
        return {
            "ffmpeg": mark(checks["ffmpeg"]),
            "stream": mark(checks["stream"]),
            "ordner": mark(checks["dir"]),
            "ami": checks["ami"][1],
            "app": base["app"],
            "sip": base["sip"],
        }

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> IntercomOptionsFlow:
        return IntercomOptionsFlow()


class IntercomOptionsFlow(OptionsFlow):
    """Optionen: Stream, App, Alarmzentrale, Schloss, Ordner, Hoechstdauer, Standbild, Zustandsnamen.

    Wechselt der Basisordner und liegen im alten Ordner Dateien, bietet ein zweiter Schritt den Umzug an.
    """

    def __init__(self) -> None:
        self._pending: dict[str, Any] | None = None
        self._old = ""
        self._new = ""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        current = {**self.config_entry.data, **self.config_entry.options}
        if user_input is not None:
            for key in (CONF_ALARM_ENTITY, CONF_LOCK_ENTITY, CONF_ADDON_SLUG):
                user_input.setdefault(key, None)
            old = str(current.get(CONF_BASE_DIR) or DEFAULT_BASE_DIR).rstrip("/") or "/"
            new = str(user_input.get(CONF_BASE_DIR) or DEFAULT_BASE_DIR).rstrip("/") or "/"
            user_input[CONF_BASE_DIR] = new
            if new != old:
                counts = await self.hass.async_add_executor_job(_count_media, old)
                if counts["gesamt"]:
                    self._pending, self._old, self._new = user_input, old, new
                    return await self.async_step_move()
            return self.async_create_entry(title="", data=user_input)
        env = await async_discover(self.hass)
        return self.async_show_form(step_id="init", data_schema=_schema_options(current, env))

    async def async_step_move(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None and self._pending is not None:
            if user_input.get(CONF_MOVE_FILES, True):
                try:
                    moved = await self.hass.async_add_executor_job(_move_media, self._old, self._new)
                    _LOGGER.info("Intercom: %s Dateien von %s nach %s verschoben", moved, self._old, self._new)
                except OSError as err:
                    _LOGGER.warning("Intercom: Verschieben nach %s fehlgeschlagen: %s", self._new, err)
                    errors["base"] = "move_failed"
            if not errors:
                return self.async_create_entry(title="", data=self._pending)
        counts = await self.hass.async_add_executor_job(_count_media, self._old)
        return self.async_show_form(
            step_id="move",
            data_schema=vol.Schema({vol.Optional(CONF_MOVE_FILES, default=True): BOOL}),
            errors=errors,
            description_placeholders={
                "alt": self._old,
                "neu": self._new,
                "messages": str(counts[DIR_MAILBOX]),
                "announcements": str(counts[DIR_ANSAGE]),
                "ringback": str(counts[DIR_FREIZEICHEN]),
            },
        )

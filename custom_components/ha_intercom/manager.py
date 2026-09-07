"""Kernlogik der Intercom-Integration: Klingeln, Aufnahme, Mailbox, Ansagen, Freizeichen, astdb."""

from __future__ import annotations

import asyncio
import json
import logging
import re
import shutil
import signal
import subprocess
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Callable

from homeassistant.components.camera import async_get_image
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.util import dt as dt_util

from .const import (
    ANSAGE_KEINE,
    ASTDB_FAMILY,
    ASTDB_STARTUP_DELAY,
    ASTERISK_DOMAIN,
    ASTERISK_SERVICE,
    AUDIO_EXTENSIONS,
    CLEANUP_HOUR,
    CLEANUP_MINUTE,
    CONF_ADDON_SLUG,
    CONF_ALARM_ENTITY,
    CONF_LOCK_ENTITY,
    CONF_AMI_CONNECTED_ENTITY,
    CONF_BASE_DIR,
    CONF_CAMERA_ENTITY,
    CONF_DOOR_STATE_ENTITY,
    CONF_IDLE_STATE,
    CONF_IN_USE_STATE,
    CONF_MAX_CLIP_SECONDS,
    CONF_SNAPSHOT_DELAY,
    CONF_STREAM_URL,
    CONF_TABLET_STATE_ENTITY,
    CONF_TRIGGER_ENTITY,
    CONF_TRIGGER_STATE,
    DEFAULT_AMI_CONNECTED_ENTITY,
    DEFAULT_BASE_DIR,
    DEFAULT_IDLE_STATE,
    DEFAULT_IN_USE_STATE,
    DEFAULT_MAX_CLIP_SECONDS,
    DEFAULT_SETTINGS,
    DEFAULT_SNAPSHOT_DELAY,
    DEFAULT_TRIGGER_STATE,
    DIR_ANSAGE,
    DIR_FREIZEICHEN,
    DIR_FREIZEICHEN_AKTIV,
    DIR_KLINGELTOENE,
    DIR_KONVERTIERT,
    DIR_MAILBOX,
    EVENT_ANGENOMMEN,
    EVENT_AUFGEZEICHNET,
    EVENT_KLINGELN,
    EVENT_NACHRICHT,
    FFMPEG,
    FFPROBE,
    FREIZEICHEN_STANDARD,
    HA_EVENT_RECORDED,
    HA_EVENT_RING,
    MEDIA_KIND_ANSAGE,
    MEDIA_KIND_BILD,
    MEDIA_KIND_CLIP,
    MEDIA_KIND_FREIZEICHEN,
    MOH_CLASS,
    SCAN_INTERVAL_SECONDS,
    SETTING_ANSAGE,
    SETTING_AUFBEWAHRUNG,
    SETTING_FREIZEICHEN,
    SETTING_KLINGELDAUER,
    SETTING_KLINGELTON,
    SETTING_MAILBOX,
    SETTING_SPRACHANSAGE,
    SETTING_SPRECHZEIT,
)

_LOGGER = logging.getLogger(__name__)

SAFE_NAME = re.compile(r"^[A-Za-z0-9_.\-]+$")


@dataclass
class Nachricht:
    """Ein Mailbox-Eintrag: ein Klingeln mit Clip und Bild."""

    id: str
    time: str
    duration: float = 0.0
    answered: bool = False
    message: bool = False
    seen: bool = False
    clip: bool = False
    image: bool = False


@dataclass
class Ansage:
    """Eine Ansage-Datei (WAV, 8 kHz) mit Anzeigename."""

    file: str
    name: str
    created: str
    duration: float = 0.0


@dataclass
class Freizeichen:
    """Eine Freizeichen-Datei (konvertiertes WAV)."""

    file: str
    name: str


@dataclass
class Klingelton:
    """Ein Klingelton der Innenstation (Datei im Ordner klingeltoene, wird unveraendert abgespielt)."""

    file: str
    name: str


def _now_iso() -> str:
    return dt_util.now().isoformat(timespec="seconds")


def _kennung_now() -> str:
    return dt_util.now().strftime("%Y-%m-%d_%H-%M-%S")


_OLD_KEYS = {
    "kennung": "id", "zeit": "time", "dauer": "duration", "angenommen": "answered", "nachricht": "message",
    "gesehen": "seen", "bild": "image", "datei": "file", "erstellt": "created",
}


def _upgrade_keys(raw: dict[str, Any]) -> dict[str, Any]:
    """Alte (deutsche) Feldnamen aus fruehen Versionen der JSON-Dateien auf die aktuellen abbilden."""
    return {_OLD_KEYS.get(k, k): v for k, v in raw.items()}


def safe_name(name: str) -> bool:
    """Nur einfache Dateinamen ohne Pfadanteile zulassen."""
    return bool(name) and bool(SAFE_NAME.match(name)) and ".." not in name


class IntercomManager:
    """Haelt Zustand und Logik fuer einen Intercom-Eintrag."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        data: dict[str, Any] = {**entry.data, **entry.options}

        self.trigger_entity: str = data[CONF_TRIGGER_ENTITY]
        self.trigger_state: str = data.get(CONF_TRIGGER_STATE, DEFAULT_TRIGGER_STATE)
        self.camera_entity: str | None = data.get(CONF_CAMERA_ENTITY) or None
        self.stream_url: str = data[CONF_STREAM_URL]
        self.door_state_entity: str | None = data.get(CONF_DOOR_STATE_ENTITY) or None
        self.tablet_state_entity: str | None = data.get(CONF_TABLET_STATE_ENTITY) or None
        self.ami_connected_entity: str = data.get(CONF_AMI_CONNECTED_ENTITY) or DEFAULT_AMI_CONNECTED_ENTITY
        self.addon_slug: str | None = data.get(CONF_ADDON_SLUG) or None
        self.alarm_entity: str | None = data.get(CONF_ALARM_ENTITY) or None
        self.lock_entity: str | None = data.get(CONF_LOCK_ENTITY) or None
        self.max_clip_seconds: int = int(data.get(CONF_MAX_CLIP_SECONDS, DEFAULT_MAX_CLIP_SECONDS))
        self.snapshot_delay: float = float(data.get(CONF_SNAPSHOT_DELAY, DEFAULT_SNAPSHOT_DELAY))
        self.idle_state: str = data.get(CONF_IDLE_STATE, DEFAULT_IDLE_STATE)
        self.in_use_state: str = data.get(CONF_IN_USE_STATE, DEFAULT_IN_USE_STATE)

        self.base = Path(data.get(CONF_BASE_DIR, DEFAULT_BASE_DIR))
        self.dir_mailbox = self.base / DIR_MAILBOX
        self.dir_ansage = self.base / DIR_ANSAGE
        self.dir_freizeichen = self.base / DIR_FREIZEICHEN
        self.dir_freizeichen_konv = self.dir_freizeichen / DIR_KONVERTIERT
        self.dir_freizeichen_aktiv = self.dir_freizeichen / DIR_FREIZEICHEN_AKTIV
        self.dir_klingeltoene = self.base / DIR_KLINGELTOENE

        self.settings: dict[str, Any] = dict(DEFAULT_SETTINGS)
        self.nachrichten: list[Nachricht] = []
        self.ansagen: list[Ansage] = []
        self.freizeichen: list[Freizeichen] = []
        self.klingeltoene: list[Klingelton] = []
        self.letztes_klingeln: str | None = None
        self.im_anruf: bool = False

        self.recording: bool = False
        self._proc: asyncio.subprocess.Process | None = None
        self._rec_id: str | None = None
        self._rec_started: datetime | None = None
        self._rec_answered: bool = False
        self._rec_snapshot: bool = False
        self._rec_cancel_max: Callable[[], None] | None = None
        self._rec_lock = asyncio.Lock()

        self._listeners: list[Callable[[], None]] = []
        self._event_listeners: list[Callable[[str, dict[str, Any]], None]] = []
        self._unsubs: list[Callable[[], None]] = []
        self._ffprobe = shutil.which(FFPROBE)
        self._ffmpeg = shutil.which(FFMPEG) or FFMPEG

    # ------------------------------------------------------------------ Lebenszyklus
    async def async_setup(self) -> None:
        """Ordner anlegen, Bestand einlesen, Ereignisse abonnieren."""
        await self.hass.async_add_executor_job(self._ensure_dirs)
        await self.async_scan_all(sync=False)

        self._unsubs.append(
            async_track_state_change_event(self.hass, [self.trigger_entity], self._trigger_changed)
        )
        if self.door_state_entity:
            self._unsubs.append(
                async_track_state_change_event(self.hass, [self.door_state_entity], self._door_changed)
            )
        if self.tablet_state_entity:
            self._unsubs.append(
                async_track_state_change_event(self.hass, [self.tablet_state_entity], self._tablet_changed)
            )
        if self.ami_connected_entity:
            self._unsubs.append(
                async_track_state_change_event(self.hass, [self.ami_connected_entity], self._ami_changed)
            )
        self._unsubs.append(
            async_track_time_interval(self.hass, self._periodic, timedelta(seconds=SCAN_INTERVAL_SECONDS))
        )
        self._unsubs.append(
            async_track_time_change(self.hass, self._nightly, hour=CLEANUP_HOUR, minute=CLEANUP_MINUTE, second=0)
        )
        self._unsubs.append(async_call_later(self.hass, ASTDB_STARTUP_DELAY, self._startup_sync))

    async def async_unload(self) -> None:
        """Abonnements loesen und eine laufende Aufnahme beenden."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self.recording:
            await self._stop_recording("unload")

    def _ensure_dirs(self) -> None:
        for d in (
            self.dir_mailbox,
            self.dir_ansage,
            self.dir_freizeichen,
            self.dir_freizeichen_konv,
            self.dir_freizeichen_aktiv,
            self.dir_klingeltoene,
        ):
            d.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------ Beobachter
    @callback
    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Entitaeten melden sich hier fuer Zustandsaenderungen an."""
        self._listeners.append(listener)

        def _remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return _remove

    @callback
    def add_event_listener(self, listener: Callable[[str, dict[str, Any]], None]) -> Callable[[], None]:
        """Die Ereignis-Entitaet meldet sich hier an."""
        self._event_listeners.append(listener)

        def _remove() -> None:
            if listener in self._event_listeners:
                self._event_listeners.remove(listener)

        return _remove

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    @callback
    def _fire(self, event_type: str, data: dict[str, Any]) -> None:
        for listener in list(self._event_listeners):
            listener(event_type, data)

    # ------------------------------------------------------------------ Einstellungen
    @callback
    def restore_setting(self, key: str, value: Any) -> None:
        """Wert aus dem wiederhergestellten Entitaetszustand uebernehmen (ohne astdb)."""
        self.settings[key] = value

    async def async_set_setting(self, key: str, value: Any) -> None:
        """Einstellung aendern, Entitaeten benachrichtigen, nach Asterisk uebertragen."""
        if self.settings.get(key) == value:
            return
        self.settings[key] = value
        self._notify()
        if key == SETTING_FREIZEICHEN:
            await self._activate_freizeichen(value)
        await self.async_sync_astdb([key])

    def _astdb_values(self) -> dict[str, str]:
        ansage = self.settings.get(SETTING_ANSAGE) or ""
        ansage_pfad = str(self.dir_ansage / ansage) if ansage else ""
        freizeichen = self.settings.get(SETTING_FREIZEICHEN) or "default"
        return {
            SETTING_KLINGELDAUER: str(int(self.settings[SETTING_KLINGELDAUER])),
            SETTING_SPRECHZEIT: str(int(self.settings[SETTING_SPRECHZEIT])),
            SETTING_SPRACHANSAGE: "on" if self.settings[SETTING_SPRACHANSAGE] else "off",
            SETTING_MAILBOX: "on" if self.settings[SETTING_MAILBOX] else "off",
            SETTING_FREIZEICHEN: "default" if freizeichen == "default" else "file",
            SETTING_ANSAGE: ansage_pfad,
        }

    async def async_sync_astdb(self, keys: list[str] | None = None) -> bool:
        """Einstellungen per AMI DBPut in die Asterisk-Datenbank schreiben."""
        if not self.hass.services.has_service(ASTERISK_DOMAIN, ASTERISK_SERVICE):
            _LOGGER.debug("Dienst %s.%s nicht vorhanden, astdb-Abgleich uebersprungen", ASTERISK_DOMAIN, ASTERISK_SERVICE)
            return False
        values = self._astdb_values()
        for key, val in values.items():
            if keys and key not in keys:
                continue
            try:
                await self.hass.services.async_call(
                    ASTERISK_DOMAIN,
                    ASTERISK_SERVICE,
                    {"action": "DBPut", "parameters": {"Family": ASTDB_FAMILY, "Key": key, "Val": val}},
                    blocking=True,
                )
            except Exception as err:  # noqa: BLE001 - AMI-Fehler duerfen die Integration nicht stoppen
                _LOGGER.warning("astdb %s/%s konnte nicht geschrieben werden: %s", ASTDB_FAMILY, key, err)
                return False
        return True

    @callback
    def _startup_sync(self, _now: Any) -> None:
        self.hass.async_create_task(self.async_sync_astdb())

    @callback
    def _ami_changed(self, event: Event[EventStateChangedData]) -> None:
        new = event.data.get("new_state")
        if new is not None and new.state == "on":
            self.hass.async_create_task(self.async_sync_astdb())

    # ------------------------------------------------------------------ Klingeln und Aufnahme
    @callback
    def _trigger_changed(self, event: Event[EventStateChangedData]) -> None:
        new = event.data.get("new_state")
        if new is None or new.state != self.trigger_state:
            return
        self.hass.async_create_task(self.async_handle_ring())

    async def async_handle_ring(self) -> None:
        """Ein Klingeln verarbeiten."""
        async with self._rec_lock:
            kennung = _kennung_now()
            self.letztes_klingeln = _now_iso()
            self._fire(EVENT_KLINGELN, {"id": kennung})
            self.hass.bus.async_fire(HA_EVENT_RING, {"id": kennung, "entry_id": self.entry.entry_id})
            if self.recording:
                _LOGGER.debug("Klingeln waehrend laufender Aufnahme %s ignoriert", self._rec_id)
                self._notify()
                return
            if self.settings.get(SETTING_MAILBOX):
                await self._start_recording(kennung)
            self._notify()

    async def async_start_manual(self) -> None:
        """Aufnahme manuell starten (Dienst, fuer Tests)."""
        async with self._rec_lock:
            if self.recording:
                return
            await self._start_recording(_kennung_now())
            self._notify()

    async def async_stop_manual(self) -> None:
        """Aufnahme manuell beenden (Dienst)."""
        await self._stop_recording("manuell")

    async def _start_recording(self, kennung: str) -> None:
        part = self.dir_mailbox / f"{kennung}.mp4.part"
        cmd = [
            self._ffmpeg,
            "-nostdin",
            "-hide_banner",
            "-loglevel",
            "error",
            "-rtsp_transport",
            "tcp",
            "-i",
            self.stream_url,
            "-t",
            str(self.max_clip_seconds),
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "64k",
            "-movflags",
            "+faststart",
            "-f",
            "mp4",
            "-y",
            str(part),
        ]
        try:
            self._proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.DEVNULL,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.PIPE,
            )
        except (OSError, FileNotFoundError) as err:
            _LOGGER.error("ffmpeg konnte nicht gestartet werden: %s", err)
            self._proc = None
            return

        self.recording = True
        self._rec_id = kennung
        self._rec_started = dt_util.now()
        self._rec_answered = False
        self._rec_snapshot = False
        _LOGGER.info("Aufnahme %s gestartet", kennung)

        self.hass.async_create_task(self._take_snapshot(kennung))
        self.hass.async_create_task(self._watch_process(self._proc, kennung))
        self._rec_cancel_max = async_call_later(
            self.hass, self.max_clip_seconds + 5, lambda _now: self.hass.async_create_task(self._stop_recording("max"))
        )

    async def _take_snapshot(self, kennung: str) -> None:
        if not self.camera_entity:
            return
        if self.snapshot_delay > 0:
            await asyncio.sleep(self.snapshot_delay)
        try:
            image = await async_get_image(self.hass, self.camera_entity, timeout=10)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Standbild von %s fehlgeschlagen: %s", self.camera_entity, err)
            return
        path = self.dir_mailbox / f"{kennung}.jpg"
        await self.hass.async_add_executor_job(path.write_bytes, image.content)
        if self._rec_id == kennung:
            self._rec_snapshot = True

    async def _watch_process(self, proc: asyncio.subprocess.Process, kennung: str) -> None:
        """Beendet sich ffmpeg von selbst (Streamfehler, Hoechstdauer), die Aufnahme abschliessen."""
        stderr = b""
        try:
            _, stderr = await proc.communicate()
        except Exception:  # noqa: BLE001
            pass
        if stderr:
            _LOGGER.warning("ffmpeg %s: %s", kennung, stderr.decode(errors="replace").strip()[:500])
        if self.recording and self._rec_id == kennung and self._proc is proc:
            await self._finalize(kennung)

    async def _stop_recording(self, reason: str) -> None:
        if not self.recording or self._proc is None:
            return
        proc = self._proc
        kennung = self._rec_id or ""
        _LOGGER.info("Aufnahme %s wird beendet (%s)", kennung, reason)
        if proc.returncode is None:
            try:
                proc.send_signal(signal.SIGINT)
            except ProcessLookupError:
                pass
            try:
                await asyncio.wait_for(proc.wait(), timeout=15)
            except asyncio.TimeoutError:
                _LOGGER.warning("ffmpeg reagiert nicht, wird beendet")
                proc.kill()
                await proc.wait()
        if self.recording and self._rec_id == kennung:
            await self._finalize(kennung)

    async def _finalize(self, kennung: str) -> None:
        if self._rec_cancel_max:
            self._rec_cancel_max()
            self._rec_cancel_max = None
        self.recording = False
        self._proc = None
        answered = self._rec_answered
        started = self._rec_started or dt_util.now()

        info = await self.hass.async_add_executor_job(self._finish_files, kennung, started, answered)
        self._rec_id = None
        await self.async_refresh_index()

        if info is None:
            _LOGGER.warning("Aufnahme %s ohne brauchbare Datei beendet", kennung)
            return
        payload = {"id": kennung, **info}
        self._fire(EVENT_AUFGEZEICHNET, payload)
        if info.get("message"):
            self._fire(EVENT_NACHRICHT, payload)
        self.hass.bus.async_fire(HA_EVENT_RECORDED, {**payload, "entry_id": self.entry.entry_id})

    def _finish_files(self, kennung: str, started: datetime, answered: bool) -> dict[str, Any] | None:
        part = self.dir_mailbox / f"{kennung}.mp4.part"
        clip = self.dir_mailbox / f"{kennung}.mp4"
        bild = self.dir_mailbox / f"{kennung}.jpg"
        if part.exists():
            if part.stat().st_size > 0:
                part.replace(clip)
            else:
                part.unlink(missing_ok=True)
        if not clip.exists():
            bild.unlink(missing_ok=True)
            return None

        dauer = self._probe_duration(clip)
        if dauer <= 0:
            dauer = max(0.0, (dt_util.now() - started).total_seconds())
        if not bild.exists():
            self._extract_frame(clip, bild)

        klingeldauer = int(self.settings.get(SETTING_KLINGELDAUER, 20))
        nachricht = (
            not answered
            and bool(self.settings.get(SETTING_SPRACHANSAGE))
            and dauer >= klingeldauer + 5
        )
        eintrag = Nachricht(
            id=kennung,
            time=started.isoformat(timespec="seconds"),
            duration=round(dauer, 1),
            answered=answered,
            message=nachricht,
            seen=False,
            clip=True,
            image=bild.exists(),
        )
        (self.dir_mailbox / f"{kennung}.json").write_text(json.dumps(asdict(eintrag), ensure_ascii=False))
        return {"duration": eintrag.duration, "answered": answered, "message": nachricht}

    def _probe_duration(self, path: Path) -> float:
        if not self._ffprobe:
            return 0.0
        try:
            out = subprocess.run(
                [self._ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
                capture_output=True,
                text=True,
                timeout=30,
                check=False,
            )
            return float(out.stdout.strip() or 0)
        except (OSError, ValueError, subprocess.TimeoutExpired):
            return 0.0

    def _extract_frame(self, clip: Path, bild: Path) -> None:
        try:
            subprocess.run(
                [self._ffmpeg, "-y", "-loglevel", "error", "-ss", "1", "-i", str(clip), "-frames:v", "1", "-q:v", "3", str(bild)],
                capture_output=True,
                timeout=60,
                check=False,
            )
        except (OSError, subprocess.TimeoutExpired) as err:
            _LOGGER.debug("Vorschaubild aus Clip fehlgeschlagen: %s", err)

    @callback
    def _door_changed(self, event: Event[EventStateChangedData]) -> None:
        new = event.data.get("new_state")
        if new is None:
            return
        self.im_anruf = new.state != self.idle_state and new.state not in ("unknown", "unavailable", "Unavailable")
        if self.recording and new.state == self.idle_state:
            self.hass.async_create_task(self._stop_recording("anrufende"))
        self._notify()

    @callback
    def _tablet_changed(self, event: Event[EventStateChangedData]) -> None:
        new = event.data.get("new_state")
        if new is None:
            return
        if self.recording and new.state == self.in_use_state and not self._rec_answered:
            self._rec_answered = True
            self._fire(EVENT_ANGENOMMEN, {"id": self._rec_id})
            self._notify()

    # ------------------------------------------------------------------ Index Mailbox
    async def async_refresh_index(self) -> None:
        self.nachrichten = await self.hass.async_add_executor_job(self._scan_mailbox)
        self._notify()

    def _scan_mailbox(self) -> list[Nachricht]:
        result: list[Nachricht] = []
        if not self.dir_mailbox.exists():
            return result
        for meta in self.dir_mailbox.glob("*.json"):
            kennung = meta.stem
            clip = self.dir_mailbox / f"{kennung}.mp4"
            if not clip.exists():
                continue
            try:
                raw = _upgrade_keys(json.loads(meta.read_text()))
            except (OSError, ValueError):
                continue
            result.append(
                Nachricht(
                    id=kennung,
                    time=str(raw.get("time", "")),
                    duration=float(raw.get("duration", 0) or 0),
                    answered=bool(raw.get("answered", False)),
                    message=bool(raw.get("message", False)),
                    seen=bool(raw.get("seen", False)),
                    clip=True,
                    image=(self.dir_mailbox / f"{kennung}.jpg").exists(),
                )
            )
        result.sort(key=lambda n: n.id, reverse=True)
        return result

    @property
    def neue_nachrichten(self) -> int:
        return sum(1 for n in self.nachrichten if not n.seen)

    def nachrichten_attr(self) -> list[dict[str, Any]]:
        out = []
        for n in self.nachrichten:
            d = asdict(n)
            d["clip_url"] = f"/api/ha_intercom/media/{MEDIA_KIND_CLIP}/{n.id}"
            d["image_url"] = f"/api/ha_intercom/media/{MEDIA_KIND_BILD}/{n.id}" if n.image else None
            out.append(d)
        return out

    async def async_nachricht_loeschen(self, kennung: str) -> None:
        if not safe_name(kennung):
            return
        await self.hass.async_add_executor_job(self._delete_entry_files, kennung)
        await self.async_refresh_index()

    def _delete_entry_files(self, kennung: str) -> None:
        for suffix in (".mp4", ".mp4.part", ".jpg", ".json"):
            (self.dir_mailbox / f"{kennung}{suffix}").unlink(missing_ok=True)

    async def async_nachricht_gesehen(self, kennung: str, gesehen: bool = True) -> None:
        if not safe_name(kennung):
            return
        await self.hass.async_add_executor_job(self._mark_seen, [kennung], gesehen)
        await self.async_refresh_index()

    async def async_alle_gesehen(self) -> None:
        await self.hass.async_add_executor_job(self._mark_seen, [n.id for n in self.nachrichten], True)
        await self.async_refresh_index()

    def _mark_seen(self, kennungen: list[str], gesehen: bool) -> None:
        for kennung in kennungen:
            meta = self.dir_mailbox / f"{kennung}.json"
            if not meta.exists():
                continue
            try:
                raw = _upgrade_keys(json.loads(meta.read_text()))
            except (OSError, ValueError):
                continue
            raw["seen"] = gesehen
            meta.write_text(json.dumps(raw, ensure_ascii=False))

    async def async_cleanup(self) -> int:
        """Eintraege loeschen, die aelter als die Aufbewahrung sind."""
        tage = int(self.settings.get(SETTING_AUFBEWAHRUNG, 30))
        grenze = dt_util.now() - timedelta(days=tage)
        geloescht = 0
        for n in list(self.nachrichten):
            try:
                zeit = datetime.fromisoformat(n.time)
            except ValueError:
                continue
            if zeit.tzinfo is None:
                zeit = zeit.replace(tzinfo=grenze.tzinfo)
            if zeit < grenze:
                await self.hass.async_add_executor_job(self._delete_entry_files, n.id)
                geloescht += 1
        if geloescht:
            _LOGGER.info("Aufraeumen: %s Eintraege aelter als %s Tage geloescht", geloescht, tage)
            await self.async_refresh_index()
        return geloescht

    @callback
    def _nightly(self, _now: Any) -> None:
        self.hass.async_create_task(self.async_cleanup())

    @callback
    def _periodic(self, _now: Any) -> None:
        self.hass.async_create_task(self.async_scan_all(sync=True))

    # ------------------------------------------------------------------ Ansagen und Freizeichen
    async def async_scan_all(self, sync: bool) -> None:
        """Ordner einlesen, neue Dateien konvertieren, Listen aktualisieren."""
        nachrichten, ansagen, freizeichen, klingeltoene = await self.hass.async_add_executor_job(self._scan_media)
        self.nachrichten = nachrichten
        self.ansagen = ansagen
        self.freizeichen = freizeichen
        self.klingeltoene = klingeltoene
        kt = self.settings.get(SETTING_KLINGELTON) or ""
        if klingeltoene and not any(k.file == kt for k in klingeltoene):
            self.settings[SETTING_KLINGELTON] = klingeltoene[0].file

        changed: list[str] = []
        aktiv = self.settings.get(SETTING_ANSAGE) or ""
        if aktiv and not any(a.file == aktiv for a in ansagen):
            self.settings[SETTING_ANSAGE] = ""
            changed.append(SETTING_ANSAGE)
        fz = self.settings.get(SETTING_FREIZEICHEN) or "default"
        if fz != "default" and not any(f.file == fz for f in freizeichen):
            self.settings[SETTING_FREIZEICHEN] = "default"
            changed.append(SETTING_FREIZEICHEN)
        self._notify()
        if sync and changed:
            await self.async_sync_astdb(changed)

    def _scan_media(self) -> tuple[list[Nachricht], list[Ansage], list[Freizeichen], list[Klingelton]]:
        return self._scan_mailbox(), self._scan_ansagen(), self._scan_freizeichen(), self._scan_klingeltoene()

    def _scan_ansagen(self) -> list[Ansage]:
        result: list[Ansage] = []
        if not self.dir_ansage.exists():
            return result
        # Rohdateien (MP3, WebM, ...) nach WAV wandeln, wenn noch keine WAV existiert
        for src in sorted(self.dir_ansage.iterdir()):
            if src.suffix.lower() not in AUDIO_EXTENSIONS or src.suffix.lower() == ".wav" or src.name.startswith("."):
                continue
            wav = self.dir_ansage / f"{src.stem}.wav"
            if wav.exists() and wav.stat().st_mtime >= src.stat().st_mtime:
                continue
            if self._convert_to_wav(src, wav):
                self._write_ansage_meta(wav, name=src.stem)
        for wav in sorted(self.dir_ansage.glob("*.wav")):
            meta = self._read_ansage_meta(wav)
            result.append(meta)
        # Verwaiste Begleitdateien (JSON ohne WAV) entfernen
        for meta_path in self.dir_ansage.glob("*.json"):
            if not meta_path.with_suffix(".wav").exists():
                meta_path.unlink(missing_ok=True)
        result.sort(key=lambda a: a.created, reverse=True)
        return result

    def _read_ansage_meta(self, wav: Path) -> Ansage:
        meta_path = wav.with_suffix(".json")
        if meta_path.exists():
            try:
                raw = _upgrade_keys(json.loads(meta_path.read_text()))
                return Ansage(
                    file=wav.stem,
                    name=str(raw.get("name") or wav.stem),
                    created=str(raw.get("created") or ""),
                    duration=float(raw.get("duration", 0) or 0),
                )
            except (OSError, ValueError):
                pass
        return self._write_ansage_meta(wav, name=wav.stem)

    def _write_ansage_meta(self, wav: Path, name: str, created: str | None = None) -> Ansage:
        if created is None:
            created = datetime.fromtimestamp(wav.stat().st_mtime, tz=dt_util.DEFAULT_TIME_ZONE).isoformat(timespec="seconds")
        ansage = Ansage(file=wav.stem, name=name, created=created, duration=round(self._probe_duration(wav), 1))
        wav.with_suffix(".json").write_text(json.dumps(asdict(ansage), ensure_ascii=False))
        return ansage

    def _scan_freizeichen(self) -> list[Freizeichen]:
        result: list[Freizeichen] = []
        if not self.dir_freizeichen.exists():
            return result
        self.dir_freizeichen_konv.mkdir(exist_ok=True)
        quellen: dict[str, Path] = {}
        for src in sorted(self.dir_freizeichen.iterdir()):
            if not src.is_file() or src.suffix.lower() not in AUDIO_EXTENSIONS or src.name.startswith("."):
                continue
            quellen[src.stem] = src
            wav = self.dir_freizeichen_konv / f"{src.stem}.wav"
            if wav.exists() and wav.stat().st_mtime >= src.stat().st_mtime:
                continue
            self._convert_to_wav(src, wav)
        # verwaiste Konvertierungen entfernen
        for wav in self.dir_freizeichen_konv.glob("*.wav"):
            if wav.stem not in quellen:
                wav.unlink(missing_ok=True)
        for wav in sorted(self.dir_freizeichen_konv.glob("*.wav")):
            result.append(Freizeichen(file=wav.stem, name=wav.stem))
        return result

    def _convert_to_wav(self, src: Path, dst: Path) -> bool:
        """Beliebiges Audio nach 8 kHz, mono, 16 Bit WAV wandeln (Telefonformat fuer Asterisk)."""
        tmp = dst.with_name(f".{dst.stem}.tmp.wav")
        cmd = [
            self._ffmpeg,
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-vn",
            "-ac",
            "1",
            "-af",
            "aresample=8000:filter_size=64",
            "-ar",
            "8000",
            "-c:a",
            "pcm_s16le",
            str(tmp),
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=180, check=False)
        except (OSError, subprocess.TimeoutExpired) as err:
            _LOGGER.error("Konvertierung %s fehlgeschlagen: %s", src.name, err)
            tmp.unlink(missing_ok=True)
            return False
        if res.returncode != 0 or not tmp.exists():
            _LOGGER.error("Konvertierung %s fehlgeschlagen: %s", src.name, res.stderr.strip()[:300])
            tmp.unlink(missing_ok=True)
            return False
        tmp.replace(dst)
        return True

    async def _activate_freizeichen(self, datei: str) -> None:
        """Gewaehlte Freizeichen-Datei nach aktiv kopieren und die MOH-Klasse neu laden."""
        if datei == "default":
            return
        ok = await self.hass.async_add_executor_job(self._copy_freizeichen, datei)
        if not ok:
            return
        if self.addon_slug and self.hass.services.has_service("hassio", "addon_stdin"):
            try:
                await self.hass.services.async_call(
                    "hassio", "addon_stdin", {"addon": self.addon_slug, "input": "moh reload"}, blocking=True
                )
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("moh reload fehlgeschlagen: %s", err)

    def _copy_freizeichen(self, datei: str) -> bool:
        src = self.dir_freizeichen_konv / f"{datei}.wav"
        if not src.exists():
            _LOGGER.warning("Freizeichen %s nicht gefunden", datei)
            return False
        self.dir_freizeichen_aktiv.mkdir(exist_ok=True)
        for old in self.dir_freizeichen_aktiv.glob("*"):
            old.unlink(missing_ok=True)
        shutil.copy2(src, self.dir_freizeichen_aktiv / src.name)
        return True

    @property
    def freizeichen_options(self) -> list[str]:
        return [FREIZEICHEN_STANDARD] + [f.name for f in self.freizeichen]

    @property
    def freizeichen_current(self) -> str:
        fz = self.settings.get(SETTING_FREIZEICHEN) or "default"
        if fz == "default":
            return FREIZEICHEN_STANDARD
        for f in self.freizeichen:
            if f.file == fz:
                return f.name
        return FREIZEICHEN_STANDARD

    async def async_select_freizeichen(self, option: str) -> None:
        if option == FREIZEICHEN_STANDARD:
            await self.async_set_setting(SETTING_FREIZEICHEN, "default")
            return
        for f in self.freizeichen:
            if f.name == option:
                await self.async_set_setting(SETTING_FREIZEICHEN, f.file)
                return
        _LOGGER.warning("Freizeichen %s unbekannt", option)

    # ------------------------------------------------------------------ Klingelton der Innenstation
    def _scan_klingeltoene(self) -> list[Klingelton]:
        if not self.dir_klingeltoene.exists():
            return []
        result: list[Klingelton] = []
        for src in sorted(self.dir_klingeltoene.iterdir()):
            if src.is_file() and src.suffix.lower() in AUDIO_EXTENSIONS and not src.name.startswith("."):
                result.append(Klingelton(file=src.name, name=src.stem))
        return result

    @property
    def klingelton_options(self) -> list[str]:
        return [k.name for k in self.klingeltoene]

    @property
    def klingelton_current(self) -> str | None:
        aktiv = self.settings.get(SETTING_KLINGELTON) or ""
        for k in self.klingeltoene:
            if k.file == aktiv:
                return k.name
        return None

    async def async_select_klingelton(self, option: str) -> None:
        for k in self.klingeltoene:
            if k.name == option:
                await self.async_set_setting(SETTING_KLINGELTON, k.file)
                return
        _LOGGER.warning("Klingelton %s unbekannt", option)

    def klingelton_attr(self) -> dict[str, Any]:
        """Medienquelle des gewaehlten Klingeltons, direkt fuer media_player.play_media verwendbar."""
        aktiv = self.settings.get(SETTING_KLINGELTON) or ""
        pfad = self.dir_klingeltoene / aktiv if aktiv else None
        media_id = None
        if pfad is not None:
            media_dirs = dict(getattr(self.hass.config, "media_dirs", None) or {}) or {"local": "/media"}
            for name, root in media_dirs.items():
                try:
                    rel = pfad.relative_to(root)
                except ValueError:
                    continue
                media_id = f"media-source://media_source/{name}/{rel.as_posix()}"
                break
        suffix = pfad.suffix.lower() if pfad else ""
        typen = {
            ".mp3": "audio/mpeg",
            ".ogg": "audio/ogg",
            ".opus": "audio/ogg",
            ".wav": "audio/wav",
            ".m4a": "audio/mp4",
            ".aac": "audio/aac",
            ".webm": "audio/webm",
            ".flac": "audio/flac",
        }
        return {
            "media_content_id": media_id,
            "media_content_type": typen.get(suffix, "audio/mpeg"),
            "path": str(pfad) if pfad else None,
            "list": [k.name for k in self.klingeltoene],
        }

    @property
    def ansage_options(self) -> list[str]:
        return [ANSAGE_KEINE] + [a.name for a in self.ansagen]

    @property
    def ansage_current(self) -> str:
        aktiv = self.settings.get(SETTING_ANSAGE) or ""
        for a in self.ansagen:
            if a.file == aktiv:
                return a.name
        return ANSAGE_KEINE

    def ansagen_attr(self) -> list[dict[str, Any]]:
        aktiv = self.settings.get(SETTING_ANSAGE) or ""
        out = []
        for a in self.ansagen:
            d = asdict(a)
            d["active"] = a.file == aktiv
            d["url"] = f"/api/ha_intercom/media/{MEDIA_KIND_ANSAGE}/{a.file}"
            out.append(d)
        return out

    def freizeichen_attr(self) -> list[dict[str, Any]]:
        aktiv = self.settings.get(SETTING_FREIZEICHEN) or "default"
        out = []
        for f in self.freizeichen:
            d = asdict(f)
            d["active"] = f.file == aktiv
            d["url"] = f"/api/ha_intercom/media/{MEDIA_KIND_FREIZEICHEN}/{f.file}"
            out.append(d)
        return out

    def _find_ansage(self, name: str) -> Ansage | None:
        for a in self.ansagen:
            if a.name == name or a.file == name:
                return a
        return None

    async def async_ansage_aktivieren(self, name: str) -> None:
        if name in (ANSAGE_KEINE, ""):
            await self.async_set_setting(SETTING_ANSAGE, "")
            return
        ansage = self._find_ansage(name)
        if ansage is None:
            _LOGGER.warning("Ansage %s unbekannt", name)
            return
        await self.async_set_setting(SETTING_ANSAGE, ansage.file)

    async def async_ansage_loeschen(self, name: str) -> None:
        ansage = self._find_ansage(name)
        if ansage is None:
            return
        await self.hass.async_add_executor_job(self._delete_ansage_files, ansage.file)
        if self.settings.get(SETTING_ANSAGE) == ansage.file:
            self.settings[SETTING_ANSAGE] = ""
            await self.async_sync_astdb([SETTING_ANSAGE])
        await self.async_scan_all(sync=False)

    def _delete_ansage_files(self, datei: str) -> None:
        for path in self.dir_ansage.glob(f"{datei}.*"):
            path.unlink(missing_ok=True)

    async def async_ansage_umbenennen(self, name: str, neuer_name: str) -> None:
        ansage = self._find_ansage(name)
        if ansage is None or not neuer_name.strip():
            return
        wav = self.dir_ansage / f"{ansage.file}.wav"
        await self.hass.async_add_executor_job(self._write_ansage_meta, wav, neuer_name.strip(), ansage.created)
        await self.async_scan_all(sync=False)

    async def async_save_ansage_upload(self, data: bytes, filename: str, name: str | None) -> Ansage | None:
        """Hochgeladene Aufnahme (WebM/MP4/MP3) speichern, wandeln und in die Liste aufnehmen."""
        suffix = Path(filename or "").suffix.lower() or ".webm"
        if suffix not in AUDIO_EXTENSIONS and suffix not in (".mp4", ".m4a", ".weba"):
            suffix = ".webm"
        base = f"ansage-{_kennung_now()}"
        anzeigename = (name or "").strip() or f"Ansage {dt_util.now().strftime('%d.%m. %H:%M')}"

        def _do() -> Ansage | None:
            # Rohdatei versteckt und mit eigenem Namen ablegen, damit sie nie mit der Ziel-WAV zusammenfaellt
            raw = self.dir_ansage / f".{base}.upload{suffix}"
            wav = self.dir_ansage / f"{base}.wav"
            raw.write_bytes(data)
            ok = self._convert_to_wav(raw, wav)
            raw.unlink(missing_ok=True)
            if not ok:
                return None
            return self._write_ansage_meta(wav, name=anzeigename, created=_now_iso())

        ansage = await self.hass.async_add_executor_job(_do)
        await self.async_scan_all(sync=False)
        return ansage

    # ------------------------------------------------------------------ Medienpfade fuer HTTP
    def media_path(self, kind: str, name: str) -> Path | None:
        if not safe_name(name):
            return None
        if kind == MEDIA_KIND_CLIP:
            return self.dir_mailbox / f"{name}.mp4"
        if kind == MEDIA_KIND_BILD:
            return self.dir_mailbox / f"{name}.jpg"
        if kind == MEDIA_KIND_ANSAGE:
            return self.dir_ansage / f"{name}.wav"
        if kind == MEDIA_KIND_FREIZEICHEN:
            return self.dir_freizeichen_konv / f"{name}.wav"
        return None

    # ------------------------------------------------------------------ Ende

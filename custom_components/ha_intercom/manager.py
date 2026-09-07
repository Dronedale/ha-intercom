"""Core logic of the Intercom integration: ringing, recording, mailbox, announcements, ringback tones, astdb."""

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
    ANNOUNCEMENT_NONE,
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
    DIR_ANNOUNCEMENTS,
    DIR_RINGBACK,
    DIR_RINGBACK_ACTIVE,
    DIR_RINGTONES,
    DIR_CONVERTED,
    DIR_MAILBOX,
    EVENT_ANSWERED,
    EVENT_RECORDED,
    EVENT_RING,
    EVENT_MESSAGE,
    FFMPEG,
    FFPROBE,
    RINGBACK_DEFAULT,
    HA_EVENT_RECORDED,
    HA_EVENT_RING,
    MEDIA_KIND_ANNOUNCEMENT,
    MEDIA_KIND_IMAGE,
    MEDIA_KIND_CLIP,
    MEDIA_KIND_RINGBACK,
    SCAN_INTERVAL_SECONDS,
    SETTING_ANNOUNCEMENT,
    SETTING_RETENTION,
    SETTING_RINGBACK,
    SETTING_RING_DURATION,
    SETTING_RINGTONE,
    SETTING_MAILBOX,
    SETTING_VOICE_ANNOUNCEMENT,
    SETTING_TALK_TIME,
)

_LOGGER = logging.getLogger(__name__)

SAFE_NAME = re.compile(r"^[A-Za-z0-9_.\-]+$")


@dataclass
class Message:
    """A mailbox entry: one ring with clip and image."""

    id: str
    time: str
    duration: float = 0.0
    answered: bool = False
    message: bool = False
    seen: bool = False
    clip: bool = False
    image: bool = False


@dataclass
class Announcement:
    """An announcement file (WAV, 8 kHz) with display name."""

    file: str
    name: str
    created: str
    duration: float = 0.0


@dataclass
class RingbackTone:
    """A ringback tone file (converted WAV)."""

    file: str
    name: str


@dataclass
class Ringtone:
    """A ringtone of the indoor station (file in the ringtones folder, played back unchanged)."""

    file: str
    name: str


def _now_iso() -> str:
    return dt_util.now().isoformat(timespec="seconds")


def _new_msg_id() -> str:
    return dt_util.now().strftime("%Y-%m-%d_%H-%M-%S")


_OLD_KEYS = {
    "kennung": "id", "zeit": "time", "dauer": "duration", "angenommen": "answered", "nachricht": "message",
    "gesehen": "seen", "bild": "image", "datei": "file", "erstellt": "created",
}


def _upgrade_keys(raw: dict[str, Any]) -> dict[str, Any]:
    """Map old (German) field names from early versions of the JSON files to the current ones."""
    return {_OLD_KEYS.get(k, k): v for k, v in raw.items()}


def safe_name(name: str) -> bool:
    """Allow only simple file names without path components."""
    return bool(name) and bool(SAFE_NAME.match(name)) and ".." not in name


class IntercomManager:
    """Holds state and logic for one Intercom entry."""

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
        self.dir_announcements = self.base / DIR_ANNOUNCEMENTS
        self.dir_ringback = self.base / DIR_RINGBACK
        self.dir_ringback_converted = self.dir_ringback / DIR_CONVERTED
        self.dir_ringback_active = self.dir_ringback / DIR_RINGBACK_ACTIVE
        self.dir_ringtones = self.base / DIR_RINGTONES

        self.settings: dict[str, Any] = dict(DEFAULT_SETTINGS)
        self.messages: list[Message] = []
        self.announcements: list[Announcement] = []
        self.ringback: list[RingbackTone] = []
        self.ringtones: list[Ringtone] = []
        self.last_ring: str | None = None
        self.in_call: bool = False

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

    # ------------------------------------------------------------------ Lifecycle
    async def async_setup(self) -> None:
        """Create folders, read the inventory, subscribe to events."""
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
        """Release subscriptions and stop a running recording."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self.recording:
            await self._stop_recording("unload")

    def _ensure_dirs(self) -> None:
        for d in (
            self.dir_mailbox,
            self.dir_announcements,
            self.dir_ringback,
            self.dir_ringback_converted,
            self.dir_ringback_active,
            self.dir_ringtones,
        ):
            d.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------ Listeners
    @callback
    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Entities subscribe here for state changes."""
        self._listeners.append(listener)

        def _remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return _remove

    @callback
    def add_event_listener(self, listener: Callable[[str, dict[str, Any]], None]) -> Callable[[], None]:
        """The event entity subscribes here."""
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

    # ------------------------------------------------------------------ Settings
    @callback
    def restore_setting(self, key: str, value: Any) -> None:
        """Take over a value from the restored entity state (without astdb)."""
        self.settings[key] = value

    async def async_set_setting(self, key: str, value: Any) -> None:
        """Change a setting, notify entities, push it to Asterisk."""
        if self.settings.get(key) == value:
            return
        self.settings[key] = value
        self._notify()
        if key == SETTING_RINGBACK:
            await self._activate_ringback(value)
        await self.async_sync_astdb([key])

    def _astdb_values(self) -> dict[str, str]:
        announcement = self.settings.get(SETTING_ANNOUNCEMENT) or ""
        announcement_path = str(self.dir_announcements / announcement) if announcement else ""
        ringback = self.settings.get(SETTING_RINGBACK) or "default"
        return {
            SETTING_RING_DURATION: str(int(self.settings[SETTING_RING_DURATION])),
            SETTING_TALK_TIME: str(int(self.settings[SETTING_TALK_TIME])),
            SETTING_VOICE_ANNOUNCEMENT: "on" if self.settings[SETTING_VOICE_ANNOUNCEMENT] else "off",
            SETTING_MAILBOX: "on" if self.settings[SETTING_MAILBOX] else "off",
            SETTING_RINGBACK: "default" if ringback == "default" else "file",
            SETTING_ANNOUNCEMENT: announcement_path,
        }

    async def async_sync_astdb(self, keys: list[str] | None = None) -> bool:
        """Write the settings to the Asterisk database via AMI DBPut."""
        if not self.hass.services.has_service(ASTERISK_DOMAIN, ASTERISK_SERVICE):
            _LOGGER.debug("Service %s.%s not available, astdb sync skipped", ASTERISK_DOMAIN, ASTERISK_SERVICE)
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
            except Exception as err:  # noqa: BLE001 - AMI errors must not stop the integration
                _LOGGER.warning("astdb %s/%s could not be written: %s", ASTDB_FAMILY, key, err)
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

    # ------------------------------------------------------------------ Ringing and recording
    @callback
    def _trigger_changed(self, event: Event[EventStateChangedData]) -> None:
        new = event.data.get("new_state")
        if new is None or new.state != self.trigger_state:
            return
        self.hass.async_create_task(self.async_handle_ring())

    async def async_handle_ring(self) -> None:
        """Handle a ring."""
        async with self._rec_lock:
            msg_id = _new_msg_id()
            self.last_ring = _now_iso()
            self._fire(EVENT_RING, {"id": msg_id})
            self.hass.bus.async_fire(HA_EVENT_RING, {"id": msg_id, "entry_id": self.entry.entry_id})
            if self.recording:
                _LOGGER.debug("Ring ignored while recording %s is running", self._rec_id)
                self._notify()
                return
            if self.settings.get(SETTING_MAILBOX):
                await self._start_recording(msg_id)
            self._notify()

    async def async_start_manual(self) -> None:
        """Start a recording manually (service, for tests)."""
        async with self._rec_lock:
            if self.recording:
                return
            await self._start_recording(_new_msg_id())
            self._notify()

    async def async_stop_manual(self) -> None:
        """Stop a recording manually (service)."""
        await self._stop_recording("manual")

    async def _start_recording(self, msg_id: str) -> None:
        part = self.dir_mailbox / f"{msg_id}.mp4.part"
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
            _LOGGER.error("ffmpeg could not be started: %s", err)
            self._proc = None
            return

        self.recording = True
        self._rec_id = msg_id
        self._rec_started = dt_util.now()
        self._rec_answered = False
        self._rec_snapshot = False
        _LOGGER.info("Recording %s started", msg_id)

        self.hass.async_create_task(self._take_snapshot(msg_id))
        self.hass.async_create_task(self._watch_process(self._proc, msg_id))
        self._rec_cancel_max = async_call_later(
            self.hass, self.max_clip_seconds + 5, lambda _now: self.hass.async_create_task(self._stop_recording("max"))
        )

    async def _take_snapshot(self, msg_id: str) -> None:
        if not self.camera_entity:
            return
        if self.snapshot_delay > 0:
            await asyncio.sleep(self.snapshot_delay)
        try:
            image = await async_get_image(self.hass, self.camera_entity, timeout=10)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Snapshot from %s failed: %s", self.camera_entity, err)
            return
        path = self.dir_mailbox / f"{msg_id}.jpg"
        await self.hass.async_add_executor_job(path.write_bytes, image.content)
        if self._rec_id == msg_id:
            self._rec_snapshot = True

    async def _watch_process(self, proc: asyncio.subprocess.Process, msg_id: str) -> None:
        """Finish the recording when ffmpeg exits on its own (stream error, maximum duration)."""
        stderr = b""
        try:
            _, stderr = await proc.communicate()
        except Exception:  # noqa: BLE001
            pass
        if stderr:
            _LOGGER.warning("ffmpeg %s: %s", msg_id, stderr.decode(errors="replace").strip()[:500])
        if self.recording and self._rec_id == msg_id and self._proc is proc:
            await self._finalize(msg_id)

    async def _stop_recording(self, reason: str) -> None:
        if not self.recording or self._proc is None:
            return
        proc = self._proc
        msg_id = self._rec_id or ""
        _LOGGER.info("Recording %s is being stopped (%s)", msg_id, reason)
        if proc.returncode is None:
            try:
                proc.send_signal(signal.SIGINT)
            except ProcessLookupError:
                pass
            try:
                await asyncio.wait_for(proc.wait(), timeout=15)
            except asyncio.TimeoutError:
                _LOGGER.warning("ffmpeg not responding, killing it")
                proc.kill()
                await proc.wait()
        if self.recording and self._rec_id == msg_id:
            await self._finalize(msg_id)

    async def _finalize(self, msg_id: str) -> None:
        if self._rec_cancel_max:
            self._rec_cancel_max()
            self._rec_cancel_max = None
        self.recording = False
        self._proc = None
        answered = self._rec_answered
        started = self._rec_started or dt_util.now()

        info = await self.hass.async_add_executor_job(self._finish_files, msg_id, started, answered)
        self._rec_id = None
        await self.async_refresh_index()

        if info is None:
            _LOGGER.warning("Recording %s ended without a usable file", msg_id)
            return
        payload = {"id": msg_id, **info}
        self._fire(EVENT_RECORDED, payload)
        if info.get("message"):
            self._fire(EVENT_MESSAGE, payload)
        self.hass.bus.async_fire(HA_EVENT_RECORDED, {**payload, "entry_id": self.entry.entry_id})

    def _finish_files(self, msg_id: str, started: datetime, answered: bool) -> dict[str, Any] | None:
        part = self.dir_mailbox / f"{msg_id}.mp4.part"
        clip = self.dir_mailbox / f"{msg_id}.mp4"
        image_path = self.dir_mailbox / f"{msg_id}.jpg"
        if part.exists():
            if part.stat().st_size > 0:
                part.replace(clip)
            else:
                part.unlink(missing_ok=True)
        if not clip.exists():
            image_path.unlink(missing_ok=True)
            return None

        duration = self._probe_duration(clip)
        if duration <= 0:
            duration = max(0.0, (dt_util.now() - started).total_seconds())
        if not image_path.exists():
            self._extract_frame(clip, image_path)

        ring_duration = int(self.settings.get(SETTING_RING_DURATION, 20))
        message = (
            not answered
            and bool(self.settings.get(SETTING_VOICE_ANNOUNCEMENT))
            and duration >= ring_duration + 5
        )
        record = Message(
            id=msg_id,
            time=started.isoformat(timespec="seconds"),
            duration=round(duration, 1),
            answered=answered,
            message=message,
            seen=False,
            clip=True,
            image=image_path.exists(),
        )
        (self.dir_mailbox / f"{msg_id}.json").write_text(json.dumps(asdict(record), ensure_ascii=False))
        return {"duration": record.duration, "answered": answered, "message": message}

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

    def _extract_frame(self, clip: Path, image_path: Path) -> None:
        try:
            subprocess.run(
                [self._ffmpeg, "-y", "-loglevel", "error", "-ss", "1", "-i", str(clip), "-frames:v", "1", "-q:v", "3", str(image_path)],
                capture_output=True,
                timeout=60,
                check=False,
            )
        except (OSError, subprocess.TimeoutExpired) as err:
            _LOGGER.debug("Preview image from clip failed: %s", err)

    @callback
    def _door_changed(self, event: Event[EventStateChangedData]) -> None:
        new = event.data.get("new_state")
        if new is None:
            return
        self.in_call = new.state != self.idle_state and new.state not in ("unknown", "unavailable", "Unavailable")
        if self.recording and new.state == self.idle_state:
            self.hass.async_create_task(self._stop_recording("call ended"))
        self._notify()

    @callback
    def _tablet_changed(self, event: Event[EventStateChangedData]) -> None:
        new = event.data.get("new_state")
        if new is None:
            return
        if self.recording and new.state == self.in_use_state and not self._rec_answered:
            self._rec_answered = True
            self._fire(EVENT_ANSWERED, {"id": self._rec_id})
            self._notify()

    # ------------------------------------------------------------------ Mailbox index
    async def async_refresh_index(self) -> None:
        self.messages = await self.hass.async_add_executor_job(self._scan_mailbox)
        self._notify()

    def _scan_mailbox(self) -> list[Message]:
        result: list[Message] = []
        if not self.dir_mailbox.exists():
            return result
        for meta in self.dir_mailbox.glob("*.json"):
            msg_id = meta.stem
            clip = self.dir_mailbox / f"{msg_id}.mp4"
            if not clip.exists():
                continue
            try:
                raw = _upgrade_keys(json.loads(meta.read_text()))
            except (OSError, ValueError):
                continue
            result.append(
                Message(
                    id=msg_id,
                    time=str(raw.get("time", "")),
                    duration=float(raw.get("duration", 0) or 0),
                    answered=bool(raw.get("answered", False)),
                    message=bool(raw.get("message", False)),
                    seen=bool(raw.get("seen", False)),
                    clip=True,
                    image=(self.dir_mailbox / f"{msg_id}.jpg").exists(),
                )
            )
        result.sort(key=lambda n: n.id, reverse=True)
        return result

    @property
    def new_messages(self) -> int:
        return sum(1 for n in self.messages if not n.seen)

    def messages_attr(self) -> list[dict[str, Any]]:
        out = []
        for n in self.messages:
            d = asdict(n)
            d["clip_url"] = f"/api/ha_intercom/media/{MEDIA_KIND_CLIP}/{n.id}"
            d["image_url"] = f"/api/ha_intercom/media/{MEDIA_KIND_IMAGE}/{n.id}" if n.image else None
            out.append(d)
        return out

    async def async_delete_message(self, msg_id: str) -> None:
        if not safe_name(msg_id):
            return
        await self.hass.async_add_executor_job(self._delete_entry_files, msg_id)
        await self.async_refresh_index()

    def _delete_entry_files(self, msg_id: str) -> None:
        for suffix in (".mp4", ".mp4.part", ".jpg", ".json"):
            (self.dir_mailbox / f"{msg_id}{suffix}").unlink(missing_ok=True)

    async def async_mark_message_seen(self, msg_id: str, seen: bool = True) -> None:
        if not safe_name(msg_id):
            return
        await self.hass.async_add_executor_job(self._mark_seen, [msg_id], seen)
        await self.async_refresh_index()

    async def async_mark_all_seen(self) -> None:
        await self.hass.async_add_executor_job(self._mark_seen, [n.id for n in self.messages], True)
        await self.async_refresh_index()

    def _mark_seen(self, msg_ids: list[str], seen: bool) -> None:
        for msg_id in msg_ids:
            meta = self.dir_mailbox / f"{msg_id}.json"
            if not meta.exists():
                continue
            try:
                raw = _upgrade_keys(json.loads(meta.read_text()))
            except (OSError, ValueError):
                continue
            raw["seen"] = seen
            meta.write_text(json.dumps(raw, ensure_ascii=False))

    async def async_cleanup(self) -> int:
        """Delete entries older than the retention period."""
        days = int(self.settings.get(SETTING_RETENTION, 30))
        cutoff = dt_util.now() - timedelta(days=days)
        deleted = 0
        for n in list(self.messages):
            try:
                when = datetime.fromisoformat(n.time)
            except ValueError:
                continue
            if when.tzinfo is None:
                when = when.replace(tzinfo=cutoff.tzinfo)
            if when < cutoff:
                await self.hass.async_add_executor_job(self._delete_entry_files, n.id)
                deleted += 1
        if deleted:
            _LOGGER.info("Cleanup: deleted %s entries older than %s days", deleted, days)
            await self.async_refresh_index()
        return deleted

    @callback
    def _nightly(self, _now: Any) -> None:
        self.hass.async_create_task(self.async_cleanup())

    @callback
    def _periodic(self, _now: Any) -> None:
        self.hass.async_create_task(self.async_scan_all(sync=True))

    # ------------------------------------------------------------------ Announcements and ringback tones
    async def async_scan_all(self, sync: bool) -> None:
        """Read the folders, convert new files, update the lists."""
        messages, announcements, ringback, ringtones = await self.hass.async_add_executor_job(self._scan_media)
        self.messages = messages
        self.announcements = announcements
        self.ringback = ringback
        self.ringtones = ringtones
        if not self.last_ring and messages:
            # After a restart: the newest mailbox entry counts as the last ring
            self.last_ring = max((n.time for n in messages if n.time), default=None)
        active_ringtone = self.settings.get(SETTING_RINGTONE) or ""
        if ringtones and not any(k.file == active_ringtone for k in ringtones):
            self.settings[SETTING_RINGTONE] = ringtones[0].file

        changed: list[str] = []
        active = self.settings.get(SETTING_ANNOUNCEMENT) or ""
        if active and not any(a.file == active for a in announcements):
            self.settings[SETTING_ANNOUNCEMENT] = ""
            changed.append(SETTING_ANNOUNCEMENT)
        active_ringback = self.settings.get(SETTING_RINGBACK) or "default"
        if active_ringback != "default" and not any(f.file == active_ringback for f in ringback):
            self.settings[SETTING_RINGBACK] = "default"
            changed.append(SETTING_RINGBACK)
        self._notify()
        if sync and changed:
            await self.async_sync_astdb(changed)

    def _scan_media(self) -> tuple[list[Message], list[Announcement], list[RingbackTone], list[Ringtone]]:
        return self._scan_mailbox(), self._scan_announcements(), self._scan_ringback(), self._scan_ringtones()

    def _scan_announcements(self) -> list[Announcement]:
        result: list[Announcement] = []
        if not self.dir_announcements.exists():
            return result
        # Convert raw files (MP3, WebM, ...) to WAV if no WAV exists yet
        for src in sorted(self.dir_announcements.iterdir()):
            if src.suffix.lower() not in AUDIO_EXTENSIONS or src.suffix.lower() == ".wav" or src.name.startswith("."):
                continue
            wav = self.dir_announcements / f"{src.stem}.wav"
            if wav.exists() and wav.stat().st_mtime >= src.stat().st_mtime:
                continue
            if self._convert_to_wav(src, wav):
                self._write_announcement_meta(wav, name=src.stem)
        for wav in sorted(self.dir_announcements.glob("*.wav")):
            meta = self._read_announcement_meta(wav)
            result.append(meta)
        # Remove orphaned companion files (JSON without WAV)
        for meta_path in self.dir_announcements.glob("*.json"):
            if not meta_path.with_suffix(".wav").exists():
                meta_path.unlink(missing_ok=True)
        result.sort(key=lambda a: a.created, reverse=True)
        return result

    def _read_announcement_meta(self, wav: Path) -> Announcement:
        meta_path = wav.with_suffix(".json")
        if meta_path.exists():
            try:
                raw = _upgrade_keys(json.loads(meta_path.read_text()))
                return Announcement(
                    file=wav.stem,
                    name=str(raw.get("name") or wav.stem),
                    created=str(raw.get("created") or ""),
                    duration=float(raw.get("duration", 0) or 0),
                )
            except (OSError, ValueError):
                pass
        return self._write_announcement_meta(wav, name=wav.stem)

    def _write_announcement_meta(self, wav: Path, name: str, created: str | None = None) -> Announcement:
        if created is None:
            created = datetime.fromtimestamp(wav.stat().st_mtime, tz=dt_util.DEFAULT_TIME_ZONE).isoformat(timespec="seconds")
        announcement = Announcement(file=wav.stem, name=name, created=created, duration=round(self._probe_duration(wav), 1))
        wav.with_suffix(".json").write_text(json.dumps(asdict(announcement), ensure_ascii=False))
        return announcement

    def _scan_ringback(self) -> list[RingbackTone]:
        result: list[RingbackTone] = []
        if not self.dir_ringback.exists():
            return result
        self.dir_ringback_converted.mkdir(exist_ok=True)
        sources: dict[str, Path] = {}
        for src in sorted(self.dir_ringback.iterdir()):
            if not src.is_file() or src.suffix.lower() not in AUDIO_EXTENSIONS or src.name.startswith("."):
                continue
            sources[src.stem] = src
            wav = self.dir_ringback_converted / f"{src.stem}.wav"
            if wav.exists() and wav.stat().st_mtime >= src.stat().st_mtime:
                continue
            self._convert_to_wav(src, wav)
        # remove orphaned conversions
        for wav in self.dir_ringback_converted.glob("*.wav"):
            if wav.stem not in sources:
                wav.unlink(missing_ok=True)
        for wav in sorted(self.dir_ringback_converted.glob("*.wav")):
            result.append(RingbackTone(file=wav.stem, name=wav.stem))
        return result

    def _convert_to_wav(self, src: Path, dst: Path) -> bool:
        """Convert any audio to 8 kHz, mono, 16-bit WAV (telephone format for Asterisk)."""
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
            _LOGGER.error("Conversion of %s failed: %s", src.name, err)
            tmp.unlink(missing_ok=True)
            return False
        if res.returncode != 0 or not tmp.exists():
            _LOGGER.error("Conversion of %s failed: %s", src.name, res.stderr.strip()[:300])
            tmp.unlink(missing_ok=True)
            return False
        tmp.replace(dst)
        return True

    async def _activate_ringback(self, file: str) -> None:
        """Copy the selected ringback file to active and reload the MOH class."""
        if file == "default":
            return
        ok = await self.hass.async_add_executor_job(self._copy_ringback, file)
        if not ok:
            return
        if self.addon_slug and self.hass.services.has_service("hassio", "addon_stdin"):
            try:
                await self.hass.services.async_call(
                    "hassio", "addon_stdin", {"addon": self.addon_slug, "input": "moh reload"}, blocking=True
                )
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("moh reload failed: %s", err)

    def _copy_ringback(self, file: str) -> bool:
        src = self.dir_ringback_converted / f"{file}.wav"
        if not src.exists():
            _LOGGER.warning("Ringback tone %s not found", file)
            return False
        self.dir_ringback_active.mkdir(exist_ok=True)
        for old in self.dir_ringback_active.glob("*"):
            old.unlink(missing_ok=True)
        shutil.copy2(src, self.dir_ringback_active / src.name)
        return True

    @property
    def ringback_options(self) -> list[str]:
        return [RINGBACK_DEFAULT] + [f.name for f in self.ringback]

    @property
    def ringback_current(self) -> str:
        active = self.settings.get(SETTING_RINGBACK) or "default"
        if active == "default":
            return RINGBACK_DEFAULT
        for f in self.ringback:
            if f.file == active:
                return f.name
        return RINGBACK_DEFAULT

    async def async_select_ringback(self, option: str) -> None:
        if option == RINGBACK_DEFAULT:
            await self.async_set_setting(SETTING_RINGBACK, "default")
            return
        for f in self.ringback:
            if f.name == option:
                await self.async_set_setting(SETTING_RINGBACK, f.file)
                return
        _LOGGER.warning("Ringback tone %s unknown", option)

    # ------------------------------------------------------------------ Indoor station ringtone
    def _scan_ringtones(self) -> list[Ringtone]:
        if not self.dir_ringtones.exists():
            return []
        result: list[Ringtone] = []
        for src in sorted(self.dir_ringtones.iterdir()):
            if src.is_file() and src.suffix.lower() in AUDIO_EXTENSIONS and not src.name.startswith("."):
                result.append(Ringtone(file=src.name, name=src.stem))
        return result

    @property
    def ringtone_options(self) -> list[str]:
        return [k.name for k in self.ringtones]

    @property
    def ringtone_current(self) -> str | None:
        active = self.settings.get(SETTING_RINGTONE) or ""
        for k in self.ringtones:
            if k.file == active:
                return k.name
        return None

    async def async_select_ringtone(self, option: str) -> None:
        for k in self.ringtones:
            if k.name == option:
                await self.async_set_setting(SETTING_RINGTONE, k.file)
                return
        _LOGGER.warning("Ringtone %s unknown", option)

    def ringtone_attr(self) -> dict[str, Any]:
        """Media source of the selected ringtone, directly usable for media_player.play_media."""
        active = self.settings.get(SETTING_RINGTONE) or ""
        file_path = self.dir_ringtones / active if active else None
        media_id = None
        if file_path is not None:
            media_dirs = dict(getattr(self.hass.config, "media_dirs", None) or {}) or {"local": "/media"}
            for name, root in media_dirs.items():
                try:
                    rel = file_path.relative_to(root)
                except ValueError:
                    continue
                media_id = f"media-source://media_source/{name}/{rel.as_posix()}"
                break
        suffix = file_path.suffix.lower() if file_path else ""
        mime_types = {
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
            "media_content_type": mime_types.get(suffix, "audio/mpeg"),
            "path": str(file_path) if file_path else None,
            "list": [k.name for k in self.ringtones],
        }

    @property
    def announcement_options(self) -> list[str]:
        return [ANNOUNCEMENT_NONE] + [a.name for a in self.announcements]

    @property
    def announcement_current(self) -> str:
        active = self.settings.get(SETTING_ANNOUNCEMENT) or ""
        for a in self.announcements:
            if a.file == active:
                return a.name
        return ANNOUNCEMENT_NONE

    def announcements_attr(self) -> list[dict[str, Any]]:
        active = self.settings.get(SETTING_ANNOUNCEMENT) or ""
        out = []
        for a in self.announcements:
            d = asdict(a)
            d["active"] = a.file == active
            d["url"] = f"/api/ha_intercom/media/{MEDIA_KIND_ANNOUNCEMENT}/{a.file}"
            out.append(d)
        return out

    def ringback_attr(self) -> list[dict[str, Any]]:
        active = self.settings.get(SETTING_RINGBACK) or "default"
        out = []
        for f in self.ringback:
            d = asdict(f)
            d["active"] = f.file == active
            d["url"] = f"/api/ha_intercom/media/{MEDIA_KIND_RINGBACK}/{f.file}"
            out.append(d)
        return out

    def _find_announcement(self, name: str) -> Announcement | None:
        for a in self.announcements:
            if a.name == name or a.file == name:
                return a
        return None

    async def async_activate_announcement(self, name: str) -> None:
        if name in (ANNOUNCEMENT_NONE, ""):
            await self.async_set_setting(SETTING_ANNOUNCEMENT, "")
            return
        announcement = self._find_announcement(name)
        if announcement is None:
            _LOGGER.warning("Announcement %s unknown", name)
            return
        await self.async_set_setting(SETTING_ANNOUNCEMENT, announcement.file)

    async def async_delete_announcement(self, name: str) -> None:
        announcement = self._find_announcement(name)
        if announcement is None:
            return
        await self.hass.async_add_executor_job(self._delete_announcement_files, announcement.file)
        if self.settings.get(SETTING_ANNOUNCEMENT) == announcement.file:
            self.settings[SETTING_ANNOUNCEMENT] = ""
            await self.async_sync_astdb([SETTING_ANNOUNCEMENT])
        await self.async_scan_all(sync=False)

    def _delete_announcement_files(self, file: str) -> None:
        for path in self.dir_announcements.glob(f"{file}.*"):
            path.unlink(missing_ok=True)

    async def async_rename_announcement(self, name: str, new_name: str) -> None:
        announcement = self._find_announcement(name)
        if announcement is None or not new_name.strip():
            return
        wav = self.dir_announcements / f"{announcement.file}.wav"
        await self.hass.async_add_executor_job(self._write_announcement_meta, wav, new_name.strip(), announcement.created)
        await self.async_scan_all(sync=False)

    async def async_save_announcement_upload(self, data: bytes, filename: str, name: str | None) -> Announcement | None:
        """Save an uploaded recording (WebM/MP4/MP3), convert it and add it to the list."""
        suffix = Path(filename or "").suffix.lower() or ".webm"
        if suffix not in AUDIO_EXTENSIONS and suffix not in (".mp4", ".m4a", ".weba"):
            suffix = ".webm"
        base = f"announcement-{_new_msg_id()}"
        display_name = (name or "").strip() or f"Announcement {dt_util.now().strftime('%d.%m. %H:%M')}"

        def _do() -> Announcement | None:
            # Store the raw file hidden and under its own name so that it never collides with the target WAV
            raw = self.dir_announcements / f".{base}.upload{suffix}"
            wav = self.dir_announcements / f"{base}.wav"
            raw.write_bytes(data)
            ok = self._convert_to_wav(raw, wav)
            raw.unlink(missing_ok=True)
            if not ok:
                return None
            return self._write_announcement_meta(wav, name=display_name, created=_now_iso())

        announcement = await self.hass.async_add_executor_job(_do)
        await self.async_scan_all(sync=False)
        return announcement

    # ------------------------------------------------------------------ Media paths for HTTP
    def media_path(self, kind: str, name: str) -> Path | None:
        if not safe_name(name):
            return None
        if kind == MEDIA_KIND_CLIP:
            return self.dir_mailbox / f"{name}.mp4"
        if kind == MEDIA_KIND_IMAGE:
            return self.dir_mailbox / f"{name}.jpg"
        if kind == MEDIA_KIND_ANNOUNCEMENT:
            return self.dir_announcements / f"{name}.wav"
        if kind == MEDIA_KIND_RINGBACK:
            return self.dir_ringback_converted / f"{name}.wav"
        return None

    # ------------------------------------------------------------------ End

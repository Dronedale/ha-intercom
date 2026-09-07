"""Sensoren: Nachrichten, neue Nachrichten, Ansagen, Freizeichen-Dateien, letztes Klingeln."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util

from . import IntercomConfigEntry
from .entity import IntercomEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: IntercomConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager = entry.runtime_data
    async_add_entities(
        [
            NachrichtenSensor(manager),
            NeueNachrichtenSensor(manager),
            AnsagenSensor(manager),
            FreizeichenSensor(manager),
            LetztesKlingelnSensor(manager),
        ]
    )


class NachrichtenSensor(IntercomEntity, SensorEntity):
    """Anzahl der Mailbox-Eintraege; die Liste liegt in den Attributen fuer die Karte."""

    _attr_icon = "mdi:voicemail"

    def __init__(self, manager) -> None:
        super().__init__(manager, "messages")

    @property
    def native_value(self) -> int:
        return len(self.manager.nachrichten)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "new": self.manager.neue_nachrichten,
            "entries": self.manager.nachrichten_attr(),
            "recording": self.manager.recording,
        }


class NeueNachrichtenSensor(IntercomEntity, SensorEntity):
    """Anzahl ungesehener Eintraege."""

    _attr_icon = "mdi:message-badge"

    def __init__(self, manager) -> None:
        super().__init__(manager, "new_messages")

    @property
    def native_value(self) -> int:
        return self.manager.neue_nachrichten


class AnsagenSensor(IntercomEntity, SensorEntity):
    """Anzahl der Ansagen; Liste und aktive Ansage in den Attributen."""

    _attr_icon = "mdi:account-voice"

    def __init__(self, manager) -> None:
        super().__init__(manager, "announcements")

    @property
    def native_value(self) -> int:
        return len(self.manager.ansagen)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"active": self.manager.ansage_current, "list": self.manager.ansagen_attr()}


class FreizeichenSensor(IntercomEntity, SensorEntity):
    """Anzahl der Freizeichen-Dateien; Liste und aktives Freizeichen in den Attributen."""

    _attr_icon = "mdi:music-box-multiple"

    def __init__(self, manager) -> None:
        super().__init__(manager, "ringback_files")

    @property
    def native_value(self) -> int:
        return len(self.manager.freizeichen)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"active": self.manager.freizeichen_current, "list": self.manager.freizeichen_attr()}


class LetztesKlingelnSensor(IntercomEntity, SensorEntity, RestoreEntity):
    """Zeitpunkt des letzten Klingelns; ueberlebt Neustarts ueber den gespeicherten Zustand."""

    _attr_icon = "mdi:bell-ring-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, manager) -> None:
        super().__init__(manager, "last_ring")

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if self.manager.letztes_klingeln:
            return
        last = await self.async_get_last_state()
        if last is not None and last.state not in (None, "unknown", "unavailable") and dt_util.parse_datetime(last.state):
            self.manager.letztes_klingeln = last.state

    @property
    def native_value(self) -> datetime | None:
        if not self.manager.letztes_klingeln:
            return None
        return dt_util.parse_datetime(self.manager.letztes_klingeln)

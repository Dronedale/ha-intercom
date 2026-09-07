"""Sensoren: Nachrichten, neue Nachrichten, Ansagen, Freizeichen-Dateien, letztes Klingeln."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
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

    _attr_name = "Nachrichten"
    _attr_icon = "mdi:voicemail"

    def __init__(self, manager) -> None:
        super().__init__(manager, "nachrichten")

    @property
    def native_value(self) -> int:
        return len(self.manager.nachrichten)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "neue": self.manager.neue_nachrichten,
            "eintraege": self.manager.nachrichten_attr(),
            "aufnahme_laeuft": self.manager.recording,
        }


class NeueNachrichtenSensor(IntercomEntity, SensorEntity):
    """Anzahl ungesehener Eintraege."""

    _attr_name = "Neue Nachrichten"
    _attr_icon = "mdi:message-badge"

    def __init__(self, manager) -> None:
        super().__init__(manager, "neue_nachrichten")

    @property
    def native_value(self) -> int:
        return self.manager.neue_nachrichten


class AnsagenSensor(IntercomEntity, SensorEntity):
    """Anzahl der Ansagen; Liste und aktive Ansage in den Attributen."""

    _attr_name = "Ansagen"
    _attr_icon = "mdi:account-voice"

    def __init__(self, manager) -> None:
        super().__init__(manager, "ansagen")

    @property
    def native_value(self) -> int:
        return len(self.manager.ansagen)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"aktiv": self.manager.ansage_current, "liste": self.manager.ansagen_attr()}


class FreizeichenSensor(IntercomEntity, SensorEntity):
    """Anzahl der Freizeichen-Dateien; Liste und aktives Freizeichen in den Attributen."""

    _attr_name = "Freizeichen-Dateien"
    _attr_icon = "mdi:music-box-multiple"

    def __init__(self, manager) -> None:
        super().__init__(manager, "freizeichen_dateien")

    @property
    def native_value(self) -> int:
        return len(self.manager.freizeichen)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"aktiv": self.manager.freizeichen_current, "liste": self.manager.freizeichen_attr()}


class LetztesKlingelnSensor(IntercomEntity, SensorEntity):
    """Zeitpunkt des letzten Klingelns."""

    _attr_name = "Letztes Klingeln"
    _attr_icon = "mdi:bell-ring-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, manager) -> None:
        super().__init__(manager, "letztes_klingeln")

    @property
    def native_value(self) -> datetime | None:
        if not self.manager.letztes_klingeln:
            return None
        return dt_util.parse_datetime(self.manager.letztes_klingeln)

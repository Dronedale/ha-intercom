"""Binaersensoren: Aufnahme laeuft, Tuerstation im Anruf."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import IntercomConfigEntry
from .entity import IntercomEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: IntercomConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager = entry.runtime_data
    async_add_entities([AufnahmeSensor(manager), ImAnrufSensor(manager)])


class AufnahmeSensor(IntercomEntity, BinarySensorEntity):
    """An, solange ffmpeg einen Clip aufzeichnet."""

    _attr_name = "Aufnahme"
    _attr_device_class = BinarySensorDeviceClass.RUNNING
    _attr_icon = "mdi:record-rec"

    def __init__(self, manager) -> None:
        super().__init__(manager, "aufnahme")

    @property
    def is_on(self) -> bool:
        return self.manager.recording


class ImAnrufSensor(IntercomEntity, BinarySensorEntity):
    """An, solange die Tuerstation nicht im Ruhezustand ist (klingelt oder spricht)."""

    _attr_name = "Türstation im Anruf"
    _attr_icon = "mdi:phone-in-talk"

    def __init__(self, manager) -> None:
        super().__init__(manager, "im_anruf")

    @property
    def is_on(self) -> bool:
        return self.manager.im_anruf

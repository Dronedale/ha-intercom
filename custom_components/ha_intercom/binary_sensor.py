"""Binary sensors: recording in progress, door station in call."""

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
    async_add_entities([RecordingSensor(manager), InCallSensor(manager)])


class RecordingSensor(IntercomEntity, BinarySensorEntity):
    """On while ffmpeg is recording a clip."""

    _attr_device_class = BinarySensorDeviceClass.RUNNING
    _attr_icon = "mdi:record-rec"

    def __init__(self, manager) -> None:
        super().__init__(manager, "recording")

    @property
    def is_on(self) -> bool:
        return self.manager.recording


class InCallSensor(IntercomEntity, BinarySensorEntity):
    """On while the door station is not idle (ringing or talking)."""

    _attr_icon = "mdi:phone-in-talk"

    def __init__(self, manager) -> None:
        super().__init__(manager, "in_call")

    @property
    def is_on(self) -> bool:
        return self.manager.in_call

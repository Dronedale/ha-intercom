"""Ereignis-Entitaet: klingeln, angenommen, aufgezeichnet, nachricht."""

from __future__ import annotations

from typing import Any

from homeassistant.components.event import EventDeviceClass, EventEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import IntercomConfigEntry
from .const import EVENT_TYPES
from .entity import IntercomEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: IntercomConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([KlingelEvent(entry.runtime_data)])


class KlingelEvent(IntercomEntity, EventEntity):
    """Automationen hoeren hierauf statt auf die Tuerstation direkt."""

    _attr_device_class = EventDeviceClass.DOORBELL
    _attr_event_types = EVENT_TYPES

    def __init__(self, manager) -> None:
        super().__init__(manager, "klingel")

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(self.manager.add_event_listener(self._handle_event))

    @callback
    def _handle_event(self, event_type: str, data: dict[str, Any]) -> None:
        self._trigger_event(event_type, data)
        self.async_write_ha_state()

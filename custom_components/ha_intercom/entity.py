"""Gemeinsame Basis der Intercom-Entitaeten."""

from __future__ import annotations

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .manager import IntercomManager

VERSION = "0.1.0"


class IntercomEntity(Entity):
    """Basisklasse: Geraetezuordnung, eindeutige ID, Aktualisierung ueber den Manager."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, manager: IntercomManager, key: str) -> None:
        self.manager = manager
        self._key = key
        self._attr_unique_id = f"{manager.entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, manager.entry.entry_id)},
            name="Intercom",
            manufacturer="ha-intercom",
            model="Türsprechanlage",
            sw_version=VERSION,
        )

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(self.manager.add_listener(self._handle_update))

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()

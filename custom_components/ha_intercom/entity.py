"""Common base of the Intercom entities."""

from __future__ import annotations

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .manager import IntercomManager

VERSION = "0.2.0"

# English names for the object IDs so that the entity IDs read the same in every language
# (e.g. number.intercom_ring_duration). The display names come from the translations.
OBJECT_ID_NAMES = {
    "mailbox": "Mailbox",
    "voice_announcement": "Voice announcement",
    "ring_duration": "Ring duration",
    "talk_time": "Talk time after announcement",
    "retention": "Retention",
    "ringback": "Ringback tone",
    "announcement": "Active announcement",
    "ringtone": "Indoor ringtone",
    "messages": "Messages",
    "new_messages": "New messages",
    "announcements": "Announcements",
    "ringback_files": "Ringback files",
    "last_ring": "Last ring",
    "recording": "Recording",
    "in_call": "Door station in call",
    "doorbell": "Doorbell",
}


class IntercomEntity(Entity):
    """Base class: device assignment, unique ID, updates via the manager."""

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
            model="Door intercom",
            sw_version=VERSION,
        )

    @property
    def suggested_object_id(self) -> str | None:
        """Object ID derived from the English name, independent of the instance language."""
        return OBJECT_ID_NAMES.get(self._key) or super().suggested_object_id

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(self.manager.add_listener(self._handle_update))

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()

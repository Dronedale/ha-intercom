"""Sensors: messages, new messages, announcements, ringback files, last ring."""

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
            MessagesSensor(manager),
            NewMessagesSensor(manager),
            AnnouncementsSensor(manager),
            RingbackFilesSensor(manager),
            LastRingSensor(manager),
        ]
    )


class MessagesSensor(IntercomEntity, SensorEntity):
    """Number of mailbox entries; the list is in the attributes for the card."""

    _attr_icon = "mdi:voicemail"

    def __init__(self, manager) -> None:
        super().__init__(manager, "messages")

    @property
    def native_value(self) -> int:
        return len(self.manager.messages)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "new": self.manager.new_messages,
            "entries": self.manager.messages_attr(),
            "recording": self.manager.recording,
        }


class NewMessagesSensor(IntercomEntity, SensorEntity):
    """Number of unseen entries."""

    _attr_icon = "mdi:message-badge"

    def __init__(self, manager) -> None:
        super().__init__(manager, "new_messages")

    @property
    def native_value(self) -> int:
        return self.manager.new_messages


class AnnouncementsSensor(IntercomEntity, SensorEntity):
    """Number of announcements; list and active announcement in the attributes."""

    _attr_icon = "mdi:account-voice"

    def __init__(self, manager) -> None:
        super().__init__(manager, "announcements")

    @property
    def native_value(self) -> int:
        return len(self.manager.announcements)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"active": self.manager.announcement_current, "list": self.manager.announcements_attr()}


class RingbackFilesSensor(IntercomEntity, SensorEntity):
    """Number of ringback files; list and active ringback tone in the attributes."""

    _attr_icon = "mdi:music-box-multiple"

    def __init__(self, manager) -> None:
        super().__init__(manager, "ringback_files")

    @property
    def native_value(self) -> int:
        return len(self.manager.ringback)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"active": self.manager.ringback_current, "list": self.manager.ringback_attr()}


class LastRingSensor(IntercomEntity, SensorEntity, RestoreEntity):
    """Time of the last ring; survives restarts via the stored state."""

    _attr_icon = "mdi:bell-ring-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, manager) -> None:
        super().__init__(manager, "last_ring")

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if self.manager.last_ring:
            return
        last = await self.async_get_last_state()
        if last is not None and last.state not in (None, "unknown", "unavailable") and dt_util.parse_datetime(last.state):
            self.manager.last_ring = last.state

    @property
    def native_value(self) -> datetime | None:
        if not self.manager.last_ring:
            return None
        return dt_util.parse_datetime(self.manager.last_ring)

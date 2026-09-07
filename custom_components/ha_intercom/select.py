"""Selects: active ringback tone, active announcement and indoor station ringtone."""

from __future__ import annotations

from typing import Any

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from . import IntercomConfigEntry
from .const import ANNOUNCEMENT_NONE, RINGBACK_DEFAULT, SETTING_ANNOUNCEMENT, SETTING_RINGBACK, SETTING_RINGTONE
from .entity import IntercomEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: IntercomConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager = entry.runtime_data
    async_add_entities(
        [IntercomRingbackSelect(manager), IntercomAnnouncementSelect(manager), IntercomRingtoneSelect(manager)]
    )


class IntercomRingbackSelect(IntercomEntity, SelectEntity, RestoreEntity):
    """Ringback tone at the door: default tone or a file from the ringback folder."""

    _attr_icon = "mdi:music-note"

    def __init__(self, manager) -> None:
        super().__init__(manager, SETTING_RINGBACK)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is None or last.state in (None, "unknown", "unavailable", RINGBACK_DEFAULT):
            return
        for f in self.manager.ringback:
            if f.name == last.state:
                self.manager.restore_setting(SETTING_RINGBACK, f.file)
                return

    @property
    def options(self) -> list[str]:
        return self.manager.ringback_options

    @property
    def current_option(self) -> str | None:
        return self.manager.ringback_current

    async def async_select_option(self, option: str) -> None:
        await self.manager.async_select_ringback(option)


class IntercomAnnouncementSelect(IntercomEntity, SelectEntity, RestoreEntity):
    """Active announcement of the answering machine."""

    _attr_icon = "mdi:account-voice"

    def __init__(self, manager) -> None:
        super().__init__(manager, SETTING_ANNOUNCEMENT)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is None or last.state in (None, "unknown", "unavailable", ANNOUNCEMENT_NONE):
            return
        for a in self.manager.announcements:
            if a.name == last.state:
                self.manager.restore_setting(SETTING_ANNOUNCEMENT, a.file)
                return

    @property
    def options(self) -> list[str]:
        return self.manager.announcement_options

    @property
    def current_option(self) -> str | None:
        return self.manager.announcement_current

    async def async_select_option(self, option: str) -> None:
        await self.manager.async_activate_announcement(option)


class IntercomRingtoneSelect(IntercomEntity, SelectEntity, RestoreEntity):
    """Ringtone of the indoor station (wall tablet): a file from the ringtones folder.

    The attributes media_content_id and media_content_type can be passed directly to media_player.play_media.
    """

    _attr_icon = "mdi:bell-ring-outline"

    def __init__(self, manager) -> None:
        super().__init__(manager, SETTING_RINGTONE)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is None or last.state in (None, "unknown", "unavailable"):
            return
        for k in self.manager.ringtones:
            if k.name == last.state:
                self.manager.restore_setting(SETTING_RINGTONE, k.file)
                return

    @property
    def options(self) -> list[str]:
        return self.manager.ringtone_options

    @property
    def current_option(self) -> str | None:
        return self.manager.ringtone_current

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self.manager.ringtone_attr()

    async def async_select_option(self, option: str) -> None:
        await self.manager.async_select_ringtone(option)

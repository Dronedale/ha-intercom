"""Switches: mailbox and voice announcement."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from . import IntercomConfigEntry
from .const import SETTING_MAILBOX, SETTING_VOICE_ANNOUNCEMENT
from .entity import IntercomEntity

SWITCHES: list[tuple[str, str]] = [
    (SETTING_MAILBOX, "mdi:voicemail"),
    (SETTING_VOICE_ANNOUNCEMENT, "mdi:account-voice"),
]


async def async_setup_entry(
    hass: HomeAssistant, entry: IntercomConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager = entry.runtime_data
    async_add_entities(IntercomSwitch(manager, key, icon) for key, icon in SWITCHES)


class IntercomSwitch(IntercomEntity, SwitchEntity, RestoreEntity):
    """An on/off value of the manager; state is restored after a restart."""

    def __init__(self, manager, key: str, icon: str) -> None:
        super().__init__(manager, key)
        self._attr_icon = icon

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None and last.state in ("on", "off"):
            self.manager.restore_setting(self._key, last.state == "on")

    @property
    def is_on(self) -> bool:
        return bool(self.manager.settings.get(self._key))

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.manager.async_set_setting(self._key, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.manager.async_set_setting(self._key, False)

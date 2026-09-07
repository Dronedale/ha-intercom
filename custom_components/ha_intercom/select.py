"""Auswahl: aktives Freizeichen, aktive Ansage und Klingelton der Innenstation."""

from __future__ import annotations

from typing import Any

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from . import IntercomConfigEntry
from .const import ANSAGE_KEINE, FREIZEICHEN_STANDARD, SETTING_ANSAGE, SETTING_FREIZEICHEN, SETTING_KLINGELTON
from .entity import IntercomEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: IntercomConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager = entry.runtime_data
    async_add_entities(
        [IntercomFreizeichenSelect(manager), IntercomAnsageSelect(manager), IntercomKlingeltonSelect(manager)]
    )


class IntercomFreizeichenSelect(IntercomEntity, SelectEntity, RestoreEntity):
    """Freizeichen an der Tuer: Standardton oder eine Datei aus dem Ordner freizeichen."""

    _attr_name = "Freizeichen"
    _attr_icon = "mdi:music-note"

    def __init__(self, manager) -> None:
        super().__init__(manager, SETTING_FREIZEICHEN)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is None or last.state in (None, "unknown", "unavailable", FREIZEICHEN_STANDARD):
            return
        for f in self.manager.freizeichen:
            if f.name == last.state:
                self.manager.restore_setting(SETTING_FREIZEICHEN, f.datei)
                return

    @property
    def options(self) -> list[str]:
        return self.manager.freizeichen_options

    @property
    def current_option(self) -> str | None:
        return self.manager.freizeichen_current

    async def async_select_option(self, option: str) -> None:
        await self.manager.async_select_freizeichen(option)


class IntercomAnsageSelect(IntercomEntity, SelectEntity, RestoreEntity):
    """Aktive Ansage des Anrufbeantworters."""

    _attr_name = "Ansage"
    _attr_icon = "mdi:account-voice"

    def __init__(self, manager) -> None:
        super().__init__(manager, SETTING_ANSAGE)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is None or last.state in (None, "unknown", "unavailable", ANSAGE_KEINE):
            return
        for a in self.manager.ansagen:
            if a.name == last.state:
                self.manager.restore_setting(SETTING_ANSAGE, a.datei)
                return

    @property
    def options(self) -> list[str]:
        return self.manager.ansage_options

    @property
    def current_option(self) -> str | None:
        return self.manager.ansage_current

    async def async_select_option(self, option: str) -> None:
        await self.manager.async_ansage_aktivieren(option)


class IntercomKlingeltonSelect(IntercomEntity, SelectEntity, RestoreEntity):
    """Klingelton der Innenstation (Wandtablet): eine Datei aus dem Ordner klingeltoene.

    Attribute media_content_id und media_content_type lassen sich direkt an media_player.play_media geben.
    """

    _attr_name = "Klingelton Innenstation"
    _attr_icon = "mdi:bell-ring-outline"

    def __init__(self, manager) -> None:
        super().__init__(manager, SETTING_KLINGELTON)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is None or last.state in (None, "unknown", "unavailable"):
            return
        for k in self.manager.klingeltoene:
            if k.name == last.state:
                self.manager.restore_setting(SETTING_KLINGELTON, k.datei)
                return

    @property
    def options(self) -> list[str]:
        return self.manager.klingelton_options

    @property
    def current_option(self) -> str | None:
        return self.manager.klingelton_current

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self.manager.klingelton_attr()

    async def async_select_option(self, option: str) -> None:
        await self.manager.async_select_klingelton(option)

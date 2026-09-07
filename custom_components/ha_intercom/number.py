"""Numbers: ring duration, talk time, retention."""

from __future__ import annotations

from homeassistant.components.number import NumberMode, RestoreNumber
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import IntercomConfigEntry
from .const import SETTING_RETENTION, SETTING_RING_DURATION, SETTING_TALK_TIME
from .entity import IntercomEntity

# key, min, max, step, unit, icon
NUMBERS: list[tuple[str, int, int, int, str, str]] = [
    (SETTING_RING_DURATION, 5, 60, 1, "s", "mdi:timer-outline"),
    (SETTING_TALK_TIME, 10, 60, 5, "s", "mdi:microphone-message"),
    (SETTING_RETENTION, 1, 365, 1, "d", "mdi:calendar-clock"),
]


async def async_setup_entry(
    hass: HomeAssistant, entry: IntercomConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager = entry.runtime_data
    async_add_entities(IntercomNumber(manager, *spec) for spec in NUMBERS)


class IntercomNumber(IntercomEntity, RestoreNumber):
    """A numeric value of the manager; state is restored after a restart."""

    _attr_mode = NumberMode.SLIDER

    def __init__(self, manager, key: str, vmin: int, vmax: int, step: int, unit: str, icon: str) -> None:
        super().__init__(manager, key)
        self._attr_native_min_value = vmin
        self._attr_native_max_value = vmax
        self._attr_native_step = step
        self._attr_native_unit_of_measurement = unit
        self._attr_icon = icon

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        data = await self.async_get_last_number_data()
        if data is not None and data.native_value is not None:
            value = int(data.native_value)
            if self._attr_native_min_value <= value <= self._attr_native_max_value:
                self.manager.restore_setting(self._key, value)

    @property
    def native_value(self) -> float | None:
        value = self.manager.settings.get(self._key)
        return float(value) if value is not None else None

    async def async_set_native_value(self, value: float) -> None:
        await self.manager.async_set_setting(self._key, int(value))

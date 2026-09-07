"""Test helper: provides the asterisk.send_action service so the intercom config flow runs through locally.

Only for the local test instance (.test/config/custom_components), not part of the integration.
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.typing import ConfigType

DOMAIN = "fake_asterisk"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async def send_action(call: ServiceCall) -> None:
        hass.bus.async_fire("fake_asterisk_action", dict(call.data))

    hass.services.async_register("asterisk", "send_action", send_action)
    return True

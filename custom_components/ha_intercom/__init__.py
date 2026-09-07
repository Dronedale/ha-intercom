"""Intercom: door intercom with mailbox, announcements and ringback tones for Home Assistant."""

from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import (
    ATTR_ID,
    ATTR_NAME,
    ATTR_NEW_NAME,
    DOMAIN,
    SERVICE_MARK_ALL_SEEN,
    SERVICE_ACTIVATE_ANNOUNCEMENT,
    SERVICE_DELETE_ANNOUNCEMENT,
    SERVICE_RENAME_ANNOUNCEMENT,
    SERVICE_ASTERISK_SYNC,
    SERVICE_START_RECORDING,
    SERVICE_STOP_RECORDING,
    SERVICE_RESCAN,
    SERVICE_MARK_MESSAGE_SEEN,
    SERVICE_DELETE_MESSAGE,
)
from .http import IntercomMediaView, IntercomUploadView
from .frontend import async_register_frontend, async_register_resource
from .manager import IntercomManager
from .websocket import async_register_websocket

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SWITCH,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.EVENT,
]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type IntercomConfigEntry = ConfigEntry[IntercomManager]

ATTR_ENTRY_ID = "entry_id"

SCHEMA_ID = vol.Schema(
    {vol.Required(ATTR_ID): cv.string, vol.Optional(ATTR_ENTRY_ID): cv.string}
)
SCHEMA_NAME = vol.Schema({vol.Required(ATTR_NAME): cv.string, vol.Optional(ATTR_ENTRY_ID): cv.string})
SCHEMA_RENAME = vol.Schema(
    {
        vol.Required(ATTR_NAME): cv.string,
        vol.Required(ATTR_NEW_NAME): cv.string,
        vol.Optional(ATTR_ENTRY_ID): cv.string,
    }
)
SCHEMA_PLAIN = vol.Schema({vol.Optional(ATTR_ENTRY_ID): cv.string})


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Create the scaffolding and register endpoints and services once."""
    hass.data.setdefault(DOMAIN, {})
    hass.http.register_view(IntercomMediaView(hass))
    hass.http.register_view(IntercomUploadView(hass))
    await async_register_frontend(hass)
    async_register_websocket(hass)
    _register_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: IntercomConfigEntry) -> bool:
    """Start an Intercom entry."""
    manager = IntercomManager(hass, entry)
    await manager.async_setup()
    entry.runtime_data = manager
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = manager

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    try:
        await async_register_resource(hass)
    except Exception as err:  # noqa: BLE001 - the card must never block the entry
        _LOGGER.warning("Could not register the Intercom card as a dashboard resource: %s", err)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: IntercomConfigEntry) -> bool:
    """Unload an Intercom entry."""
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        manager: IntercomManager = entry.runtime_data
        await manager.async_unload()
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return ok


async def _async_update_listener(hass: HomeAssistant, entry: IntercomConfigEntry) -> None:
    """Options changed: reload the entry."""
    await hass.config_entries.async_reload(entry.entry_id)


def _pick_manager(hass: HomeAssistant, call: ServiceCall) -> IntercomManager | None:
    managers: dict[str, IntercomManager] = hass.data.get(DOMAIN, {})
    entry_id = call.data.get(ATTR_ENTRY_ID)
    if entry_id:
        return managers.get(entry_id)
    return next(iter(managers.values()), None)


@callback
def _register_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, SERVICE_RESCAN):
        return

    async def delete_message(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_delete_message(call.data[ATTR_ID])

    async def mark_message_seen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_mark_message_seen(call.data[ATTR_ID], True)

    async def mark_all_seen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_mark_all_seen()

    async def activate_announcement(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_activate_announcement(call.data[ATTR_NAME])

    async def delete_announcement(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_delete_announcement(call.data[ATTR_NAME])

    async def rename_announcement(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_rename_announcement(call.data[ATTR_NAME], call.data[ATTR_NEW_NAME])

    async def start_recording(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_start_manual()

    async def stop_recording(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_stop_manual()

    async def rescan(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_scan_all(sync=True)

    async def asterisk_sync(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_sync_astdb()

    hass.services.async_register(DOMAIN, SERVICE_DELETE_MESSAGE, delete_message, schema=SCHEMA_ID)
    hass.services.async_register(DOMAIN, SERVICE_MARK_MESSAGE_SEEN, mark_message_seen, schema=SCHEMA_ID)
    hass.services.async_register(DOMAIN, SERVICE_MARK_ALL_SEEN, mark_all_seen, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_ACTIVATE_ANNOUNCEMENT, activate_announcement, schema=SCHEMA_NAME)
    hass.services.async_register(DOMAIN, SERVICE_DELETE_ANNOUNCEMENT, delete_announcement, schema=SCHEMA_NAME)
    hass.services.async_register(DOMAIN, SERVICE_RENAME_ANNOUNCEMENT, rename_announcement, schema=SCHEMA_RENAME)
    hass.services.async_register(DOMAIN, SERVICE_START_RECORDING, start_recording, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_STOP_RECORDING, stop_recording, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_RESCAN, rescan, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_ASTERISK_SYNC, asterisk_sync, schema=SCHEMA_PLAIN)

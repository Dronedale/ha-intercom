"""WebSocket command for the card: configuration, entities and extensions of an Intercom entry."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er

from .const import (
    CONF_ALARM_ENTITY,
    CONF_AMI_CONNECTED_ENTITY,
    CONF_BASE_DIR,
    CONF_CAMERA_ENTITY,
    CONF_DOOR_STATE_ENTITY,
    CONF_EXT_DOOR,
    CONF_EXT_TABLET,
    CONF_IDLE_STATE,
    CONF_IN_USE_STATE,
    CONF_LOCK_ENTITY,
    CONF_TABLET_STATE_ENTITY,
    CONF_TRIGGER_ENTITY,
    DEFAULT_IDLE_STATE,
    DEFAULT_IN_USE_STATE,
    DOMAIN,
    SIP_CORE_DOMAIN,
    URL_MEDIA,
    URL_UPLOAD,
)
from .discovery import asterisk_endpoints
from .entity import VERSION

WS_TYPE_INFO = f"{DOMAIN}/info"


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    """Register the commands once."""
    websocket_api.async_register_command(hass, ws_info)


@websocket_api.websocket_command({vol.Required("type"): WS_TYPE_INFO, vol.Optional("entry_id"): str})
@callback
def ws_info(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Returns, per entry, the configuration, the mapping key -> entity ID and the extensions."""
    registry = er.async_get(hass)
    wanted = msg.get("entry_id")
    entries: list[dict[str, Any]] = []
    extensions = asterisk_endpoints(hass)
    sip_core = bool(hass.config_entries.async_entries(SIP_CORE_DOMAIN))
    for entry_id, manager in hass.data.get(DOMAIN, {}).items():
        if wanted and entry_id != wanted:
            continue
        entry = manager.entry
        cfg = {**entry.data, **entry.options}
        prefix = f"{entry_id}_"
        entities: dict[str, str] = {}
        for reg in er.async_entries_for_config_entry(registry, entry_id):
            if reg.unique_id and reg.unique_id.startswith(prefix):
                entities[reg.unique_id[len(prefix):]] = reg.entity_id
        entries.append(
            {
                "entry_id": entry_id,
                "title": entry.title,
                "ext_door": cfg.get(CONF_EXT_DOOR),
                "ext_tablet": cfg.get(CONF_EXT_TABLET),
                "camera_entity": cfg.get(CONF_CAMERA_ENTITY),
                "trigger_entity": cfg.get(CONF_TRIGGER_ENTITY),
                "door_state_entity": cfg.get(CONF_DOOR_STATE_ENTITY),
                "tablet_state_entity": cfg.get(CONF_TABLET_STATE_ENTITY),
                "ami_connected_entity": cfg.get(CONF_AMI_CONNECTED_ENTITY),
                "alarm_entity": cfg.get(CONF_ALARM_ENTITY) or None,
                "lock_entity": cfg.get(CONF_LOCK_ENTITY) or None,
                "idle_state": cfg.get(CONF_IDLE_STATE, DEFAULT_IDLE_STATE),
                "in_use_state": cfg.get(CONF_IN_USE_STATE, DEFAULT_IN_USE_STATE),
                "base_dir": cfg.get(CONF_BASE_DIR),
                "entities": entities,
                "extensions": extensions,
                "sip_core": sip_core,
                "media_url": URL_MEDIA,
                "upload_url": URL_UPLOAD,
            }
        )
    connection.send_result(msg["id"], {"version": VERSION, "entries": entries})

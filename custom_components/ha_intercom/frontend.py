"""Serving the card: static path and entry in the dashboard resources.

The built card lives at frontend/intercom-card.js and is served under /intercom_files/.
When an entry starts, it is registered as a module if the resources are managed by Home Assistant;
the version tag in the URL makes browsers load a new build.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.const import CONF_ID, CONF_URL
from homeassistant.core import HomeAssistant

from .entity import VERSION

try:  # name of the resource type field, depends on the version
    from homeassistant.components.lovelace.const import CONF_RESOURCE_TYPE_WS
except ImportError:  # pragma: no cover
    CONF_RESOURCE_TYPE_WS = "res_type"

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
CARD_FILE = FRONTEND_DIR / "intercom-card.js"
CARD_URL = "/intercom_files/intercom-card.js"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register the static path for the card (without cache headers so that changes get through)."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(CARD_FILE), cache_headers=False)]
    )


def _version_tag() -> str:
    try:
        return f"{VERSION}.{int(CARD_FILE.stat().st_mtime)}"
    except OSError:
        return VERSION


async def async_register_resource(hass: HomeAssistant) -> None:
    """Register the card in the dashboard resources or bump the URL to the current build."""
    lovelace = hass.data.get("lovelace")
    resources = getattr(lovelace, "resources", None)
    if resources is None and isinstance(lovelace, dict):
        resources = lovelace.get("resources")
    if resources is None:
        _LOGGER.debug("No dashboard resources available, the card has to be added manually")
        return
    if not getattr(resources, "loaded", True):
        await resources.async_load()
        resources.loaded = True

    tag = await hass.async_add_executor_job(_version_tag)
    url = f"{CARD_URL}?v={tag}"
    for item in resources.async_items():
        if str(item.get(CONF_URL, "")).split("?", 1)[0] != CARD_URL:
            continue
        if item[CONF_URL] == url:
            return
        if not hasattr(resources, "async_update_item"):
            _LOGGER.warning("Dashboard resources are managed via YAML; please add %s", url)
            return
        await resources.async_update_item(item[CONF_ID], {CONF_URL: url})
        _LOGGER.info("Intercom card resource updated: %s", url)
        return
    if not hasattr(resources, "async_create_item"):
        _LOGGER.warning("Dashboard resources are managed via YAML; please add %s", url)
        return
    await resources.async_create_item({CONF_RESOURCE_TYPE_WS: "module", CONF_URL: url})
    _LOGGER.info("Intercom card registered as dashboard resource: %s", url)

"""Auslieferung der Karte: statischer Pfad und Eintrag in den Dashboard-Ressourcen.

Die gebaute Karte liegt unter frontend/intercom-card.js und wird unter /intercom_files/ bereitgestellt.
Beim Start eines Eintrags wird sie, falls die Ressourcen in Home Assistant verwaltet werden, als
Modul eingetragen; die Versionsangabe in der URL sorgt dafuer, dass Browser eine neue Fassung laden.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.const import CONF_ID, CONF_URL
from homeassistant.core import HomeAssistant

from .entity import VERSION

try:  # Name des Feldes fuer den Ressourcentyp, je nach Version
    from homeassistant.components.lovelace.const import CONF_RESOURCE_TYPE_WS
except ImportError:  # pragma: no cover
    CONF_RESOURCE_TYPE_WS = "res_type"

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
CARD_FILE = FRONTEND_DIR / "intercom-card.js"
CARD_URL = "/intercom_files/intercom-card.js"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Statischen Pfad fuer die Karte anmelden (ohne Cache-Header, damit Aenderungen ankommen)."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(CARD_FILE), cache_headers=False)]
    )


def _version_tag() -> str:
    try:
        return f"{VERSION}.{int(CARD_FILE.stat().st_mtime)}"
    except OSError:
        return VERSION


async def async_register_resource(hass: HomeAssistant) -> None:
    """Karte in den Dashboard-Ressourcen eintragen oder die URL auf die aktuelle Fassung heben."""
    lovelace = hass.data.get("lovelace")
    resources = getattr(lovelace, "resources", None)
    if resources is None and isinstance(lovelace, dict):
        resources = lovelace.get("resources")
    if resources is None:
        _LOGGER.debug("Keine Dashboard-Ressourcen verfuegbar, Karte muss von Hand eingebunden werden")
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
            _LOGGER.warning("Dashboard-Ressourcen werden per YAML verwaltet; bitte %s eintragen", url)
            return
        await resources.async_update_item(item[CONF_ID], {CONF_URL: url})
        _LOGGER.info("Ressource der Intercom-Karte aktualisiert: %s", url)
        return
    if not hasattr(resources, "async_create_item"):
        _LOGGER.warning("Dashboard-Ressourcen werden per YAML verwaltet; bitte %s eintragen", url)
        return
    await resources.async_create_item({CONF_RESOURCE_TYPE_WS: "module", CONF_URL: url})
    _LOGGER.info("Intercom-Karte als Dashboard-Ressource eingetragen: %s", url)

"""Intercom: Tuersprechanlage mit Mailbox, Ansagen und Freizeichen fuer Home Assistant."""

from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import (
    ATTR_KENNUNG,
    ATTR_NAME,
    ATTR_NEUER_NAME,
    DOMAIN,
    SERVICE_ALLE_GESEHEN,
    SERVICE_ANSAGE_AKTIVIEREN,
    SERVICE_ANSAGE_LOESCHEN,
    SERVICE_ANSAGE_UMBENENNEN,
    SERVICE_ASTERISK_SYNC,
    SERVICE_AUFNAHME_STARTEN,
    SERVICE_AUFNAHME_STOPPEN,
    SERVICE_INDEX_NEU,
    SERVICE_NACHRICHT_GESEHEN,
    SERVICE_NACHRICHT_LOESCHEN,
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

SCHEMA_KENNUNG = vol.Schema(
    {vol.Required(ATTR_KENNUNG): cv.string, vol.Optional(ATTR_ENTRY_ID): cv.string}
)
SCHEMA_NAME = vol.Schema({vol.Required(ATTR_NAME): cv.string, vol.Optional(ATTR_ENTRY_ID): cv.string})
SCHEMA_RENAME = vol.Schema(
    {
        vol.Required(ATTR_NAME): cv.string,
        vol.Required(ATTR_NEUER_NAME): cv.string,
        vol.Optional(ATTR_ENTRY_ID): cv.string,
    }
)
SCHEMA_PLAIN = vol.Schema({vol.Optional(ATTR_ENTRY_ID): cv.string})


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Grundgeruest anlegen, Endpunkte und Dienste einmalig registrieren."""
    hass.data.setdefault(DOMAIN, {})
    hass.http.register_view(IntercomMediaView(hass))
    hass.http.register_view(IntercomUploadView(hass))
    await async_register_frontend(hass)
    async_register_websocket(hass)
    _register_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: IntercomConfigEntry) -> bool:
    """Einen Intercom-Eintrag starten."""
    manager = IntercomManager(hass, entry)
    await manager.async_setup()
    entry.runtime_data = manager
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = manager

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    try:
        await async_register_resource(hass)
    except Exception as err:  # noqa: BLE001 - die Karte darf den Eintrag nie blockieren
        _LOGGER.warning("Dashboard-Ressource der Intercom-Karte konnte nicht eingetragen werden: %s", err)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: IntercomConfigEntry) -> bool:
    """Einen Intercom-Eintrag beenden."""
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        manager: IntercomManager = entry.runtime_data
        await manager.async_unload()
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return ok


async def _async_update_listener(hass: HomeAssistant, entry: IntercomConfigEntry) -> None:
    """Optionen geaendert: Eintrag neu laden."""
    await hass.config_entries.async_reload(entry.entry_id)


def _pick_manager(hass: HomeAssistant, call: ServiceCall) -> IntercomManager | None:
    managers: dict[str, IntercomManager] = hass.data.get(DOMAIN, {})
    entry_id = call.data.get(ATTR_ENTRY_ID)
    if entry_id:
        return managers.get(entry_id)
    return next(iter(managers.values()), None)


@callback
def _register_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, SERVICE_INDEX_NEU):
        return

    async def nachricht_loeschen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_nachricht_loeschen(call.data[ATTR_KENNUNG])

    async def nachricht_gesehen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_nachricht_gesehen(call.data[ATTR_KENNUNG], True)

    async def alle_gesehen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_alle_gesehen()

    async def ansage_aktivieren(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_ansage_aktivieren(call.data[ATTR_NAME])

    async def ansage_loeschen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_ansage_loeschen(call.data[ATTR_NAME])

    async def ansage_umbenennen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_ansage_umbenennen(call.data[ATTR_NAME], call.data[ATTR_NEUER_NAME])

    async def aufnahme_starten(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_start_manual()

    async def aufnahme_stoppen(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_stop_manual()

    async def index_neu(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_scan_all(sync=True)

    async def asterisk_sync(call: ServiceCall) -> None:
        if m := _pick_manager(hass, call):
            await m.async_sync_astdb()

    hass.services.async_register(DOMAIN, SERVICE_NACHRICHT_LOESCHEN, nachricht_loeschen, schema=SCHEMA_KENNUNG)
    hass.services.async_register(DOMAIN, SERVICE_NACHRICHT_GESEHEN, nachricht_gesehen, schema=SCHEMA_KENNUNG)
    hass.services.async_register(DOMAIN, SERVICE_ALLE_GESEHEN, alle_gesehen, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_ANSAGE_AKTIVIEREN, ansage_aktivieren, schema=SCHEMA_NAME)
    hass.services.async_register(DOMAIN, SERVICE_ANSAGE_LOESCHEN, ansage_loeschen, schema=SCHEMA_NAME)
    hass.services.async_register(DOMAIN, SERVICE_ANSAGE_UMBENENNEN, ansage_umbenennen, schema=SCHEMA_RENAME)
    hass.services.async_register(DOMAIN, SERVICE_AUFNAHME_STARTEN, aufnahme_starten, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_AUFNAHME_STOPPEN, aufnahme_stoppen, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_INDEX_NEU, index_neu, schema=SCHEMA_PLAIN)
    hass.services.async_register(DOMAIN, SERVICE_ASTERISK_SYNC, asterisk_sync, schema=SCHEMA_PLAIN)

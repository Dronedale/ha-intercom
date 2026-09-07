"""HTTP-Endpunkte: geschuetzte Medienauslieferung und Upload von Ansagen."""

from __future__ import annotations

import logging
from dataclasses import asdict

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN, MAX_UPLOAD_BYTES, MEDIA_KINDS, URL_MEDIA, URL_UPLOAD
from .manager import IntercomManager

_LOGGER = logging.getLogger(__name__)


def _manager_for(hass: HomeAssistant, request: web.Request) -> IntercomManager | None:
    managers: dict[str, IntercomManager] = hass.data.get(DOMAIN, {})
    entry_id = request.query.get("entry")
    if entry_id:
        return managers.get(entry_id)
    return next(iter(managers.values()), None)


class IntercomMediaView(HomeAssistantView):
    """Liefert Clips, Bilder, Ansagen und Freizeichen aus, nur mit Anmeldung.

    Die Karte holt sich ueber auth/sign_path einen signierten Link auf diese Adresse;
    web.FileResponse unterstuetzt Range-Anfragen, also Spulen im Video.
    """

    url = URL_MEDIA
    name = "api:intercom:media"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request, kind: str, name: str) -> web.StreamResponse:
        if kind not in MEDIA_KINDS:
            raise web.HTTPNotFound()
        manager = _manager_for(self.hass, request)
        if manager is None:
            raise web.HTTPNotFound()
        path = manager.media_path(kind, name)
        if path is None or not path.is_file():
            raise web.HTTPNotFound()
        return web.FileResponse(path, headers={"Cache-Control": "private, max-age=3600"})


class IntercomUploadView(HomeAssistantView):
    """Nimmt eine im Browser aufgenommene Ansage entgegen (multipart: file, name)."""

    url = URL_UPLOAD
    name = "api:intercom:ansage_upload"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def post(self, request: web.Request) -> web.Response:
        manager = _manager_for(self.hass, request)
        if manager is None:
            return self.json_message("Intercom nicht eingerichtet", 404)
        if not request.content_type.startswith("multipart/"):
            return self.json_message("multipart/form-data erwartet", 400)

        reader = await request.multipart()
        data: bytes | None = None
        filename = "aufnahme.webm"
        name: str | None = None
        while True:
            part = await reader.next()
            if part is None:
                break
            if part.name == "name":
                name = (await part.text()).strip()
            elif part.name == "file":
                filename = part.filename or filename
                chunks: list[bytes] = []
                size = 0
                while True:
                    chunk = await part.read_chunk()
                    if not chunk:
                        break
                    size += len(chunk)
                    if size > MAX_UPLOAD_BYTES:
                        return self.json_message("Datei zu gross", 413)
                    chunks.append(chunk)
                data = b"".join(chunks)
        if not data:
            return self.json_message("Keine Datei erhalten", 400)

        ansage = await manager.async_save_ansage_upload(data, filename, name)
        if ansage is None:
            return self.json_message("Konvertierung fehlgeschlagen", 500)
        return self.json({"ok": True, "ansage": asdict(ansage)})

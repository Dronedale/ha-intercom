"""HTTP endpoints: protected media delivery and upload of announcements."""

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
    """Serves clips, images, announcements and ringback tones, authenticated only.

    The card obtains a signed link to this address via auth/sign_path;
    web.FileResponse supports range requests, i.e. seeking in the video.
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
    """Accepts an announcement recorded in the browser (multipart: file, name)."""

    url = URL_UPLOAD
    name = "api:intercom:announcement_upload"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def post(self, request: web.Request) -> web.Response:
        manager = _manager_for(self.hass, request)
        if manager is None:
            return self.json_message("Intercom not set up", 404)
        if not request.content_type.startswith("multipart/"):
            return self.json_message("multipart/form-data expected", 400)

        reader = await request.multipart()
        data: bytes | None = None
        filename = "recording.webm"
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
                        return self.json_message("File too large", 413)
                    chunks.append(chunk)
                data = b"".join(chunks)
        if not data:
            return self.json_message("No file received", 400)

        announcement = await manager.async_save_announcement_upload(data, filename, name)
        if announcement is None:
            return self.json_message("Conversion failed", 500)
        return self.json({"ok": True, "announcement": asdict(announcement)})

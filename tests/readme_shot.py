"""Screenshot der Karte fuer die README aus der lokalen Testinstanz (englische Texte, Beispiel-Daten).

Voraussetzungen: laufende Testinstanz (.venv/bin/hass -c .test/config), `pip install playwright`,
Google Chrome installiert (Playwright nutzt es ueber channel="chrome", kein Browser-Download).
Ergebnis: assets/screenshot.png
"""

from __future__ import annotations

import asyncio
import base64
import json
import sys
from pathlib import Path

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import smoke  # noqa: E402
from smoke import BASE, CLIENT_ID, call, set_state  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "screenshot.png"
URL_PATH = "readme-shot"
MAILBOX_DIR = ROOT / ".test" / "media" / "doorbell" / "mailbox"

# Flache Illustration eines Hauseingangs als Platzhalter fuer das Livebild
DOOR_SVG = """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'>
<defs>
 <linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3b4a5c'/><stop offset='1' stop-color='#1f2733'/></linearGradient>
 <linearGradient id='wall' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#7d8592'/><stop offset='1' stop-color='#5b626e'/></linearGradient>
 <radialGradient id='lamp' cx='0.5' cy='0.5' r='0.5'><stop offset='0' stop-color='#ffd98a' stop-opacity='0.85'/><stop offset='1' stop-color='#ffd98a' stop-opacity='0'/></radialGradient>
</defs>
<rect width='1280' height='720' fill='url(#sky)'/>
<rect x='0' y='0' width='1280' height='560' fill='url(#wall)'/>
<rect x='0' y='560' width='1280' height='160' fill='#3a3f47'/>
<rect x='0' y='556' width='1280' height='8' fill='#2c3037'/>
<circle cx='330' cy='250' r='220' fill='url(#lamp)'/>
<rect x='318' y='150' width='24' height='40' rx='4' fill='#2b2f36'/>
<path d='M300 190 h60 l-8 40 h-44 z' fill='#f2e2b3'/>
<rect x='470' y='120' width='340' height='440' rx='6' fill='#2f3a46'/>
<rect x='486' y='136' width='308' height='424' rx='4' fill='#3f5062'/>
<rect x='510' y='160' width='120' height='150' rx='3' fill='#34435a'/>
<rect x='650' y='160' width='120' height='150' rx='3' fill='#34435a'/>
<rect x='510' y='340' width='120' height='190' rx='3' fill='#34435a'/>
<rect x='650' y='340' width='120' height='190' rx='3' fill='#34435a'/>
<rect x='748' y='352' width='12' height='60' rx='6' fill='#d8dde3'/>
<rect x='900' y='250' width='60' height='150' rx='8' fill='#22272e'/>
<circle cx='930' cy='285' r='14' fill='#0f1216'/>
<circle cx='930' cy='285' r='6' fill='#3b6fb6'/>
<rect x='914' y='320' width='32' height='10' rx='3' fill='#4a525c'/>
<rect x='914' y='340' width='32' height='10' rx='3' fill='#4a525c'/>
<circle cx='930' cy='375' r='9' fill='#c9d1d9'/>
<rect x='560' y='60' width='160' height='44' rx='6' fill='#22272e'/>
<text x='640' y='92' font-family='Helvetica, Arial, sans-serif' font-size='30' fill='#d8dde3' text-anchor='middle'>12</text>
<rect x='520' y='580' width='240' height='36' rx='6' fill='#5a4633'/>
</svg>"""


def card_config() -> dict:
    image = "data:image/svg+xml;base64," + base64.b64encode(DOOR_SVG.encode()).decode()
    return {
        "type": "custom:intercom-card",
        "language": "en",
        "fullscreen_on_ring": True,
        "fullscreen_auto_close": True,
        "camera": {"type": "picture", "image": image},
        "door": {"entity": "input_boolean.haustuer", "name": "Front door", "confirm": True},
        "alarm": {"entity": "alarm_control_panel.test_alarm", "name": "Alarm"},
        "volume": {"entity": "input_number.tablet_lautstaerke", "mute_entity": "input_boolean.tablet_stumm", "name": "Tablet"},
        "contacts": [
            {"name": "Kitchen", "extension": "100"},
            {"name": "Office", "extension": "101"},
            {"name": "Wall tablet", "extension": "102", "icon": "tablet"},
            {"name": "Door station", "extension": "103"},
        ],
        "settings": {"mode": "popup"},
    }


async def ws_call(token: str, messages: list[dict]) -> list[dict]:
    import aiohttp

    results = []
    async with aiohttp.ClientSession() as session:
        async with session.ws_connect(BASE + "/api/websocket") as ws:
            await ws.receive_json()  # auth_required
            await ws.send_json({"type": "auth", "access_token": token})
            auth = await ws.receive_json()
            assert auth.get("type") == "auth_ok", auth
            for i, msg in enumerate(messages, start=1):
                await ws.send_json({"id": i, **msg})
                while True:
                    res = await ws.receive_json()
                    if res.get("id") == i:
                        results.append(res)
                        break
    return results


def prepare() -> str:
    smoke.wait_ready()
    smoke.onboard()
    token = smoke.TOKEN
    assert token
    for ext in ("100", "101", "102", "103"):
        set_state(f"binary_sensor.{ext}_registered", "on")
        set_state(f"sensor.{ext}_state", "Not in use")
    set_state("binary_sensor.ami_connected", "on")
    # Beispiel-Ansagen englisch benennen (nur Testdaten)
    st, res, _ = call("GET", "/api/states/sensor.intercom_announcements")
    wanted = ["Vacation", "Delivery"]
    if st == 200:
        for entry, new in zip(res["attributes"].get("list", []), wanted):
            if entry["name"] != new:
                call("POST", "/api/services/ha_intercom/rename_announcement", {"name": entry["name"], "new_name": new})
    # Beispiel-Nachricht auf gestern 18:25 legen, damit die Karte "Yesterday" statt eines Datums zeigt
    if MAILBOX_DIR.exists():
        from datetime import datetime, timedelta

        when = (datetime.now().astimezone() - timedelta(days=1)).replace(hour=18, minute=25, second=0, microsecond=0)
        for meta in MAILBOX_DIR.glob("*.json"):
            data = json.loads(meta.read_text())
            data["time"] = when.isoformat()
            meta.write_text(json.dumps(data, ensure_ascii=False))
        call("POST", "/api/services/ha_intercom/rescan", {})
        set_state("sensor.intercom_last_ring", when.isoformat())
    view = {"title": "Intercom", "path": "intercom", "type": "panel", "cards": [card_config()]}
    res = asyncio.run(
        ws_call(
            token,
            [
                {"type": "lovelace/dashboards/list"},
            ],
        )
    )
    existing = {d["url_path"] for d in res[0].get("result", [])}
    msgs = []
    if URL_PATH not in existing:
        msgs.append({"type": "lovelace/dashboards/create", "url_path": URL_PATH, "title": "README", "icon": "mdi:camera", "show_in_sidebar": False})
    msgs.append({"type": "lovelace/config/save", "url_path": URL_PATH, "config": {"views": [view]}})
    for r in asyncio.run(ws_call(token, msgs)):
        assert r.get("success"), r
    # Anmelde-URL (Auth-Code, der Browser tauscht ihn selbst ein)
    st, res, _ = call("POST", "/auth/login_flow", {"client_id": CLIENT_ID, "handler": ["homeassistant", None], "redirect_uri": CLIENT_ID})
    assert st == 200, res
    st, res, _ = call("POST", f"/auth/login_flow/{res['flow_id']}", {"username": "test", "password": "test1234", "client_id": CLIENT_ID})
    assert st == 200 and res.get("type") == "create_entry", res
    state = base64.b64encode(json.dumps({"hassUrl": BASE, "clientId": CLIENT_ID}).encode()).decode()
    # Code direkt auf der Zielseite einloesen: ohne "angemeldet bleiben" haelt HA den Token nur im Speicher der Seite
    return f"{BASE}/{URL_PATH}/0?auth_callback=1&code={res['result']}&state={state}"


INIT_JS = """
window.sipCore = { callState: 'idle', user: { extension: '101' }, ua: { isRegistered: () => true },
  startCall() {}, answerCall() {}, endCall() {} };
try { localStorage.setItem('selectedLanguage', JSON.stringify('en')); } catch (e) {}
"""


def neutral_thumbnails(ctx) -> None:
    """Vorschaubilder der Test-Nachrichten durch die Illustration ersetzen (Originale nach .test/mailbox-orig)."""
    jpgs = sorted(MAILBOX_DIR.glob("*.jpg")) if MAILBOX_DIR.exists() else []
    if not jpgs:
        return
    keep = ROOT / ".test" / "mailbox-orig"
    keep.mkdir(parents=True, exist_ok=True)
    image = "data:image/svg+xml;base64," + base64.b64encode(DOOR_SVG.encode()).decode()
    page = ctx.new_page()
    page.set_viewport_size({"width": 640, "height": 360})
    page.set_content(f"<body style='margin:0;background:#000'><img src='{image}' style='width:640px;height:360px;display:block'></body>")
    for jpg in jpgs:
        orig = keep / jpg.name
        if not orig.exists():
            jpg.rename(orig)
        page.screenshot(path=str(jpg), type="jpeg", quality=85)
    page.close()


def shoot(login_url: str, width: int, height: int, scale: int) -> None:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        ctx = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=scale, locale="en-US", color_scheme="dark")
        ctx.add_init_script(INIT_JS)
        neutral_thumbnails(ctx)
        page = ctx.new_page()
        page.goto(login_url, wait_until="networkidle")
        page.wait_for_timeout(1500)
        card = page.locator("intercom-card").first
        try:
            card.wait_for(state="visible", timeout=30000)
        except Exception:
            dbg = ROOT / ".test" / "readme-debug.png"
            page.screenshot(path=str(dbg), full_page=True)
            print("DEBUG url:", page.url, "title:", page.title(), "->", dbg)
            raise
        page.wait_for_timeout(4000)
        OUT.parent.mkdir(parents=True, exist_ok=True)
        card.screenshot(path=str(OUT))
        browser.close()


def main() -> int:
    width = int(sys.argv[1]) if len(sys.argv) > 1 else 1600
    height = int(sys.argv[2]) if len(sys.argv) > 2 else 960
    scale = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    url = prepare()
    shoot(url, width, height, scale)
    print("written", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())

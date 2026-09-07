"""Neuen Konfigurationsdialog und Kontakte-Befehle gegen die lokale Testinstanz pruefen.

Aufruf: .venv/bin/python tests/flow.py [--stream rtsp://...] [--keep]
Loescht einen vorhandenen Intercom-Eintrag, laeuft den Dialog durch, prueft ha_intercom/info und den Optionsdialog mit Ordnerwechsel.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time

import aiohttp

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import smoke  # noqa: E402
from smoke import BASE, MEDIA_BASE, call, onboard, run_flow, set_state, wait_ready  # noqa: E402


async def ws_calls(token: str, entry_id: str) -> int:
    url = BASE.replace("http", "ws", 1) + "/api/websocket"
    async with aiohttp.ClientSession() as session, session.ws_connect(url) as ws:
        assert (await ws.receive_json())["type"] == "auth_required"
        await ws.send_json({"type": "auth", "access_token": token})
        assert (await ws.receive_json())["type"] == "auth_ok"
        mid = [0]

        async def cmd(payload: dict) -> dict:
            mid[0] += 1
            await ws.send_json({"id": mid[0], **payload})
            while True:
                msg = await ws.receive_json()
                if msg.get("id") == mid[0] and msg.get("type") == "result":
                    return msg

        res = await cmd({"type": "ha_intercom/info", "entry_id": entry_id})
        assert res["success"], res
        info = res["result"]["entries"][0]
        print("info:", json.dumps({k: info.get(k) for k in ("alarm_entity", "lock_entity", "extensions", "sip_core", "base_dir")}, ensure_ascii=False))
        assert info["alarm_entity"] == "alarm_control_panel.test_alarm", info["alarm_entity"]
        exts = {e["extension"]: e for e in info["extensions"]}
        assert "103" in exts and "102" in exts, info["extensions"]
        assert exts["103"]["state_entity"] == "sensor.103_state" and exts["103"]["registered_entity"] == "binary_sensor.103_registered", exts["103"]
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stream", default=os.environ.get("INTERCOM_TEST_STREAM", "rtsp://127.0.0.1:8554/doorbell_hd"))
    parser.add_argument("--keep", action="store_true", help="vorhandenen Eintrag behalten")
    args = parser.parse_args()

    wait_ready()
    onboard()
    for eid, st in (
        ("sensor.vto_tuerklingel", "Doorbell No Ring"),
        ("sensor.103_state", "Not in use"),
        ("sensor.102_state", "Not in use"),
        ("binary_sensor.103_registered", "on"),
        ("binary_sensor.102_registered", "on"),
        ("binary_sensor.ami_connected", "on"),
    ):
        set_state(eid, st)

    status, entries, _ = call("GET", "/api/config/config_entries/entry")
    for e in entries or []:
        if e["domain"] in ("ha_intercom", "intercom") and not args.keep:
            status, res, _ = call("DELETE", f"/api/config/config_entries/entry/{e['entry_id']}")
            print("alter Eintrag geloescht:", e["entry_id"], status)
            time.sleep(2)

    entry_id = run_flow(args.stream, str(MEDIA_BASE), alarm="alarm_control_panel.test_alarm", verbose=True)
    time.sleep(3)
    status, entries, _ = call("GET", "/api/config/config_entries/entry")
    e = next(x for x in entries if x["domain"] == "ha_intercom")
    print("Eintrag:", e["title"], e["state"])
    assert e["state"] == "loaded", e
    rc = asyncio.run(ws_calls(smoke.TOKEN, entry_id))
    options_move(entry_id)
    return rc


def options_move(entry_id: str) -> None:
    """Optionen: Basisordner wechseln, Umzugsschritt bestaetigen, Dateien im neuen Ordner pruefen, zurueckwechseln."""
    from pathlib import Path

    old = MEDIA_BASE
    new = MEDIA_BASE.parent / "ha-intercom-test"
    (old / "mailbox").mkdir(parents=True, exist_ok=True)
    probe = old / "mailbox" / "umzugstest.json"
    probe.write_text("{}")
    vorher = sum(1 for p in (old / "mailbox").iterdir() if p.is_file())

    def opt(payload: dict | None = None):
        if payload is None:
            st, fl, _ = call("POST", "/api/config/config_entries/options/flow", {"handler": entry_id})
        else:
            st, fl, _ = call("POST", f"/api/config/config_entries/options/flow/{fid[0]}", payload)
        assert st == 200, fl
        return fl

    fid = [None]
    flow = opt()
    fid[0] = flow["flow_id"]
    assert flow["step_id"] == "init", flow
    flow = opt({"base_dir": str(new)})
    assert flow.get("step_id") == "umzug", flow
    print("  Umzug:", json.dumps(flow.get("description_placeholders"), ensure_ascii=False))
    flow = opt({"dateien_verschieben": True})
    assert flow.get("type") == "create_entry", flow
    time.sleep(4)
    nachher = sum(1 for p in (new / "mailbox").iterdir() if p.is_file())
    print(f"  Dateien mailbox: vorher {vorher} in {old.name}, nachher {nachher} in {new.name}")
    assert nachher >= vorher and not probe.exists() and (new / "mailbox" / "umzugstest.json").exists()
    (new / "mailbox" / "umzugstest.json").unlink()

    # zurueck auf den alten Ordner, ebenfalls mit Umzug
    flow = opt()
    fid[0] = flow["flow_id"]
    flow = opt({"base_dir": str(old)})
    assert flow.get("step_id") == "umzug", flow
    flow = opt({"dateien_verschieben": True})
    assert flow.get("type") == "create_entry", flow
    time.sleep(4)
    zurueck = sum(1 for p in (old / "mailbox").iterdir() if p.is_file())
    print(f"  zurueck: {zurueck} Dateien in {old.name}")
    assert zurueck == vorher - 1, (zurueck, vorher)
    _, entries, _ = call("GET", "/api/config/config_entries/entry")
    e = next(x for x in entries if x["domain"] == "ha_intercom")
    assert e["state"] == "loaded", e
    print("Optionsdialog mit Umzug ok")


if __name__ == "__main__":
    sys.exit(main())

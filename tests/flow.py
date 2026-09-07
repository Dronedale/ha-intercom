"""Check the new config flow and the contacts commands against the local test instance.

Usage: .venv/bin/python tests/flow.py [--stream rtsp://...] [--keep]
Deletes an existing intercom entry, runs through the flow, checks ha_intercom/info and the options flow with a base folder change.
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
    parser.add_argument("--keep", action="store_true", help="keep an existing entry")
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
            print("old entry deleted:", e["entry_id"], status)
            time.sleep(2)

    entry_id = run_flow(args.stream, str(MEDIA_BASE), alarm="alarm_control_panel.test_alarm", verbose=True)
    time.sleep(3)
    status, entries, _ = call("GET", "/api/config/config_entries/entry")
    e = next(x for x in entries if x["domain"] == "ha_intercom")
    print("entry:", e["title"], e["state"])
    assert e["state"] == "loaded", e
    rc = asyncio.run(ws_calls(smoke.TOKEN, entry_id))
    options_move(entry_id)
    return rc


def options_move(entry_id: str) -> None:
    """Options: change the base folder, confirm the move step, check the files in the new folder, switch back."""
    old = MEDIA_BASE
    new = MEDIA_BASE.parent / "ha-intercom-test"
    (old / "mailbox").mkdir(parents=True, exist_ok=True)
    probe = old / "mailbox" / "move_test.json"
    probe.write_text("{}")
    before = sum(1 for p in (old / "mailbox").iterdir() if p.is_file())

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
    assert flow.get("step_id") == "move", flow
    print("  move:", json.dumps(flow.get("description_placeholders"), ensure_ascii=False))
    flow = opt({"move_files": True})
    assert flow.get("type") == "create_entry", flow
    time.sleep(4)
    after = sum(1 for p in (new / "mailbox").iterdir() if p.is_file())
    print(f"  mailbox files: before {before} in {old.name}, after {after} in {new.name}")
    assert after >= before and not probe.exists() and (new / "mailbox" / "move_test.json").exists()
    (new / "mailbox" / "move_test.json").unlink()

    # back to the old folder, again with a move
    flow = opt()
    fid[0] = flow["flow_id"]
    flow = opt({"base_dir": str(old)})
    assert flow.get("step_id") == "move", flow
    flow = opt({"move_files": True})
    assert flow.get("type") == "create_entry", flow
    time.sleep(4)
    back = sum(1 for p in (old / "mailbox").iterdir() if p.is_file())
    print(f"  back: {back} files in {old.name}")
    assert back == before - 1, (back, before)
    _, entries, _ = call("GET", "/api/config/config_entries/entry")
    e = next(x for x in entries if x["domain"] == "ha_intercom")
    assert e["state"] == "loaded", e
    print("options flow with move ok")


if __name__ == "__main__":
    sys.exit(main())

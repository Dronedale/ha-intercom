"""Smoke test against a local HA test instance (port 8124): onboarding, config flow, ringing, recording, media, upload.

Usage: .venv/bin/python tests/smoke.py [--stream rtsp://...] [--no-record]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "http://127.0.0.1:8124"
CLIENT_ID = "http://127.0.0.1:8124/"
ROOT = Path(__file__).resolve().parent.parent
MEDIA_BASE = ROOT / ".test" / "media" / "doorbell"

TOKEN: str | None = None


def call(method: str, path: str, data: dict | bytes | None = None, headers: dict | None = None, raw: bool = False):
    hdrs = {"Content-Type": "application/json"}
    if TOKEN:
        hdrs["Authorization"] = f"Bearer {TOKEN}"
    if headers:
        hdrs.update(headers)
    body = None
    if data is not None:
        body = data if isinstance(data, bytes) else json.dumps(data).encode()
    req = urllib.request.Request(BASE + path, data=body, method=method, headers=hdrs)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            payload = resp.read()
            if raw:
                return resp.status, payload, dict(resp.headers)
            return resp.status, (json.loads(payload) if payload else None), dict(resp.headers)
    except urllib.error.HTTPError as err:
        payload = err.read()
        try:
            return err.code, json.loads(payload), dict(err.headers)
        except ValueError:
            return err.code, payload.decode(errors="replace"), dict(err.headers)


def wait_ready(timeout: int = 480) -> None:
    start = time.time()
    while time.time() - start < timeout:
        try:
            status, _, _ = call("GET", "/api/")
            if status in (200, 401):
                return
        except Exception:  # noqa: BLE001
            pass
        time.sleep(2)
    raise SystemExit("HA test instance is not responding")


def onboard() -> None:
    global TOKEN
    status, steps, _ = call("GET", "/api/onboarding")
    if status == 200 and steps and not all(s["done"] for s in steps):
        status, res, _ = call(
            "POST",
            "/api/onboarding/users",
            {"client_id": CLIENT_ID, "name": "Test", "username": "test", "password": "test1234", "language": "de"},
        )
        assert status == 200, res
        code = res["auth_code"]
        form = f"grant_type=authorization_code&code={code}&client_id={CLIENT_ID}".encode()
        status, tok, _ = call("POST", "/auth/token", form, {"Content-Type": "application/x-www-form-urlencoded"})
        assert status == 200, tok
        TOKEN = tok["access_token"]
        call("POST", "/api/onboarding/core_config", {})
        call("POST", "/api/onboarding/analytics", {})
        call("POST", "/api/onboarding/integration", {"client_id": CLIENT_ID, "redirect_uri": CLIENT_ID})
        print("onboarding done, token received")
    else:
        # Already set up: get a token via password login
        status, res, _ = call("POST", "/auth/login_flow", {"client_id": CLIENT_ID, "handler": ["homeassistant", None], "redirect_uri": CLIENT_ID})
        assert status == 200, res
        status, res, _ = call("POST", f"/auth/login_flow/{res['flow_id']}", {"username": "test", "password": "test1234", "client_id": CLIENT_ID})
        assert status == 200 and res.get("type") == "create_entry", res
        form = f"grant_type=authorization_code&code={res['result']}&client_id={CLIENT_ID}".encode()
        status, tok, _ = call("POST", "/auth/token", form, {"Content-Type": "application/x-www-form-urlencoded"})
        assert status == 200, tok
        TOKEN = tok["access_token"]
        print("login done, token received")


def set_state(entity_id: str, state: str) -> None:
    status, res, _ = call("POST", f"/api/states/{entity_id}", {"state": state})
    assert status in (200, 201), res


def ensure_entry(stream: str) -> str:
    status, entries, _ = call("GET", "/api/config/config_entries/entry")
    for e in entries or []:
        if e["domain"] == "ha_intercom":
            print("config entry exists:", e["entry_id"])
            return e["entry_id"]
    return run_flow(stream, str(MEDIA_BASE))


def run_flow(stream: str, base_dir: str, alarm: str | None = None, lock: str | None = None, verbose: bool = False) -> str:
    """Run through the new config flow: prerequisites, sources, intercom, (sensors), house, check."""

    def step(payload: dict | None = None):
        if payload is None:
            st, fl, _ = call("POST", "/api/config/config_entries/flow", {"handler": "ha_intercom"})
        else:
            st, fl, _ = call("POST", f"/api/config/config_entries/flow/{fl_id[0]}", payload)
        assert st == 200, fl
        if verbose:
            print(f"  step {fl.get('step_id') or fl.get('type')}: {json.dumps(fl.get('description_placeholders') or fl.get('errors') or {}, ensure_ascii=False)}")
        return fl

    fl_id = [None]
    flow = step()
    fl_id[0] = flow["flow_id"]
    assert flow["step_id"] == "user", flow
    flow = step({})
    assert flow.get("step_id") == "sources", flow
    flow = step({"trigger_entity": "sensor.vto_tuerklingel", "trigger_state": "Doorbell Ring", "stream_url": stream})
    assert flow.get("step_id") == "sip", flow
    flow = step({"ext_door": "103", "ext_tablet": "102"})
    if flow.get("step_id") == "sensors":
        flow = step({"door_state_entity": "sensor.103_state", "tablet_state_entity": "sensor.102_state", "ami_connected_entity": "binary_sensor.ami_connected"})
    assert flow.get("step_id") == "house", flow
    house = {"base_dir": base_dir}
    if alarm:
        house["alarm_entity"] = alarm
    if lock:
        house["lock_entity"] = lock
    flow = step(house)
    assert flow.get("step_id") == "check", flow
    flow = step({})
    if flow.get("type") != "create_entry" and (flow.get("errors") or {}).get("base") == "stream_failed":
        print("  stream not reachable, ignoring")
        flow = step({"ignore_stream": True})
    assert flow.get("type") == "create_entry", flow
    print("config entry created:", flow["result"]["entry_id"])
    return flow["result"]["entry_id"]


def states(prefix: str = "") -> dict[str, dict]:
    _, res, _ = call("GET", "/api/states")
    return {s["entity_id"]: s for s in res if "intercom" in s["entity_id"] and s["entity_id"].startswith(prefix)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stream", default=os.environ.get("INTERCOM_TEST_STREAM", "rtsp://127.0.0.1:8554/doorbell_hd"))
    parser.add_argument("--no-record", action="store_true")
    args = parser.parse_args()

    wait_ready()
    onboard()
    for eid, st in (("sensor.vto_tuerklingel", "Doorbell No Ring"), ("sensor.103_state", "Not in use"), ("sensor.102_state", "Not in use"), ("binary_sensor.ami_connected", "off")):
        set_state(eid, st)
    entry_id = ensure_entry(args.stream)
    time.sleep(3)

    ents = states()
    print(f"\nEntities ({len(ents)}):")
    for eid in sorted(ents):
        print(f"  {eid:55s} {ents[eid]['state']}")
    missing = [d for d in ("switch.", "number.", "select.", "sensor.", "binary_sensor.", "event.") if not any(e.startswith(d) for e in ents)]
    if missing:
        print("ERROR: platforms without entities:", missing)
        return 1

    # Apply settings (via the domain services)
    mailbox = next(e for e in ents if e.startswith("switch.") and e.endswith("mailbox"))
    status, _, _ = call("POST", "/api/services/switch/turn_on", {"entity_id": mailbox})
    assert status == 200
    ring_duration = next(e for e in ents if e.startswith("number.") and "ring_duration" in e)
    status, _, _ = call("POST", "/api/services/number/set_value", {"entity_id": ring_duration, "value": 15})
    assert status == 200
    time.sleep(1)
    print("mailbox on, ring duration 15:", states()[mailbox]["state"], states()[ring_duration]["state"])

    if not args.no_record:
        print("\nSimulating a ring, recording for 12 s, ending the call ...")
        set_state("sensor.vto_tuerklingel", "Doorbell Ring")
        set_state("sensor.103_state", "Ringing")
        time.sleep(1)
        set_state("sensor.vto_tuerklingel", "Doorbell No Ring")
        time.sleep(6)
        set_state("sensor.102_state", "In use")
        time.sleep(6)
        recording_entity = next(e for e in states() if e.startswith("binary_sensor.") and e.endswith("recording"))
        print("recording active:", states()[recording_entity]["state"])
        set_state("sensor.103_state", "Not in use")
        set_state("sensor.102_state", "Not in use")
        time.sleep(6)
        messages = next(e for e in states() if e.startswith("sensor.") and e.endswith("_messages") and "new" not in e)
        s = states()[messages]
        print("messages:", s["state"], json.dumps(s["attributes"].get("entries"), ensure_ascii=False)[:400])
        records = s["attributes"].get("entries") or []
        if not records:
            print("ERROR: no entry after the recording")
            return 1
        k = records[0]["id"]
        status, data, hdrs = call("GET", f"/api/ha_intercom/media/clip/{k}", raw=True, headers={"Range": "bytes=0-99"})
        print(f"clip fetch with Range: HTTP {status}, {len(data)} bytes, Content-Range {hdrs.get('Content-Range')}")
        status, data, hdrs = call("GET", f"/api/ha_intercom/media/image/{k}", raw=True)
        print(f"image fetch: HTTP {status}, {len(data)} bytes, {hdrs.get('Content-Type')}")
        status, _, _ = call("POST", "/api/services/ha_intercom/mark_message_seen", {"id": k})
        time.sleep(1)
        print("marked seen:", states()[messages]["attributes"]["entries"][0]["seen"])

    # Announcement upload: create a short test file with ffmpeg
    import subprocess, tempfile  # noqa: E402

    tmp = Path(tempfile.mkdtemp()) / "test.mp3"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=2", "-c:a", "libmp3lame", str(tmp)], check=True)
    boundary = "----intercomtest"
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nTest announcement\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.mp3\"\r\nContent-Type: audio/mpeg\r\n\r\n"
    ).encode() + tmp.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    status, res, _ = call("POST", "/api/ha_intercom/announcement/upload", body, {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    print("Upload:", status, res)
    if status != 200:
        return 1
    time.sleep(1)
    announcements = next(e for e in states() if e.startswith("sensor.") and e.endswith("_announcements"))
    print("announcements:", states()[announcements]["state"], json.dumps(states()[announcements]["attributes"].get("list"), ensure_ascii=False)[:300])
    status, _, _ = call("POST", "/api/services/ha_intercom/activate_announcement", {"name": "Test announcement"})
    time.sleep(1)
    sel = next(e for e in states() if e.startswith("select.") and e.endswith("_active_announcement"))
    print("active announcement:", states()[sel]["state"])
    status, data, hdrs = call("GET", f"/api/ha_intercom/media/announcement/{res['announcement']['file']}", raw=True)
    print(f"announcement fetch: HTTP {status}, {len(data)} bytes, {hdrs.get('Content-Type')}")
    status, _, _ = call("POST", "/api/services/ha_intercom/rename_announcement", {"name": "Test announcement", "new_name": "Vacation"})
    time.sleep(1)
    print("after rename:", states()[sel]["state"])
    print("\nSMOKE TEST OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

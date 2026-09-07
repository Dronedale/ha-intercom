"""Rauchtest gegen eine lokale HA-Testinstanz (Port 8124): Onboarding, Konfigurationsdialog, Klingeln, Aufnahme, Medien, Upload.

Aufruf: .venv/bin/python tests/smoke.py [--stream rtsp://...] [--no-record]
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
    raise SystemExit("HA-Testinstanz antwortet nicht")


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
        print("Onboarding erledigt, Token erhalten")
    else:
        # Bereits eingerichtet: Token per Passwort-Login holen
        status, res, _ = call("POST", "/auth/login_flow", {"client_id": CLIENT_ID, "handler": ["homeassistant", None], "redirect_uri": CLIENT_ID})
        assert status == 200, res
        status, res, _ = call("POST", f"/auth/login_flow/{res['flow_id']}", {"username": "test", "password": "test1234", "client_id": CLIENT_ID})
        assert status == 200 and res.get("type") == "create_entry", res
        form = f"grant_type=authorization_code&code={res['result']}&client_id={CLIENT_ID}".encode()
        status, tok, _ = call("POST", "/auth/token", form, {"Content-Type": "application/x-www-form-urlencoded"})
        assert status == 200, tok
        TOKEN = tok["access_token"]
        print("Anmeldung erledigt, Token erhalten")


def set_state(entity_id: str, state: str) -> None:
    status, res, _ = call("POST", f"/api/states/{entity_id}", {"state": state})
    assert status in (200, 201), res


def ensure_entry(stream: str) -> str:
    status, entries, _ = call("GET", "/api/config/config_entries/entry")
    for e in entries or []:
        if e["domain"] == "ha_intercom":
            print("Konfigurationseintrag vorhanden:", e["entry_id"])
            return e["entry_id"]
    return run_flow(stream, str(MEDIA_BASE))


def run_flow(stream: str, base_dir: str, alarm: str | None = None, lock: str | None = None, verbose: bool = False) -> str:
    """Neuen Konfigurationsdialog durchlaufen: Voraussetzungen, Quellen, Sprechanlage, (Sensoren), Haus, Pruefung."""

    def step(payload: dict | None = None):
        if payload is None:
            st, fl, _ = call("POST", "/api/config/config_entries/flow", {"handler": "ha_intercom"})
        else:
            st, fl, _ = call("POST", f"/api/config/config_entries/flow/{fl_id[0]}", payload)
        assert st == 200, fl
        if verbose:
            print(f"  Schritt {fl.get('step_id') or fl.get('type')}: {json.dumps(fl.get('description_placeholders') or fl.get('errors') or {}, ensure_ascii=False)}")
        return fl

    fl_id = [None]
    flow = step()
    fl_id[0] = flow["flow_id"]
    assert flow["step_id"] == "user", flow
    flow = step({})
    assert flow.get("step_id") == "quellen", flow
    flow = step({"trigger_entity": "sensor.vto_tuerklingel", "trigger_state": "Doorbell Ring", "stream_url": stream})
    assert flow.get("step_id") == "sip", flow
    flow = step({"ext_door": "103", "ext_tablet": "102"})
    if flow.get("step_id") == "sensoren":
        flow = step({"door_state_entity": "sensor.103_state", "tablet_state_entity": "sensor.102_state", "ami_connected_entity": "binary_sensor.ami_connected"})
    assert flow.get("step_id") == "haus", flow
    haus = {"base_dir": base_dir}
    if alarm:
        haus["alarm_entity"] = alarm
    if lock:
        haus["lock_entity"] = lock
    flow = step(haus)
    assert flow.get("step_id") == "pruefung", flow
    flow = step({})
    if flow.get("type") != "create_entry" and (flow.get("errors") or {}).get("base") == "stream_failed":
        print("  Stream nicht erreichbar, wird ignoriert")
        flow = step({"ignore_stream": True})
    assert flow.get("type") == "create_entry", flow
    print("Konfigurationseintrag angelegt:", flow["result"]["entry_id"])
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
    print(f"\nEntitaeten ({len(ents)}):")
    for eid in sorted(ents):
        print(f"  {eid:55s} {ents[eid]['state']}")
    fehlt = [d for d in ("switch.", "number.", "select.", "sensor.", "binary_sensor.", "event.") if not any(e.startswith(d) for e in ents)]
    if fehlt:
        print("FEHLER: Plattformen ohne Entitaeten:", fehlt)
        return 1

    # Einstellungen setzen (Dienste der Domaenen)
    mailbox = next(e for e in ents if e.startswith("switch.") and e.endswith("mailbox"))
    status, _, _ = call("POST", "/api/services/switch/turn_on", {"entity_id": mailbox})
    assert status == 200
    klingeldauer = next(e for e in ents if e.startswith("number.") and "ring_duration" in e)
    status, _, _ = call("POST", "/api/services/number/set_value", {"entity_id": klingeldauer, "value": 15})
    assert status == 200
    time.sleep(1)
    print("Mailbox an, Klingeldauer 15:", states()[mailbox]["state"], states()[klingeldauer]["state"])

    if not args.no_record:
        print("\nKlingeln simulieren, 12 s aufnehmen, Anruf beenden ...")
        set_state("sensor.vto_tuerklingel", "Doorbell Ring")
        set_state("sensor.103_state", "Ringing")
        time.sleep(1)
        set_state("sensor.vto_tuerklingel", "Doorbell No Ring")
        time.sleep(6)
        set_state("sensor.102_state", "In use")
        time.sleep(6)
        aufnahme = next(e for e in states() if e.startswith("binary_sensor.") and e.endswith("recording"))
        print("Aufnahme laeuft:", states()[aufnahme]["state"])
        set_state("sensor.103_state", "Not in use")
        set_state("sensor.102_state", "Not in use")
        time.sleep(6)
        nachrichten = next(e for e in states() if e.startswith("sensor.") and e.endswith("_messages") and "new" not in e)
        s = states()[nachrichten]
        print("Nachrichten:", s["state"], json.dumps(s["attributes"].get("eintraege"), ensure_ascii=False)[:400])
        eintraege = s["attributes"].get("eintraege") or []
        if not eintraege:
            print("FEHLER: kein Eintrag nach der Aufnahme")
            return 1
        k = eintraege[0]["kennung"]
        status, data, hdrs = call("GET", f"/api/ha_intercom/media/clip/{k}", raw=True, headers={"Range": "bytes=0-99"})
        print(f"Clip-Abruf mit Range: HTTP {status}, {len(data)} Byte, Content-Range {hdrs.get('Content-Range')}")
        status, data, hdrs = call("GET", f"/api/ha_intercom/media/bild/{k}", raw=True)
        print(f"Bild-Abruf: HTTP {status}, {len(data)} Byte, {hdrs.get('Content-Type')}")
        status, _, _ = call("POST", "/api/services/ha_intercom/nachricht_gesehen", {"kennung": k})
        time.sleep(1)
        print("gesehen markiert:", states()[nachrichten]["attributes"]["eintraege"][0]["gesehen"])

    # Ansage-Upload: kurze Testdatei mit ffmpeg erzeugen
    import subprocess, tempfile  # noqa: E402

    tmp = Path(tempfile.mkdtemp()) / "test.mp3"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=2", "-c:a", "libmp3lame", str(tmp)], check=True)
    boundary = "----intercomtest"
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nTestansage\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.mp3\"\r\nContent-Type: audio/mpeg\r\n\r\n"
    ).encode() + tmp.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    status, res, _ = call("POST", "/api/ha_intercom/ansage/upload", body, {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    print("Upload:", status, res)
    if status != 200:
        return 1
    time.sleep(1)
    ansagen = next(e for e in states() if e.startswith("sensor.") and e.endswith("_announcements"))
    print("Ansagen:", states()[ansagen]["state"], json.dumps(states()[ansagen]["attributes"].get("liste"), ensure_ascii=False)[:300])
    status, _, _ = call("POST", "/api/services/ha_intercom/ansage_aktivieren", {"name": "Testansage"})
    time.sleep(1)
    sel = next(e for e in states() if e.startswith("select.") and e.endswith("_active_announcement"))
    print("Aktive Ansage:", states()[sel]["state"])
    status, data, hdrs = call("GET", f"/api/ha_intercom/media/ansage/{res['ansage']['datei']}", raw=True)
    print(f"Ansage-Abruf: HTTP {status}, {len(data)} Byte, {hdrs.get('Content-Type')}")
    status, _, _ = call("POST", "/api/services/ha_intercom/ansage_umbenennen", {"name": "Testansage", "neuer_name": "Urlaub"})
    time.sleep(1)
    print("Nach Umbenennen:", states()[sel]["state"])
    print("\nRAUCHTEST OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

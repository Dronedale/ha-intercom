"""Generische Kamera (go2rtc-Standbild + RTSP) in der Testinstanz per Konfigurationsdialog anlegen."""

from __future__ import annotations

import os
import sys

HOST = os.environ.get("INTERCOM_TEST_GO2RTC", "127.0.0.1")  # go2rtc-Host fuer die Testkamera

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from smoke import call, onboard, wait_ready  # noqa: E402


def main() -> int:
    wait_ready()
    onboard()
    status, entries, _ = call("GET", "/api/config/config_entries/entry")
    if any(e["domain"] == "generic" for e in entries or []):
        print("Kamera vorhanden")
        return 0
    status, flow, _ = call("POST", "/api/config/config_entries/flow", {"handler": "generic"})
    print("Schritt:", status, flow.get("step_id"), [f.get("name") for f in flow.get("data_schema", [])])
    fid = flow["flow_id"]
    status, flow, _ = call(
        "POST",
        f"/api/config/config_entries/flow/{fid}",
        {
            "still_image_url": f"http://{HOST}:1984/api/frame.jpeg?src=doorbell",
            "stream_source": f"rtsp://{HOST}:8554/doorbell",
            "rtsp_transport": "tcp",
            "authentication": "basic",
            "framerate": 2,
            "verify_ssl": False,
        },
    )
    print("Antwort:", status, flow.get("type"), flow.get("step_id"), flow.get("errors"))
    steps = 0
    while flow.get("type") == "form" and steps < 3:
        steps += 1
        status, flow, _ = call("POST", f"/api/config/config_entries/flow/{fid}", {"confirmed_ok": True} if flow.get("step_id") == "user_confirm" else {})
        print("Weiter:", status, flow.get("type"), flow.get("step_id"), flow.get("errors"))
    if flow.get("type") == "create_entry":
        print("Kamera angelegt:", flow["result"].get("title"))
        return 0
    print("Kamera nicht angelegt:", flow)
    return 1


if __name__ == "__main__":
    sys.exit(main())

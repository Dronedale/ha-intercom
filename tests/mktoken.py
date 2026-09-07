"""Anmelde-URL fuer die lokale Testinstanz erzeugen (Auth-Code ueber den Login-Flow, Browser tauscht ihn selbst ein)."""

from __future__ import annotations

import base64
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from smoke import BASE, CLIENT_ID, call, wait_ready  # noqa: E402


def main() -> int:
    wait_ready()
    status, res, _ = call("POST", "/auth/login_flow", {"client_id": CLIENT_ID, "handler": ["homeassistant", None], "redirect_uri": CLIENT_ID})
    assert status == 200, res
    status, res, _ = call("POST", f"/auth/login_flow/{res['flow_id']}", {"username": "test", "password": "test1234", "client_id": CLIENT_ID})
    assert status == 200 and res.get("type") == "create_entry", res
    state = base64.b64encode(json.dumps({"hassUrl": BASE, "clientId": CLIENT_ID}).encode()).decode()
    print(f"{BASE}/?auth_callback=1&code={res['result']}&state={state}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Zustaende der Testinstanz setzen: python tests/ring.py entity=state [entity=state ...]"""

from __future__ import annotations

import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from smoke import onboard, set_state, wait_ready  # noqa: E402


def main() -> int:
    wait_ready()
    onboard()
    for arg in sys.argv[1:]:
        eid, st = arg.split("=", 1)
        set_state(eid, st)
        print(eid, "->", st)
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Run deterministic UI assertions through Google's ARTEMIS device controller.

Run from an installed google/artemis checkout's Python environment:
  python /path/to/BailaCue/scripts/artemis-smoke.py
This uses ARTEMIS observation/actions directly, not an autonomous Gemini agent.
Only an isolated synthetic test device should be attached.
"""
import asyncio
import base64
import json
import os
import re
from pathlib import Path
from artemis.mcp.adb_server import _get_controller

OUT = Path(os.environ.get("BAILACUE_ARTEMIS_OUT", "/workspace/BailaCue/artifacts/artemis"))
OUT.mkdir(parents=True, exist_ok=True)
report = {"framework": "google/artemis", "mode": "controller-driven assertions; no autonomous model invocation", "checks": [], "status": "running"}

async def main():
    controller = _get_controller(device_serial=os.environ.get("ARTEMIS_DEVICE_ID", "emulator-5554"))
    async def observe(name):
        screen = await asyncio.wait_for(controller.get_screen_data(), timeout=45)
        (OUT / f"{name}.png").write_bytes(base64.b64decode(screen.base64))
        (OUT / f"{name}.json").write_text(json.dumps(screen.elements, indent=2))
        return screen.elements
    def label(element):
        return " ".join(str(element.get(k, "")) for k in ["text", "content-desc", "contentDescription", "label"])
    async def tap(text):
        elements = await observe("before-tap")
        matches = [e for e in elements if text.lower() in label(e).lower()]
        for element in sorted(matches, key=lambda e: len(label(e))):
            bounds = re.fullmatch(r"\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]", str(element.get("bounds", "")))
            if not bounds:
                continue
            x1,y1,x2,y2 = map(int,bounds.groups())
            if x2>x1 and y2>y1:
                result = await asyncio.wait_for(controller.tap_at((x1+x2)//2,(y1+y2)//2),timeout=30)
                if getattr(result,"error",None):
                    raise AssertionError(result.error)
                return
        raise AssertionError(f"ARTEMIS could not locate {text!r}")
    if not await asyncio.wait_for(controller.launch_app("app.bailacue.mobile"),timeout=45):
        raise AssertionError("ARTEMIS could not launch the installed APK")
    for attempt in range(12):
        elements = await observe("launch")
        if any("Find your rhythm" in label(e) for e in elements):
            break
        await asyncio.sleep(3)
    else:
        raise AssertionError("BailaCue home did not become visible")
    report["checks"].append({"check":"Native APK launch and branded home", "result":"passed"})
    await tap("Settings")
    await asyncio.sleep(2)
    elements = await observe("settings")
    if not any("Make it your own" in label(e) for e in elements):
        raise AssertionError("Settings page did not open")
    report["checks"].append({"check":"Native tab navigation to Settings", "result":"passed"})
    await tap("Library")
    await asyncio.sleep(2)
    elements = await observe("library")
    if not any("Your dance library" in label(e) for e in elements):
        raise AssertionError("Library page did not open")
    report["checks"].append({"check":"Native tab navigation to Library", "result":"passed"})
    report["status"] = "passed"

try:
    asyncio.run(main())
except Exception as error:
    report["status"] = "blocked-or-failed"
    report["error"] = str(error)
finally:
    (OUT / "report.json").write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
if report["status"] != "passed":
    raise SystemExit(1)

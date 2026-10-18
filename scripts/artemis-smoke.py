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
import subprocess
import hashlib
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
        for element in sorted(matches, key=lambda e: (not (e.get("focusable") in (True,"true") or e.get("clickable") in (True,"true")),len(label(e)))):
            bounds = re.fullmatch(r"\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]", str(element.get("bounds", "")))
            if not bounds:
                continue
            x1,y1,x2,y2 = map(int,bounds.groups())
            if x2>x1 and y2>y1 and y1>=0 and y2<=controller.ctx.device.device_height:
                result = await asyncio.wait_for(controller.tap_at((x1+x2)//2,(y1+y2)//2),timeout=30)
                if getattr(result,"error",None):
                    raise AssertionError(result.error)
                return
        raise AssertionError(f"ARTEMIS could not locate {text!r}")
    await controller.driver.execute_shell("logcat -c")
    async def launch():
        # ARTEMIS's monkey wrapper can return success while a launcher dialog
        # consumes its event. Use its shell driver to start the exact activity.
        result = await controller.driver.execute_shell("am start -W -n app.bailacue.mobile/.MainActivity", timeout_seconds=45)
        (OUT / "activity-start.txt").write_text(result)
        if "Error:" in result or "Exception" in result:
            raise AssertionError(f"Native activity launch failed: {result}")
    await launch()
    for attempt in range(12):
        elements = await observe("launch")
        # A fresh emulator can show a launcher ANR over the newly opened app.
        # Dismiss only that unrelated system dialog; never hide a BailaCue ANR.
        if any("Pixel Launcher isn't responding" in label(e) for e in elements):
            await tap("Close app")
            await asyncio.sleep(3)
            await launch()
            continue
        if any("BailaCue isn't responding" in label(e) for e in elements):
            raise AssertionError("BailaCue native application is not responding")
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
    if os.environ.get("BAILACUE_ARTEMIS_VIDEO") == "1":
        fixture = Path(os.environ["BAILACUE_ARTEMIS_FIXTURE"])
        async def locate(text, scrolls=0, attempts=12):
            for attempt in range(attempts):
                elements = await observe("video-step")
                if any(text.lower() in label(e).lower() for e in elements):
                    try:
                        await tap(text)
                        return
                    except AssertionError:
                        pass
                if attempt < scrolls:
                    screen = await controller.get_screen_data()
                    await controller.swipe_coords(screen.width//2,int(screen.height*.78),screen.width//2,int(screen.height*.28),400)
                await asyncio.sleep(1)
            raise AssertionError(f"Native journey could not locate {text}")
        async def field(text,value):
            await locate(text,scrolls=6)
            if not await controller.type_text(value,clear_existing=True):
                raise AssertionError(f"Could not edit {text}")
            await controller.go_back()
        await locate("Add video")
        await locate("Choose a video")
        # Android's document provider lists the synthetic fixture in Recents after scanning.
        elements = await observe("file-picker")
        if not any("BailaCue-ARTEMIS" in label(e) for e in elements):
            await locate("Show roots",attempts=3)
            await locate("Downloads",attempts=3)
        await locate("BailaCue-ARTEMIS",attempts=8)
        await field("Video title","ARTEMIS practice")
        await locate("Add to my library",scrolls=10)
        for _ in range(20):
            elements = await observe("imported-video")
            if any("ARTEMIS practice" in label(e) for e in elements): break
            await asyncio.sleep(1)
        else: raise AssertionError("Imported native video did not open")
        report["checks"].append({"check":"Native document import and video detail", "result":"passed"})
        def adb(*args):
            return subprocess.run(["adb","-s",os.environ.get("ARTEMIS_DEVICE_ID","emulator-5554"),*args],check=True,capture_output=True,text=True,timeout=30).stdout.strip()
        original = adb("shell","ls","/data/user/0/app.bailacue.mobile/files/bailacue-library/*.mp4").splitlines()[0]
        adb("pull",original,str(OUT/"original-before.mp4"))
        before = hashlib.sha256((OUT/"original-before.mp4").read_bytes()).hexdigest()
        if before != hashlib.sha256(fixture.read_bytes()).hexdigest(): raise AssertionError("Imported copy differs from fixture")
        await field("Start (m:ss or seconds)","1")
        await field("End (m:ss or seconds)","4")
        await field("Section name","ARTEMIS loop")
        await locate("Save practice section",scrolls=3)
        await locate("Loop section",scrolls=3)
        elements = await observe("loop-enabled")
        if not any("Loop on" in label(e) for e in elements): raise AssertionError("Loop did not enable")
        report["checks"].append({"check":"Native named section and loop control", "result":"passed"})
        await locate("Export new trimmed video",scrolls=3)
        for _ in range(90):
            elements = await observe("export")
            if any("NEW CLIP READY" in label(e) for e in elements): break
            await asyncio.sleep(1)
        else: raise AssertionError("Native export did not complete")
        clip = adb("shell","ls","/data/user/0/app.bailacue.mobile/files/bailacue-exports/*.mp4").splitlines()[0]
        if original == clip: raise AssertionError("Export overwrote original path")
        adb("pull",clip,str(OUT/"exported-clip.mp4"))
        adb("pull",original,str(OUT/"original-after.mp4"))
        after = hashlib.sha256((OUT/"original-after.mp4").read_bytes()).hexdigest()
        if after != before: raise AssertionError("Original changed during export")
        duration = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(OUT/"exported-clip.mp4")],check=True,capture_output=True,text=True).stdout.strip())
        if abs(duration-3)>0.25: raise AssertionError(f"Unexpected trim duration {duration}")
        report["checks"].append({"check":"Native Media3 new-file export, original checksum preserved", "result":"passed", "duration":duration, "original_sha256":before})
        await observe("new-clip-ready")
        await locate("Save new clip to Photos",scrolls=3)
        saved = False
        for _ in range(25):
            elements = await observe("photos-save")
            if any("Your new clip was saved to Photos" in label(e) for e in elements):
                saved = True
                break
            for choice in ("Allow all", "Allow"):
                candidates = [e for e in elements if label(e).strip().lower() == choice.lower()]
                if candidates:
                    await tap(choice)
                    break
            await asyncio.sleep(1)
        if not saved: raise AssertionError("Native Photos save was not confirmed")
        report["checks"].append({"check":"Explicit native Save new clip to Photos", "result":"passed"})
    report["status"] = "passed"

try:
    asyncio.run(main())
except Exception as error:
    report["status"] = "blocked-or-failed"
    report["error"] = str(error)
finally:
    try:
        diagnostic = subprocess.run(["adb", "-s", os.environ.get("ARTEMIS_DEVICE_ID", "emulator-5554"), "logcat", "-d", "-b", "main", "-b", "system", "-b", "crash"], capture_output=True, text=True, timeout=20)
        (OUT / "device-logcat.txt").write_text(diagnostic.stdout)
    except Exception:
        pass
    (OUT / "report.json").write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
if report["status"] != "passed":
    raise SystemExit(1)

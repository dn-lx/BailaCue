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
from artemis.clients.screen_client_factory import hierarchy_backend_summary

OUT = Path(os.environ.get("BAILACUE_ARTEMIS_OUT", "/workspace/BailaCue/artifacts/artemis"))
OUT.mkdir(parents=True, exist_ok=True)
report = {"framework": "google/artemis", "mode": "controller-driven assertions; no autonomous model invocation", "checks": [], "status": "running"}
apk_files = list(Path("artifacts").glob("*.apk"))
if len(apk_files) == 1:
    report["apk_file"] = apk_files[0].name
    report["apk_sha256"] = hashlib.sha256(apk_files[0].read_bytes()).hexdigest()

async def main():
    controller = _get_controller(device_serial=os.environ.get("ARTEMIS_DEVICE_ID", "emulator-5554"))
    async def observe(name):
        screen = await asyncio.wait_for(controller.get_screen_data(), timeout=45)
        report["observation_backend"] = hierarchy_backend_summary(controller.ctx.ui_adb_client)
        (OUT / f"{name}.png").write_bytes(base64.b64decode(screen.base64))
        (OUT / f"{name}.json").write_text(json.dumps(screen.elements, indent=2))
        return screen.elements
    def label(element):
        return " ".join(str(element.get(k, "")) for k in ["text", "content-desc", "contentDescription", "label"])
    async def tap(text):
        elements = await observe("before-tap")
        # DocumentsUI exposes a separate accessible "Preview the file ..."
        # button. Selecting it opens a player instead of returning the file.
        matches = [e for e in elements if text.lower() in label(e).lower()
                   and not label(e).strip().lower().startswith("preview the file")]
        for element in sorted(matches, key=lambda e: (not (e.get("focusable") in (True,"true") or e.get("clickable") in (True,"true")),len(label(e)))):
            bounds = re.fullmatch(r"\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]", str(element.get("bounds", "")))
            if not bounds:
                continue
            x1,y1,x2,y2 = map(int,bounds.groups())
            if x2>x1 and y2>y1 and y1>=0 and y2<=controller.ctx.device.device_height:
                result = await asyncio.wait_for(controller.tap_at((x1+x2)//2,(y1+y2)//2),timeout=30)
                if getattr(result,"error",None):
                    raise AssertionError(result.error)
                await asyncio.sleep(0.8)
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
        if any("BailaCue keeps stopping" in label(e) or "BailaCue has stopped" in label(e) for e in elements):
            raise AssertionError("BailaCue crashed during native startup; see device-logcat.txt")
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
            # Use ARTEMIS's focused-input accessibility API, avoiding the
            # driver's unsupported --meta keyboard-clear sequence on API35.
            client = controller.ctx.ui_adb_client
            if not await asyncio.to_thread(client.clear_text):
                raise AssertionError(f"ARTEMIS could not clear {text}")
            await asyncio.to_thread(client.send_text, value)
            await controller.go_back()
            # The IME can cover the focused field; inspect after it closes.
            for attempt in range(5):
                elements = await observe("field-value")
                fields = [e for e in elements if "EditText" in e.get("class", "") and text.lower() in label(e).lower()]
                if fields:
                    if not any(e.get("text") == value for e in fields):
                        raise AssertionError(f"Native text entry did not replace {text} with {value}")
                    return
                screen = await controller.get_screen_data()
                await controller.swipe_coords(screen.width//2,int(screen.height*.78),screen.width//2,int(screen.height*.48),350)
            raise AssertionError(f"Could not verify the entered value for {text}")
        await locate("Add video")
        await locate("Choose a video")
        # Wait for the external picker rather than inspecting the previous app
        # screen while its activity transition is still running.
        for _ in range(15):
            elements = await observe("file-picker")
            if any("BailaCue-ARTEMIS" in label(e) for e in elements):
                break
            await asyncio.sleep(1)
        else:
            await locate("Show roots",attempts=3)
            await locate("Videos",attempts=3)
            elements = await observe("video-folders")
            if not any("BailaCue-ARTEMIS" in label(e) for e in elements):
                await locate("Download",attempts=5)
        await locate("BailaCue-ARTEMIS",attempts=8)
        await field("Video title","ARTEMIS practice")
        await locate("Choose labels",scrolls=3)
        await field("Search labels","ARTEMIS Artist")
        await locate("Create “ARTEMIS Artist”",scrolls=3)
        elements = await observe("label-created")
        if not any("Remove label ARTEMIS Artist" in label(e) for e in elements):
            raise AssertionError("Created artist label was not selected")
        await locate("Done choosing labels",scrolls=2)
        await locate("Add to my library",scrolls=10)
        for _ in range(20):
            elements = await observe("imported-video")
            if any("Video position" in label(e) for e in elements): break
            await asyncio.sleep(1)
        else: raise AssertionError("Imported native video did not open")
        # Exercise the actual native resize grip and shared-line trim handles.
        async def control(text, name):
            elements = await observe(name)
            matches = [e for e in elements if text.lower() in label(e).lower() and e.get("parsed_bounds")]
            for element in matches:
                b = element["parsed_bounds"]
                if b["bottom"] > b["top"] >= 0 and b["bottom"] <= controller.ctx.device.device_height:
                    return element, b
            raise AssertionError(f"Native control {text} is not visible")
        await locate("Compact video",scrolls=2)
        grip, b = await control("Resize video area", "player-compact")
        if "170 pixels tall" not in label(grip): raise AssertionError("Compact video size was not applied")
        await controller.swipe_coords((b["left"]+b["right"])//2,(b["top"]+b["bottom"])//2,(b["left"]+b["right"])//2,(b["top"]+b["bottom"])//2+90,600)
        await asyncio.sleep(1)
        grip, _ = await control("Resize video area", "player-resized")
        height = re.search(r"(\d+) pixels tall", label(grip))
        if not height or int(height.group(1)) <= 170: raise AssertionError("Dragging the native video grip did not increase its height")
        report["checks"].append({"check":"Native player size preset and drag resizing", "result":"passed", "dragged_height":int(height.group(1))})
        await locate("Standard video",scrolls=2)
        await locate("Trim on timeline",scrolls=3)
        for edge, movement in (("start",90),("end",-90)):
            handle, b = await control(f"Trim {edge}", f"trim-{edge}-before")
            x,y = (b["left"]+b["right"])//2,(b["top"]+b["bottom"])//2
            await controller.swipe_coords(x,y,x+movement,y,600)
            await asyncio.sleep(1)
            handle, _ = await control(f"Trim {edge}", f"trim-{edge}-after")
            value = re.search(r"(\d+\.\d+) seconds", label(handle))
            if not value: raise AssertionError(f"Trim {edge} does not expose its selected time")
            seconds = float(value.group(1))
            if edge == "start" and seconds <= 0.25: raise AssertionError("Native start trim handle did not move")
            if edge == "end" and seconds >= 5.9: raise AssertionError("Native end trim handle did not move")
        report["checks"].append({"check":"Native start and end trim handles dragged on playback timeline", "result":"passed"})
        await locate("Done trimming",scrolls=2)
        # The title follows the player and local-storage controls below the fold.
        await locate("ARTEMIS practice", scrolls=4)
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
        # The confirmation is a native Alert, which must close before the
        # remaining label controls below the player become accessible.
        await locate("OK",attempts=3)
        await locate("Remove label ARTEMIS Artist",scrolls=12)
        await locate("Choose labels",scrolls=2)
        await field("Search labels","artemis artist")
        elements = await observe("label-existing")
        if any("Create “artemis artist”" in label(e) for e in elements):
            raise AssertionError("Existing artist label incorrectly offered as new")
        await locate("Select ARTEMIS Artist",scrolls=3)
        await locate("Done choosing labels",scrolls=2)
        await locate("Save details",scrolls=3)
        report["checks"].append({"check":"Native artist label creation, saved reuse and case-insensitive selection", "result":"passed"})
        # New daily-mix acceptance uses real imports and star controls, with no
        # injected library state or live cloud credentials.
        await controller.go_back()
        await asyncio.sleep(1)
        for title, style, stars in (("ARTEMIS Salsa pick","Salsa",5),("ARTEMIS Bachata pick","Bachata",4)):
            await locate("Add video",attempts=5)
            await locate("Choose a video",scrolls=12)
            for _ in range(15):
                elements = await observe("daily-file-picker")
                if any("BailaCue-ARTEMIS" in label(e) for e in elements): break
                await asyncio.sleep(1)
            await locate("BailaCue-ARTEMIS",attempts=8)
            await field("Video title",title)
            await locate(style,scrolls=3)
            await locate(f"{stars} ★",scrolls=5)
            await locate("Add to my library",scrolls=12)
            for _ in range(20):
                elements = await observe("daily-imported")
                if any("Video position" in label(e) for e in elements): break
                await asyncio.sleep(1)
            else: raise AssertionError("Rated native video did not open")
            await controller.go_back()
            await asyncio.sleep(1)
        await locate("Today",attempts=5)
        await locate("Update today’s picks",scrolls=6)
        async def see(text, name):
            for _ in range(12):
                elements = await observe(name)
                for element in elements:
                    b = element.get("parsed_bounds", {})
                    if text in label(element) and b.get("bottom", 0) > b.get("top", 0) >= 0 and b["bottom"] <= controller.ctx.device.device_height:
                        return
                screen = await controller.get_screen_data()
                await controller.swipe_coords(screen.width//2,int(screen.height*.78),screen.width//2,int(screen.height*.28),400)
                await asyncio.sleep(0.8)
            raise AssertionError(f"Native Daily Picks did not show {text}")
        await see("Play ARTEMIS Bachata pick","daily-bachata")
        await see("Play ARTEMIS Salsa pick","daily-salsa")
        report["checks"].append({"check":"Native rated imports produce one Bachata and one Salsa Daily Pick", "result":"passed"})

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

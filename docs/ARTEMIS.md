# Google ARTEMIS testing

Framework: [google/artemis](https://github.com/google/artemis), pinned to
`351ca8422f7b5b54e80a9c1ce03a222e02415b6b`. Installed with Python3.12/uv.
`scripts/artemis-smoke.py` uses its actual Android controller, observation and actions.
This is deterministic controller testing, not an autonomous Gemini session. No model
API key, private account credentials or user videos are supplied to the framework.

## Actual findings

The cloud workspace lacks KVM. Its software-emulated API35 device eventually accepted
the helper/APK, but screenshot/XML capture timed out. No native pass came from it.
Testing moved to an isolated, hardware-accelerated GitHub Actions API35 Google APIs
x86_64 emulator. Fresh emulator launcher dialogs and accessibility-service enablement
races initially blocked observation/launch; the harness now retries installation,
allows ARTEMIS's built-in UIAutomator fallback and starts the exact app activity.

[Run 39099737136](https://github.com/dn-lx/BailaCue/actions/runs/39099737136)
reached the actual build3 application through ARTEMIS helper1.2.0 and exposed a real
**native startup crash**: AndroidX WorkManager could not instantiate its Room
WorkDatabase during AndroidX Startup initialization. DEX class-definition inspection
confirmed that build3 retained the generated WorkDatabase_Impl class but removed its
reflective constructor; the unshrunk local build4 retains its public no-argument
constructor. Its report has zero passed app
assertions. Full device logs, screenshots, hierarchy, activity-start output and report
are in the run's `BailaCue-ARTEMIS-acceptance-evidence` artifact. Build3 was withdrawn;
build2 was also retired rather than recommending an unverified older preview.

Build4 uses the SDK58 `expo-build-properties` config plugin to disable Android
release minification/resource shrinking. Generated native files are not edited by
hand. It remains a bundled release-mode preview with a test signing identity.
Build4 compiled and its public checksum/signature/version were verified. ARTEMIS in run 39100084476 passed native launch, branded Today and Settings/Library
navigation, confirming the startup fix. The video journey stopped at fixture
selection in Android DocumentsUI. The harness now waits for the external picker
transition and uses a correctly scaled Pixel viewport; rerun 39101471275 tests the
same published APK. Export/Photos are not claimed as passed yet.

## Native acceptance harness

The workflow generates a synthetic six-second H.264/AAC video. The harness checks:

1. Native launch, branded Today screen and Settings/Library navigation.
2. Android document-picker import and editable video title.
3. A named 1–4 second section and loop control.
4. Actual native Media3 export to a separate app-owned MP4.
5. Original bytes match the fixture before and after exporting; ffprobe output
   duration is three seconds within 0.25 seconds.
6. Explicit Save new clip to Photos, handling permission prompts and success result.

Each assertion must execute successfully before the report says passed. A native
crash/ANR, missing control or timeout fails the job. ARTEMIS observation backend is
recorded. Evidence includes synthetic originals/output, screenshots/hierarchies,
report and launch/device logs. Tests use no private media or connected cloud accounts.

The revised preview-tag workflow builds/verifies an artifact, runs native
acceptance on it, then publishes only after that job succeeds. Build4 was started
with the earlier publication order; its native acceptance is checked separately. `artemis-android.yml` can repeat acceptance for a selected published tag
without rebuilding the application. A passing harness does not imply autonomous
Gemini exploration, camera/accessibility review, physical-device codec coverage,
live Google/Dropbox consent/transfers, real two-user Me+ acceptance or iOS parity.

## Build5 continuation

Run39101731554 corrected selection of the filename rather than DocumentsUI's
separate Preview action. It reached the real importer and exposed a real asynchronous
SDK58 file-copy race before native inspection. Build4 was withdrawn. Build5 awaits
copy/move completion and has three deferred-I/O regression tests (68 total passing).
Run39102137159 builds5 and gates publication on native acceptance. Import/export/
Photos are still pending; startup and native navigation were verified on build4.

# Google ARTEMIS testing

Requested framework: [google/artemis](https://github.com/google/artemis), cloned and
installed locally with Python 3.12 and `uv sync --no-dev`. Its setup script was not
run because it rewrites global IDE/agent configuration. No private videos/accounts
or provider credentials were supplied to ARTEMIS.

The initial `uv run artemis doctor --json` found two blockers: no connected Android
device and no model API credential (GEMINI_API_KEY / equivalent). Android SDK emulator
and API 35 Google APIs x86_64 image were installed. Hardware virtualisation/KVM is
unavailable; the emulator is being attempted with forced TCG software emulation.

```sh
export PATH="$ANDROID_HOME/platform-tools:$PATH"
uv run artemis doctor --json
uv run artemis helper install --serial emulator-5554
```

The helper is an accessibility service on the isolated test emulator. It reads screen
layouts through an authenticated loopback endpoint. Initial installation failed while
Android's package service was still unavailable during boot. Device testing is not
claimed until recorded in VERIFICATION.md. Autonomous ARTEMIS Gemini runs also require
a configured model credential in the environment; no secret is requested in chat.

For a hardware-accelerated emulator or connected test phone, install the preview APK
and use ARTEMIS to exercise: launch → import the synthetic clip → play/seek/speed/mirror
→ save/loop 1–4 seconds → export new clip → verify original checksum and separate
output duration → save/share → relaunch persistence. Then use registered OAuth apps
for personal folder connection, online playback, selected download, airplane mode,
upload interruption/retry, permission denial/reconnect and reminder deep links.
The repository's browser mocks do not replace these native journeys.

Further actual attempts: streaming helper installation timed out after 30 seconds.
A pushed install reached Android PackageInstaller but failed because its
PackageManagerInternal was still null while the software-emulated system booted.
These are environment failures, not passed application tests.

`scripts/artemis-smoke.py` provides deterministic native UI assertions using
ARTEMIS's actual controller/observation API. This mode does not invoke Gemini.
It requires a fully booted device and working helper and does not substitute for
the autonomous runner or video-editing acceptance journey.

The isolated emulator eventually finished booting. A manual helper install and APK
installation succeeded; ARTEMIS attached its helper and UIAutomator2 fallback.
Observation repeatedly timed out during screenshot/XML capture under forced TCG.
The 180-second controller run ended without a completed app assertion report.
The preview publication workflow now includes a separate hardware-accelerated
Android/ARTEMIS job. It uses the published APK and synthetic video, with deterministic
controller assertions for import, saved section/loop controls and new-file export.
Gemini is not invoked by that job and no model API key is bundled. Its actual result
will be recorded separately; configuring a test job is not a passing test.

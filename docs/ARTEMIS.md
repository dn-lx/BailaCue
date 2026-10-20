# Preview18 native acceptance in progress

The updated harness removes preset assertions, tests the resize grip, opens Extra
options before editing, and checks native Mirror by comparing asymmetric rendered
pixels before/reversed/restored. It also verifies actual Practice time, paused time
and background/foreground resume. The same Media3/Photos/original-checksum checks
remain. Do not treat prior runs as evidence for this source. Result pending.

Build17 brand-only acceptance passed12 checks in run39422105336; its report is in
verification/android-build17/. The full-document features start at build18.

# Current acceptance · BailaCue 0.2.10/build15

All12 Google ARTEMIS native checks passed in
[run39214131930](https://github.com/dn-lx/BailaCue/actions/runs/39214131930).
App source fe73e07156a279e6b607911a8bd3aece4142814a; helper1.2.0. Public APK
SHA256 `0c4901c01f83f277ab08a5dee9a911a6d484b40efde26e5f60d51e19a6cf52d5`
(70,240,141bytes) equals the native-tested artifact. Checksum, APKv2 signature,
package/version and unchanged signing identity were independently verified.
[Report](verification/android-build15/report.json) · [Details](VERIFICATION.md).
Cloud renaming/default-off/progress/failure tests use mocked providers; native
checks use synthetic phone videos through the actual controller/helper, without
an autonomous model. No live provider rename writes were used for this release.

Earlier acceptance records and setup follow.

---

# Current acceptance · BailaCue 0.2.9/build14

All12 Google ARTEMIS native checks passed in
[run39172854949](https://github.com/dn-lx/BailaCue/actions/runs/39172854949).
App source f3885fa595b7802ad094de9e7cd70482b28e7831; helper1.2.0. Public APK
SHA256 `18ade8ba0e623e9f8f871cecb2d39e9e9edee8f7634add7433d9b828389aa7bf`
(70,231,089bytes) equals the native-tested artifact. Checksum, APKv2 signature,
package/version and unchanged signing identity were independently verified.
[Report](verification/android-build14/report.json) · [Details](VERIFICATION.md).
Cloud numbering/renaming tests use mocked providers; native checks use synthetic
phone videos through the actual controller/helper, without an autonomous model.

Earlier acceptance records and setup follow.

---

# Google ARTEMIS · build11 acceptance

[Acceptance run39166069113](https://github.com/dn-lx/BailaCue/actions/runs/39166069113)
passed **all12 native checks** on the exact0.2.8/build11 APK. New native import
preview playback passes, along with all existing resize/trim-handle/import/labels/
loop/new-file export/original-preservation/Photos/Daily Picks assertions.
The real pinned ARTEMIS controller/helper1.2.0 ran on API35; no autonomous Gemini
session, real account or private media was used.

[Report](verification/android-build11/report.json) ·
[Preview playback](verification/android-build11/import-preview.jpg) ·
[Daily mix](verification/android-build11/daily-mix.jpg) ·
[Timeline trim](verification/android-build11/timeline-trim.jpg) ·
[Player resize](verification/android-build11/player-resized.jpg) ·
[Photos save](verification/android-build11/photos-saved.jpg).

The [first attempt](verification/android-build11/first-attempt.json) passed11 checks
then stopped during the final rated imports. A substring selector matched the title
ARTEMIS Bachata pick, opening the keyboard before the star control could be reached.
Harness commit a41f549 now requires exact style/star controls. The rerun tested the
same built APK, with no skipped application assertion or binary change.

[Build39164214724](https://github.com/dn-lx/BailaCue/actions/runs/39164214724) compiled
and signed the app; its original publication was skipped after that harness failure.
[Recovery39166585417](https://github.com/dn-lx/BailaCue/actions/runs/39166585417)
required the successful acceptance job/report and matching APK hash before publishing.
Public APK SHA256 `b3db5adec0b0590bd87a79387c2e2b8bec21c8540294ec8837ed4f9826b5f2ba` equals
the build artifact and native report. Public checksum/signature/version were verified.
The 1–4s clip measured3.017075s; original-before/after hashes match. Resizing changed
170px to217px. Native Daily Picks uses real local imports; cloud-source selection,
renames and transfer behavior use separate mocked regression/browser tests.

Full original screenshots, hierarchies, synthetic media and logs are retained in the
acceptance artifact. Committed images are unchanged JPEG bytes, renamed from the
harness's .png extension. The Daily mix capture shows cards as reached during the
scrolling assertions. Live provider transfers/renames, physical-device hardening and
iOS remain unverified. See [full verification](VERIFICATION.md).

## Historical build9 acceptance

[Build9 run39120175502](https://github.com/dn-lx/BailaCue/actions/runs/39120175502)
passed **all11 native checks** on Android API35 using the real pinned ARTEMIS
controller/helper1.2.0. The additional check imports rated Salsa and Bachata videos
through DocumentsUI and asserts both Daily Picks. Existing resize, both timeline
trim handles, import, labels, looping, separate MP4 export and Photos checks pass.
No autonomous Gemini session or real provider account was used.

[Report](verification/android-build9/report.json) ·
[Today](verification/android-build9/today.jpg) ·
[Daily mix](verification/android-build9/daily-mix.jpg) ·
[Trim](verification/android-build9/timeline-trim.jpg) ·
[Player resize](verification/android-build9/player-resized.jpg) ·
[Photos saved](verification/android-build9/photos-saved.jpg).
Screenshots retain original ARTEMIS JPEG bytes with corrected extensions. The daily
mix image shows the Bachata card and the start of the Salsa card; assertions also
use the native accessibility hierarchy. The browser journey separately verifies
highest-rated selection, both styles, threshold exclusion and saved-day behavior.

The public APK, build artifact and native report share SHA256
`1bbd27d402e047f1dfa0f677d239e17ae221837b4274a387ed7bb04792d78c66`.
The public checksum, APKv2 signature, package and version were independently verified.
The 1–4s export was independently measured at3.017075s and both original hashes match.
The complete evidence remains in the run artifact. This run passed on its first
attempt; no application assertion was skipped. See [verification](VERIFICATION.md)
for remaining live-provider, physical-device and iOS boundaries.

## Historical build8 acceptance

[Build8 run39115739082](https://github.com/dn-lx/BailaCue/actions/runs/39115739082)
passed **all ten native checks** and published the tested APK. Real native resize-grip
and both start/end trim-handle gestures pass, alongside import/labels/loop/new-file
export/original-byte/Photos assertions. Compact170px became220px after dragging;
the selected range became0.89–5.11s. Precision1–4s export measured3.017075s, with
unchanged originals. This is the real controller/helper1.2.0, not autonomous Gemini.

[Report](verification/android-build8/report.json) ·
[Timeline trim](verification/android-build8/timeline-trim.jpg) ·
[Resized player](verification/android-build8/player-resized.jpg) ·
[Photos saved](verification/android-build8/photos-saved.jpg).

Public APK bytes exactly match the built artifact and passing report:
SHA256`1a7c65aca5c0c7097b7af0b30746a9980a1915989408417443dbe44ebe7a1bba`. Signature and
version were independently verified. First attempt lost ADB before app installation;
retry tested the same APK without rebuilding or skipping an app assertion.
See [verification](VERIFICATION.md) for scope and live-provider/iOS boundaries.

## Historical build7 result

[Build7 native test and publication run39111878471](https://github.com/dn-lx/BailaCue/actions/runs/39111878471)
passed **all eight checks** on Android API35 with the pinned real ARTEMIS controller
and helper1.2.0. This includes saved artist-label creation, removal and reuse via
case-insensitive search, alongside launch/navigation/import, named looping, separate
native MP4 export and explicit Photos saving. The Photos confirmation is dismissed
before testing the label controls below the player.

Tested and publicly downloaded APK SHA256:
`59557aa55efecff2baa0250f239b4f9478a66fb00f43d3ee827731d53f06faa8`.
The 1–4s native trim measured3.017075s; original bytes remained unchanged.
[Report](verification/android-build7/report.json) ·
[created artist label](verification/android-build7/label-created.jpg) ·
[existing artist suggestion](verification/android-build7/label-existing.jpg) ·
[Photos saved](verification/android-build7/photos-saved.jpg).

Full screenshots/hierarchies, original/output fixtures and logs are in the run's
`BailaCue-ARTEMIS-device-evidence` artifact. All screenshots are unmodified JPEG
bytes from ARTEMIS, renamed from the harness's .png extension to .jpg.
No autonomous Gemini session or live Google account was used. SDK registration-error
mapping is covered by mock tests separately; it is not live OAuth acceptance.

The label-only build6 also passed eight native checks in run39112241526, but was
superseded before publication by build7's Drive error recovery. Its first native
job was intentionally cancelled after a successful build, so the updated harness
could dismiss the Photos confirmation before continuing to label controls.
Build6 remains a draft. Build7 is superseded by build8 for installation.

## Earlier build5 evidence

[Successful run39104109693](https://github.com/dn-lx/BailaCue/actions/runs/39104109693)
verified BailaCue 0.2.3/build5 on an isolated Android API35 Google APIs x86_64 emulator
with hardware CPU acceleration. Framework:
[google/artemis](https://github.com/google/artemis), pinned to
`351ca8422f7b5b54e80a9c1ce03a222e02415b6b`, Python3.12, helper1.2.0.

This is deterministic testing through ARTEMIS's real controller, observations and
focused-input accessibility actions. No autonomous Gemini session or model API key
was used. No real account credentials or private user videos were supplied.

| Native check                                       | Actual result                                    |
| -------------------------------------------------- | ------------------------------------------------ |
| Installed APK launch / branded Today               | Passed                                           |
| Settings navigation                                | Passed                                           |
| Library navigation                                 | Passed                                           |
| DocumentsUI import / editable title / video detail | Passed                                           |
| Named 1–4 second section / loop control            | Passed                                           |
| Separate native Media3 MP4 export                  | Passed; ffprobe duration 3.017075s               |
| Original byte preservation                         | SHA256 before/after equals the synthetic fixture |
| Explicit Save new clip to Photos                   | Passed; native success alert recorded            |

The report groups export/duration/checksum preservation as one check: **7 checks
passed**. [Committed report](verification/android-build5/report.json),
[Today screenshot](verification/android-build5/today.jpg),
[new clip](verification/android-build5/trim-ready.jpg) and
[Photos confirmation](verification/android-build5/photos-saved.jpg) are retained.
Full screenshots/hierarchies, synthetic originals/output and logs are in the run's
`BailaCue-ARTEMIS-acceptance-evidence` artifact. The exported video was also pulled
and measured again locally; original-before/after hashes were independently compared.

Tested APK SHA256:
`7443b70330a8b6e0afdddfbab1711415b074f9c82a85df416fcf20008e42bb1f`.
Original fixture SHA256:
`ba9ae8ea60f222465b2d9af337fa267734a9c15fc10a9d11d53f9f3ff60c68c2`.

## What the testing caught

Build3's optimized release crashed before launch: R8 removed WorkDatabase_Impl's
reflective constructor. Build4 disabled shrinking through the supported Expo config
plugin and passed startup/navigation. Corrected file-picker interaction then exposed
an unawaited SDK58 File.copy; downloaded File.move had the same inspection race.
Build5 awaits both, cleans failed partial copies, and adds 3 deferred-I/O regressions.
Builds2–4 were retired/withdrawn.

Harness corrections wait for DocumentsUI, select its filename instead of its separate
Preview action, scale the emulator display consistently, scroll to below-fold titles,
and use ARTEMIS clear_text/send_text instead of the driver's unsupported keyboard
clear sequence. Exact field values are checked after dismissing the covering IME.
No application assertion was skipped to obtain the pass.

The workspace's software-only emulator could not capture observations reliably;
all passing native results came from the hardware-accelerated Actions emulator.
The first build5 workflow's native job failed on harness visibility; a standalone run
retested the same artifact with corrected interactions. Recovery publication required
that run to succeed and its recorded APK hash to equal the built artifact's hash.
Future preview publication is gated on native acceptance before creating a release.

`artemis-android.yml` can test a published tag or an existing build-run artifact.
This coverage does not imply autonomous Gemini exploration, actual loop-wrap timing
on every codec/device, camera/accessibility review, live provider consent/transfers,
real two-user Me+ acceptance, physical notification delivery or iOS parity.

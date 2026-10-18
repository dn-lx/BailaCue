# Google ARTEMIS · build7 passed

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
Build6 remains a draft; use build7 for installation.

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

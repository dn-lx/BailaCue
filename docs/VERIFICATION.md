# Verification · BailaCue 0.2.21 / build26

[Download the Android APK](https://github.com/dn-lx/BailaCue/releases/download/v0.2.21-preview.26/BailaCue-v0.2.21-build26-preview.apk). App source `9bc627d1c6aff5918938d506e1cbdf8a03ab2914`.

Implements [R2-01–R2-06](REQUIREMENTS-ROUND-2.md): playlist cue/import and durable
Add/Open Library, compact YouTube titles, resize/full screen with one mounted player,
the approved transparent b/play identity, and centered chip groups/wrapped rows.

| Check                                                                                          | Actual result                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Source checks](https://github.com/dn-lx/BailaCue/actions/runs/39504555287)                    | 190 unit/database tests in 19 suites; 14 browser journeys; type/lint, web export, Deno check and Expo Doctor 20/20 pass                                                                           |
| [Android build](https://github.com/dn-lx/BailaCue/actions/runs/39504561447)                    | Bundled release-mode preview, ARM64+x86_64, Android API 24 minimum/API 36 target                                                                                                                  |
| [Google ARTEMIS native acceptance](https://github.com/dn-lx/BailaCue/actions/runs/39508298270) | All 14 recorded checks passed on API 35; real pinned controller/helper 1.2.0, no autonomous model/private accounts                                                                                |
| Public APK                                                                                     | APKv2 signature/content digest, package/version, checksum and unchanged preview signer independently verified; public bytes equal accepted artifact                                               |
| [iOS compile](https://github.com/dn-lx/BailaCue/actions/runs/39504563536)                      | Fresh unsigned simulator compilation passes; iOS-target Hermes export also passes                                                                                                                 |
| Chip layout                                                                                    | Actual exported UI: 34 groups across Library/Settings/Practice at 320/412px, each wrapped row centered with 0px maximum measured error; light/dark screenshots                                    |
| Brand                                                                                          | All 70 manifest checksums match; genuine transparent artwork/in-app marks; adaptive color/monochrome layers have zero visible pixels outside Android's 66dp safe zone; separate opaque iOS export |

Native checks retain actual import-preview playback, drag resizing, rendered-pixel
Mirror reversal/restoration, both timeline trim handles, named loops, a new native
MP4, unchanged originals, Photos, artist-label creation/reuse, rated Salsa/Bachata
Daily Picks and Practice active-time/manual-pause/background-resume behavior.
The exported clip independently measures 3.017075s and
original-before/after SHA256 values match.

The [first device attempt](verification/android-build26-initial/README.md) stopped
at an export action clipped against Android's bottom gesture edge. The corrected
harness scrolled that action into view and passed all 14 checks on the same APK.
No application assertion was skipped and the binary was not rebuilt.

## YouTube evidence and limits

The live public playlist attempt timed out without exposing addable contents. The app displayed its timeout and API-key setup guidance. Live import remains unverified and is not counted as a passed check. Playlist regression tests use controlled official-endpoint responses.

The 14 browser journeys include four new round-2 cases: cued keyless discovery
without playback and despite preview failure; invalid-key fallback/deduplication;
compact title/resize/full-screen continuity preserving iframe identity, position
and 1.5× speed; and failed durable save with preserved selection and working retry.
These integrations use controlled official endpoints, not live provider responses.
Full playlist pagination needs a device YouTube Data API v3 key. Keyless player
lists may be limited; setup/retry and partial membership preservation are explicit.
A second live public playlist and physical iPhone YouTube playback remain manual.

## Evidence and distribution

[Native report](verification/android-build26/report.json) · [APK proof](verification/android-build26/apk-proof.json) · [Media proof](verification/android-build26/media-proof.json) · [Browser evidence](verification/browser-build26/checks.json) · [Chip geometry](verification/ui-build26/checks.json) · [Brand checks](verification/brand-build26/checks.json) · [iOS scope](verification/ios-build26/report.json).

Public APK SHA256: `3101235f761f09afdf43b77c462a7cc88ae32dbd35ca546c0558cf8f41e7e07c`. Signer SHA1 remains
`5e8f16062ea3cd2c4a0d547876baa6f38cabf625`, enabling installation over the
existing matching preview. Main remains unmerged; no new production database
changes or store submission occurred. iPhone distribution still requires Apple
signing/provisioning. Live Drive/Dropbox consent/transfers, phone-call interruption,
full TalkBack/VoiceOver and physical-device hardening are not implied by these checks.

Builds23–25 were withheld before publication for final layout/icon corrections and
the owner's additional chip-group request. [Build22 verification](VERIFICATION-0.2.17.md)
is historical. No build26 feature is attributed to the older APK.

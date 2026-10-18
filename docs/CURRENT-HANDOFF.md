# Current handoff · BailaCue 0.2.5 (build8)

Source branch `feat/bailacue-mobile-foundation`, draft PR#1. Build8 release tag
`v0.2.5-preview.8` points to `95a088b8d776eb5017862ebbc7c52992315c9fcc`.
Later commits update only documentation/evidence. Build8 is published:
https://github.com/dn-lx/BailaCue/releases/tag/v0.2.5-preview.8
APK68,528,909 bytes; SHA256
`1a7c65aca5c0c7097b7af0b30746a9980a1915989408417443dbe44ebe7a1bba`.
Public bytes were re-downloaded, matched to the passing native report, signature and
version verified. Same preview signing certificate as build7, for in-place upgrades.
Run39115739082 passed native acceptance on retry and published. The first emulator's
ADB connection closed before installing the app; retry reused the same built APK.

## Implemented for the latest request

Imports/recordings and native trimmed-clip saves offer explicit phone/cloud destination,
separate Salsa/Bachata folders (including one account), and keep-phone-copy selection.
Online saves start uploading to the chosen source. Failure retains the owned local
file; online-only cleanup follows successful transfer confirmation. Resume pins
source/folder/account/provider. Upload registration retains latest metadata and
all library references. Drive token refresh respects writable account permission.

Playback timeline has draggable, accessible trim start/end handles; numeric timing
and separate-file export remain. Video has a vertical resize grip and three presets,
with aspect ratio preserved. Clip saves from an online source default to its sole
folder; ambiguous membership requires a choice. Local saves remain separate.

100 unit/database tests, four browser journeys, type/lint, Deno and Doctor20/20
pass in Actions. Native ARTEMIS passed all ten checks, including real grip and both
handle gestures, import/labels/loop/export/original-hash/Photos. Precision1–4s export
measured3.017075s; before/after original hashes match. Public APK hash matches the
passing report. See VERIFICATION.md and verification/android-build8 for evidence.
The controller is real Google ARTEMIS with helper1.2.0, not autonomous Gemini.

## Google setup progress

The owner manually created an Android OAuth client, reports Drive API enabled,
Audience test users configured and read/write consent scopes saved. Exact preview
package `app.bailacue.mobile`, SHA1
`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
Current correct Data Access console route is `/auth/scopes`, not `/auth/data-access`.
Android native sign-in needs no bundled Android client ID. Optional web/iOS build
identifiers must be of their matching OAuth client types. No Google Cloud credentials
are available in the workspace. Actual real-account login/upload remains unverified.
The user explicitly requested no TinyFish; do not invoke it or access browser profile
files/cookies. No browser control runtime is available here.

## Existing scope and authorization

Branding, labels/artist dropdowns, account API, personal sources, offline copies,
video practice, collections and native media module remain. Me+ shared production
BailaCue APIv2 and three additive migrations were owner-approved and deployed already;
do not re-ask approval or modify unrelated Me+ health/auth data. Source pushes and
APK prerelease publication are authorized. Do not merge main or submit to stores.
No paid actions. No subagents unless explicitly requested.

Live provider transfers, real two-user Me+ acceptance, camera/notification/physical
accessibility/large-file hardening and iOS compilation/signing remain unverified.
Automatic metadata merge/sync, new-video push and WebDAV/S3 adapters remain pending.

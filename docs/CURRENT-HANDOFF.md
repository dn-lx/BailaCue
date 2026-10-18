# Current handoff · BailaCue0.2.4 (build7)

Source: `feat/bailacue-mobile-foundation`, draft PR#1. App source tag
`v0.2.4-preview.7` points to `6c2e0fb40486a16fddc3c423d95db708c38ba9fe`.
Later commits update documentation/evidence only.

## Current Android delivery

https://github.com/dn-lx/BailaCue/releases/tag/v0.2.4-preview.7
APK `BailaCue-v0.2.4-build7-preview.apk`, 68,515,481 bytes.
SHA256 `59557aa55efecff2baa0250f239b4f9478a66fb00f43d3ee827731d53f06faa8`.
Public bytes were downloaded again and exactly matched the passing ARTEMIS report.
APKv2 signature verified; packageapp.bailacue.mobile, version0.2.4/code7,
minimumAPI24/target36, ARM64+x86_64. Preview certificate SHA1:
`5e8f16062ea3cd2c4a0d547876baa6f38cabf625`, unchanged from build5.

Run39111878471 built, passed all8 native ARTEMIS checks and published the APK.
Checks39111879404 passed: 80 tests/9 suites,4 browser journeys, type/lint, Deno,
Expo Doctor20/20 and web export. Native report/screenshots are committed under
`docs/verification/android-build7`; original/output hashes and3.017075s duration
were independently checked in the workspace. ARTEMIS uses its real controller,
not autonomous Gemini. Build6 passed separate native acceptance but is superseded
and remains a draft. Builds2–4 remain withdrawn. Build5 is historical.

## New features and current Google blocker

Searchable multi-label pickers in video import, details and cloud-folder defaults:
select existing labels or create artist/video-type/custom labels, remove selected
chips and save. Suggestions come from saved videos/folders in the current library;
case/whitespace/Unicode variants deduplicate. Existing arrays/sync remain compatible.
See docs/LABELS.md. Browser and native tests verify creation, reuse and persistence.

The user's screenshot showed Google DEVELOPER_ERROR/code10. Official SDK docs
identify it as an app/remote OAuth registration mismatch. Native code now maps it
to GoogleDriveSetupError, with clear recovery and Files/setup-help actions.
Nine SDK mock regressions pass. This is not a completed live sign-in fix.
No Google Cloud credentials/project exist in the cloud runtime. Remote registration
is awaiting the app owner's authenticated Google Cloud access. Do not request a
password in chat. Once access is available, inspect the project and public Android
OAuth client settings for this exact package/certificate; do not infer success.
No private browser/session data belongs in the repository. See CLOUD-STORAGE.md.

## Existing app and infrastructure

Original branding/themes, local import/recording, personal Drive/Dropbox folders,
online/phone copies, recoverable uploads, practice player/loops/notes/collections,
separate native trims with Photos/share/upload, comparison/reminders/device lock.
Owner-approved Me+ APIv2 and all3 additive BailaCue migrations remain deployed to
`wbqnctrvxohxwiaignhg`. The app receives scoped opaque sessions; existing health
tables/auth settings were not changed. Do not request deployment approval again.

Live provider transfers, real two-user Me+ acceptance, physical camera/notifications/
accessibility/large-file hardening and iOS compilation/signing remain unverified.
Automatic merge/sync, remote new-video push, server picks and WebDAV/S3 remain pending.
No main merge, store submission or paid purchase was performed. User authorization
for GitHub source/APK upload and scoped Me+ deployment is explicit. Root native dirs
are generated; read AGENTS.md and matching SDK58 docs before API changes. Do not
spawn agents unless explicitly instructed.

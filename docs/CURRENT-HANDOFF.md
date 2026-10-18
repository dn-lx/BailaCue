# Current handoff · BailaCue0.2.3 (build5)

Source: `feat/bailacue-mobile-foundation`, draft PR#1. App source tag
`v0.2.3-preview.5` points to3cf916c1c811ecd238f5920b236cc718559adfec. Later commits
improve the native acceptance harness, publication gates and documentation only.

## Delivered

Original icon/brand/badges/themes; personal Drive/Dropbox account/folder configuration,
refresh/reconciliation, labels/ratings/notes/collections, authenticated streaming or
phone copies, recoverable uploads to explicit writable sources, native practice
player/loops, separate trimmed MP4s with Photos/share/upload, comparison, local
reminders/quiet hours and device lock. See README and the full BACKLOG ledger.

Owner-approved Me+ APIv2 and all3 BailaCue-only migrations are deployed to
`wbqnctrvxohxwiaignhg`. The client receives scoped opaque app sessions, not broad
Me+ JWTs. No health tables/data, existing functions or auth settings were changed.
Do not ask for deployment approval again. Real account acceptance is still pending.

## Published and verified Android

https://github.com/dn-lx/BailaCue/releases/tag/v0.2.3-preview.5
APK `BailaCue-v0.2.3-build5-preview.apk`,68,508,221 bytes.
SHA256 `7443b70330a8b6e0afdddfbab1711415b074f9c82a85df416fcf20008e42bb1f`.
Public bytes were downloaded and verified: APKv2 signature, packageapp.bailacue.mobile,
version0.2.3/code5, minimumAPI24/target36, ARM64+x86_64. Preview cert SHA1:
`5e8f16062ea3cd2c4a0d547876baa6f38cabf625`.

68 tests across7 suites, TypeScript, lint,3 browser journeys, Deno check, Expo Doctor
20/20 and web export passed. Build run39102137159 compiled the universal APK.
Native ARTEMIS run39104109693 passed all7 checks against those exact bytes:
launch, Settings/Library, real import, named1–4s section/loop control, separate native
Media3 MP4 (ffprobe3.017075s), original checksum unchanged and Save to Photos.
Recovery publication run39104394080 checked the successful report's APK hash before
uploading. Committed report/screenshots are under docs/verification/android-build5.
ARTEMIS used its real controller/helper1.2.0, not autonomous Gemini.

## Important history and limits

Native testing caught an R8-removed Room constructor (fixed by disabling preview
shrinking) and unawaited SDK58 File.copy/File.move (fixed and regression-tested).
Builds2–4 are withdrawn drafts. Native harness corrections concern picker Preview
buttons, below-fold content and keyboard input/visibility; no app assertion was
skipped. Do not recommend old builds or reuse their checksums.

Live OAuth still needs BailaCue's one-time Google/Dropbox app registrations; each
user then selects their own account/folders. No IDs/secrets were invented. Files
picker import works independently. No live cloud transfer or real two-user Me+
acceptance is claimed. iOS native source is maintained but not compiled/signed.
Remote source push, automatic merge/sync, server picks and WebDAV/S3 remain tracked
implementation scope; physical camera/notifications/accessibility/large-file codec
acceptance and release signing remain hardening work. APK is an internal preview.

No store submission, main-branch merge, paid purchase or private-video sharing was
performed. User authorization for GitHub upload and the scoped Me+ deployment is
already explicit. Native root android/ios/artifacts are generated/ignored; use the
Expo config plugin and modules, not manual generated-source edits. Read AGENTS.md
and matching SDK58 docs before changing APIs. Do not spawn agents unless instructed.

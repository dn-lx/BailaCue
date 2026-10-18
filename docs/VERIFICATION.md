# Verification · BailaCue 0.2.5 (build8)

Executed on 2026-10-18. Source and Android release tag: `v0.2.5-preview.8`.
[Previous build7 verification](VERIFICATION-0.2.4.md) is historical.

| Check | Result |
| --- | --- |
| TypeScript / ESLint | Passed locally |
| Vitest | 100 tests across ten suites passed |
| Folder routing | Mock Drive parent IDs and fresh Dropbox paths checked for separate Salsa/Bachata destinations; resume cannot change folder/account |
| Save registration | Selected source only, latest labels/ratings, collection/pick/practice/feedback references and online/phone copy choices checked |
| Editing bounds | Drag handles cannot cross or escape the video; viewport sizing bounded |
| Google native SDK | Read/write scope refresh, registration failures and account-token isolation checked with SDK mocks |
| Browser | Four Chromium journeys passed, extended for handle keyboard/drag movement, three player sizes and selected-folder failed-upload retention |
| Android / ARTEMIS | Build8 publication run pending; release is gated on native acceptance |
| Live Google OAuth / Drive / Dropbox transfers | Not verified; user reports completing Cloud registration, API activation and consent scopes |
| iOS / real two-user Me+ acceptance | Not run |

## New behavior

Local saves create a phone entry without uploading. Selecting Online storage on an
import or native clip save starts the exact chosen folder upload. Online-only cleanup
runs after confirmed transfer; failures retain the owned local video. Upload jobs
record original source, folder, account and provider. Choosing Salsa or Bachata is
explicit and independent of the video's labels/style.

The player exposes resizable video bounds, presets and start/end trim handles on the
playback line. Native trim export creates a separate MP4; cloud originals remain
unchanged. Streaming-only videos need a phone download before native export.

## Boundaries

Provider HTTP tests and the browser OAuth fixture are mocks. They do not prove live
Google/Dropbox consent, transfer quotas, token revocation or large-file durability.
The owner reports completing registration/scopes manually in Google Cloud; no real
Drive login/transfer result has been observed by this workspace. Do not infer it from
console setup. Phone camera, notifications, physical-device accessibility, iOS signing,
automatic sync and new-video server push retain the earlier verification limits.

Native evidence and exact public-byte checks will be recorded after the gated build.
No private media or credentials are used in tests or committed.

# Verification · BailaCue 0.2.0 (build 2)

Date: 2026-10-18. Linux cloud workspace, Node 24.19, npm 11.9, JDK 21.
This file records executed checks. [0.1.0 evidence](VERIFICATION-0.1.md) is retained.

| Check | Actual result |
|---|---|
| TypeScript | Passed |
| ESLint | Passed |
| Vitest | 64 passing tests across 6 suites |
| PostgreSQL | Both migrations applied in local PGlite; 27 tables with RLS; negative client grants, owner/FK isolation, atomic rate limits, stale revisions and BailaCue-only cleanup tested |
| Gateway | Mock transport tests: opaque session hashing, no broad Auth tokens returned, owner derived from session, forged-owner denial, rate limits, secret/path rejection, conflicts and sharing ownership/revocation/allowlisting |
| Providers | Mock HTTP: Drive/Dropbox paging, folders, errors, temporary URL checks, stable upload identity, completed-file reconciliation, lost Dropbox acknowledgement and strict no-overwrite commits |
| Notifications | Mock OS: schedule replacement/cancellation, duplicate prevention, denied permission and serial updates; quiet-hour rollover calculations |
| Browser | Existing import/loop/notes/persistence and theme/collection journeys passed; new Dropbox PKCE → folder → streaming → edit → refresh journey passed with mocked provider HTTP |
| Web production export | Passed with clear Metro cache |
| Deno Edge Function check | Passed |
| Android | New native dependencies compiled; first universal ARM64/x86_64 release-mode preview built successfully in 7 min. Final native rebuild succeeded (6m23s) and final JS update succeeded (32s); signature/version/ABIs verified |
| Google ARTEMIS | Installed; doctor executed. API credential absent. API35 software emulator reached ADB/package service; helper installation timed out, then Android PackageInstaller threw a null PackageManagerInternal exception during boot. No native app test pass claimed |
| Live provider OAuth/transfers | Not run; BailaCue Google/Dropbox app registrations not supplied |
| Live Me+ account API | New function/migration not deployed; separate approval required by brief |
| iOS build/signing/runtime | Not run: no macOS/Xcode/Apple signing environment |

Browser tests use synthetic H.264 fixtures. The Dropbox browser test intercepts provider
OAuth/token/metadata/media endpoints; it verifies the application's PKCE callback and
UI integration, not Dropbox's production consent service. It caught and fixed an
unbound browser fetch receiver bug in the provider adapter. No private user media was
uploaded. Unit tests do not imply real provider permissions or physical-device codecs.

The initial 23-table migration remains live on the explicitly approved shared Me+
project. The additional migration has only been exercised locally. No existing Me+
auth settings/functions/domain records were modified during this continuation.

Remaining acceptance includes native trim bounds/original checksum/Photos/camera,
large-file and low-space recovery, actual token expiry/reconnect, two real scoped API
accounts, device accessibility, physical notification delivery and iOS parity.

Final APK: `BailaCue-v0.2.0-build2-preview.apk`, 59,006,103 bytes.
SHA-256: `333d015745af10386f2d4f2d02963b8fbb0a3489dd9ae692e27293573bb2bccd`.
`apksigner` verified APK v2 signing; `aapt` verified package `app.bailacue.mobile`,
version 0.2.0/build 2, minimum API24, target36, ARM64 and x86_64. Bundled Hermes
program: 2,710,044 bytes. Internal debug certificate SHA-1:
`5e8f16062ea3cd2c4a0d547876baa6f38cabf625` (register only for this preview).

Final combined browser run: all 3 journeys passed (12.8s). An intermediate run
exposed a test reconnect race: it waited for an already-persisted account label
instead of completion of the new OAuth flow. The assertion now waits for the
selected-account folder browser before navigating away; targeted and combined reruns passed.
Expo Doctor: 20/20. GitHub Checks on 198385e passed; newer evidence commits have
separate CI status visible in the PR.

Direct release upload from the cloud session failed with GitHub HTTP 401 on
uploads.github.com despite successful repository API/git access. A tag-triggered
GitHub Actions workflow now builds/verifies/publishes the prerelease using the
repository's own GITHUB_TOKEN. Its uploaded APK is a separate CI build and may
have a different binary checksum from the local APK above; the release includes
its actual matching SHA-256 file. No credentials were copied or exposed.

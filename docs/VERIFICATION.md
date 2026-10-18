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
| Android | New native dependencies compiled; first universal ARM64/x86_64 release-mode preview built successfully in 7 min. Final updated APK build in progress |
| Google ARTEMIS | Installed; doctor executed. API credential absent. Software emulator boot/helper setup attempted; no app runtime pass claimed yet |
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

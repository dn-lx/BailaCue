# Verification · BailaCue 0.2.3 (build 5)

Executed on 2026-10-18. Cloud workspace: Linux, Node 24.19, npm 11.9, JDK21.
[Earlier 0.1.0 evidence](VERIFICATION-0.1.md) is retained.

| Check | Actual result |
|---|---|
| TypeScript / ESLint | Passed |
| Vitest | 68 passing tests across 7 suites |
| PostgreSQL | All three migrations applied in PGlite; 27 tables with RLS; negative grants, owner/FK isolation, atomic rate limits, stale revisions and BailaCue-only cleanup tested |
| Gateway transport | Mock tests cover hashed opaque sessions, no broad Auth tokens returned, forged owner denial, rate limits, path/secret rejection, revision conflicts, share ownership/revocation and literal username underscores |
| Providers | Mock HTTP covers paging, folders, access errors, temporary links, stable upload identity, completed-file reconciliation, lost Dropbox acknowledgement and strict no-overwrite commits |
| Notifications | Mock OS covers replacement/cancellation, duplicates, denied permission, serial updates and quiet-hour rollover |
| Browser | All 3 Chromium journeys passed: local import/playback/loop/notes/persistence; themes/collections; Dropbox PKCE/folder/stream/edit/refresh with mocked provider HTTP |
| Web production export | Passed with clear Metro cache |
| Deno check / Expo Doctor | Passed / 20 of 20 |
| Android compilation | Build5 is compiling with native-gated publication; earlier build4 compiled and passed startup but failed import |
| Public APK | Builds2–4 withdrawn; build5 publication/download verification pending |
| Google ARTEMIS | Actual framework installed and exercised; see [ARTEMIS evidence](ARTEMIS.md) for device-run outcomes |
| Live provider OAuth/transfers | Not run: BailaCue Google/Dropbox app registrations were not supplied |
| Live Me+ gateway | API v2 and all migrations deployed after explicit approval. Anonymous request and invalid login return 401; private table/RPC grants verified |
| iOS compile/signing/runtime | Not run: no macOS/Xcode/Apple signing environment |

## Android runtime finding

Build3's public APK was downloaded and its matching SHA-256, v2 signature,
version/code and ABIs checked. ARTEMIS then found a real AndroidX Startup / Room
WorkDatabase initialization crash before the app opened. Compilation/signing are
not runtime acceptance. Build3 was withdrawn and build2 retired. Build4 disables
release shrinking through the supported Expo config plugin.
Local build4 compiled in 4m56s; APK v2 signature, version 0.2.2/code4 and ARM64/x86_64
were verified. DEX inspection confirms the public no-argument WorkDatabase_Impl
constructor is present in build4 and absent in build3. The public CI APK was downloaded and verified separately:

`BailaCue-v0.2.2-build4-preview.apk`: **68,507,957 bytes**.
SHA-256: `b9a24d42dfe0d64f252e878bf4a55421cb314eda241bc1e603be5bbedf48822b`.
Version 0.2.2/code4, minimum API24, target36, ARM64 + x86_64, APK v2 signature.
Preview certificate SHA-1: `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`.
[Release](https://github.com/dn-lx/BailaCue/releases/tag/v0.2.2-preview.4) ·
[Build and native test run](https://github.com/dn-lx/BailaCue/actions/runs/39100084476).
Initial ARTEMIS build4 run passed native launch and Settings/Library navigation,
then stopped at test-fixture selection in DocumentsUI. Rerun 39101471275 uses the
same published APK with corrected picker-transition timing; export/Photos results
are pending.

## Scope of evidence

Browser videos are synthetic H.264 fixtures. The Dropbox browser journey intercepts
OAuth/token/metadata/media endpoints: it checks the app's PKCE callback and UI,
not Dropbox's live consent service. It caught an unbound browser fetch receiver bug.
A later reconnect assertion race was fixed by waiting for the new account's folder
browser rather than its already-persisted label. Final combined run: 3 passed (13s).
No private user videos were uploaded.

All three deployed migration filenames match remote history. The initial invalid-login
probe returned 503 because shared Me+ default privileges denied the service role access
to new BailaCue tables. Explicit BailaCue-only grants fixed this; the probe then returned
401. Tests now emulate those actual default privileges. API v2 also fixes literal
underscore username lookup by using equality on canonical lowercase usernames.

All four new private gateway tables have RLS and no anonymous/authenticated grants.
The two new RPCs are SECURITY INVOKER and service-only. Advisors report informational
[RLS-with-no-policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
notices for these intentionally service-only tables. Existing Me+ health tables,
functions, domain records and auth settings were untouched. No real account credentials
or health data were used in the live probes. Positive two-user authentication/sync is
still acceptance work.

Remaining acceptance includes real provider consent, cloud transfer interruptions,
large-file/low-space recovery, camera, real account registration/recovery, accessibility,
physical notification delivery, physical-device codecs and iOS parity. Downloaded
copies cannot be remotely revoked while offline; exported Photos/external copies
remain under the user's control. Automatic metadata merge, remote new-video push,
server-generated picks and WebDAV/S3 are not implemented.

Build4 source checks on `5c185d3991959abfd50a4b2c368195a255489c64` passed in
GitHub runs 39100087425 and 39100084472, including 65 tests, 3 browser journeys,
Deno check, web export and Expo Doctor. The release workflow has been revised for
future tags to gate publication on successful ARTEMIS native acceptance. Recovery
also requires a passed native job; already-published assets are preserved.

Native build4 fixture selection ultimately exposed a real SDK58 importer race:
File.copy was not awaited before native inspection. Cloud download File.move had
the same issue. Build5 awaits both and cleans failed partial copies. Three new
mocked/deferred-I/O regression tests verify inspection waits for completed files,
picker-cache lifetime and failed-copy cleanup. All68 tests, TypeScript and lint pass.
Build5 source3cf916c and native-gated workflow run39102137159 are in progress.
The old build4 checksum above is historical, not a recommended download.

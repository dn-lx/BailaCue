# Verification · BailaCue 0.1.0 (build 1)

Environment: managed Linux cloud workspace, Node 24.19.0, npm 11.9.0.
Date: 2026-10-18. This records executed checks, not planned acceptance.

| Check                                  | Actual result                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| TypeScript `npm run typecheck`         | Passed                                                                                                       |
| ESLint `npm run lint`                  | Passed without errors or warnings                                                                            |
| `npm test`                             | 32 passed across 3 suites                                                                                    |
| `npm run build:web`                    | Passed, Metro production bundle in `dist/`                                                                   |
| Playwright Chromium / Pixel 7 viewport | 2 journeys passed                                                                                            |
| `NODE_USE_ENV_PROXY=1 npx expo-doctor` | 20/20 checks passed                                                                                          |
| `npx expo install --check`             | Dependencies up to date                                                                                      |
| Expo native autolinking                | BailaMedia Android module resolved                                                                           |
| Shared Me+ migration                   | Applied after explicit owner authorisation                                                                   |
| Live BailaCue catalog                  | 23 tables, 23 RLS flags, 23 owner policies, 42 validated FKs, 3 time-validation triggers, 0 anonymous grants |
| Supabase security advisor              | No findings for BailaCue objects                                                                             |
| Supabase performance advisor           | New unused indexes are informational; no BailaCue unindexed FK finding                                       |
| Android release-mode preview APK       | Build in progress; update before handoff                                                                     |
| Physical Android / emulator runtime    | Not run; no attached device or KVM                                                                           |
| iOS build / device / signing           | Not run; no macOS/Xcode/Apple credentials                                                                    |
| Live Auth, Drive, uploads, push        | Not connected or tested                                                                                      |

The first Android build installed SDK 37 / build tools 37 and NDK 27.1, then
failed because the preinstalled Java runtime lacked `JAVA_COMPILER`. A full
JDK 21 is being provisioned to retry; this is not a successful APK claim.
The initial network-dependent Expo Doctor run failed before Node was configured
to use the session proxy; its later complete run passed all 20 checks.

The browser journey uses a generated six-second H.264/AAC test pattern, not any
private user video: import, title/labels, named 1–4 second section, A–B playback
including a real loop wrap, note/bookmark, Daily Pick, reload with IndexedDB
video playback, deletion confirmation/cancellation, local deletion and preserved
source fixture. A separate journey changes theme and creates a collection.
The web exporter displays the supported-platform message; it does not pretend
to create a trimmed video in the browser. Mobile exports still need real device
codec, bounds, Photos/share, cancellation and original-checksum verification.

Local PostgreSQL tests apply the actual migration in PGlite, define two synthetic
auth identities, and exercise owner reads, foreign-owner denial, ownership-change
denial, owner FK checks, server section bounds, provider-ID uniqueness, all-table
RLS and anonymous denial. These are real PostgreSQL policy tests, not SQL string
assertions. They are not Supabase login tests or real two-account API tests.

Existing Me+ advisor notices were present before the migration and remain
unchanged: private/service tables with RLS and no policies, signed-in callable
Me+ security-definer functions, and the existing Auth password-protection setting.
No Me+ settings or functions were modified. Review these existing policies and
use a scoped BailaCue backend session before enabling accounts in the mobile app,
so broad Me+ Auth credentials are not handed to this app by accident.
[Advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
[Password-security guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
[Unused-index guidance](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

Screenshots from the executed browser run are in `docs/brand/app-*.png`.
They verify the rendered preview, not an Android/iOS screenshot. See the
[complete backlog](BACKLOG.md) for device and connected-product acceptance.

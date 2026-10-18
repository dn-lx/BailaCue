# Verification · BailaCue 0.2.6 (build9)

Executed on 2026-10-18. New source/release tag `v0.2.6-preview.9`.
[Previous build8 verification](VERIFICATION-0.2.5.md) remains historical evidence.

| Check                                                                     | Result                                                                                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript / ESLint                                                       | Passed locally after final icon packaging                                                                                                             |
| Unit/database tests                                                       | 110 tests /11 suites passed                                                                                                                           |
| Browser                                                                   | Five Chromium journeys passed after final icon packaging                                                                                              |
| New daily mix                                                             | Rating-first ranking, independent Salsa/Bachata cooldowns, minimum rating, missing styles, explicit update, migration and stable-day behavior covered |
| Audit                                                                     | Source/UX review and synthetic failure reproductions completed; no production writes                                                                  |
| Dependencies                                                              | Actual npm audit:29 affected entries,20 high/9 moderate, three root advisories; tooling exposure needs triage; no exploits attempted                  |
| Android/ARTEMIS/public APK                                                | Build9 pending; publication gated on device acceptance                                                                                                |
| Live providers / two-user account acceptance / physical-device gaps / iOS | Still unverified                                                                                                                                      |

The new icon uses an image-generated opaque master and platform-sized assets. Its
symbol is centered within Android's adaptive-icon safe area. The package/signing
identity, saved data keys, OAuth callbacks and production endpoints remain unchanged.

The [audit](audits/2026-10-18.html) separates reproduced behavior from source-review
risks and unverified device outcomes. Current releases' ten passing native checks do
not verify the newly changed app; build9 requires its own successful acceptance.

Native/public-byte evidence will be added after publication. Audit recommendations
other than the requested Daily Picks/icon change remain open; no silent production
or broad functional changes were made.

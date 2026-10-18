# Current handoff · BailaCue 0.2.9 (build14)

Owner corrected the filename requirement: every source video must have a number-only
name, with no original title. The library displays `0001`; source files and owned
phone copies use `0001.mp4` (retaining the actual media extension). Each source has
its own incremental sequence. Existing numbers are retained and descriptive suffixes
removed on refresh. Stored titles normalize offline; source titles are read-only.
Legacy saved upload sessions retain their paths and numbers; final confirmed files
are renamed by stable ID. Both legacy and numeric staging names remain recognizable.
Unverified numeric filenames cannot claim upload reservations. Finalization rechecks
the confirmed ID and repairs legacy conflicts durably; saved Dropbox IDs allow retry
after renaming without reuploading. Intended numeric filenames are used for phone
downloads even if the provider rename needs retry. No production database changes. Source pushes and Android prereleases remain authorized.

Local140 tests/16 suites, type/lint and six browser journeys passed. Published v0.2.9-preview.14. Build/native/publication run39172854949 passed; all12 ARTEMIS checks passed with helper1.2.0. The public APK matches the tested artifact:70,231,089bytes, SHA25618ade8ba0e623e9f8f871cecb2d39e9e9edee8f7634add7433d9b828389aa7bf. Public APKv2 signature/version and unchanged signer verified. Evidence is in verification/android-build14/. Build13/run39171131452 was also cancelled before publication for reservation collision and post-rename retry corrections. Build12/run39170414260 was cancelled before publication to fix outside numeric filenames skipping the sequence.
App source f3885fa595b7802ad094de9e7cd70482b28e7831; tagv0.2.9-preview.14.
Build run39172854949; source checks39172852220 passed.
See SOURCE-NUMBERING.md, VERIFICATION.md and releases/v0.2.9-preview.14.md.

Historical build11 handoff follows.

---

# Current handoff · BailaCue 0.2.8 (build11)

Owner requested upload Blob fix, preview before classification/destination,
sequential numbering in actual Drive/Dropbox files and app-owned phone copies,
external additions discovery, unrated=5★, one Daily Pick per Salsa/Bachata source,
and alignment fixes across screens. Changes implemented and published as v0.2.8-preview.11 from app source
`11c796165917e7b376a3591784cd2bdd0d04a4cb`. Android build run39164214724 succeeded; its initial native job passed11 checks then failed due a substring locator opening the title keyboard. Harness commit a41f549 uses exact style/star matches. Standalone acceptance run39166069113 passed all12 checks against the same APK. Recovery publication run39166585417 verified the native report hash before publishing. Public APK checksum/signature/version and byte equality were independently verified. SHA256 `b3db5adec0b0590bd87a79387c2e2b8bec21c8540294ec8837ed4f9826b5f2ba`,70,229,381bytes.
Build10/tagv0.2.7-preview.10/run39163469949 was intentionally cancelled before publication; no release asset exists for it. Build11 fixes numbered Dropbox destination collisions by retaining unique staging paths and protecting pending paths during discovery.
Name remains BailaCue. Source pushes and APK prereleases remain authorized, no merge,
store submission, paid actions, TinyFish or unrelated Me+ production changes.

See SOURCE-NUMBERING.md and DAILY-PICKS.md for exact policies. Numbering retains
original descriptive filenames, reserves durably, uses stable IDs, and reports
rename failures without overwriting content. Foreground discovery on open/resume
and every five minutes; manual Refresh always scans. No closed-app discovery or
central multi-device sequence lock. Old build9 upload sessions retain destination
and identity on resume. Legacy automatically assigned cloud3★ is treated unrated;
explicit new ratings have a separate marker. Upload saves wait for durable metadata
before phone cleanup. Numbered phone copies are staged before reference changes.

Local validation:130 tests /16 suites, six browser journeys, type/lint and web export.
114.5MiB transfer regression uses mocked HTTP/native handles and rejects Blob buffers;
real provider transfers/renames are not claimed. Layout checks include long labels
across seven screens at320/360/412px. Native harness adds import-preview playback;
ARTEMIS build11 passed all12 checks; public-byte verification passed. See VERIFICATION.md and verification/android-build11/.

Historical build9 handoff follows; its source/test details are historical only.

---

# Current handoff · BailaCue 0.2.6 (build9)

Source `feat/bailacue-mobile-foundation`, draft PR#1. New release tag
`v0.2.6-preview.9` is published from source commit
`30a389b7f9e6d8db999b3aeaf0658473193003ec`. Release run39120175502 passed all11
native checks. Public APK SHA256
`1bbd27d402e047f1dfa0f677d239e17ae221837b4274a387ed7bb04792d78c66`
(70,197,869 bytes) equals the built artifact and native report. APKv2 signature
and version verified; signing identity remains the same as build8.
See VERIFICATION.md and verification/android-build9/.

## Latest owner requests

The owner chose to **keep BailaCue**, requested a more modern dance app icon and
rating-led daily viewing with one Salsa and one Bachata. New source implements
one per selected style, strict minimum stars, independent cooldown fallback,
rating-first tie policy, saved-day stability, explicit Update today’s picks and
migration of older daily choices. See DAILY-PICKS.md. Ratings now have clearer labels.

The icon is a modern abstract dancing-partner mark in coral/cream on plum.
It updates launcher/adaptive/splash/favicon/in-app mark. The opaque selected master
is assets/brand/dance-icon-source.png; scripts/brand.mjs packages sizes without
redrawing it. Name, IDs, data,
OAuth and backend are unchanged. No native dependency changes or generated-root edits.

110 unit/database tests, five browser journeys, type/lint and web export passed
after final asset integration. Android build9 passed ARTEMIS and published. The harness also imports rated Salsa
and Bachata videos through UI and verifies both daily picks. Its root-bootstrap script
handles adbd transport restarts with bounded checks rather than rebuilding the app.

## Audit scope

Source/UX audit in docs/audits/2026-10-18.html and .json. Highest open items: cloud
restore drops local-only references; cleanup errors can prevent logout; online-only
cleanup can precede durable metadata commit. First two behaviors were reproduced
using real functions with synthetic metadata/injected errors, with no production or
private media access. No broad fixes were authorized or silently implemented.
Other findings cover snapshot validation, auth-expiry/cache behavior, scaling,
thumbnails, onboarding, player density, labels, accessibility, timer recovery,
app-switcher privacy, shared-identity reset revocation, lock/picker draft preservation
and dependency triage. Actual npm audit reported29 affected
entries rooted in three advisories, mostly propagated tooling; no exploit was run.
Do not apply force downgrades that break Expo58 compatibility.

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

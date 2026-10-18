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

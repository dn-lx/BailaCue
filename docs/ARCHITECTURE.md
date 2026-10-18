# BailaCue architecture · 0.1.0

Shared Android/iOS UI: Expo SDK 58, React Native 0.88, TypeScript, Expo Router.
The browser target is a development preview with a real IndexedDB video library;
it is not the target for native video export.

## First vertical slice

`src/app` routes → reusable UI and theme → `LibraryProvider` → domain functions.
Only source metadata and explicit user edits reach the local store. Video files
are copied into app-private document storage on mobile. Browser previews store
video Blobs in IndexedDB and metadata in browser storage. Local changes serialize
through one write queue to avoid out-of-order persistence. Storage failure is
visible; corrupted metadata is not silently overwritten. This is single-device
storage, not authenticated multi-user storage or metadata sync.

Expo Video handles playback. Saved practice sections are nondestructive metadata.
`modules/baila-media` is an autolinked local Expo module. Android uses Media3
Transformer 1.9.1 (matching Expo Video's Media3 version); iOS uses AVFoundation.
The module validates real asset duration and app-private file paths, uses unique
MP4 filenames, and deletes partial exports on failure/cancellation. Exports are
foreground work. They do not modify originals. Playback speed, count and mirror
are practice overlays; they are NOT baked into trimmed exports. Trim output may
be transcoded; supported codecs, speed, precision and HDR handling depend on the
device. Unsupported files surface an actionable error.

## Me+ integration findings

Read-only inspection on 2026-10-18 found `dn-lx/me-plus`, whose mobile client
uses `@supabase/supabase-js` and Supabase Auth. The connected Me+ project was
verified by name/ref and schema catalog only. No private table rows, credentials,
or health records were read. It contains `auth.users` and a populated application
schema; no isolated development branch exists. After the owner explicitly confirmed the shared production project as the target,
the additive BailaCue migration was applied on 2026-10-18. Existing Me+ tables and
authentication settings were not changed; no application data rows were written.

Reuse `auth.users` for identity. Add only `public.bailacue_*` tables. The migration
has no dependency on Me+ health/profile/domain tables. Every owner relationship
uses composite foreign keys. All 23 exposed tables have RLS and explicit grants.
Sharing is deliberately owner-only until a provider-aware server endpoint can
verify both the collection grant and underlying file access. RLS is tested using
real PostgreSQL in PGlite with simulated authenticated/anonymous roles. That
checks the migration, not the deployed Supabase instance or Auth service.

Live catalog verification found 23/23 tables with owner RLS, 42 validated foreign
keys, three validation triggers and no anonymous grants. Security advisors found
no BailaCue findings; new unused indexes are informational. Before connecting
accounts, perform real two-account isolation tests and verify Me+ existing
authentication and row policies are compatible. Adding BailaCue RLS cannot revoke
any pre-existing Me+ grants: review the shared project's existing policies before
releasing a BailaCue client authenticated against it. Never weaken Me+ auth.

The planned username flow needs a rate-limited trusted endpoint that resolves a
BailaCue username server-side and delegates password verification to Supabase
Auth. No client-readable email/credential lookup and no password hashes in app
profile tables. Reuse the existing Supabase password/recovery policy, SecureStore
sessions, refresh/revocation, password change and account cleanup. Username
registration/login and recovery are not wired into this version.

## Storage sources and jobs

`VideoProvider` separates provider file discovery, folder capabilities and playback.
The Google Drive adapter implements folder inspection, paginated discovery,
file-ID deduplication and authenticated media URLs. It is unit-tested with mock
HTTP, not connected to a user's account. No other provider is implemented.
A resumable-upload transport probes server progress, persists acknowledgements,
retains a preallocated file ID across retries, supports AbortSignal cancellation,
and rejects unexpected session origins/results. Upload initiation, secure job
persistence, token refresh, UI wiring and remote completion reconciliation remain
milestone 2 work. Do not describe this transport as a working Drive uploader.

Each configured source has a distinct folder ID, connection, friendly name,
permissions, default dance style and labels. Several sources may share an account,
and the same file may appear in several sources with one video identity. Provider
metadata seeds filename/duration; source defaults seed editable labels. Ratings
are user-entered 1–5 importance. No automatic semantic video analysis or inferred
ratings are claimed. Dropbox/WebDAV/S3 are future adapters, not integrations.

For existing arbitrary Drive folder discovery, `drive.file` alone is insufficient.
Read access can use `https://www.googleapis.com/auth/drive.readonly`; write access
to arbitrary existing folders may require the restricted `drive` scope and Google
verification. Keep read-only discovery and write escalation separate, and validate
the final folder-picker workflow before settling scopes. Refresh tokens belong
in the backend vault or secure device storage; never in source metadata.

## Daily Picks v1

Only available videos are candidates. Score = 12 per preferred label match + 8
for preferred style + 3 × importance + 8 for To learn / 6 for Practising / −8 for
Learned + 6 if never practised + min(days since practice,30)/3 + 6 × explicit
feedback (bounded −3…3). Ties use stable video ID order. Selection applies a
3-day cooldown; if no candidates remain it allows review from the available
library. Each additional pick discounts repeated style by 5 and repeated label
by 4. Empty libraries yield no pick. The first imported video starts a selection.
Picks persist for the local calendar day and survive preference edits. Loss of
access permits replacement. Skip is a schedule flag, not dislike feedback.
Current selections are device-local; backend daily uniqueness is prepared but
cross-device stable selection is not implemented. Notifications, weekdays,
frequency, teacher/level preferences and explicit reroll remain in the backlog.

## Documentation sources checked

- https://docs.expo.dev/versions/v58.0.0/sdk/video/
- https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/
- https://docs.expo.dev/modules/get-started/
- https://docs.expo.dev/modules/native-module-tutorial/
- https://docs.expo.dev/router/introduction/
- https://developer.android.com/media/implement/editing-app
- https://developer.android.com/media/media3/transformer/transformations
- https://developer.apple.com/documentation/avfoundation/avassetexportsession
- https://supabase.com/changelog.md
- https://supabase.com/docs/guides/auth/quickstarts/react-native

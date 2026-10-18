# BailaCue

**Watch. Practise. Repeat.** A private Salsa and Bachata video library for Android
and iOS, built with React Native, TypeScript and Expo development builds.

![BailaCue identity](docs/brand/identity.png)

## What this version does

The first working vertical slice is local-first: import your own video, name and
label it, set importance and learning status, play it with speed/mirror controls,
save and loop practice sections, add timestamped notes/bookmarks, arrange
collections, get deterministic Daily Picks, and track practice sessions/goals.

The native Media3/AVFoundation module creates a **separate trimmed MP4**, with
Save to Photos and Share / Save file actions. It does not overwrite your original.
Native build/runtime verification is recorded separately in
[VERIFICATION.md](docs/VERIFICATION.md); do not equate source code with device tests.
Exports are trims only: playback speed/mirror/count overlays are not rendered
into the new file. Stay in the foreground during export. Camera recording is
implemented through the system camera flow and still needs device validation.

This is not the completed connected product. Me+ login, live Drive/Dropbox
connections, remote uploads, cross-device sync, offline provider downloads,
notifications, comparison, biometric lock and sharing are tracked in the
[complete backlog](docs/BACKLOG.md). The Google Drive adapter and resumable-upload
transport have mock HTTP tests; they are not wired to live OAuth or app uploads.
No private video is uploaded by this build.

## Run it

Requirements: Node 24, npm, Java 21 for Android, Android SDK/NDK for local builds;
macOS/Xcode for local iOS builds. Install dependencies with the committed lockfile.

```sh
npm ci
npm run start               # development build, not Expo Go
npm run android             # native Android development build on a connected device
npm run ios                 # macOS/Xcode only
npm run web                 # browser development preview
```

A custom development build is required because `modules/baila-media` contains
native code. Expo Go cannot perform the native metadata/import/export flow.
The local first slice requires no account, OAuth app or environment variables.
The browser preview stores real imported videos in IndexedDB; it supports local
playback/organisation but cannot run the native trim exporter or camera flow.

```sh
npm run typecheck
npm run lint
npm test                    # domain, provider transport and PostgreSQL RLS tests
npm run build:web
npx playwright install --with-deps chromium
npm run test:e2e             # requires ffmpeg on PATH; generates a synthetic fixture
node scripts/serve-preview.mjs  # local built preview on 127.0.0.1:4173
```

## Android APK

```sh
export ANDROID_HOME=/path/to/android-sdk
npm run build:android
```

The script runs Expo prebuild, assembles a release-mode APK with bundled
JavaScript, and copies it to
`artifacts/BailaCue-v0.1.0-build1-preview.apk` with a SHA-256 file. By default it
builds `arm64-v8a` for modern phones. Set `BAILACUE_ARCHS=x86_64` for an emulator
or `BAILACUE_ARCHS=arm64-v8a,x86_64` for both. The generated `android/` directory
is ignored; native source lives under `modules/` and is committed.

**Internal preview signing:** Expo's generated Android template uses a debug
certificate for the release variant until release signing is configured. This
is an installable test build, not a Play Store release. Never commit a signing
keystore. For EAS builds, associate your own Expo project and run:

```sh
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile development
```

EAS needs your account and may have usage costs; it was not invoked for a paid
build. GitHub Actions includes checks and a manually triggered Android preview
workflow. No workflow submits to an app store or deploys production.

## iOS signing

Local builds require macOS/Xcode and an available signing team for physical
devices. EAS cloud device builds require your Apple Developer account and
provisioning credentials. A simulator build needs a macOS runner. This Linux
workspace cannot compile or sign iOS. Keep certificates/profiles in the build
service's credential storage, never Git. Store release is a separate action.

## Me+ and backend setup

The connected Me+ project's catalog and the Me+ mobile Supabase client were
inspected read-only. The plan reuses Supabase Auth's `auth.users`; it does not
reuse health/domain tables or store passwords in BailaCue tables. The additive
[migration](supabase/migrations/20261018032846_bailacue_isolated_metadata.sql)
creates only `bailacue_*` tables with owner RLS and composite owner foreign keys.
It was tested locally and then **applied to the shared Me+ project on 2026-10-18**
after the owner explicitly confirmed that target. Live checks found 23/23 RLS
policies, 42 validated foreign keys, three time-validation triggers and zero
anonymous grants. Account sync is still not connected to the mobile UI.

Before enabling account sync, verify two-account API isolation and review
existing Me+ policies. The BailaCue migration has been applied and advisors checked. Then wire username/password endpoints to Supabase Auth, recovery,
secure device sessions and metadata revision/conflict sync. Do not point an
unreviewed development app at production. Shared Auth also requires a review of
pre-existing Me+ grants; BailaCue's policies do not change those grants.

```sh
npx supabase --help
npx supabase start           # optional local Supabase stack; requires Docker
npx supabase db reset        # LOCAL stack only; rebuilds its local database
```

The normal test suite uses PGlite PostgreSQL to exercise the migration/RLS
without Docker. It stubs `auth.users` and `auth.uid()` for isolation tests; it
does not claim to test Supabase Auth or a deployed project.

[.env.example](.env.example) lists names reserved for the next milestone:
`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`,
`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_DROPBOX_APP_KEY`.
These are not consumed by v0.1.0. Never put service/admin keys, provider refresh
tokens or client secrets in `EXPO_PUBLIC_*` or source control.

## Storage provider setup (next connected milestone)

Users will configure named folders inside the app. Several folders can share
one provider account. Source defaults seed editable labels/style; provider IDs
avoid duplicate imports. Ratings are the user's importance choices, not guessed
from video content. Reauthentication must preserve user metadata.

Drive OAuth needs platform-specific native client IDs and a browser/server
callback configured for the actual flow. Reserve `bailacue://oauth/google` for
the app deep link and `<API_URL>/oauth/google/callback` for a confidential-server
flow; register exact callbacks only after the OAuth implementation is selected.
The scheme is configured, but these callback handlers are not implemented yet.
Use PKCE and state validation. Existing arbitrary folders cannot be listed with
`drive.file` alone; readonly discovery and write escalation need a scope review.
Google's restricted full-Drive scope may require verification. Client secrets
and refresh tokens remain server-side/in secure credential storage. Dropbox,
WebDAV and S3 need their own adapters; naming a provider is not a connection.

## Privacy and limitations

- Local files are app-private mobile copies. Android cloud backup is disabled.
- Original gallery/provider files are never removed by local delete or trimming.
- Removing a library video removes its local file, notes, bookmarks and sections.
- Exported files saved to Photos or shared elsewhere require separate deletion.
- Local library and previews currently have no account sync or online backup.
- Uninstalling/clearing app storage removes the local library. Browsers may evict
  IndexedDB. Keep originals in your chosen storage.
- The count overlay uses manual BPM, pattern and offset; there is no beat detection.
- Notifications are not scheduled. Timer pauses on app background; no background
  upload/export guarantee is made.
- Cross-user live access, provider expiry/revocation, large-file interruption,
  native codecs/export precision and physical-device accessibility remain required
  checks before releasing the connected app.

See [architecture](docs/ARCHITECTURE.md), [brand assets](docs/brand/README.md),
[build brief](docs/BUILD-BRIEF.md) and [handoff](docs/CURRENT-HANDOFF.md).

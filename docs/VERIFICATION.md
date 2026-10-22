# Verification · BailaCue 0.3.0 / build27

Implements the [local-first requirements](LOCAL-FIRST-REQUIREMENTS.md).
User instructions: [storage/recovery guide](LOCAL-STORAGE.md).

Source gate: 189 tests in 20 suites, including actual SQLite migration/rollback,
backup integrity, label deletion, cloud JSON transfers and Sheets synchronization.
17 browser journeys pass, including existing video/player/YouTube behavior, profile
isolation and restore, failure retry, responsive layout, large text and reduced motion.
Typecheck/lint/web export pass. [Browser evidence](verification/browser-build27/checks.json).

Local Expo Doctor passes package compatibility but cannot complete two checks that
require Expo/React Native Directory network metadata. GitHub CI will repeat Doctor.

The Android release build, ARTEMIS gate, public APK byte/signature verification and
fresh iOS compile are pending in the release pipeline. No native pass is attributed
to a new APK until its exact checksum is accepted. The prior tested build26 remains
available in GitHub Releases while this gate runs.

The mobile app contains no Me+ account client or endpoint. Production Me+ data has
not been changed or deleted. Portable backups exclude device paths, video bytes,
provider/API credentials and device security settings. Existing local libraries
migrate separately; server-only snapshots require a separately authenticated export.

Sheets transport and conflict/recovery tests use controlled official-endpoint
responses. Live private Google/Dropbox OAuth, multi-phone background scheduling
and editing a real account's Sheet have not been tested. Google Sheets API must be
enabled in BailaCue's OAuth project. OS scheduling and Sheets concurrent-edit limits
are described in the app and guide. A live public YouTube attempt is supplemental,
not a substitute for deterministic regressions or a claimed passed import.

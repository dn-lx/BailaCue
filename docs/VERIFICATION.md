# Verification · BailaCue0.2.17/build22

Full approved requirements are implemented in the preview source. Acceptance must
remain separate from implementation:185 unit/database tests in18 suites, TypeScript,
ESLint, web export,10 browser journeys and Expo Doctor20/20 pass locally.

Browser evidence covers a real synthetic-file import, seek/trim handles, resize,
Mirror transform, saved sections/notes, persistence, source rename retry and exact
upload destination, custom dances, exact ratings/Unrated/numeric sorting, Daily mix,
continuous Practice/Previous/pause/restore/history and mocked official YouTube
pagination/deduplication/online-only controls. Layouts cover8 screens at320/360/412px;
large-text checks cover Library, Settings, Practice and YouTube at320px.

The Android native build and acceptance job are pending. The gate includes actual
rendered-pixel Mirror reversal/restoration, drag/trim, independent Media3 export and
unchanged original bytes, Photos save, labels, Daily Picks and Practice background
pause. Public APK identity and signature will be recorded after publication.

YouTube/Dropbox browser tests use mocked official endpoints, not live accounts.
An unsigned iOS simulator compile check is being run separately. Physical iOS signing/playback, real creator-specific YouTube/autoplay, live cloud transfers
and physical phone-call interruptions remain unverified. YouTube's full pagination
requires a device API key; its keyless visible-player list may be limited. No new
production database changes or app-store submission are included.

66 brand exports are generated from committed symbol/outlined-wordmark paths. The
manifest includes dimensions, alpha and checksums. See brand/README.md and the
implementation matrix in IMPLEMENTATION-TRACKER.md. Optional renaming stays off.

Prior brand-only preview: [build17](VERIFICATION-0.2.12.md).

Unpublished build18/tag v0.2.13-preview.18/run39429970323 was cancelled before publication to fix unselected dances entering total-count Daily Picks. Immutable tag/source retained.

Build19/tag v0.2.14-preview.19/run39431016837 was cancelled before publication for final YouTube import, full-screen contrast and revoked-copy UI corrections.

Build20/tag v0.2.15-preview.20/run39432080504 built successfully but was blocked after5 native checks: the hidden full-screen VideoView stole the inline video surface. Source21 conditionally mounts it. Evidence is in verification/android-build20-initial/. No build20 release was published.

Build21 passed13 native checks, including real pixel Mirror reversal, export/original integrity, labels and Daily Picks, but was withheld for the final Practice pause check. Build22 rejects stale session/mount events and preserves explicit pause intent. Its native release gate is pending.

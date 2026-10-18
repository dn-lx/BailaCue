# Verification · BailaCue 0.2.8 (build11)

Local checks on2026-10-18:130 unit/database tests /16 suites; six browser journeys;
TypeScript, ESLint and web export. GitHub source checks also passed in [run39164210653](https://github.com/dn-lx/BailaCue/actions/runs/39164210653), including Deno and Expo Doctor20/20. Android publication is still in progress.
Historical [build9 evidence](VERIFICATION-0.2.6.md) is retained separately.

New upload regression: synthetic114.5MiB native-adapter Drive and Dropbox transfers,
lost acknowledgement/resume, maximum2MiB reads, exact chunk boundary markers and a
Blob constructor deliberately rejecting buffers. HTTP and file handles are mocked;
this is not a live provider transfer. Source/numbering tests cover stable allocation,
external additions, provider parent checks, rename retries, complete-scan semantics,
metadata persistence and phone-copy safety. Phone copies check hash/size before reuse.

Browser journeys cover the existing practice/edit/labels flow plus playable import
preview, mocked source renames/discovery, both source Daily Picks, unrated stars and
minimum ratings. Layout checks cover seven screens at320/360/412px with long source
names/account emails and ensure buttons do not overflow the viewport.

Android build11 must pass its own Google ARTEMIS gate, including native preview
playback. Public APK checksum, signature, version and exact native-tested bytes will
be verified after publication. No previous build result is substituted for this.

Live Drive/Dropbox transfers/renames/consent, physical accessibility/notifications,
two-user Me+ acceptance and iOS compilation/signing remain unverified. No production
writes or real private media were used for this update.

App source: `11c796165917e7b376a3591784cd2bdd0d04a4cb`.
[Browser/check details](verification/browser-build11/checks.json) ·
[Import preview](verification/browser-build11/import-preview.png) ·
[Settings source cards](verification/browser-build11/layout-settings-320.png) ·
[Storage source cards](verification/browser-build11/layout-storage-320.png).
Screenshots are original Playwright bytes, using synthetic media/accounts.

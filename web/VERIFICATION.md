# BailaCue web 0.2 verification · 24 October 2026

Only the separate web app and Netlify configuration change on develop. Native mobile
source and main are preserved. Node 24 with pinned TypeScript 6.0.3. Local syntax
lint, JavaScript/domain type check, 17 tests and static build pass.

## Automated checks

Eight retained tests cover actual catalogue identities, YouTube validation, 1–10
ratings, daily picks, queues, filters, safe backups and embeds. Nine new tests cover
typed-label normalization/deletion, old-state migration, metadata/loop validation,
label/artist filters, numbering/extensions, writable folder checks, resumable upload
requests, acknowledged-byte resume and expired-session recovery without duplicates.

Upload tests exercise real request code against controlled responses. They do not
prove live consent, CORS, account permissions or streaming. Build validates actual
114 Salsa + 152 Bachata identities. Explicit build inputs exclude QA harnesses,
fixtures, documentation and node_modules. No copied original media or secrets.

## Browser checks

- Desktop Today and Library show real thumbnails and text-only branding.
- Dropdown label assignment and a created artist persist after reload. Artist
  filtering returns the one assigned video and its metadata appears on the card.
- Real local chooser selects a generated 8-second MP4. Upload preparation shows
  its original name, size and proposed numbered filename (0115.mp4 for Salsa).
- HTML5 preview genuinely plays: DOM observation showed paused=false,
  playbackRate=0.5 and mirrored=true. Seeking and A–B showed 0:00→0:05.
- Official YouTube API embed shows real title/duration and working custom seek.
  Saved a 0:00→0:05 practice loop and confirmed it in the saved loop list.
- Compact size selection, theater expansion and full-window mode were exercised.
  Full-window fills the viewport and exposes Exit full screen. Native fullscreen
  did not reliably expand in this environment; the fallback handles that case.
- 390px and 320px embedded browser layouts fit library/upload and bottom navigation.
  Measured scrollWidth=clientWidth (375/305px with scrollbars).
- Upload without Google authorization reports the requirement and sends nothing.
  Missing client configuration reports setup, never a simulated success.

No real user file was uploaded, no Drive original renamed/deleted, and no Drive
permission changed. Browser checks do not guarantee all devices, codecs, providers
or full-length uninterrupted streaming.

## Setup and deployment

Netlify has no BAILACUE_GOOGLE_CLIENT_ID. Cloud Console was unavailable in the
browser; no OAuth client was created. Live cloud upload and authorized Drive
streaming remain unverified until public client configuration and Google consent.
See GOOGLE-SETUP.md.

GitHub writes use GitHub MCP. Netlify is linked to dn-lx/bailacue, production branch
main, develop the only additional branch deployment. This update targets
https://develop--bailacue.netlify.app. Primary 0.1 content is retained. No paid service,
plan upgrade, production Me+ database change or BailaCue account system is introduced.
Metadata remains browser-local with backup/export.

## Release review

Commit c4afc544387d01c566462d2506351b8496b7ed63 passed GitHub Actions
run 40088119438. Netlify deploy 6adc8fb7543454a30a3fc6c5 is ready in
branch-deploy context, branch develop, with that exact commit. Reloaded the live
branch and visually confirmed the new Today interface with real thumbnails.

Post-deploy review caught the round play button's press animation replacing its
centering transform, moving the hit target before pointer-up. Preserving the
centering transform fixes the click; verified directly in the browser. This small
CSS correction follows the initial 0.2 release on develop. Upload destination,
recording date and notes also survived navigating to Labels and back in the same tab.

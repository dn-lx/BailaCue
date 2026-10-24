# BailaCue web

Account-free browser companion to the BailaCue mobile app. All changes are on
`develop`, based on mobile checkpoint `c80cbf2`; `main` and the mobile implementation
are unchanged. The web app reuses the approved concept05 b/play identity.

## Run and check

Node 24; no npm dependencies or provider credentials are needed.

```sh
cd web
npm run lint
npm run typecheck
npm test
npm run build
```

Serve `web/dist` with any static server. Netlify reads the root `netlify.toml` and
uses `web` as its base. Native Expo dependencies are outside this web build.
`.netlify/` must stay ignored; never commit local Netlify identity or credentials.

## Product contract · 24 October 2026

- Exactly two fixed read-only sources inside the supplied Dancing folder:
  Salsa `1lVR5Pc-6SupJOfLIhcRE-oo69FUDM5Sm` (114 videos), and
  Bachata `17CFKIazhQJTGXvlHP5sa1mqlvu9p-2i1` (152 videos).
- `catalogue.json` is a snapshot of actual Drive file metadata. No media is copied
  into GitHub or Netlify. Drive originals and folder permissions are unchanged.
  Update the catalogue and redeploy when the folder contents change; the Settings
  refresh button reloads the latest *deployed* snapshot, not a live Drive sync.
- No BailaCue accounts, OAuth, personal Me+ database access or runtime credentials.
- Add validated HTTPS YouTube videos and playlists, assign Salsa/Bachata and a title,
  deduplicate sources, play in a privacy-enhanced YouTube embed, remove additions.
  Playlists are one source and one rating; there is no hidden keyless enumeration.
- 1–10 and Unrated, favourites, personal titles/notes, learning status and explicit
  practice history; everything saved locally to `bailacue:web:v1`.
- Daily Picks: one per dance from Drive, highest ratings first; unrated has starting
  weight 10. Stable local-day choices with explicit refresh excluding previous pair.
- Practice: add/remove cues or make a 10-video balanced rating-weighted mix. Advance
  with Previous/Next. Timer is user-controlled, pauses on hidden tab; recording a
  practice is explicit, not inferred from an inaccessible cross-origin iframe.
- Export/import validated JSON backups. Import merges and deduplicates; imported
  metadata wins for matching IDs. Browser data does not sync between visitors.
- Search, dance/source/exact-rating filters, numeric/title/rating/recent sorting,
  paging, light/dark appearance, mobile navigation, keyboard-operable native dialogs.

## Player boundaries

Use each provider's original embedded playback UI for speed/seek/full screen.
Cross-origin Drive controls are not artificially emulated. If Drive processing,
permissions, quota or YouTube embedding restrictions block a preview, Open original
is available. No automatic playback or native trimming/export is claimed.

## Deployment

Requested Netlify site: `bailacue`, ID `0aeef340-5366-454e-b379-14bfee4c1784`.
The exact name was reserved and visitor SSO/password protection was removed as
requested for account-free use. Connect `dn-lx/bailacue`, deploy only `develop`, enable
branch deploys for `develop`; preserve `main`. Primary URL requested by owner:
`https://bailacue.netlify.app`, with branch alias `https://develop--bailacue.netlify.app`.
Treat both as pending until Netlify reports a ready deploy. If Netlify requires a
production branch for the primary alias, use `develop`; that does not merge `main`.

The Me+ spec router has no registered BailaCue canonical spec and there was no
BailaCue interaction checkpoint in `interaction_sessions`. Current mobile handoff,
repository requirements and the owner's newer web request determine this scope.
Historical Supabase BailaCue tables were read only for schema discovery and are
retired from the mobile runtime; this web app never queries or modifies them.

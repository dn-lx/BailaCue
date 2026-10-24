# Playback copies · Cloudflare Stream

BailaCue 0.3 keeps the two fixed Drive folders as the sources and uses Cloudflare
Stream copies for its own HTML5 player. Viewers need no Google or BailaCue account
for ready copies. YouTube keeps its official player. Labels, ratings and notes stay
on the original `drive:<fileId>` identity and remain browser-local with backup.

## What is implemented

- Owner-only sync reads the Salsa/Bachata folders with Google read access. Originals
  are never renamed, modified, deleted or sent with Google credentials to Cloudflare.
- Drive byte ranges are transferred to one Cloudflare tus identity in 8 MiB chunks.
  The private resume checkpoint is kept in Stream metadata. Retries check the
  acknowledged offset, including when a completed response was lost.
- Exact Drive ID/version matching prevents a repeat run from creating another copy.
  Changed originals create a new version. Old copies are retained for owner review,
  so they still count toward storage; there is no automatic deletion.
- New copies require a known source duration and fit within the configured BailaCue
  storage cap. Duration not available, orphaned partial copies and a 1,000-record
  partition limit stop the affected work instead of guessing or duplicating it.
- A read-only Netlify function publishes only the approved two-folder metadata and
  unsigned ready playback URLs. Tokens, upload URLs and raw errors never enter it.
  Its small response is cached on Netlify for 60 seconds. Video bytes go directly
  from Cloudflare to the browser, not through Netlify Functions.
- Pinned hls.js 1.7.3 supplies adaptive playback and quality selection where supported;
  native HLS is the fallback. Playback retains seek, 0.25–2× speed, mirror, A–B loops,
  size, theater and fullscreen. Video segments start on Play, limiting preload usage.
- Processing/unavailable copies keep a clearly labelled Drive-preview fallback.
  The Settings page reports setup/readiness and can check the playback index again.

## Current status

No Cloudflare credentials or owner Google sync credentials were present in Netlify.
Cloudflare dashboard opens at its sign-in screen. No Stream subscription, Worker,
paid upload or source transfer has been activated by this implementation.
The live library therefore still uses Drive preview until account setup and sync.

The catalogue has 266 originals totaling 47,987,658,007 bytes (~48 GB). The snapshot
has no video durations, so it cannot determine the exact Stream storage purchase.
Run the live read-only plan after Google configuration to measure minutes first.

## Owner activation

1. Sign into the intended Cloudflare account and enable Stream after reviewing its
   actual billing screen. Store the account ID. Use scoped API tokens, never the
   Global API Key. The website only needs **Stream Read**; the sync runner needs
   **Stream Write**. Configure tokens in their hosting secret stores, not in chat,
   frontend code, public configuration, Git or workflow logs.
2. Configure Google Drive API read access for the sync owner. Either use a service
   account with reader access to these two source folders, or owner OAuth with a
   Drive read-only refresh token. Check the consent and intended account carefully.
   This server-side sync authorization is separate from the optional browser client
   used to upload originals from BailaCue.
3. In Netlify, set these variables with **Functions** scope and redeploy develop:
   - `CLOUDFLARE_ACCOUNT_ID` (account identifier)
   - `CLOUDFLARE_STREAM_READ_TOKEN` (secret, Stream Read only)
4. Configure the sync runner below. Run **plan** first, choose a storage limit based
   on measured duration, then enable `STREAM_SYNC_ENABLED=true`. Start with one small
   file and confirm its encoding and real playback before bulk backfill.
5. Open BailaCue Settings → Check playback copies after encoding. Ready copies use
   the native player. Native source IDs mean existing ratings/labels remain attached.

### Sync credentials and budgets

Set the following on the owner runner (Cloudflare Worker secrets or GitHub Actions
`bailacue-stream` environment). Nothing here belongs in the frontend:

| Variable | Purpose |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `CLOUDFLARE_STREAM_API_TOKEN` | Secret scoped to Stream Write on that account |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Reader service account JSON, if that method is used |
| `GOOGLE_OAUTH_CLIENT_ID` | Owner OAuth alternative |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Owner OAuth alternative secret |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Owner OAuth alternative secret |
| `STREAM_SYNC_ENABLED` | Must be exactly `true` before apply can create a copy |
| `STREAM_MAX_STORED_MINUTES` | BailaCue copies' combined duration cap, default 1,000 |
| `STREAM_MAX_NEW_PER_RUN` | New identities per run, default 1; partial copies resume |
| `STREAM_MAX_BYTES_PER_RUN` | Optional CLI transfer cap; CLI default 2 GiB |

Provide either service-account credentials or all three owner OAuth values. Google
access tokens are obtained in memory and sent only to Google's API. Cloudflare
receives the selected video bytes and source metadata, never the Google token.

### Automatic sync on develop

`worker/wrangler.jsonc` defines an owner-managed Cloudflare Worker, independent of
Netlify's production branch. It checks every ten minutes in UTC. It ships with sync
**disabled**. Once enabled, each run transfers at most 80 MiB and starts at most one
new copy by default; interrupted large files continue on the next run. This is for
incremental additions. The first 48 GB backfill should use the bounded CLI runner.

Deploy the Worker using the current official Cloudflare Wrangler tooling after
reviewing the account and billing. Set the account ID and credentials as Worker
configuration/secrets; the JSONC intentionally contains no account or token. Leave
sync disabled while configuring and checking the read-only plan. Worker deployment
requires its own account access; a Stream-only token does not grant Worker editing.

Use one sync runner at a time. Pause the Worker before running CLI/backfill, then
resume it afterwards. Version matching provides retry safety within one runner;
parallel independent runners do not share a transactional lock.

### Manual/backfill runner

From `web`, with credentials supplied through the runner's environment:

```sh
npm run stream:plan
npm run stream:sync
```

The manual GitHub workflow **BailaCue playback copies** supports plan/apply on
`develop` and serializes its runs. It does not commit to GitHub or change main.
It needs no npm dependencies. A run is bounded to 12 minutes and uses the same
storage/new-copy cap. For a bulk import, increase the chosen caps deliberately and
repeat bounded runs; the default one-copy cap is meant for initial verification.

Offline inspection without credentials or network:

```sh
npm run stream:plan -- --snapshot
```

Do not add a cron to develop and assume GitHub will run it: Actions schedules run
from a repository's default branch. Netlify scheduled functions also do not fire on
branch deploys. The separate Worker is the automatic develop-compatible scheduler.

## Cost review

Cloudflare's documented Stream pricing at implementation time is $5 per month per 1,000
stored minutes (purchased capacity) and $1 per 1,000 delivered minutes. Billing is
based on duration, not the 48 GB source size. The chosen storage cap is not a hard
monthly spend limit: playback/delivery is usage-based and Worker charges or taxes
may apply to the selected account. Check the account's current checkout and billing
controls before activation. Allowed playback origins are restricted to the two
BailaCue Netlify domains, which limits embedding but is not a guaranteed spend cap.

## References and verification boundary

- https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/
- https://developers.cloudflare.com/api/resources/stream/methods/edit/
- https://developers.cloudflare.com/stream/viewing-videos/using-own-player/web/
- https://developers.cloudflare.com/stream/pricing/
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://developers.google.com/workspace/drive/api/guides/manage-downloads

Protocol tests use controlled responses and do not prove live permissions or billing.
An official public Cloudflare sample was actually played in the new HTML5 player:
zero player iframes, native/MSE HLS, 0.5× speed, mirror, 720p selection and A–B looping.
The sample is internal QA only and never becomes a BailaCue source. Actual copying
of this owner's Drive files and Worker scheduling remain activation-dependent.

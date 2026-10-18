# Personal video storage · 0.2.0

Each user signs in to their own Google Drive or Dropbox account and chooses folders
inside the app. No developer video repository or shared provider password is used.
The **app** still needs a one-time OAuth registration with each provider. Connecting
a ChatGPT Drive/Dropbox plugin does not register the mobile app with that provider.
The shipped preview has no invented client IDs; live sign-in requires this setup.
Local import through the phone's Files picker also works with installed cloud apps.

## Google Drive registration

1. Enable the Drive API in your Google Cloud project. Configure OAuth consent,
   testing users, privacy policy and scope verification as required by Google.
2. Register Android OAuth client `app.bailacue.mobile` with the exact certificate
   SHA-1 from the APK being installed. Preview and store signing certificates differ.
   `apksigner verify --print-certs artifacts/BailaCue-*.apk` prints the preview cert.
3. Optional `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` configures an appropriate web client;
   no web client secret belongs in the app. Android native sign-in uses Google Play
   services and the registered package/certificate pair.
4. For iOS set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` to the iOS client ID, then rebuild.
   app.config.ts registers its reversed URL scheme. No Firebase project is required.
5. Rebuild/reinstall, open **Settings → Manage video storage → Connect Google Drive**.
   Choose the account, browse folders or paste a folder link, set its name/style/labels,
   and connect it. Repeat for independent Salsa/Bachata folders.

Read access uses `drive.readonly` because arbitrary existing folders cannot be listed
with `drive.file` alone. **Allow uploads to my Drive** asks for `drive` access. Drive
folder/file capabilities still control actual writes and downloads. Google’s native
SDK manages credentials. A different active Google account requires an explicit
reconnect before operating on that account; metadata and associations are retained.

## Dropbox registration

1. Create a Dropbox scoped app with **Full Dropbox** access if users must select
   arbitrary existing folders. App-folder apps can see only their own app folder.
2. Enable `account_info.read`, `files.metadata.read`, `files.content.read` and
   `files.content.write`. Register `bailacue://oauth/dropbox` as a redirect URI.
   For browser testing also register the exact origin + `/oauth/dropbox` callback.
3. Set public `EXPO_PUBLIC_DROPBOX_APP_KEY` before building, or enter the public app
   key in **Storage → App connection setup**. Never enter a client secret or password.
4. Each user presses Connect Dropbox and authorises their own account in the provider
   browser. The public-client flow uses PKCE, state validation and offline tokens.

Native refresh tokens and upload sessions use Expo SecureStore. Browser previews
keep credentials in memory and require reconnect after reload. Access tokens, media
URLs, headers and local paths are never stored in metadata sync. Dropbox media links
are requested fresh instead of retaining expiring links in library data.

## Files, labels and ratings

A source scans video files directly inside its folder, paging until complete.
Subfolders are independent sources; choose a nested Dropbox path explicitly.
Stable IDs combine provider/account/file identity, so refreshes and reconnects do not
replace users' notes, edited titles, labels or ratings. One file in several folders
has one library identity. Labels initially use source defaults; importance initially
uses 3 stars. This is not AI video-content analysis or automatic quality scoring.

Refresh manually using **Refresh videos**. A failed scan does not mark files deleted.
A complete scan removes missing memberships; the metadata stays available for recovery.
Moving a file outside all selected folders makes it unavailable until its new folder
is connected. Provider permission changes are checked when opening online videos.

## Online versus phone copy

Videos start online. Open a video and choose **Download to phone**, **Stream online**,
**Use phone copy**, or **Remove phone download**. Wi-Fi-only downloads are enabled by
default. Progress, cancellation, size validation, storage checks, partial-file cleanup
and native media validation precede registering a phone copy. An interrupted download
can be restarted; download progress does not currently survive process termination.

Copies are in app-private storage. Android backups are disabled; iOS owned media is
excluded from backup and protected by the native media module. Provider restrictions
are respected. Access is checked online; denied/missing access removes BailaCue's
phone copy. Downloaded files cannot be remotely revoked while the device is offline.
Photos/shared external copies are outside that cleanup. Save to Photos is explicit.

## Uploads and editing

Import/record locally, open the video, select **Upload to my storage**, choose a
writable source and choose whether to keep a phone copy. Nothing uploads automatically.
Drive uses a reserved provider ID and resumable sessions. Dropbox uses resumable
sessions and a stable unique destination, strict conflicts and no automatic renaming.
Both reconcile a previously completed file before retrying. Native reads are bounded
2 MiB chunks rather than loading a large video into memory. Jobs persist securely;
return to the video to resume after interruption. An expired session restarts against
the same file identity/destination. Library registration waits for confirmed size.

To edit an online video, download it first. Exporting a practice section creates a
separate MP4 library video. Use Save to Photos / Share / Save file, or upload that
new clip to your selected storage folder. Originals are never overwritten.

## Verification boundary

Provider adapters, PKCE UI, scans, online playback and refresh preservation are covered
by unit/mock HTTP and browser tests. Live OAuth, provider quotas, revoked real accounts,
large-file transfers and physical-device behaviour require registered OAuth apps and
real accounts; they must not be inferred from mocked tests. See VERIFICATION.md.

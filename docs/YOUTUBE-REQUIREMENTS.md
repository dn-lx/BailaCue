# YouTube sources and beginner recommendations

Status: requirements recorded on 2026-10-19; not implemented in the published app.
The owner will supply the recommended playlist and single-video links. This document
does not select or endorse any channels or lessons on the owner's behalf.

## Goal

Let someone starting Salsa or Bachata add useful YouTube lessons without building
a library from scratch. Recommendations are optional: everyone can add their own
playlist or single-video links instead, or use both approaches.

## Required user journeys

1. Open an optional **Beginner suggestions** area, grouped by Salsa and Bachata.
2. Preview a playlist or video chosen by the BailaCue owner. See its title, creator,
   dance style, language, beginner level and a short explanation of why it is listed.
3. Choose **Add to my library**. Nothing is added merely by viewing suggestions;
   skipping or dismissing them does not restrict use of the app.
4. Alternatively choose **Add YouTube link**, paste a playlist or single-video URL,
   preview what was found, choose Salsa/Bachata/Other and labels, then confirm.
5. Play the lesson online, assign personal ratings and labels, and include it in
   Daily Picks using the same preference rules as other eligible library videos.

## Requirements

| ID | Requirement |
| --- | --- |
| YT-01 | Support public YouTube playlists and single videos. Accept standard playlist/watch links and `youtu.be` links. A watch URL containing a playlist must offer a clear choice between adding the video and adding the playlist. |
| YT-02 | Maintain an owner-curated starter catalog. Entries contain a stable ID, type, URL, Salsa/Bachata style, level, language, description, display order and enabled flag. Resolve current title/creator/thumbnail from YouTube and retain attribution. No invented starter links. |
| YT-03 | Suggestions are optional and can be revisited later. Adding a suggestion requires a deliberate action; there is no automatic enrollment or automatic playback. |
| YT-04 | Users can add their own URLs without choosing a suggestion. Explain invalid links, unsupported link types, unavailable playlists and access restrictions in plain language. |
| YT-05 | Treat each playlist as an independent named source. Permit multiple Salsa and Bachata playlists alongside existing Drive, Dropbox and phone libraries. A single video can belong to a local collection without creating an entire playlist source. |
| YT-06 | Preview playlist contents and preserve their order. Allow adding the playlist or selected lessons. Show import progress and partial failures for large playlists; paginate results. |
| YT-07 | Identify videos by YouTube video ID. Adding the same video through another playlist or a direct link must reuse its personal metadata while preserving all playlist memberships and order. Repeated Add must not create duplicates. |
| YT-08 | Support personal ratings, existing-or-new labels for video type and artists, notes, learning status, collections and practice history. Distinguish the uploader/channel from an artist label supplied by the user. |
| YT-09 | Daily Picks must apply the existing rating-first policy, unrated = 5 stars, minimum rating, cooldown and stable picks for the day. Respect the selected source/style mix without silently increasing the daily count when a beginner playlist is added. Let users choose which sources participate and keep one Salsa plus one Bachata as an explicit option. |
| YT-10 | Play through the official YouTube embedded player where permitted, retaining YouTube attribution, required controls and ads. Provide **Open in YouTube** when embedding is disabled or playback requires the YouTube app/site. |
| YT-11 | Clearly label these items **YouTube · Online**. Do not offer file download, upload-to-Drive/Dropbox, native trim/export, original-file renaming or Photos saving for YouTube links. Importing an original video file remains a separate flow. |
| YT-12 | Offer playlist refresh to discover additions and update titles, order and availability. Preserve user ratings/labels/notes by video ID. Explain removed/private/deleted/restricted items rather than deleting personal metadata silently. |
| YT-13 | Removing a source removes its membership, not the video from other sources. It never changes the original YouTube playlist, video title or content. |
| YT-14 | Handle offline use, API quota exhaustion, request failures, empty playlists, embedding restrictions and unavailable thumbnails. Preserve the existing library and provide retry or Open in YouTube as appropriate. |
| YT-15 | Keep catalog publishing separate from user library changes: editing or disabling a suggestion must not silently alter a user's already-added sources or ratings. |

## First release boundary and implementation decisions

- First release: owner-selected public playlists and single videos, manual URL add,
  optional suggestions, metadata discovery/refresh, online playback and Daily Picks.
- Whole-channel subscriptions, private/account-authorized playlists, automatic
  background refresh and YouTube account editing are later scope. Channels were
  discussed as possible future sources; they are not part of this first milestone.
- Use official YouTube Data API discovery and the supported embedded player.
  Recheck current API terms, metadata retention/refresh rules, mobile player support,
  attribution and privacy requirements before implementation. Do not scrape video
  streams or imply that YouTube Premium enables downloads inside BailaCue.
- Model YouTube as a playback/catalog source with explicit capabilities, not a
  writable file-storage folder. Keep unsupported file actions out of its UI.
- Plan API-key restrictions, quota controls and catalog hosting before choosing the
  client/backend boundary. Do not add secrets to the public repository. Public
  discovery should not require users to connect their Drive account or sign into
  BailaCue. Disclose YouTube network requests and any embedded-player data sharing.
- Verify speed, seeking, saved timestamps and loop support against the actual player
  before promising native-player parity. Do not promise video export from timestamps.
- Extend metadata persistence/sync and migrations so older libraries stay readable;
  adding a YouTube source must not change existing cloud filenames or upload settings.

## Acceptance checklist

- [ ] A new user can skip suggestions and add a manual link successfully.
- [ ] An owner-provided Salsa playlist and Bachata single video can be previewed and
      added; already-added suggestions show their state without duplicating entries.
- [ ] A URL with both video and playlist IDs presents both import choices.
- [ ] Overlapping playlists and repeated direct links preserve one video's ratings,
      notes and labels, with independent source memberships and playlist order.
- [ ] Refresh discovers a new playlist item and handles removals/unavailable entries
      while preserving personal metadata and saved Daily Picks where still valid.
- [ ] Daily Picks produces the requested Salsa/Bachata mix; unrated items count as
      5 stars, the minimum rating applies, cooldown works, and unavailable items are
      excluded. Adding a playlist does not silently change the requested mix.
- [ ] Embedded playback works on Android and iOS or offers an honest YouTube fallback;
      unsupported download, upload, rename and trim/export actions are absent.
- [ ] Invalid URLs, empty playlists, offline mode, partial refresh, quota errors and
      embedding restrictions have useful recovery states.
- [ ] Removing one playlist retains videos still used elsewhere and changes nothing
      on YouTube. Source creation never renames Drive/Dropbox files.
- [ ] Small screens, large text, screen-reader labels and touch targets are checked.

## Inputs still needed before implementation

- Owner's chosen playlist/video URLs and desired grouping/order, plus any preferred
  descriptions. Default audience is absolute beginners in Salsa and Bachata.
- Catalog publishing approach (a versioned repository catalog is a possible first
  step), language coverage, and YouTube API configuration/quota ownership.
- Confirm the default Daily Picks participation UX when multiple sources share a
  dance style. Current behavior is documented in [DAILY-PICKS.md](DAILY-PICKS.md).

No app build, provider configuration or production database change is included in
this documentation task. Design follow-up is recorded in [UI-UX-DIRECTION.md](UI-UX-DIRECTION.md).

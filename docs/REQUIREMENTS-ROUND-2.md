# BailaCue · new requirements · round 2

Status: recorded for review; not implemented by this documentation update.

This is a new list of feedback on Android preview 0.2.17/build22. It is separate
from the earlier 22-issue requirements and uses a new `R2` numbering sequence.
The previous requirements document remains unchanged.

## R2-01 · Make YouTube video titles compact

**Problem:** The supplied screenshot shows “How To DANCE Bachata During
Quarantine (4 Beginner Basic Steps)” as an oversized, five-line heading, taking
space away from the video.

**Requirement:** Use a smaller, compact video-title treatment on the YouTube
playback page. Keep Back easy to reach and give the video more screen space.

**Acceptance:**

- At the default text size, long titles use at most two lines in the compact
  header, with an obvious way to read the complete title.
- Preserve the complete original title in metadata; shortening the display must
  not rename or discard it.
- Support system text scaling and screen-reader access to the complete title.
  Title and Back must not overlap or clip on narrow screens or with large text.
- Check the supplied long-title example at 320, 360 and 412px widths.

## R2-02 · Let users resize the YouTube video area

**Problem:** The YouTube playback page has no visible way to make its video area
larger or smaller.

**Requirement:** Add a discoverable resize control to the YouTube player, with
drag-to-resize and an accessible alternative for increasing/decreasing its size.

**Acceptance:**

- Users can enlarge or reduce the video area without leaving the playback page.
- Resizing preserves the picture's aspect ratio and the official YouTube player's
  controls, captions, attribution and supported minimum dimensions.
- Playback position, play/pause state and selected speed survive resizing;
  resizing must not reload the video or restart it from the beginning.
- The resize gesture and ordinary page scrolling do not interfere with each
  other or with the video's seek controls.
- Essential playback actions remain reachable at the largest and smallest sizes;
  screen readers can operate the size adjustment.

## R2-03 · Add discoverable YouTube full-screen playback

**Problem:** The screenshot has no visible full-screen action alongside the
YouTube playback controls.

**Requirement:** Add an explicit **Full screen** action that opens an enlarged
YouTube playback view, with an obvious way to return. Use the supported official
player; opening the external YouTube app is a separate fallback.

**Acceptance:**

- Full screen is visible and usable without hunting through settings or extra tools.
- Entering and exiting preserves the current video, position, play/pause state
  and supported speed; it must not duplicate playback or reset the lesson.
- Controls and captions remain usable in portrait and landscape, with safe areas
  respected. Provide a visible exit action; Android Back exits full screen first.
- Backgrounding and resuming retain BailaCue's existing pause rules.
- Verify actual embedded playback on Android and iOS separately. If a platform
  restricts full-screen playback, explain that state and offer Open in YouTube;
  do not present an ineffective full-screen button as working.

## Implementation order and evidence

1. R2-01: compact title and header layout.
2. R2-02: resize behavior and accessible controls.
3. R2-03: full-screen lifecycle and device verification.

The user's screenshot `1000072658.png` in the conversation is the visual reference;
the personal screenshot is not published in Git. Capture before/after evidence
using a public lesson or synthetic test content. Browser layout checks complement
actual Android/iOS player checks; record untested platforms explicitly.

This update records requirements only. It does not modify the app, publish a new
APK, or reopen implementation of the previous requirements list.

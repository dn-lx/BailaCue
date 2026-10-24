# BailaCue web verification · 24 October 2026

Built on develop, preserving all mobile source and main. Node 24 build with a pinned
TypeScript 6.0.3 lockfile; clean npm install, syntax lint, JavaScript/declared-domain
type checks, eight domain tests and static build pass.

Actual Drive catalogue: 114 Salsa + 152 Bachata, unique identities and both fixed
folder IDs validated. No OAuth/admin credentials, service endpoint or Me+ database
access in client code. No copied video bytes. Public source folder permission was
already anyone-with-link; no Drive permissions were changed.

Cloud browser checks on the actual static build:

- Today renders both real Drive thumbnails and provider preview, without sign-in.
- Rating 10/10, practice note and explicitly marked practice survive a reload.
- YouTube video form saves the supplied link and filters to the new source.
  Privacy-enhanced embed loads the real provider title and play/settings/seek controls.
  Removed the temporary verification source afterward. No claim of full-length
  uninterrupted streaming or all-region/provider availability.
- Generated practice mix opens its first Salsa cue. Next advances to a Bachata cue
  at 2/10. Original URLs and per-video notes/ratings are separate.
- 390px and 320px iframe viewports show mobile bottom navigation, cards and filters.
  Measured body scrollWidth equals clientWidth: 375 and 305 after scrollbar widths.
  No horizontal overflow. This is browser layout validation, not a physical phone test.
- Approved source SVGs parse as valid XML. The preview host corrupts externally served
  SVGs through HTML injection, so the approved logo is inlined into the page for
  reliable rendering. Native app branding is untouched.

Netlify project created with exact name bailacue and id
0aeef340-5366-454e-b379-14bfee4c1784. Visitor access is public, no password or team
SSO. Git connection/deploy requires dashboard login because the available connector
has no Git-link, build-settings or deploy-create operation. Browser currently signed
out. Do not report a live URL or a ready branch deploy until deployment is confirmed.

Known product boundaries: browser-local personal data (backup import/export available),
catalogue is a versioned snapshot, provider-owned playback controls, manual queue
advance, no native trimming or automatic watch tracking. No mobile, production Me+
or main-branch change and no paid service/plan upgrade.

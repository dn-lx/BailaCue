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
SSO. The Netlify dashboard was signed in through the secure sign-in flow. Repository
linking and branch settings were completed in its UI because the connector has no
Git-link/build-settings/deploy-create operation. All GitHub writes used its MCP.

Initial tested develop commit `062e2bd74d8617760f8d5f5c495dc041ec80e9f7` passed
GitHub Actions and deployed successfully to `https://bailacue.netlify.app`:
Netlify deploy `6adc7349e0264e5eb4fc553b`, state ready, context production, no
secret-scan matches, no build or deploy errors. Netlify also returned the develop
alias `https://develop--bailacue.netlify.app`. After this initial publish, production
branch was changed to main and branch deploys limited to develop; visible settings
confirm both. Main remains unchanged. Subsequent develop pushes use branch-deploy
context and do not replace the primary site's initial tested build.

Known product boundaries: browser-local personal data (backup import/export available),
catalogue is a versioned snapshot, provider-owned playback controls, manual queue
advance, no native trimming or automatic watch tracking. No mobile, production Me+
or main-branch change and no paid service/plan upgrade.

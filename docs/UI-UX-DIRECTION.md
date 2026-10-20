# UI/UX and icon improvement requirements

Status: owner selected concept **03 — BC + play** on 2026-10-20 and authorized the
icon and blue-and-black theme implementation. App name remains **BailaCue**.
The remaining product/UX work is still pending separate implementation instructions.

## Approved brand and Git asset requirement

**BR-01:** Use concept 03's BC monogram with its embedded play triangle as the app
icon and brand symbol. Use electric blue `#1465FF`, near-black `#080D18` and white;
support readable light/dark UI palettes. Keep text contrast, source distinctions,
button states and player controls clear throughout the app.

**BR-02:** Commit all maintained logo/icon variants to this Git repository, including
their source artwork, exports and regeneration instructions. The complete delivery
inventory must include the primary symbol, light/dark and monochrome versions,
horizontal/stacked wordmarks, transparent logos, Android launcher/adaptive/themed
monochrome artwork, iOS/app-store artwork, splash, favicons and coordinated badges.
Keep a manifest with paths, format, dimensions, checksums and implementation status.
Never describe an SVG embedding PNG artwork as an editable vector master. A reviewed
pure-vector master, clean transparent artwork and Android themed monochrome assets
remain required follow-up until explicitly delivered and verified.

Acceptance:

- [ ] Every listed variant has a committed source/export or an explicitly recorded
      pending status; no asset exists only in chat or on a local machine.
- [ ] Regeneration preserves the approved mark and produces platform-compatible
      sizes, opacity and safe margins. Changes to generated exports are reproducible.
- [ ] The app icon, splash, in-app mark, badges and both themes use the chosen identity.
- [ ] Existing app behavior, video editing/export and cloud destinations are preserved.

Current files and remaining variants: [brand asset inventory](brand/README.md).

## Required use of Agent Project Starter

**UX-01:** Use the owner's
[dn-lx/agent-project-starter](https://github.com/dn-lx/agent-project-starter) design
workflow to improve BailaCue's UI/UX and app icon. Apply its Premium Redesign and
Design Stack guidance to the existing app: Taste for creative direction, UI/UX Pro
Max for design-system guidance, and Impeccable for critique and polish, followed by
rendered UI, accessibility and visual-regression verification. Adapt relevant guidance
to Expo/React Native and preserve BailaCue's product behavior and project rules.

Acceptance:

- [ ] Record the reviewed starter revision and the design guidance used.
- [ ] Capture current screens, define visual acceptance criteria and document the
      improved shared tokens/components and key user journeys.
- [x] Present icon concepts and record the owner's choice: blue-and-black concept 03.
- [ ] Complete the selected icon's full editable master and platform asset inventory.
- [ ] Implement the UI improvements and verify alignment, large text, accessibility
      and important native video workflows with before/after evidence.

This is a requirement for the future design work, not an instruction to run the
starter's full bootstrap or replace this application's architecture.

## Required work

1. Audit the main journeys: add/preview/classify a video, choose its source, play and
   practise, trim/save a new file, find Daily Picks, and manage connected sources.
   Include the planned optional YouTube beginner suggestions and manual-link flow.
2. Produce a small shared design system for spacing, type, buttons, cards, chips,
   status messages and source rows. Correct alignment with long names, narrow screens
   and large text. Make local, Drive, Dropbox and YouTube states easy to distinguish.
3. Make primary actions and transfer state easier to understand: selected destination,
   online/phone status, upload progress, retry and completion. Keep renaming optional.
4. Show why a Daily Pick was chosen and clearly distinguish daily recommendations
   from the Practice timer and its video list. Currently Practice shows the first
   five library videos; adopting recommendations there needs its own product decision.
5. Preserve the selected concept 03 BC/play symbol and blue/black identity. Retain
   a clear shape at launcher size and verify it on actual phone home screens.
6. For the chosen concept, deliver an editable vector master plus Android adaptive
   and monochrome assets, iOS artwork, splash/favicon and coordinated brand badges.
   Check platform masks, safe areas, light/dark presentation and small-size legibility.
7. Validate screen-reader names, contrast, touch targets, font scaling, keyboard/safe
   areas and empty/loading/failure states. Check layouts at 320, 360 and 412 px and
   verify native import/playback/trim/save flows after implementation.

## Can agent-project-starter help?

The owner confirmed their repository is
[dn-lx/agent-project-starter](https://github.com/dn-lx/agent-project-starter), whose
default branch was `prod` when inspected. Yes: its design workflow can help improve
this app. The following evaluation is based on its README and actual design docs,
not the unrelated Meir Labs project with a similar name.

Its [Design Stack](https://github.com/dn-lx/agent-project-starter/blob/prod/docs/DESIGN-STACK.md)
assigns clear responsibilities:

| Need in BailaCue | Relevant workflow from the starter |
| --- | --- |
| Distinctive dance identity, hierarchy and visual direction | Taste Skill |
| Consistent palette, typography, spacing and UX patterns | UI/UX Pro Max |
| Critique, alignment, clarity and polish | Impeccable |
| Verify real rendered flows and accessibility | Frontend Verification + Accessibility/Visual Regression |

Its [Premium Redesign](https://github.com/dn-lx/agent-project-starter/blob/prod/.agents/skills/premium-redesign/SKILL.md)
workflow starts from product requirements and current UI, defines visual acceptance
criteria and reusable design tokens, optionally uses Figma, then implements, polishes
and verifies. This is the required structure for the design work above.

Adapt that structure to this existing Expo/React Native app. Web-only HTML/CSS,
browser interaction assumptions and `motion/react` are not native implementation
instructions. Native accessibility, safe areas, touch targets, player gestures and
Android/iOS artwork requirements still need explicit device evidence. Keep the
existing branch/release setup and project rules; adopting design guidance is not a
request to bootstrap a new app, migrate branches or enable analytics.

For the icon, use the creative-direction stage to define three concepts, image
generation or vector exploration to develop them, and a clean editable vector master
for the selected artwork. The starter organizes the process; it does not itself
establish that a distinctive, production-ready app icon has been generated.

Recommended combination: the starter's focused design workflow, Figma screen/component
mockups where useful, custom icon exploration and implementation in the existing
React Native components. None replaces product design judgment or device testing.
The upstream files were inspected as references only. No starter scripts, external
design packs, hooks or dependencies have been installed or executed in BailaCue.

The owner has selected the icon. Remaining broader UX mockups, production vector
artwork and verification are tracked separately; choosing the mark is not a request
to replace the existing application architecture.

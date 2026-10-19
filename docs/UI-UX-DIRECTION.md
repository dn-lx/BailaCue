# Proposed UI/UX and icon follow-up

Status: design brief and tool recommendation, 2026-10-19. No redesign or icon change
has been applied. App name remains **BailaCue**. The owner finds the current icon too
generic and wants a more distinctive identity connected to dancing.

## Proposed work

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
5. Explore three original icon concepts connected to partner dancing, rhythm and
   the BailaCue identity. Prefer a distinct silhouette or monogram with motion over
   a generic play button or stock dancer. Retain a clear shape at launcher size;
   compare candidates on actual phone home screens, not only on a large design board.
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
and verifies. This is a useful structure for the proposed work above.

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

The next design deliverable should be a few representative screen mockups and three
icon candidates, with a clear reason for each direction. These are proposed next
steps, not completed assets or a request to replace the app's existing architecture.

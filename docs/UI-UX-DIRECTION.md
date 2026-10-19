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

If the owner means [Meir Labs' agent-project-starter](https://meirlabs.com/agents/project-starter),
its published description includes a planner, scaffolder, design-applier,
analytics-wirer, test-wirer and docs-writer. The design-applier handles themes,
typography and layout, so parts of that workflow could help organize a redesign.

The [GitHub README](https://github.com/meirlabs/library/tree/main/agents/project-starter)
describes a new-project workflow. Its
[design-applier instructions](https://github.com/meirlabs/library/blob/main/agents/project-starter/files/design-applier.md)
specifically use HTML theme attributes, a CSS-based web UI kit, React web icons and
environment-specific favicons. These are not directly applicable to native React
Native screens or Android/iOS launcher artwork. It can inform a plan and consistency
rules, but needs adaptation; it does not establish a dedicated app-icon design
capability. Do not run its scaffolder over the existing repository or add analytics
merely to improve appearance. It has not been installed or executed here.

A more direct approach for BailaCue is a focused UX audit, Figma screen/component
mockups, custom icon concepts using image generation, then a clean vector master
and implementation in the existing React Native components. Figma helps review
layout and visual consistency; image generation helps explore icon ideas; device
testing verifies the resulting implementation. None replaces product design judgment.

The next design deliverable should be a few representative screen mockups and three
icon candidates, with a clear reason for each direction. These are proposed next
steps, not completed assets or a request to replace the app's existing architecture.

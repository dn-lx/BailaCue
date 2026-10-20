# BailaCue · BC + play

The owner selected concept **03**, the BC monogram with an embedded play triangle,
in blue and black. Name: **BailaCue**. The original design board and generated
artwork remain in Git. The approved geometry was redrawn through image generation
in monochrome and traced with Potrace1.16; the active SVG masters contain paths.
Rejected noisy alpha cutouts are not shipped.

![Identity and palette](identity.png)

Brand blue `#1465FF`, black `#080D18`, white and pale blue `#C7DCFF`. UI actions use
`#145BE0`/white in light mode and `#8AB6FF`/black in dark mode for readable contrast.
Outfit SemiBold is the display face; DM Sans is the interface face.

| Asset                        | Path / specification                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Vector symbol master         | `assets/brand/symbol-master.svg` — SVG paths, no raster                                                        |
| Outlined wordmark            | `assets/brand/wordmark-master.svg` — Outfit glyph paths                                                        |
| Original artwork             | `assets/brand/bc-play-{blue,black,monochrome}-source.png`                                                      |
| App and iOS artwork          | `assets/icon.{png,svg}`, `assets/brand/ios-app-store.png` — opaque1024                                         |
| Adaptive foreground          | `assets/adaptive-icon.png` — transparent white symbol, blue configured background                              |
| Android themed icon          | `assets/adaptive-monochrome.png` — single-colour symbol with alpha                                             |
| Symbols                      | `assets/brand/symbol-{blue,black,white}-transparent.{svg,png}`                                                 |
| Logo family                  | `assets/brand/logo-{horizontal,stacked}-{light,dark,mono-white,mono-black}[-transparent].{svg,png}`            |
| Splash                       | `assets/splash-icon.png` — white symbol with alpha, black configured background                                |
| Favicons / PWA / Apple touch | `assets/favicon.png`, `assets/brand/favicon-{16,32}.png`, `android-icon-{192,512}.png`, `apple-touch-icon.png` |
| Badges                       | `docs/brand/badge-{salsa,bachata,practice,youtube}.{svg,png}`                                                  |
| Social / feature image       | `assets/brand/social-1200x630.{svg,png}`, `play-feature-1024x500.{svg,png}`                                    |
| Manifest                     | `assets/brand/manifest.json` —66 exports, sizes, alpha, SHA256                                                 |

Paths are relative to the repository. Historical status badges and original icon
sources remain for provenance; they are not active learning-status UI.

Run `npm run brand` to reproduce exports from the committed SVG masters. The SVG
logos have outlined text and do not depend on fonts being installed. Social
straplines and badge text remain editable SVG text with a sans-serif fallback.
To recreate the outlined wordmark, install Python `fonttools` and run
`python3 scripts/outline-wordmark.py` against the bundled OFL Outfit font.
To retrace the unchanged monochrome drawing, convert it to a 128-threshold PGM and
run `potrace logo.pgm -s --alphamax1.2 --opttolerance0.4`; preserve the1254 canvas.
Normal regeneration never calls an image-generation service or needs Potrace.

Store artwork is prepared in Git; publishing store listings or taking store-specific
marketing screenshots is a separate distribution step. No app-store submission is
implied by these exports.

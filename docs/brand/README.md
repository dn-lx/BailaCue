# BailaCue · BC + play

The owner selected **concept 03** from the blue-and-black identity set on 20 October
2026. The BC monogram contains a play triangle, connecting the name to video practice.
The approved choice is recorded in [BR-01/BR-02](../UI-UX-DIRECTION.md).

![Selected identity and palette](identity.png)

| Role | Colour |
| --- | --- |
| Brand blue | `#1465FF` |
| Brand black / dark canvas | `#080D18` |
| White | `#FFFFFF` |
| Pale-blue cue / Bachata badge | `#C7DCFF` |
| Light-theme action blue, for white text | `#145BE0` |
| Dark-theme action blue, for black text | `#8AB6FF` |

Typography stays Outfit Semibold for display and DM Sans for interface text. Blue
Salsa badges use white text; pale-blue Bachata badges use dark text. The UI uses
semantic tokens, including explicit foregrounds for primary and accent actions.

## Committed inventory

| Variant | Files | Status |
| --- | --- | --- |
| Approved design board | `selected-concept-03-board.png` | Reference, committed |
| Blue and black source artwork | `assets/brand/bc-play-{blue,black}-source.png` | Image-generated PNG masters |
| Primary app/iOS artwork | `assets/icon.png` | 1024 × 1024, opaque |
| Android adaptive foreground | `assets/adaptive-icon.png` | 1024 × 1024, opaque blue foreground/background design |
| Black app-icon variant | `assets/brand/icon-black.png` | 1024 × 1024, opaque |
| Horizontal wordmarks, light/dark | `assets/brand/logo-horizontal-{light,dark}.{png,svg}` | 1024 × 256; SVG embeds raster symbol with editable text |
| Stacked wordmarks, light/dark | `assets/brand/logo-stacked-{light,dark}.{png,svg}` | 640 × 640; SVG embeds raster symbol with editable text |
| Icon SVG container | `assets/icon.svg` | Raster-backed SVG, not pure vector |
| Splash icon | `assets/splash-icon.png` | 512 × 512, black colourway |
| Web favicon | `assets/favicon.png` | 64 × 64 |
| Salsa/Bachata/status badges | `docs/brand/badge-*.svg` | Editable SVG text/shapes |
| Identity board | `docs/brand/identity.{svg,png}` | 1200 × 720 |
| Asset manifest | `assets/brand/manifest.json` | Generated paths/checksums and format notes |
| Pure-vector symbol/wordmark masters | Pending | Requires reviewed paths, not embedded PNG |
| Clean transparent logo family | Pending | Rejected noisy cutouts are not shipped |
| Monochrome logo and Android themed-icon artwork | Pending | Do not claim an opaque colour icon is a themed monochrome asset |
| Store listing/screenshot/social size exports | Pending | Produce to confirmed distribution specifications |

Paths above are relative to the repository unless already under `docs/brand`.
`assets/brand/dance-icon-source.png` is historical artwork, not the active master.
Older screenshots may show the previous brand; current verification is recorded
with the corresponding preview release.

## Regenerate

Run `npm run brand` from the repository root. The script only resamples/packages the
approved artwork, lays out wordmarks/identity boards and generates badges. It does
not claim to vectorize or repair image-generated artwork. SVG wordmark text uses
Outfit when available, with a system sans-serif fallback; outlined production text
and a pure-vector mark remain part of BR-02.

Keep all maintained variants, sources, export instructions and the manifest in Git.
Check small launcher sizes, adaptive masks, splash and light/dark screens before a
release. Never substitute a new icon concept without the owner's direction.

// Package the selected image-generated artwork at platform-required sizes.
// Artwork changes belong in the source image; this script only resamples it.
import sharp from "sharp";
import { writeFile, mkdir, readFile } from "node:fs/promises";
await mkdir("assets", { recursive: true });
await mkdir("docs/brand", { recursive: true });
const source = await readFile("assets/brand/dance-icon-source.png");
for (const [path, size] of [
  ["assets/icon.png", 1024],
  ["assets/adaptive-icon.png", 1024],
  ["assets/splash-icon.png", 512],
  ["assets/favicon.png", 64],
]) {
  await sharp(source).resize(size, size).png().toFile(path);
}
// An opaque foreground is supported by Android. The mark itself is centered in
// its 60% safe area, so circle/squircle launcher masks retain both dancers.
await writeFile(
  "assets/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><image width="1024" height="1024" href="data:image/png;base64,${source.toString("base64")}"/></svg>`,
);
for (const [name, color, label] of [
  ["salsa", "#FF8C74", "SALSA"],
  ["bachata", "#D8F17D", "BACHATA"],
  ["practising", "#E4D5F4", "PRACTISING"],
  ["learned", "#D8F17D", "LEARNED"],
]) {
  await writeFile(
    `docs/brand/badge-${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="56"><rect width="200" height="56" rx="28" fill="${color}"/><text x="100" y="35" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="bold" letter-spacing="2" fill="#321D36">${label}</text></svg>`,
  );
}

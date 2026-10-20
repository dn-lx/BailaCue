// Package approved image-generated artwork; never retouch the selected mark here.
import sharp from "sharp";
import { createHash } from "node:crypto";
import { writeFile, mkdir, readFile } from "node:fs/promises";
await mkdir("assets/brand", { recursive: true });
await mkdir("docs/brand", { recursive: true });
const blue = await readFile("assets/brand/bc-play-blue-source.png");
const black = await readFile("assets/brand/bc-play-black-source.png");
const generated = [];
async function save(path, data) {
  await writeFile(path, data);
  generated.push(path);
}
for (const [path, source, size] of [
  ["assets/icon.png", blue, 1024],
  ["assets/adaptive-icon.png", blue, 1024],
  ["assets/splash-icon.png", black, 512],
  ["assets/favicon.png", blue, 64],
  ["assets/brand/icon-black.png", black, 1024],
]) {
  await save(
    path,
    await sharp(source).resize(size, size).removeAlpha().png().toBuffer(),
  );
}
// SVG containers retain the approved raster mark. They are not vector masters.
const image = (data, x, y, width, height) =>
  `<image x="${x}" y="${y}" width="${width}" height="${height}" href="data:image/png;base64,${data.toString("base64")}"/>`;
const svg = (width, height, content) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
await save("assets/icon.svg", svg(1024, 1024, image(blue, 0, 0, 1024, 1024)));
for (const [mode, background, foreground, source] of [
  ["light", "#FFFFFF", "#080D18", blue],
  ["dark", "#080D18", "#FFFFFF", black],
]) {
  const horizontal = svg(
    1024,
    256,
    `<rect width="1024" height="256" fill="${background}"/>` +
      image(source, 24, 24, 208, 208) +
      `<text x="270" y="163" font-family="Outfit, sans-serif" font-size="112" font-weight="600" fill="${foreground}">Baila<tspan fill="#1465FF">Cue</tspan></text>`,
  );
  const stacked = svg(
    640,
    640,
    `<rect width="640" height="640" fill="${background}"/>` +
      image(source, 128, 48, 384, 384) +
      `<text x="320" y="538" text-anchor="middle" font-family="Outfit, sans-serif" font-size="88" font-weight="600" fill="${foreground}">Baila<tspan fill="#1465FF">Cue</tspan></text>`,
  );
  for (const [name, content] of [
    ["horizontal", horizontal],
    ["stacked", stacked],
  ]) {
    await save(`assets/brand/logo-${name}-${mode}.svg`, content);
    await save(
      `assets/brand/logo-${name}-${mode}.png`,
      await sharp(Buffer.from(content)).png().toBuffer(),
    );
  }
}
for (const [name, color, foreground, label] of [
  ["salsa", "#1465FF", "#FFFFFF", "SALSA"],
  ["bachata", "#C7DCFF", "#081A38", "BACHATA"],
  ["practising", "#E8EFFA", "#080D18", "PRACTISING"],
  ["learned", "#C7DCFF", "#081A38", "LEARNED"],
]) {
  await save(
    `docs/brand/badge-${name}.svg`,
    svg(
      200,
      56,
      `<rect width="200" height="56" rx="28" fill="${color}"/><text x="100" y="35" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="bold" letter-spacing="2" fill="${foreground}">${label}</text>`,
    ),
  );
}
const identity = svg(
  1200,
  720,
  `<rect width="1200" height="720" fill="#F4F7FC"/>` +
    image(blue, 48, 48, 280, 280) +
    image(black, 352, 48, 280, 280) +
    `<text x="680" y="155" font-family="sans-serif" font-size="64" font-weight="bold" fill="#080D18">BailaCue</text>` +
    `<text x="680" y="208" font-family="sans-serif" font-size="24" fill="#54647B">Concept 03 · BC + play</text>` +
    `<text x="680" y="252" font-family="sans-serif" font-size="24" fill="#54647B">Watch. Practise. Repeat.</text>` +
    ["#1465FF", "#080D18", "#FFFFFF", "#C7DCFF"]
      .map(
        (color, i) =>
          `<rect x="${48 + i * 288}" y="400" width="264" height="144" rx="18" fill="${color}" stroke="#C4D0E0"/><text x="${48 + i * 288}" y="582" font-family="sans-serif" font-size="24" fill="#080D18">${color}</text>`,
      )
      .join("") +
    `<text x="48" y="663" font-family="sans-serif" font-size="22" fill="#54647B">Approved blue-and-black identity · Outfit + DM Sans · Light and dark themes</text>`,
);
await save("docs/brand/identity.svg", identity);
await save(
  "docs/brand/identity.png",
  await sharp(Buffer.from(identity)).png().toBuffer(),
);
await writeFile(
  "assets/brand/manifest.json",
  JSON.stringify(
    {
      concept: "03 — BC + play",
      sources: [
        "assets/brand/bc-play-blue-source.png",
        "assets/brand/bc-play-black-source.png",
      ],
      formatNote:
        "Image-generated PNG masters. Logo SVGs embed raster artwork plus editable wordmark text; they are not pure-vector masters.",
      assets: await Promise.all(
        generated.map(async (path) => {
          const data = await readFile(path);
          const metadata = await sharp(data).metadata();
          return {
            path,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            sha256: createHash("sha256").update(data).digest("hex"),
          };
        }),
      ),
      pending: [
        "Pure-vector symbol and wordmark masters",
        "Clean transparent logo family",
        "Monochrome logo and Android themed-icon artwork",
        "Store-listing and social exports at confirmed distribution sizes",
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log(`Packaged ${generated.length} approved brand assets.`);

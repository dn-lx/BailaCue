import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
await mkdir("assets", { recursive: true });
await mkdir("docs/brand", { recursive: true });
const mark = `<path d="M716 370a256 256 0 1 0 20 254" fill="none" stroke="#FF8C74" stroke-width="62" stroke-linecap="round"/><path d="m704 246 13 139-139-13" fill="none" stroke="#FF8C74" stroke-width="62" stroke-linecap="round" stroke-linejoin="round"/><path d="m452 389 185 111q18 12 0 24L452 635q-20 12-20-12V401q0-24 20-12" fill="#FFF6E8"/><circle cx="756" cy="693" r="30" fill="#D8F17D"/>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="224" fill="#321D36"/>${mark}</svg>`;
await writeFile("assets/icon.svg", icon);
await sharp(Buffer.from(icon)).png().toFile("assets/icon.png");
await sharp(Buffer.from(icon)).resize(64).png().toFile("assets/favicon.png");
const adaptive = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><g transform="translate(154 154) scale(.7)">${mark}</g></svg>`;
await sharp(Buffer.from(adaptive)).png().toFile("assets/adaptive-icon.png");
await sharp(Buffer.from(adaptive))
  .resize(512)
  .png()
  .toFile("assets/splash-icon.png");
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#FFF6E8"/><text x="100" y="100" font-family="sans-serif" font-size="20" letter-spacing="5" fill="#785C76">BAILACUE / BRAND IDENTITY / 01</text><rect x="100" y="170" width="290" height="290" rx="64" fill="#321D36"/><g transform="translate(100 170) scale(.2832)">${mark}</g><text x="450" y="300" font-family="sans-serif" font-weight="bold" font-size="110" fill="#321D36">BailaCue<tspan fill="#CF503D">.</tspan></text><text x="455" y="365" font-family="sans-serif" font-size="36" fill="#785C76">Watch. Practise. Repeat.</text><text x="100" y="565" font-family="sans-serif" font-size="20" letter-spacing="4" fill="#785C76">FIND YOUR RHYTHM. MAKE IT YOURS.</text>${["#321D36", "#FF8C74", "#FFF6E8", "#D8F17D"].map((c, i) => `<rect x="${100 + i * 350}" y="620" width="320" height="160" rx="24" fill="${c}" stroke="#E7DCCF"/><text x="${120 + i * 350}" y="830" font-family="monospace" font-size="24" fill="#321D36">${c}</text>`).join("")}<text x="100" y="940" font-family="sans-serif" font-size="22" fill="#785C76">Outfit / Display     ·     DM Sans / Interface     ·     Generous space, clear counts, a little joy.</text></svg>`;
await writeFile("docs/brand/identity.svg", board);
await sharp(Buffer.from(board)).png().toFile("docs/brand/identity.png");
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

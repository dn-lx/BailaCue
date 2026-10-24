import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogue = JSON.parse(await readFile(resolve(root, 'catalogue.json'), 'utf8'));
const counts = { Salsa: 0, Bachata: 0 };
const ids = new Set();
if (catalogue.version !== 1 || catalogue.rootFolderId !== '1elTpDpgefwwlnrSEFc8vyREt3HUpDS8P') throw new Error('Unexpected catalogue or source.');
for (const v of catalogue.videos) {
  if (!(v.dance in counts) || v.provider !== 'drive' || !/^[A-Za-z0-9_-]{10,100}$/.test(v.providerId) || v.id !== `drive:${v.providerId}` || ids.has(v.id)) throw new Error('Invalid or duplicate video.');
  ids.add(v.id); counts[v.dance]++;
}
if (!counts.Salsa || !counts.Bachata) throw new Error('Both fixed collections must be present.');
const dist = resolve(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const name of ['index.html', 'app.js', 'core.mjs', 'styles.css', 'manifest.webmanifest', 'catalogue.json', 'assets']) await cp(resolve(root, name), resolve(dist, name), { recursive: true });
console.log(`BailaCue web built: ${counts.Salsa} Salsa + ${counts.Bachata} Bachata videos. No credentials bundled.`);

import { runSync } from '../stream-sync.mjs';
import { readFile } from 'node:fs/promises';
const args = new Set(process.argv.slice(2));
if ([...args].some(a => !['--plan','--apply','--snapshot'].includes(a)) || args.has('--plan') && args.has('--apply')) throw new Error('Use --plan or --apply, optionally --snapshot for an offline plan.');
try {
  if (args.has('--snapshot')) {
    if (args.has('--apply')) throw new Error('An offline snapshot cannot upload videos.');
    const data = JSON.parse(await readFile(new URL('../catalogue.json', import.meta.url)));
    console.log(JSON.stringify({ mode: 'offline plan', videos: data.videos.length, bytes: data.videos.reduce((n,v) => n + v.size,0), unknownDurations: data.videos.filter(v => !v.duration).length, note: 'Live Google read access is required to measure minutes and calculate storage. No files were uploaded.' },null,2));
  } else {
    const result = await runSync(process.env, { apply: args.has('--apply'), maxBytes: Number(process.env.STREAM_MAX_BYTES_PER_RUN || 2 * 1024 * 1024 * 1024), deadlineMs: 12 * 60 * 1000, log: line => console.log(line) });
    console.log(JSON.stringify(result,null,2));
  }
} catch (error) { console.error(error.message || 'Sync failed. Check owner configuration.'); process.exitCode = 1; }

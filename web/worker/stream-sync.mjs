import { runSync } from '../stream-sync.mjs';
export default {
  async scheduled(_controller, env, _context) {
    if (env.STREAM_SYNC_ENABLED !== 'true') { console.log('BailaCue sync is disabled pending owner setup.'); return; }
    // Await work so a failed run is visible as a failed invocation. Each run is bounded.
    const result = await runSync(env, { apply: true }); console.log(JSON.stringify(result));
  },
  async fetch() { return new Response('BailaCue sync runs on its owner-configured schedule.', { status: 405, headers: { 'Cache-Control': 'no-store' } }); },
};

import { STREAM_APP, publicStreamVideo } from './stream-model.mjs';
/** Cloudflare access is server/owner-only. Never ship this module as a static asset. */
export class StreamProvider {
  constructor(accountId, token, fetcher = fetch) {
    if (!/^[a-f0-9]{32}$/.test(accountId || '') || !token) throw new Error('Cloudflare Stream account configuration is missing.');
    this.base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`; this.token = token; this.fetcher = fetcher;
  }
  async request(url, options = {}) {
    const response = await this.fetcher(url, { ...options, signal: options.signal || AbortSignal.timeout(20000), headers: { ...options.headers, Authorization: `Bearer ${this.token}` } });
    if (!response.ok) throw Object.assign(new Error(`Cloudflare Stream request failed (HTTP ${response.status}).`), { status: response.status });
    return response;
  }
  async json(url, options = {}) { const body = await (await this.request(url, options)).json(); if (!body.success) throw new Error('Cloudflare Stream did not confirm the request.'); return body.result; }
  async list() {
    const params = new URLSearchParams({ creator: STREAM_APP, limit: '1000' });
    const rows = await this.json(`${this.base}?${params}`); if (!Array.isArray(rows) || rows.length >= 1000) throw new Error('Stream listing needs a smaller partition before it can be used safely.');
    return rows.filter(row => row.meta?.app === STREAM_APP);
  }
  async publicLibrary() { const videos = (await this.list()).map(publicStreamVideo).filter(Boolean); return { version: 1, configured: true, checkedAt: new Date().toISOString(), videos }; }
  safeUploadUrl(value) {
    const url = new URL(value, this.base);
    const api = new URL(this.base);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !(url.origin === api.origin && url.pathname.startsWith(`${api.pathname}/`) || ['upload.videodelivery.net','upload.cloudflarestream.com'].includes(url.hostname))) throw new Error('Cloudflare returned an unexpected upload destination.');
    return url.href;
  }
  async edit(uid, meta) { return this.json(`${this.base}/${uid}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meta }) }); }
}

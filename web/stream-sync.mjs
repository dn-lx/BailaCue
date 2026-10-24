import { SOURCES } from './core.mjs';
import { mapDriveFile } from './studio-model.mjs';
import { StreamProvider } from './stream-provider.mjs';
import { STREAM_APP, STREAM_ORIGINS, sourceVersion } from './stream-model.mjs';
const DRIVE = 'https://www.googleapis.com/drive/v3';
const FIELDS = 'id,name,mimeType,size,createdTime,modifiedTime,parents,md5Checksum,videoMediaMetadata,capabilities(canDownload)';
const CHUNK = 8 * 1024 * 1024;
const encode = value => btoa(String.fromCharCode(...new TextEncoder().encode(value)));
const base64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
export class GoogleReader {
  constructor(env, fetcher = fetch) { this.env = env; this.fetcher = fetcher; this.accessToken = ''; this.expiry = 0; }
  async token() {
    if (this.accessToken && Date.now() < this.expiry) return this.accessToken;
    let body;
    if (this.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      let sa; try { sa = JSON.parse(this.env.GOOGLE_SERVICE_ACCOUNT_JSON); } catch { throw new Error('Google service account configuration is invalid.'); }
      if (!sa.client_email || !sa.private_key) throw new Error('Google service account configuration is incomplete.');
      const now = Math.floor(Date.now() / 1000);
      const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
      const claims = base64url(new TextEncoder().encode(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/drive.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
      const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
      const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
      const input = `${header}.${claims}`, signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(input));
      body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${input}.${base64url(new Uint8Array(signature))}` });
    } else {
      const { GOOGLE_OAUTH_CLIENT_ID: id, GOOGLE_OAUTH_CLIENT_SECRET: secret, GOOGLE_DRIVE_REFRESH_TOKEN: refresh } = this.env;
      if (!id || !secret || !refresh) throw new Error('Owner Google read access is not configured.');
      body = new URLSearchParams({ grant_type: 'refresh_token', client_id: id, client_secret: secret, refresh_token: refresh });
    }
    const response = await this.fetcher('https://oauth2.googleapis.com/token', { method: 'POST', body, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error('Owner Google read authorization failed.');
    const data = await response.json(); if (!data.access_token) throw new Error('Google did not return read authorization.');
    this.accessToken = data.access_token; this.expiry = Date.now() + (Number(data.expires_in || 3600) - 120) * 1000; return this.accessToken;
  }
  async request(url, options = {}) {
    const response = await this.fetcher(url, { ...options, signal: AbortSignal.timeout(20000), headers: { ...options.headers, Authorization: `Bearer ${await this.token()}` } });
    if (!response.ok) throw Object.assign(new Error(`Google Drive read failed (HTTP ${response.status}).`), { status: response.status }); return response;
  }
  async list() {
    const videos = [];
    for (const source of SOURCES) {
      let cursor = '';
      do {
        const query = new URLSearchParams({ q: `'${source.folderId}' in parents and trashed = false and mimeType contains 'video/'`, fields: `nextPageToken,files(${FIELDS})`, pageSize: '1000', supportsAllDrives: 'true', includeItemsFromAllDrives: 'true' });
        if (cursor) query.set('pageToken', cursor);
        const page = await (await this.request(`${DRIVE}/files?${query}`)).json();
        for (const f of page.files || []) {
          if (f.capabilities?.canDownload === false || !f.parents?.includes(source.folderId)) continue;
          videos.push({ ...mapDriveFile(f, source.dance, source.folderId), md5: f.md5Checksum || '' });
        }
        cursor = page.nextPageToken || '';
      } while (cursor);
    }
    return videos.sort((a,b) => a.dance.localeCompare(b.dance) || (a.filename || '').localeCompare(b.filename || '', undefined, { numeric: true }));
  }
  async chunk(file, start, end) {
    if (!/^[A-Za-z0-9_-]{10,100}$/.test(file.providerId) || !SOURCES.some(s => s.folderId === file.folderId && s.dance === file.dance)) throw new Error('Read source is outside the fixed folders.');
    const response = await this.request(`${DRIVE}/files/${file.providerId}?alt=media&supportsAllDrives=true`, { headers: { Range: `bytes=${start}-${end - 1}` } });
    const wholeSmall = start === 0 && end === file.size && response.status === 200;
    if (!wholeSmall && (response.status !== 206 || response.headers.get('Content-Range') !== `bytes ${start}-${end - 1}/${file.size}`)) { await response.body?.cancel(); throw new Error('Drive did not confirm the requested video byte range.'); }
    const length = Number(response.headers.get('Content-Length'));
    if (length && length !== end - start) { await response.body?.cancel(); throw new Error('Drive video size changed during sync.'); }
    const bytes = await response.arrayBuffer(); if (bytes.byteLength !== end - start) throw new Error('Drive returned an incomplete video chunk.'); return bytes;
  }
}
export function streamMeta(file) {
  return { app: STREAM_APP, name: `${file.dance} · ${file.filename}`, filename: file.filename, driveId: file.providerId, dance: file.dance, folderId: file.folderId,
    fileSize: String(file.size), sourceCreated: file.addedAt || '', sourceModified: file.updatedAt || '', sourceVersion: sourceVersion(file), sourceDuration: String(file.duration || '') };
}
export function syncPlan(files, records, maxMinutes) {
  const reservedSeconds = records.reduce((sum, r) => { const duration = Number(r.duration) > 0 ? Number(r.duration) : Number(r.meta?.sourceDuration); return sum + (duration > 0 ? duration : Infinity); }, 0);
  return { count: files.length, bytes: files.reduce((n,f) => n + (f.size || 0), 0), knownMinutes: files.filter(f => f.duration > 0).reduce((n,f) => n + f.duration / 60, 0),
    unknownDurations: files.filter(f => !(f.duration > 0)).length, reservedMinutes: reservedSeconds / 60, maxStoredMinutes: maxMinutes,
    files: files.map(file => {
      const matches = records.filter(r => r.meta?.driveId === file.providerId && r.meta?.sourceVersion === sourceVersion(file));
      const record = matches.find(r => r.readyToStream && r.status?.state === 'ready') || matches[0];
      const state = !record ? 'new' : record.readyToStream && record.status?.state === 'ready' ? 'ready' : record.status?.state === 'error' ? 'error' : record.status?.state === 'pendingupload' ? 'resume' : 'encoding';
      return { file, record, state, blocked: !record && (!(file.duration > 0) || reservedSeconds + file.duration > maxMinutes * 60) };
    }) };
}
export async function transferFile(file, record, drive, provider, { maxBytes = Infinity, deadline = Infinity, onProgress = () => {} } = {}) {
  let meta = record?.meta || streamMeta(file), uid = record?.uid, uploadUrl = meta.uploadSession;
  if (!record) {
    const metadata = { ...meta, allowedorigins: JSON.stringify(STREAM_ORIGINS) };
    const response = await provider.request(provider.base, { method: 'POST', headers: { 'Tus-Resumable': '1.0.0', 'Upload-Length': String(file.size), 'Upload-Creator': STREAM_APP,
      'Upload-Metadata': Object.entries(metadata).map(([key,value]) => `${key} ${encode(String(value))}`).join(',') } });
    uid = response.headers.get('stream-media-id'); if (!/^[a-z0-9]{32}$/.test(uid || '')) throw new Error('Cloudflare did not confirm a video identity. Check the dashboard before retrying.');
    uploadUrl = provider.safeUploadUrl(response.headers.get('Location') || '');
    meta = { ...meta, uploadSession: uploadUrl };
    // Persist the private resumable checkpoint with the provider, never in the public library.
    await provider.edit(uid, meta);
  }
  if (!uploadUrl) throw new Error('An incomplete copy already exists without a resume checkpoint. Review it in Cloudflare; a duplicate was not created.');
  uploadUrl = provider.safeUploadUrl(uploadUrl);
  const offset = async () => {
    const response = await provider.request(uploadUrl, { method: 'HEAD', headers: { 'Tus-Resumable': '1.0.0' } });
    const value = Number(response.headers.get('Upload-Offset')); if (!Number.isSafeInteger(value) || value < 0 || value > file.size) throw new Error('Cloudflare returned an invalid upload offset.'); return value;
  };
  let position = await offset(), transferred = 0;
  while (position < file.size && transferred < maxBytes && Date.now() < deadline) {
    const end = Math.min(position + CHUNK, file.size);
    if (end - position > maxBytes - transferred) break;
    const bytes = await drive.chunk(file, position, end);
    try {
      const response = await provider.request(uploadUrl, { method: 'PATCH', headers: { 'Tus-Resumable': '1.0.0', 'Upload-Offset': String(position), 'Content-Type': 'application/offset+octet-stream' }, body: bytes });
      const acknowledged = Number(response.headers.get('Upload-Offset')); if (acknowledged !== end) throw new Error('Cloudflare did not acknowledge the complete chunk.');
    } catch { const acknowledged = await offset(); if (acknowledged !== end) throw new Error('Upload interrupted. The next sync resumes the existing copy.'); }
    transferred += end - position; position = end; onProgress(position, file.size);
  }
  if (position === file.size) { const clean = { ...meta }; delete clean.uploadSession; await provider.edit(uid, clean); }
  return { uid, complete: position === file.size, position, transferred };
}
export async function runSync(env, { apply = false, fetcher = fetch, maxBytes = 80 * 1024 * 1024, deadlineMs = 90000, log = () => {} } = {}) {
  if (!(maxBytes >= CHUNK) || !(deadlineMs > 0)) throw new Error('Choose a valid transfer budget.');
  if (apply && env.STREAM_SYNC_ENABLED !== 'true') throw new Error('Sync is disabled. Review the plan and enable STREAM_SYNC_ENABLED after owner setup.');
  const maxMinutes = Number(env.STREAM_MAX_STORED_MINUTES || 1000), maxNew = Number(env.STREAM_MAX_NEW_PER_RUN || 1);
  if (!(maxMinutes > 0 && maxMinutes <= 1000000) || !Number.isInteger(maxNew) || maxNew < 1 || maxNew > 100) throw new Error('Choose a valid explicit sync budget.');
  const drive = new GoogleReader(env, fetcher), files = await drive.list();
  const provider = env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_STREAM_API_TOKEN ? new StreamProvider(env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_STREAM_API_TOKEN, fetcher) : null;
  if (apply && !provider) throw new Error('Cloudflare Stream write configuration is missing.');
  const records = provider ? await provider.list() : [], plan = syncPlan(files, records, maxMinutes);
  const summary = { count: plan.count, bytes: plan.bytes, knownMinutes: plan.knownMinutes, unknownDurations: plan.unknownDurations, reservedMinutes: Number.isFinite(plan.reservedMinutes) ? plan.reservedMinutes : null, maxStoredMinutes: maxMinutes, configured: !!provider,
    ready: plan.files.filter(p => p.state === 'ready').length, pending: plan.files.filter(p => p.state !== 'ready').length, transferredBytes: 0, started: 0, completedUploads: 0, blocked: [] };
  if (!apply) return summary;
  const deadline = Date.now() + deadlineMs; let reservedMinutes = plan.reservedMinutes;
  for (const item of plan.files) {
    if (!['new','resume'].includes(item.state)) continue;
    if (Date.now() >= deadline || summary.transferredBytes >= maxBytes) break;
    if (item.state === 'new') {
      if (summary.started >= maxNew) continue;
      if (!(item.file.duration > 0) || reservedMinutes + item.file.duration / 60 > maxMinutes) { summary.blocked.push(item.file.id); continue; }
      reservedMinutes += item.file.duration / 60; summary.started++;
    }
    log(`${item.file.dance} · ${item.file.filename}: ${item.state === 'resume' ? 'resuming' : 'creating playback copy'}`);
    const result = await transferFile(item.file, item.record, drive, provider, { maxBytes: maxBytes - summary.transferredBytes, deadline });
    summary.transferredBytes += result.transferred; if (result.complete) summary.completedUploads++;
  }
  return summary;
}

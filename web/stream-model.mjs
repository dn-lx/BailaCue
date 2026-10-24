import { SOURCES } from './core.mjs';
export const STREAM_APP = 'bailacue-v1';
export const STREAM_ORIGINS = ['bailacue.netlify.app', 'develop--bailacue.netlify.app'];
const FILE_ID = /^[A-Za-z0-9_-]{10,100}$/;
export function sourceVersion(file) { return `${file.updatedAt || ''}|${Number(file.size) || 0}|${file.md5 || ''}`; }
export function safeHlsUrl(value, uid) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.search && !url.hash && /^(?:[a-z0-9-]+\.)?(?:cloudflarestream\.com|videodelivery\.net)$/.test(url.hostname) && url.pathname === `/${uid}/manifest/video.m3u8` ? url.href : ''; } catch { return ''; }
}
/** Only the approved Drive collections may be exposed by the public playback index. */
export function publicStreamVideo(record) {
  const m = record?.meta || {}, source = SOURCES.find(s => s.dance === m.dance && s.folderId === m.folderId);
  if (m.app !== STREAM_APP || !source || !FILE_ID.test(m.driveId || '') || !/^[a-z0-9]{32}$/.test(record.uid || '')) return null;
  const hls = safeHlsUrl(record.playback?.hls, record.uid);
  const ready = record.readyToStream === true && record.status?.state === 'ready' && !record.requireSignedURLs && !!hls;
  const size = Number(m.fileSize), duration = Number(record.duration), sourceDuration = Number(m.sourceDuration);
  return { id: `drive:${m.driveId}`, provider: 'drive', providerId: m.driveId, folderId: source.folderId, dance: source.dance,
    title: String(m.filename || m.name || 'Untitled video').replace(/\.[^.]+$/, '').slice(0, 160), filename: String(m.filename || '').slice(0, 200),
    addedAt: validDate(m.sourceCreated), updatedAt: validDate(m.sourceModified), size: Number.isFinite(size) && size > 0 ? size : undefined,
    duration: duration > 0 ? duration : sourceDuration > 0 ? sourceDuration : undefined,
    streaming: { uid: record.uid, status: ready ? 'ready' : record.status?.state === 'error' ? 'error' : 'processing', hls: ready ? hls : '', version: String(m.sourceVersion || '') } };
}
function validDate(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : undefined; }
/** Revalidate the response in the browser and retain the original Drive IDs used by progress. */
export function mergeStreamingVideos(base, payload) {
  const map = new Map(base.map(v => [v.id, { ...v }]));
  if (payload?.version !== 1 || !Array.isArray(payload.videos)) return [...map.values()];
  for (const candidate of payload.videos) {
    const source = SOURCES.find(s => s.dance === candidate.dance && s.folderId === candidate.folderId);
    if (!source || candidate.provider !== 'drive' || !FILE_ID.test(candidate.providerId || '') || candidate.id !== `drive:${candidate.providerId}` || !candidate.streaming) continue;
    const stream = candidate.streaming, uid = String(stream.uid || ''); if (!/^[a-z0-9]{32}$/.test(uid)) continue;
    const hls = safeHlsUrl(stream.hls, uid), existing = map.get(candidate.id);
    const incomingTime = Date.parse(candidate.updatedAt || ''), existingTime = Date.parse(existing?.updatedAt || '');
    const newerLocal = existing && Number.isFinite(existingTime) && (!Number.isFinite(incomingTime) || existingTime > incomingTime);
    const differs = existing && incomingTime === existingTime && existing.size && candidate.size && existing.size !== candidate.size;
    if (newerLocal && existing.streaming && existing.streaming.status !== 'stale') continue;
    const video = newerLocal || differs ? existing : { ...existing, ...candidate };
    map.set(candidate.id, { ...video, streaming: { uid, status: newerLocal || differs ? 'stale' : stream.status === 'ready' && hls ? 'ready' : stream.status === 'error' ? 'error' : 'processing', hls: newerLocal || differs ? '' : hls, version: String(stream.version || '') } });
  }
  return [...map.values()];
}

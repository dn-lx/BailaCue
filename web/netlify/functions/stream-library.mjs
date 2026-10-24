import { StreamProvider } from '../../stream-provider.mjs';
export function createHandler(env, fetcher = fetch) {
  return async request => {
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, durable, max-age=60', 'X-Content-Type-Options': 'nosniff' };
    if (!['GET','HEAD'].includes(request.method)) return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { ...headers, Allow: 'GET, HEAD', 'Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store' } });
    const account = env('CLOUDFLARE_ACCOUNT_ID'), token = env('CLOUDFLARE_STREAM_READ_TOKEN');
    if (!account || !token) return new Response(request.method === 'HEAD' ? null : JSON.stringify({ version: 1, configured: false, videos: [], message: 'Playback copies are waiting for owner setup.' }), { headers });
    try { const data = await new StreamProvider(account, token, fetcher).publicLibrary(); return new Response(request.method === 'HEAD' ? null : JSON.stringify(data), { headers }); }
    catch { return new Response(request.method === 'HEAD' ? null : JSON.stringify({ version: 1, configured: true, videos: [], error: 'Playback copies could not be checked. Drive preview is available.' }), { status: 503, headers: { ...headers, 'Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store' } }); }
  };
}
export default request => createHandler(key => Netlify.env.get(key))(request);

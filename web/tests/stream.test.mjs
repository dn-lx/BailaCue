import test from 'node:test';
import assert from 'node:assert/strict';
import { safeHlsUrl, publicStreamVideo, mergeStreamingVideos, sourceVersion, STREAM_APP } from '../stream-model.mjs';
import { StreamProvider } from '../stream-provider.mjs';
import { syncPlan, transferFile, runSync, streamMeta, GoogleReader } from '../stream-sync.mjs';
import { createHandler } from '../netlify/functions/stream-library.mjs';
const account = 'a'.repeat(32), uid = 'b'.repeat(32), folderId = '1lVR5Pc-6SupJOfLIhcRE-oo69FUDM5Sm';
const file = { id: 'drive:drivevideo12345', provider: 'drive', providerId: 'drivevideo12345', dance: 'Salsa', folderId, filename: '0115.mp4', size: 12, duration: 60, updatedAt: '2026-10-24T09:00:00Z', addedAt: '2026-10-24T08:00:00Z' };
const hls = `https://customer-example.cloudflarestream.com/${uid}/manifest/video.m3u8`;
const record = overrides => ({ uid, meta: streamMeta(file), creator: STREAM_APP, readyToStream: true, status: { state: 'ready' }, playback: { hls }, duration: 60, ...overrides });
const json = result => Response.json({ success: true, result });
test('HLS URLs accept only the expected provider video and reject tokens, credentials and lookalike domains', () => {
  assert.equal(safeHlsUrl(hls,uid),hls);
  for (const value of [hls+'?token=secret',hls+'#x',hls.replace('cloudflarestream.com','cloudflarestream.com.evil.test'),hls.replace('https:','http:'),hls.replace(uid,'c'.repeat(32)),hls.replace('https://','https://secret@')]) assert.equal(safeHlsUrl(value,uid),'');
});
test('public playback records whitelist the two sources and strip all private metadata and upload checkpoints', () => {
  const row = record(); row.meta.uploadSession='private-resume-url'; row.meta.secret='never-public';
  const result = publicStreamVideo(row); assert.equal(result.id,file.id); assert.equal(result.streaming.status,'ready'); assert.equal(result.streaming.hls,hls); assert.ok(!JSON.stringify(result).includes('private-resume')); assert.ok(!JSON.stringify(result).includes('never-public'));
  assert.equal(publicStreamVideo(record({meta:{...row.meta,folderId:'other-folder'}})),null);
  assert.equal(publicStreamVideo(record({meta:{...row.meta,app:'another-app'}})),null);
  assert.equal(publicStreamVideo(record({requireSignedURLs:true})).streaming.hls,'');
  assert.equal(publicStreamVideo(record({status:{state:'queued'}})).streaming.status,'processing');
});
test('a new playback copy retains its Drive identity and a stale copy cannot replace newer source content', () => {
  const payload={version:1,videos:[publicStreamVideo(record())]};
  const merged=mergeStreamingVideos([file],payload); assert.equal(merged.length,1); assert.equal(merged[0].id,file.id); assert.equal(merged[0].streaming.status,'ready');
  const newer={...file,updatedAt:'2026-10-25T09:00:00Z'};
  assert.equal(mergeStreamingVideos([newer],payload)[0].streaming.status,'stale');
  const readyNew={...newer,streaming:{uid:'c'.repeat(32),status:'ready',hls:'new-copy'}};
  assert.equal(mergeStreamingVideos([readyNew],payload)[0].streaming.uid,'c'.repeat(32));
  assert.equal(mergeStreamingVideos([],{version:1,videos:[{...payload.videos[0],folderId:'other'}]}).length,0);
});
test('the playback endpoint is read-only and missing configuration is explicit without contacting a provider', async () => {
  const handler=createHandler(()=>'',()=>{throw new Error('must not fetch');});
  const response=await handler(new Request('https://baila.test/.netlify/functions/stream-library')); assert.equal(response.status,200); assert.equal((await response.json()).configured,false);
  assert.equal((await handler(new Request('https://baila.test/',{method:'POST'}))).status,405);
});
test('the playback endpoint never exposes provider tokens or raw error bodies', async () => {
  const env=key=>key==='CLOUDFLARE_ACCOUNT_ID'?account:'private-token';
  const handler=createHandler(env,async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer private-token'); assert.ok(String(url).includes('creator=bailacue-v1')); return json([record()]);});
  const response=await handler(new Request('https://baila.test/')); const text=await response.text(); assert.ok(!text.includes('private-token')); assert.equal(JSON.parse(text).videos.length,1);
  const failure=createHandler(env,async()=>new Response('private diagnostic secret',{status:401})); const failed=await failure(new Request('https://baila.test/')); assert.equal(failed.status,503); assert.ok(!(await failed.text()).includes('private diagnostic'));
});
test('sync planning distinguishes current versions, changed files, unknown duration and paid storage bounds', () => {
  assert.equal(syncPlan([file],[record()],1000).files[0].state,'ready');
  assert.equal(syncPlan([{...file,size:13}],[record()],1000).files[0].state,'new');
  assert.equal(syncPlan([{...file,duration:undefined}],[],1000).files[0].blocked,true);
  assert.equal(syncPlan([file],[],0.5).files[0].blocked,true);
  assert.equal(sourceVersion(file),streamMeta(file).sourceVersion);
});
test('tus transfer creates one tagged identity, checkpoints privately, and confirms bytes from the same upload', async () => {
  const edits=[],chunks=[],calls=[]; let offset=0;
  const provider = new StreamProvider(account,'cf-secret',async(url,options)=>{
    calls.push({url,method:options.method,headers:options.headers});
    if(options.method==='POST'&&url.endsWith('/stream')) return new Response(null,{status:201,headers:{Location:`https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}`,'stream-media-id':uid}});
    if(options.method==='POST') {edits.push(JSON.parse(options.body).meta);return json(record());}
    if(options.method==='HEAD')return new Response(null,{status:200,headers:{'Upload-Offset':String(offset)}});
    if(options.method==='PATCH'){offset+=options.body.byteLength;return new Response(null,{status:204,headers:{'Upload-Offset':String(offset)}});} throw Error('unexpected request');
  });
  const drive={chunk:async(f,start,end)=>{chunks.push([start,end]);return new ArrayBuffer(end-start);}};
  const result=await transferFile(file,null,drive,provider); assert.equal(result.complete,true); assert.deepEqual(chunks,[[0,12]]); assert.equal(calls.filter(c=>c.url.endsWith('/stream')).length,1);
  assert.ok(edits[0].uploadSession); assert.equal(edits[1].uploadSession,undefined); assert.equal(edits[0].driveId,file.providerId); assert.equal(calls[0].headers['Upload-Creator'],STREAM_APP);
  assert.ok(!JSON.stringify(calls).includes('google-secret'));
});
test('an interrupted tus transfer resumes from Cloudflare acknowledgement without allocating another copy', async () => {
  let offset=4,allocations=0; const chunks=[];
  const provider=new StreamProvider(account,'secret',async(url,options)=>{
    if(options.method==='HEAD')return new Response(null,{status:200,headers:{'Upload-Offset':String(offset)}});
    if(options.method==='PATCH'){offset+=options.body.byteLength;return new Response(null,{status:204,headers:{'Upload-Offset':String(offset)}});}
    if(options.method==='POST'&&url.endsWith('/stream')) allocations++;
    return json(record());
  });
  const existing=record({status:{state:'pendingupload'},meta:{...streamMeta(file),uploadSession:`${provider.base}/${uid}`}});
  const result=await transferFile(file,existing,{chunk:async(f,a,b)=>{chunks.push([a,b]);return new ArrayBuffer(b-a);}},provider);
  assert.equal(result.complete,true);assert.deepEqual(chunks,[[4,12]]);assert.equal(allocations,0);
});
test('unexpected upload hosts and missing checkpoints fail without credential leakage or duplicate allocation', async () => {
  const provider=new StreamProvider(account,'secret',()=>{throw Error('must not send');});
  assert.throws(()=>provider.safeUploadUrl('https://attacker.test/upload'));
  assert.throws(()=>provider.safeUploadUrl(''));
  await assert.rejects(()=>transferFile(file,record({meta:streamMeta(file)}),{},provider),/duplicate was not created/);
});
test('Drive byte reads require the correct range, and paid sync cannot run while disabled', async () => {
  const reader=new GoogleReader({},async()=>new Response(new Uint8Array(12),{status:200,headers:{'Content-Length':'12'}})); reader.accessToken='google-secret';reader.expiry=Date.now()+100000;
  await assert.rejects(()=>reader.chunk(file,4,12),/byte range/);
  await assert.rejects(()=>runSync({}, {apply:true}),/disabled/);
});
test('owner Drive listing uses read authorization, paginates fixed folders, and keeps real duration metadata', async () => {
  const folders=['1lVR5Pc-6SupJOfLIhcRE-oo69FUDM5Sm','17CFKIazhQJTGXvlHP5sa1mqlvu9p-2i1']; let reads=0;
  const reader=new GoogleReader({GOOGLE_OAUTH_CLIENT_ID:'owner-client',GOOGLE_OAUTH_CLIENT_SECRET:'owner-secret',GOOGLE_DRIVE_REFRESH_TOKEN:'owner-refresh'},async(url,options)=>{
    if(url==='https://oauth2.googleapis.com/token'){assert.equal(options.body.get('grant_type'),'refresh_token');return Response.json({access_token:'google-owner-token',expires_in:3600});}
    assert.equal(options.headers.Authorization,'Bearer google-owner-token'); const q=new URL(url).searchParams;
    assert.ok(q.get('q').includes('trashed = false')); assert.ok(folders.some(id=>q.get('q').includes(id)));reads++;
    const folder=q.get('q').includes(folders[0])?folders[0]:folders[1];
    return Response.json({files:[{id:folder===folders[0]?'drivevideo12345':'drivevideo67890',name:'0115.mp4',mimeType:'video/mp4',parents:[folder],size:'12',modifiedTime:file.updatedAt,videoMediaMetadata:{durationMillis:'60000'},capabilities:{canDownload:true}}]});
  });
  const files=await reader.list();assert.equal(reads,2);assert.equal(files.length,2);assert.ok(files.every(f=>f.duration===60));assert.equal(files[0].dance,'Bachata');
});
test('a lost tus response checks acknowledged bytes and finishes the original identity', async () => {
  let position=0; const existing=record({status:{state:'pendingupload'},meta:{...streamMeta(file),uploadSession:`https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}`}});
  const provider=new StreamProvider(account,'secret',async(url,options)=>{
    if(options.method==='HEAD')return new Response(null,{headers:{'Upload-Offset':String(position)}});
    if(options.method==='PATCH'){position=12;throw new Error('network response lost');} return json(record());
  });
  const result=await transferFile(file,existing,{chunk:async()=>new ArrayBuffer(12)},provider);assert.equal(result.complete,true);assert.equal(result.uid,uid);
});
test('a bounded apply run blocks the second new video when the cumulative storage allowance is consumed', async () => {
  const ids=['drivevideo12345','drivevideo67890'];let creations=0;
  const fetcher=async(url,options)=>{
    if(url==='https://oauth2.googleapis.com/token')return Response.json({access_token:'google-token',expires_in:3600});
    if(url.startsWith('https://www.googleapis.com/drive/v3/files?')) {
      const salsa=new URL(url).searchParams.get('q').includes(folderId);
      return Response.json({files:salsa?ids.map(id=>({id,name:id+'.mp4',mimeType:'video/mp4',parents:[folderId],size:'12',modifiedTime:file.updatedAt,videoMediaMetadata:{durationMillis:'60000'}})):[]});
    }
    if(url.includes('?alt=media'))return new Response(new Uint8Array(12),{headers:{'Content-Length':'12'}});
    if(options.method==='HEAD')return new Response(null,{headers:{'Upload-Offset':'0'}});
    if(options.method==='PATCH')return new Response(null,{status:204,headers:{'Upload-Offset':'12'}});
    if(options.method==='POST'&&url.endsWith('/stream')){creations++;return new Response(null,{status:201,headers:{Location:`https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}`,'stream-media-id':uid}});}
    if(options.method==='POST')return json(record());
    return json([]);
  };
  const result=await runSync({STREAM_SYNC_ENABLED:'true',STREAM_MAX_STORED_MINUTES:'1',STREAM_MAX_NEW_PER_RUN:'2',CLOUDFLARE_ACCOUNT_ID:account,CLOUDFLARE_STREAM_API_TOKEN:'cf-token',GOOGLE_OAUTH_CLIENT_ID:'id',GOOGLE_OAUTH_CLIENT_SECRET:'secret',GOOGLE_DRIVE_REFRESH_TOKEN:'refresh'},{apply:true,fetcher});
  assert.equal(creations,1);assert.equal(result.started,1);assert.equal(result.blocked.length,1);assert.equal(result.completedUploads,1);
});

import { reconcileSource } from "../../core/sources";
import { planNumbering, stagedUploadNames } from "../../core/numbering";
import type { CloudFolder, Library } from "../../core/types";
import { prepareNamedCopy } from "../phoneCopies";
import { deleteMedia } from "../media";
import { vault } from "./vault";
import type { PendingUpload } from "./uploadEngine";
import { provider } from "./provider";
const active = new Map<string, Promise<void>>();
export type ScanStore = {
  getLibrary: () => Library;
  commit: (action: (l: Library) => Library) => Promise<Library>;
};
export function scanSource(store: ScanStore, sourceId: string) {
  if (active.has(sourceId)) return active.get(sourceId)!;
  const task = scan(store, sourceId).finally(() => active.delete(sourceId));
  active.set(sourceId, task);
  return task;
}
async function scan(store: ScanStore, sourceId: string) {
  const before = store.getLibrary();
  const source = before.sources.find((s) => s.id === sourceId);
  const connection = before.connections.find(
    (c) => c.id === source?.connectionId,
  );
  if (!source || !connection?.connected)
    throw new Error("Reconnect this source first.");
  const adapter = provider(connection);
  const info = await adapter.inspectFolder(source.folderId);
  const { videos } = await adapter.listVideos(source);
  // Reserve all identities before any remote rename. A failed scan or rename does
  // not reuse a number, lose notes or falsely remove unseen files.
  let planned: CloudFolder = source;
  await store.commit((l) => {
    const current = l.sources.find((s) => s.id === source.id);
    if (
      !current ||
      current.connectionId !== source.connectionId ||
      current.folderId !== source.folderId
    )
      throw new Error("The source changed during refresh. Try again.");
    planned = {
      ...current,
      writable: info.writable,
      numbering: planNumbering(current, videos).numbering,
    };
    return reconcileSource(l, planned, videos);
  });
  const names = planNumbering(planned, videos).names;
  const pendingNames = new Set(stagedUploadNames(planned).keys());
  const pendingIds = new Set<string>();
  // A completed-but-unregistered job must still be found at its saved path after
  // a lost acknowledgement. Do not let discovery rename it ahead of resume.
  for (const video of store.getLibrary().videos.filter((v) => !v.remote)) {
    const jobId = await vault.get(`upload-for-${video.id}`);
    if (!jobId) continue;
    const raw = await vault.get(`upload-${jobId}`);
    if (!raw) continue;
    const pending: PendingUpload = JSON.parse(raw);
    if (pending.sourceId !== source.id) continue;
    if (pending.fileId) pendingIds.add(pending.fileId);
    if (pending.path) pendingNames.add(pending.path.split("/").pop()!);
  }

  let failures = 0;
  for (const file of videos) {
    const name = names.get(file.fileId)!;
    if (
      file.name === name ||
      pendingNames.has(file.name) ||
      pendingIds.has(file.fileId)
    )
      continue;
    if (!connection.writable || !info.writable) {
      failures++;
      continue;
    }
    try {
      await adapter.renameVideo(file.fileId, name, planned.folderId);
    } catch {
      failures++;
    }
  }
  await store.commit((l) => {
    const current = l.sources.find((s) => s.id === source.id);
    if (!current) return l;
    return reconcileSource(
      l,
      {
        ...current,
        writable: info.writable,
        error: failures
          ? `${failures} cloud filename(s) could not be numbered. BailaCue numbers are saved; allow uploads/write access and refresh to retry.`
          : undefined,
      },
      videos,
    );
  });
  // Rename cached phone copies only after the source identities/numbers are saved.
  for (const video of store
    .getLibrary()
    .videos.filter(
      (v) => v.remote?.sourceIds.includes(source.id) && v.offlineUri,
    )) {
    const oldUri = video.offlineUri!;
    const name = names.get(video.remote!.fileId);
    if (!name) continue;
    try {
      const uri = await prepareNamedCopy(oldUri, name, video.id);
      if (uri !== oldUri) {
        await store.commit((l) => ({
          ...l,
          videos: l.videos.map((v) =>
            v.id === video.id && v.offlineUri === oldUri
              ? { ...v, offlineUri: uri }
              : v,
          ),
        }));
        await deleteMedia(oldUri);
      }
    } catch {
      await store.commit((l) => ({
        ...l,
        sources: l.sources.map((s) =>
          s.id === source.id
            ? {
                ...s,
                error:
                  `${s.error ?? ""} A phone copy could not be renamed; the original copy was kept. Refresh to retry.`.trim(),
              }
            : s,
        ),
      }));
    }
  }
}

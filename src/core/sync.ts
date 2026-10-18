import { emptyLibrary, type Library } from "./types";
// Explicitly allow fields: never send local paths, OAuth/session credentials or upload jobs.
export function metadataSnapshot(library: Library) {
  return {
    version: 1,
    videos: library.videos.map((v) => ({
      id: v.id,
      title: v.title,
      duration: v.duration,
      mimeType: v.mimeType,
      size: v.size,
      style: v.style,
      labels: v.labels,
      importance: v.importance,
      status: v.status,
      teacher: v.teacher,
      className: v.className,
      location: v.location,
      lessonDate: v.lessonDate,
      createdAt: v.createdAt,
      lastPractisedAt: v.lastPractisedAt,
      resume: v.resume,
      segments: v.segments,
      bookmarks: v.bookmarks,
      notes: v.notes,
      available: v.available,
      source: v.source,
      parentId: v.parentId,
      sharedGrantId: v.sharedGrantId,
      remote: v.remote,
    })),
    connections: library.connections.map((c) => ({
      id: c.id,
      provider: c.provider,
      accountId: c.accountId,
      name: c.name,
      email: c.email,
      writable: c.writable,
      connected: false,
    })),
    sources: library.sources.map(({ error: _error, ...s }) => s),
    sessions: library.sessions,
    playlists: library.playlists,
    picks: library.picks,
    feedback: library.feedback,
    preferences: library.preferences,
  };
}
export function restoreSnapshot(
  snapshot: ReturnType<typeof metadataSnapshot>,
  local: Library,
): Library {
  return {
    ...emptyLibrary(),
    ...snapshot,
    version: 1,
    cloudSettings: local.cloudSettings,
    deviceLock: local.deviceLock,
    reminders: local.reminders,
    connections: snapshot.connections.map((c) => ({
      ...c,
      connected: local.connections.some(
        (own) => own.id === c.id && own.connected,
      ),
    })),
    videos: snapshot.videos.map((v) => {
      const own = local.videos.find((l) => l.id === v.id);
      return {
        ...v,
        uri: own?.uri ?? "",
        offlineUri: own?.offlineUri,
        thumbnail: own?.thumbnail,
        storagePreference: own?.storagePreference ?? "online",
        available: v.remote ? v.available : !!own?.uri,
      };
    }),
  };
}

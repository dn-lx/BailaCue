import {
  uid,
  type Library,
  type LearningStatus,
  type DanceStyle,
  type Video,
} from "./types";
export type Filters = {
  query?: string;
  style?: DanceStyle;
  status?: LearningStatus;
  minImportance?: number;
};
export function filterVideos(videos: Video[], f: Filters) {
  const terms = (f.query ?? "")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return videos.filter(
    (v) =>
      (!f.style || v.style === f.style) &&
      (!f.status || v.status === f.status) &&
      v.importance >= (f.minImportance ?? 1) &&
      terms.every((term) =>
        [v.title, ...v.labels, v.teacher, v.className, v.location]
          .join(" ")
          .toLowerCase()
          .includes(term),
      ),
  );
}
export function removeVideo(library: Library, id: string): Library {
  return {
    ...library,
    videos: library.videos.filter((v) => v.id !== id),
    playlists: library.playlists.map((p) => ({
      ...p,
      videoIds: p.videoIds.filter((i) => i !== id),
    })),
    picks: library.picks.map((p) => ({
      ...p,
      videoIds: p.videoIds.filter((i) => i !== id),
    })),
    feedback: Object.fromEntries(
      Object.entries(library.feedback).filter(([key]) => key !== id),
    ),
  };
}

export function videoFromExport(
  original: Video,
  output: { uri: string; duration: number; size: number; thumbnail?: string },
): Video {
  return {
    ...original,
    ...output,
    thumbnail: output.thumbnail,
    id: uid(),
    parentId: original.id,
    title: `${original.title} · practice clip`,
    labels: [...new Set([...original.labels, "Practice clip"])],
    createdAt: new Date().toISOString(),
    status: "Practising",
    lastPractisedAt: undefined,
    resume: 0,
    notes: [],
    bookmarks: [],
    segments: [],
    source: "device",
    mimeType: "video/mp4",
    remote: undefined,
    sharedGrantId: undefined,
    offlineUri: undefined,
    storagePreference: undefined,
    available: true,
  };
}

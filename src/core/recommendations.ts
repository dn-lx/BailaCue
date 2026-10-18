import { localDay } from "./practice";
import type { Library, Video } from "./types";
const DAY = 86400000;
export const minimumPickRating = (library: Library) =>
  Math.max(1, Math.min(5, library.preferences.minPickRating ?? 1));
const eligible = (library: Library, video: Video) =>
  video.available && video.importance >= minimumPickRating(library);
const selectionKey = (library: Library) => {
  const p = library.preferences;
  return `rating-first-v1:${p.onePerStyle !== false ? [...new Set(p.styles)].sort().join(",") : `total-${p.count}`}:${minimumPickRating(library)}`;
};
export function rankCandidates(
  library: Library,
  now = new Date(),
  ignoreCooldown = false,
): { video: Video; score: number; reason: string }[] {
  const { preferences: p } = library;
  const recentlyPicked = new Set(
    library.picks
      .filter(
        (pick) =>
          (now.getTime() - new Date(`${pick.day}T12:00:00`).getTime()) / DAY <
            p.cooldownDays && pick.day !== localDay(now),
      )
      .flatMap((x) => x.videoIds),
  );
  return library.videos
    .filter(
      (v) =>
        eligible(library, v) && (ignoreCooldown || !recentlyPicked.has(v.id)),
    )
    .map((video) => {
      const matches = video.labels.filter((l) =>
        p.labels.some((pref) => pref.toLowerCase() === l.toLowerCase()),
      );
      const styleMatch = p.styles.includes(video.style);
      const lastPractice = video.lastPractisedAt
        ? Date.parse(video.lastPractisedAt)
        : NaN;
      const daysSince = Number.isFinite(lastPractice)
        ? Math.max(0, (now.getTime() - lastPractice) / DAY)
        : 30;
      // This score only breaks ties within the same star rating.
      const score =
        matches.length * 12 +
        (styleMatch ? 8 : 0) +
        (video.status === "To learn"
          ? 8
          : video.status === "Practising"
            ? 6
            : -8) +
        (!video.lastPractisedAt ? 6 : 0) +
        Math.min(daysSince, 30) / 3 +
        (library.feedback[video.id] ?? 0) * 6;
      return {
        video,
        score,
        reason: `${video.importance}-star ${video.style} · ${matches.length ? `Matches your ${matches[0].toLowerCase()} preference.` : video.status === "Learned" ? "A familiar move for review." : "Chosen for your practice mix."}`,
      };
    })
    .sort(
      (a, b) =>
        b.video.importance - a.video.importance ||
        b.score - a.score ||
        a.video.id.localeCompare(b.video.id),
    );
}
export function choosePicks(library: Library, now = new Date()): string[] {
  let candidates = rankCandidates(library, now);
  if (library.preferences.onePerStyle !== false) {
    const fallback = rankCandidates(library, now, true);
    // Cooldown fallback is independent for each style. Never substitute a second
    // Salsa for a missing Bachata (or silently lower the user's minimum rating).
    return [...new Set(library.preferences.styles)].flatMap((style) => {
      const next =
        candidates.find((c) => c.video.style === style) ??
        fallback.find((c) => c.video.style === style);
      return next ? [next.video.id] : [];
    });
  }
  if (!candidates.length) candidates = rankCandidates(library, now, true);
  const chosen: string[] = [];
  const usedStyles = new Set<string>();
  const usedLabels = new Set<string>();
  while (chosen.length < library.preferences.count && candidates.length) {
    candidates.sort(
      (a, b) =>
        b.video.importance - a.video.importance ||
        b.score -
          (usedStyles.has(b.video.style) ? 5 : 0) -
          b.video.labels.filter((x) => usedLabels.has(x)).length * 4 -
          (a.score -
            (usedStyles.has(a.video.style) ? 5 : 0) -
            a.video.labels.filter((x) => usedLabels.has(x)).length * 4) ||
        a.video.id.localeCompare(b.video.id),
    );
    const next = candidates.shift()!.video;
    chosen.push(next.id);
    usedStyles.add(next.style);
    next.labels.forEach((x) => usedLabels.add(x));
  }
  return chosen;
}
export function refreshDailyPicks(library: Library, now = new Date()): Library {
  const day = localDay(now);
  return {
    ...library,
    picks: [
      ...library.picks.filter((p) => p.day !== day).slice(-89),
      {
        day,
        videoIds: choosePicks(library, now),
        skipped: false,
        selectionKey: selectionKey(library),
      },
    ],
  };
}
export function ensureDailyPick(library: Library, now = new Date()): Library {
  if (!library.preferences.picksEnabled) return library;
  const day = localDay(now);
  const saved = library.picks.find((p) => p.day === day);
  if (saved?.skipped) return library;
  if (
    saved?.selectionKey === selectionKey(library) &&
    saved.videoIds.every((id) =>
      library.videos.some((v) => v.id === id && eligible(library, v)),
    )
  ) {
    if (library.preferences.onePerStyle !== false && saved.videoIds.length) {
      const styles = new Set(
        library.videos
          .filter((v) => saved.videoIds.includes(v.id))
          .map((v) => v.style),
      );
      const additions = choosePicks(library, now).filter(
        (id) => !styles.has(library.videos.find((v) => v.id === id)!.style),
      );
      if (additions.length)
        return {
          ...library,
          picks: library.picks.map((p) =>
            p.day === day
              ? { ...p, videoIds: [...p.videoIds, ...additions] }
              : p,
          ),
        };
    }
    if (
      saved.videoIds.length ||
      !library.videos.some((v) => eligible(library, v))
    )
      return library;
  }
  return refreshDailyPicks(library, now);
}

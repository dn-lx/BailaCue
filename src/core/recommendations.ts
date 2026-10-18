import { localDay } from "./practice";
import type { Library, Video } from "./types";
const DAY = 86400000;
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
    .filter((v) => v.available && (ignoreCooldown || !recentlyPicked.has(v.id)))
    .map((video) => {
      const matches = video.labels.filter((l) =>
        p.labels.some((pref) => pref.toLowerCase() === l.toLowerCase()),
      );
      const styleMatch = p.styles.includes(video.style);
      const daysSince = video.lastPractisedAt
        ? Math.max(0, (now.getTime() - Date.parse(video.lastPractisedAt)) / DAY)
        : 30;
      const score =
        matches.length * 12 +
        (styleMatch ? 8 : 0) +
        video.importance * 3 +
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
        reason: matches.length
          ? `Matches your ${video.style} ${matches[0].toLowerCase()} preference.`
          : styleMatch
            ? `A little ${video.style} for your next practice.`
            : video.status === "Learned"
              ? "Bring a familiar move back for a review."
              : "Something fresh from your library.",
      };
    })
    .sort((a, b) => b.score - a.score || a.video.id.localeCompare(b.video.id));
}
export function choosePicks(library: Library, now = new Date()): string[] {
  let candidates = rankCandidates(library, now);
  if (!candidates.length) candidates = rankCandidates(library, now, true);
  const chosen: string[] = [];
  const usedStyles = new Set<string>();
  const usedLabels = new Set<string>();
  while (chosen.length < library.preferences.count && candidates.length) {
    candidates.sort(
      (a, b) =>
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
export function ensureDailyPick(library: Library, now = new Date()): Library {
  if (!library.preferences.picksEnabled) return library;
  const day = localDay(now);
  const saved = library.picks.find((p) => p.day === day);
  if (
    saved &&
    (saved.skipped ||
      saved.videoIds.length > 0 ||
      !library.videos.some((v) => v.available)) &&
    saved.videoIds.every((id) =>
      library.videos.some((v) => v.id === id && v.available),
    )
  )
    return library;
  return {
    ...library,
    picks: [
      ...library.picks.filter((p) => p.day !== day).slice(-89),
      { day, videoIds: choosePicks(library, now), skipped: false },
    ],
  };
}

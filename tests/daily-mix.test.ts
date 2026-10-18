import { expect, it } from "vitest";
import { emptyLibrary, type Video } from "../src/core/types";
import {
  choosePicks,
  ensureDailyPick,
  rankCandidates,
  refreshDailyPicks,
} from "../src/core/recommendations";
const now = new Date("2026-10-18T12:00:00");
const video = (
  id: string,
  style: Video["style"],
  importance: number,
  changes: Partial<Video> = {},
): Video => ({
  id,
  title: id,
  style,
  importance,
  source: "device",
  uri: `file:///${id}.mp4`,
  duration: 6,
  size: 100,
  available: true,
  status: "To learn",
  labels: [],
  teacher: "",
  className: "",
  location: "",
  lessonDate: "",
  createdAt: "now",
  resume: 0,
  segments: [],
  bookmarks: [],
  notes: [],
  ...changes,
});
it("defaults to one Salsa and one Bachata, even when several Salsa videos have higher ratings", () => {
  const l = emptyLibrary();
  l.videos = [
    video("s1", "Salsa", 5),
    video("s2", "Salsa", 5),
    video("b1", "Bachata", 2),
  ];
  expect(choosePicks(l, now)).toEqual(["b1", "s1"]);
});
it("lets rating outrank any number of label matches or recommendation-feedback bonuses", () => {
  const l = emptyLibrary();
  l.preferences.labels = Array.from({ length: 100 }, (_, i) => `Label ${i}`);
  l.videos = [
    video("preferred", "Salsa", 4, { labels: l.preferences.labels }),
    video("five-stars", "Salsa", 5),
  ];
  l.feedback.preferred = 3;
  l.feedback["five-stars"] = -3;
  expect(rankCandidates(l, now)[0].video.id).toBe("five-stars");
  expect(choosePicks(l, now)).toEqual(["five-stars"]);
});
it("applies cooldown fallback per style, without relaxing the minimum rating", () => {
  const l = emptyLibrary();
  l.preferences.minPickRating = 4;
  l.videos = [
    video("s", "Salsa", 5),
    video("b", "Bachata", 4),
    video("b-low", "Bachata", 3),
  ];
  l.picks = [{ day: "2026-10-17", videoIds: ["s"], skipped: false }];
  expect(choosePicks(l, now)).toEqual(["b", "s"]);
  l.videos[1].available = false;
  expect(choosePicks(l, now)).toEqual(["s"]);
});
it("rests a recent five-star video when another eligible video of that style exists", () => {
  const l = emptyLibrary();
  l.videos = [
    video("s-recent", "Salsa", 5),
    video("s-next", "Salsa", 4),
    video("b", "Bachata", 5),
  ];
  l.picks = [{ day: "2026-10-17", videoIds: ["s-recent"], skipped: false }];
  expect(choosePicks(l, now)).toEqual(["b", "s-next"]);
});
it("leaves missing styles empty and excludes unavailable, low-rated and unselected styles", () => {
  const l = emptyLibrary();
  l.preferences.minPickRating = 4;
  l.videos = [
    video("s1", "Salsa", 5),
    video("s2", "Salsa", 4),
    video("b-low", "Bachata", 3),
    video("b-missing", "Bachata", 5, { available: false }),
    video("other", "Other", 5),
  ];
  expect(choosePicks(l, now)).toEqual(["s1"]);
  l.preferences.styles = [];
  expect(choosePicks(l, now)).toEqual([]);
});
it("supports an explicit total-count mode without letting variety outrank star ratings", () => {
  const l = emptyLibrary();
  l.preferences.onePerStyle = false;
  l.preferences.count = 2;
  l.videos = [
    video("s1", "Salsa", 5),
    video("s2", "Salsa", 5),
    video("b", "Bachata", 4),
  ];
  expect(choosePicks(l, now)).toEqual(["s1", "s2"]);
});
it("keeps today's selection stable after a rating change, then explicitly updates it", () => {
  let l = emptyLibrary();
  l.videos = [
    video("s1", "Salsa", 5),
    video("s2", "Salsa", 4),
    video("b", "Bachata", 5),
  ];
  l = ensureDailyPick(l, now);
  l.videos[0].importance = 2;
  expect(ensureDailyPick(l, now).picks.at(-1)?.videoIds).toEqual(["b", "s1"]);
  const refreshed = refreshDailyPicks(l, now);
  expect(refreshed.picks.at(-1)?.videoIds).toEqual(["b", "s2"]);
  expect(refreshed.picks.filter((p) => p.day === "2026-10-18")).toHaveLength(1);
});
it("upgrades an older saved selection once and fills newly available style slots without replacing existing picks", () => {
  let l = emptyLibrary();
  l.videos = [video("s1", "Salsa", 5), video("s2", "Salsa", 4)];
  l.picks = [{ day: "2026-10-18", videoIds: ["s2"], skipped: false }];
  l = ensureDailyPick(l, now);
  expect(l.picks.at(-1)?.videoIds).toEqual(["s1"]);
  l.videos[0].importance = 2;
  l.videos.push(video("b", "Bachata", 5));
  expect(ensureDailyPick(l, now).picks.at(-1)?.videoIds).toEqual(["s1", "b"]);
});
it("updates a changed daily mix or rating threshold while preserving Skip today", () => {
  let l = emptyLibrary();
  l.videos = [video("s", "Salsa", 5), video("b", "Bachata", 3)];
  l = ensureDailyPick(l, now);
  l.preferences.minPickRating = 4;
  l = ensureDailyPick(l, now);
  expect(l.picks.at(-1)?.videoIds).toEqual(["s"]);
  l.picks[l.picks.length - 1].skipped = true;
  l.preferences.styles = ["Bachata"];
  expect(ensureDailyPick(l, now)).toBe(l);
  expect(l.feedback).toEqual({});
});
it("uses new balanced defaults for an older library without the optional settings fields", () => {
  const l = emptyLibrary();
  delete l.preferences.onePerStyle;
  delete l.preferences.minPickRating;
  l.videos = [video("s", "Salsa", 5), video("b", "Bachata", 4)];
  expect(choosePicks(l, now)).toEqual(["b", "s"]);
});

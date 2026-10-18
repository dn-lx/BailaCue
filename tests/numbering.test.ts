import { expect, it } from "vitest";
import { planNumbering, reserveUploadNumber } from "../src/core/numbering";
import { emptyLibrary, type CloudFolder } from "../src/core/types";
import { reconcileSource } from "../src/core/sources";
import { metadataSnapshot, restoreSnapshot } from "../src/core/sync";
const source: CloudFolder = {
  id: "s",
  connectionId: "c",
  provider: "google-drive",
  folderId: "folder",
  name: "Salsa",
  defaultStyle: "Bachata",
  defaultLabels: [],
  writable: true,
};
const file = (fileId: string, name = fileId + ".mp4") => ({
  fileId,
  name,
  mimeType: "video/mp4",
  size: 10,
  duration: 6,
  modifiedAt: "",
  canDownload: true,
});
it("assigns deterministic per-source numbers and never reuses removed identities", () => {
  let plan = planNumbering(source, [file("z"), file("a")]);
  expect(plan.names.get("a")).toBe("0001 — a.mp4");
  expect(plan.names.get("z")).toBe("0002 — z.mp4");
  plan = planNumbering({ ...source, numbering: plan.numbering }, [
    file("z"),
    file("outside"),
  ]);
  expect(plan.names.get("z")).toBe("0002 — z.mp4");
  expect(plan.names.get("outside")).toBe("0003 — outside.mp4");
  expect(
    planNumbering({ ...source, id: "b", numbering: undefined }, [
      file("b"),
    ]).names.get("b"),
  ).toBe("0001 — b.mp4");
});
it("adopts existing numeric prefixes and repairs duplicates without renumbering existing files", () => {
  const plan = planNumbering(source, [
    file("a", "0020 — Turn.mp4"),
    file("b", "0020 — Step.mp4"),
    file("c", "Fresh.mp4"),
  ]);
  expect(
    new Set(Object.values(plan.numbering.files).map((e) => e.number)).size,
  ).toBe(3);
  expect(
    Math.max(...Object.values(plan.numbering.files).map((e) => e.number)),
  ).toBe(22);
  const again = planNumbering({ ...source, numbering: plan.numbering }, [
    file("c"),
    file("b"),
    file("a"),
  ]);
  expect(again.numbering).toEqual(plan.numbering);
});
it("pins a reserved upload number across retry and advances the next external discovery", () => {
  const a = reserveUploadNumber(source, "job", "Turn.mp4");
  const retry = reserveUploadNumber(
    { ...source, numbering: a.numbering },
    "job",
    "Changed.mp4",
  );
  expect(retry).toEqual(a);
  const next = planNumbering({ ...source, numbering: a.numbering }, [
    file("external"),
  ]);
  expect(next.names.get("external")).toBe("0002 — external.mp4");
});
it("retains numbers, notes and explicit ratings on refresh and metadata restore", () => {
  const l = emptyLibrary();
  l.sources = [source];
  l.connections = [
    {
      id: "c",
      provider: "google-drive",
      accountId: "account",
      name: "Dancer",
      email: "test@example.com",
      connected: true,
      writable: true,
    },
  ];
  let next = reconcileSource(l, source, [file("a")]);
  expect(next.videos[0]).toMatchObject({
    title: "0001 — a",
    style: "Salsa",
    importance: 5,
    ratingSet: false,
  });
  next.videos[0] = {
    ...next.videos[0],
    importance: 2,
    ratingSet: true,
    notes: [{ id: "n", text: "Keep", createdAt: "now" }],
  };
  next = reconcileSource(next, next.sources[0], [
    file("a", "0001 — a.mp4"),
    file("outside"),
  ]);
  expect(next.videos[0]).toMatchObject({
    importance: 2,
    ratingSet: true,
    notes: [{ text: "Keep" }],
  });
  const restored = restoreSnapshot(metadataSnapshot(next), next);
  expect(restored.sources[0].numbering).toEqual(next.sources[0].numbering);
  expect(restored.videos[0].ratingSet).toBe(true);
});

it("reconciles a completed upload reservation once without giving duplicate files the same number", () => {
  const reserved = reserveUploadNumber(source, "job", "Turn.mp4");
  const plan = planNumbering({ ...source, numbering: reserved.numbering }, [
    file("first", reserved.name),
    file("duplicate", reserved.name),
  ]);
  expect(
    new Set([
      plan.numbering.files.first.number,
      plan.numbering.files.duplicate.number,
    ]).size,
  ).toBe(2);
  expect(plan.numbering.files["upload:job"]).toBeUndefined();
});

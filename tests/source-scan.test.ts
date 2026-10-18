import { beforeEach, expect, it, vi } from "vitest";
import { emptyLibrary, type Library } from "../src/core/types";
const remote = vi.hoisted(() => ({
  inspectFolder: vi.fn(),
  listVideos: vi.fn(),
  renameVideo: vi.fn(),
  prepare: vi.fn(),
  remove: vi.fn(),
  get: vi.fn(),
}));
vi.mock("../src/services/cloud/vault", () => ({ vault: { get: remote.get } }));
vi.mock("../src/services/cloud/provider", () => ({ provider: () => remote }));
vi.mock("../src/services/phoneCopies", () => ({
  prepareNamedCopy: remote.prepare,
}));
vi.mock("../src/services/media", () => ({ deleteMedia: remote.remove }));
import { scanSource } from "../src/services/cloud/scan";
function fixture() {
  let library = emptyLibrary();
  library.connections = [
    {
      id: "c",
      provider: "google-drive",
      accountId: "own",
      name: "Dancer",
      email: "test@example.com",
      connected: true,
      writable: true,
    },
  ];
  library.sources = [
    {
      id: "s",
      connectionId: "c",
      provider: "google-drive",
      folderId: "folder",
      name: "Salsa",
      defaultStyle: "Salsa",
      defaultLabels: [],
      writable: true,
    },
  ];
  return {
    getLibrary: () => library,
    commit: vi.fn(async (action: (l: Library) => Library) => {
      library = action(library);
      return library;
    }),
  };
}
const file = {
  fileId: "id:one",
  name: "Turn.mp4",
  mimeType: "video/mp4",
  size: 10,
  duration: 6,
  modifiedAt: "",
  canDownload: true,
};
beforeEach(() => {
  vi.clearAllMocks();
  remote.get.mockResolvedValue(null);
  remote.inspectFolder.mockResolvedValue({ writable: true });
  remote.listVideos.mockResolvedValue({ videos: [file] });
  remote.renameVideo.mockResolvedValue(undefined);
});
it("saves a numbering reservation before renaming the exact source file and discovers later additions", async () => {
  const store = fixture();
  remote.renameVideo.mockImplementation(async () => {
    expect(
      store.getLibrary().sources[0].numbering?.files[file.fileId].number,
    ).toBe(1);
  });
  await scanSource(store, "s");
  expect(remote.renameVideo).toHaveBeenCalledWith(
    file.fileId,
    "0001 — Turn.mp4",
    "folder",
  );
  expect(store.getLibrary().videos[0].title).toBe("0001 — Turn");
  remote.renameVideo.mockResolvedValue(undefined);
  remote.listVideos.mockResolvedValue({
    videos: [
      { ...file, name: "0001 — Turn.mp4" },
      { ...file, fileId: "outside", name: "Outside.mp4" },
    ],
  });
  await scanSource(store, "s");
  expect(remote.renameVideo).toHaveBeenLastCalledWith(
    "outside",
    "0002 — Outside.mp4",
    "folder",
  );
  expect(store.getLibrary().videos).toHaveLength(2);
});
it("does not rename if reservations cannot be saved and keeps library entries on incomplete scans", async () => {
  const store = fixture();
  store.commit.mockRejectedValueOnce(new Error("Disk full"));
  await expect(scanSource(store, "s")).rejects.toThrow("Disk full");
  expect(remote.renameVideo).not.toHaveBeenCalled();
  await scanSource(store, "s");
  remote.listVideos.mockRejectedValueOnce(new Error("Page two failed"));
  await expect(scanSource(store, "s")).rejects.toThrow("Page two failed");
  expect(store.getLibrary().videos[0].available).toBe(true);
});
it("records remote rename failures for retry and commits phone references before removing old copies", async () => {
  const store = fixture();
  remote.renameVideo.mockRejectedValueOnce(new Error("Read only"));
  await scanSource(store, "s");
  expect(store.getLibrary().sources[0].error).toContain(
    "could not be numbered",
  );
  store.getLibrary().videos[0].offlineUri = "file:///owned/old.mp4";
  remote.prepare.mockResolvedValue("file:///owned/0001 — Turn.mp4");
  remote.remove.mockImplementation(async () => {
    expect(store.getLibrary().videos[0].offlineUri).toBe(
      "file:///owned/0001 — Turn.mp4",
    );
  });
  remote.renameVideo.mockResolvedValue(undefined);
  await scanSource(store, "s");
  expect(store.getLibrary().sources[0].error).toBeUndefined();
  expect(remote.remove).toHaveBeenCalledWith("file:///owned/old.mp4");
});

it("leaves completed legacy jobs at their saved path until resume registers the file", async () => {
  const store = fixture();
  store.getLibrary().videos.push({ id: "local", remote: undefined } as never);
  const staged = { ...file, name: "job-Turn.mp4" };
  remote.listVideos.mockResolvedValue({ videos: [staged] });
  remote.get.mockImplementation(async (key: string) =>
    key === "upload-for-local"
      ? "job"
      : JSON.stringify({
          sourceId: "s",
          path: "/Salsa/job-Turn.mp4",
          fileId: "",
          status: "interrupted",
        }),
  );
  await scanSource(store, "s");
  expect(remote.renameVideo).not.toHaveBeenCalled();
});

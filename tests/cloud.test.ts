import { describe, expect, it, vi } from "vitest";
import {
  emptyLibrary,
  type CloudFolder,
  type Connection,
} from "../src/core/types";
import { parseFolder, reconcileSource, remoteId } from "../src/core/sources";
import { DropboxProvider } from "../src/services/providers/dropbox";
import { defaultReminders, reminderSchedule } from "../src/core/reminders";
import { metadataSnapshot, restoreSnapshot } from "../src/core/sync";
import {
  uploadFile,
  type PendingUpload,
} from "../src/services/cloud/uploadEngine";
const connection: Connection = {
  id: "c",
  provider: "google-drive",
  accountId: "my-account",
  name: "Dancer",
  email: "dancer@example.com",
  writable: true,
  connected: true,
};
const source: CloudFolder = {
  id: "s",
  connectionId: "c",
  provider: "google-drive",
  folderId: "folder-a",
  name: "Salsa",
  defaultStyle: "Salsa",
  defaultLabels: ["Class"],
  writable: true,
};
const file = {
  fileId: "f",
  name: "Footwork.mp4",
  mimeType: "video/mp4",
  size: 10,
  duration: 30,
  modifiedAt: "",
  canDownload: true,
};
const response = (
  body: unknown,
  status = 200,
  headers?: Record<string, string>,
) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers,
  });
const pending: PendingUpload = {
  id: "unique-job",
  videoId: "local",
  sourceId: "s",
  provider: "google-drive",
  name: "Footwork.mp4",
  mimeType: "video/mp4",
  size: 10,
  fileId: "",
  offset: 0,
  status: "queued",
  keepCopy: true,
};
describe("user-selected sources", () => {
  it("deduplicates a file across folders and preserves all user edits after rename/reconnect", () => {
    let library = {
      ...emptyLibrary(),
      connections: [connection],
      sources: [source, { ...source, id: "s2", folderId: "folder-b" }],
    };
    library = reconcileSource(library, source, [file]);
    library.videos[0] = {
      ...library.videos[0],
      title: "My move",
      labels: ["Personal"],
      importance: 5,
      notes: [{ id: "note", text: "Small steps", createdAt: "now" }],
    };
    library = reconcileSource(library, library.sources[1], [
      { ...file, name: "Renamed.mp4" },
    ]);
    expect(library.videos).toHaveLength(1);
    expect(library.videos[0]).toMatchObject({
      title: "My move",
      labels: ["Personal"],
      importance: 5,
      remote: { sourceIds: ["s", "s2"] },
    });
    library = reconcileSource(library, source, []);
    expect(library.videos[0].available).toBe(true);
    library = reconcileSource(library, library.sources[1], []);
    expect(library.videos[0].available).toBe(false);
    library = reconcileSource(library, source, [file]);
    expect(library.videos[0].notes[0].text).toBe("Small steps");
    expect(library.videos[0].available).toBe(true);
    expect(remoteId({ ...connection, id: "new-device-connection" }, "f")).toBe(
      library.videos[0].id,
    );
    expect(
      remoteId({ ...connection, accountId: "someone-else" }, "f"),
    ).not.toBe(library.videos[0].id);
  });
  it("parses folder links/paths without confusing shared Dropbox links for folders", () => {
    expect(
      parseFolder(
        "google-drive",
        "https://drive.google.com/drive/folders/abc-123?usp=sharing",
      ),
    ).toBe("abc-123");
    expect(parseFolder("dropbox", "/Dance/Salsa/")).toBe("/Dance/Salsa");
    expect(() =>
      parseFolder("dropbox", "https://dropbox.com/s/a/video"),
    ).toThrow(/path/);
  });
  it("syncs metadata without paths, credentials, thumbnails or device preferences", () => {
    let library = reconcileSource(
      { ...emptyLibrary(), connections: [connection], sources: [source] },
      source,
      [file],
    );
    library.videos[0] = {
      ...library.videos[0],
      offlineUri: "file:///private/video.mp4",
      thumbnail: "file:///private/thumb.jpg",
      storagePreference: "offline",
    };
    const snapshot = metadataSnapshot(library),
      serialised = JSON.stringify(snapshot);
    expect(serialised).not.toContain("file://");
    expect(serialised).not.toContain("dropboxAppKey");
    expect(snapshot.connections[0].connected).toBe(false);
    expect(
      restoreSnapshot(snapshot, emptyLibrary()).videos[0].offlineUri,
    ).toBeUndefined();
    expect(restoreSnapshot(snapshot, library).videos[0].offlineUri).toBe(
      "file:///private/video.mp4",
    );
  });
});
describe("Dropbox adapter (mock HTTP)", () => {
  it("paginates nested folders and maps duration in milliseconds, excluding non-video files", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          entries: [
            {
              ".tag": "file",
              id: "id:v",
              name: "Move.mov",
              size: 10,
              media_info: {
                ".tag": "metadata",
                metadata: { ".tag": "video", duration: 12500 },
              },
            },
            { ".tag": "file", id: "id:txt", name: "readme.txt" },
          ],
          cursor: "next",
          has_more: true,
        }),
      )
      .mockResolvedValueOnce(
        response({
          entries: [{ ".tag": "file", id: "id:two", name: "Second.mp4" }],
          cursor: "done",
          has_more: false,
        }),
      );
    const adapter = new DropboxProvider(async () => "own-token", request);
    const videos = (
      await adapter.listVideos({
        ...source,
        provider: "dropbox",
        folderId: "/Dance/Salsa",
      })
    ).videos;
    expect(videos).toHaveLength(2);
    expect(videos[0].duration).toBe(12.5);
    expect(request.mock.calls[1][0]).toContain("list_folder/continue");
    expect(request.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer own-token",
    );
  });
  it("resolves a fresh temporary media link and refuses unexpected origins", async () => {
    const adapter = new DropboxProvider(
      async () => "token",
      vi
        .fn()
        .mockResolvedValue(response({ link: "https://evil.example/file" })),
    );
    await expect(adapter.playback("id:v")).rejects.toMatchObject({
      code: "invalid",
    });
  });
  it.each([
    [401, "reauth"],
    [403, "permission"],
    [409, "missing"],
  ])("handles Dropbox status %s", async (status, code) => {
    const adapter = new DropboxProvider(
      async () => "token",
      vi.fn().mockResolvedValue(response({}, status as number)),
    );
    await expect(adapter.inspectFolder("/private")).rejects.toMatchObject({
      code,
    });
  });
});
describe("upload initiation and safe recovery (mock HTTP)", () => {
  it("reserves a Drive ID before creating a session and confirms the final size", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(response({ ids: ["reserved"] }))
      .mockResolvedValueOnce(response({}, 404))
      .mockResolvedValueOnce(
        response(null, 200, {
          Location:
            "https://www.googleapis.com/upload/drive/v3/files?upload_id=one",
        }),
      )
      .mockResolvedValueOnce(response(null, 308))
      .mockResolvedValueOnce(response({ id: "reserved" }))
      .mockResolvedValueOnce(
        response({
          id: "reserved",
          name: "Footwork.mp4",
          mimeType: "video/mp4",
          size: "10",
          capabilities: { canDownload: true },
        }),
      );
    const states: PendingUpload[] = [];
    const result = await uploadFile(pending, "folder-a", {
      request,
      token: async () => "token",
      read: async (a, b) => new Blob([new Uint8Array(b - a)]),
      persist: async (j) => {
        states.push(j);
      },
    });
    expect(states[0].fileId).toBe("reserved");
    expect(result.fileId).toBe("reserved");
    expect(states.at(-1)?.status).toBe("ready");
    expect(JSON.parse(request.mock.calls[2][1].body).parents).toEqual([
      "folder-a",
    ]);
  });
  it("does not re-upload a completed Drive file after the completion response was lost", async () => {
    const request = vi.fn().mockResolvedValue(
      response({
        id: "reserved",
        name: "Move.mp4",
        mimeType: "video/mp4",
        size: "10",
      }),
    );
    await uploadFile(
      { ...pending, fileId: "reserved", status: "interrupted" },
      "folder",
      { request, token: async () => "token", read: vi.fn(), persist: vi.fn() },
    );
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][1].method).toBeUndefined();
  });
  it("resumes Dropbox after a lost acknowledgement without changing its unique destination", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(response({ error_summary: "path/not_found" }, 409))
      .mockResolvedValueOnce(
        response(
          { error: { ".tag": "incorrect_offset", correct_offset: 10 } },
          409,
        ),
      )
      .mockResolvedValueOnce(
        response({
          ".tag": "file",
          id: "id:done",
          name: "unique-Move.mp4",
          size: 10,
        }),
      );
    const states: PendingUpload[] = [];
    const result = await uploadFile(
      {
        ...pending,
        provider: "dropbox",
        sessionId: "session",
        path: "/Dance/unique-Move.mp4",
      },
      "/Dance",
      {
        request,
        token: async () => "token",
        read: async (a, b) => new Blob([new Uint8Array(b - a)]),
        persist: async (j) => {
          states.push(j);
        },
      },
    );
    expect(result.fileId).toBe("id:done");
    const commit = JSON.parse(
      request.mock.calls[2][1].headers["Dropbox-API-Arg"],
    ).commit;
    expect(commit).toMatchObject({
      path: "/Dance/unique-Move.mp4",
      mode: "add",
      autorename: false,
      strict_conflict: true,
    });
    expect(states.at(-1)?.status).toBe("ready");
  });
  it("keeps resumable state and never marks an interrupted upload ready", async () => {
    const persist = vi.fn();
    await expect(
      uploadFile({ ...pending, fileId: "reserved" }, "folder", {
        request: vi.fn().mockRejectedValue(new TypeError("Offline")),
        token: async () => "token",
        read: vi.fn(),
        persist,
      }),
    ).rejects.toThrow("Offline");
    expect(persist).toHaveBeenLastCalledWith(
      expect.objectContaining({ fileId: "reserved", status: "interrupted" }),
    );
  });
});
describe("local reminder plan", () => {
  it("moves late-night Saturday reminders to Sunday after quiet hours", () => {
    expect(
      reminderSchedule({ ...defaultReminders(), weekdays: [7], time: "23:15" }),
    ).toEqual([{ id: "bailacue-practice-7", weekday: 1, hour: 8, minute: 0 }]);
  });
  it("keeps early-morning quiet-hour reminders on the same day and removes duplicates", () => {
    expect(
      reminderSchedule({
        ...defaultReminders(),
        weekdays: [2, 2],
        time: "07:00",
      }),
    ).toEqual([{ id: "bailacue-practice-2", weekday: 2, hour: 8, minute: 0 }]);
  });
  it("leaves allowed times unchanged and validates invalid clock values", () => {
    expect(
      reminderSchedule({
        ...defaultReminders(),
        weekdays: [3],
        time: "18:30",
      })[0],
    ).toMatchObject({ weekday: 3, hour: 18, minute: 30 });
    expect(() =>
      reminderSchedule({ ...defaultReminders(), time: "25:00" }),
    ).toThrow(/HH:MM/);
  });
});

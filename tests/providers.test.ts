import { describe, expect, it, vi } from "vitest";
import { GoogleDriveProvider } from "../src/services/providers/googleDrive";
import { resumeUpload } from "../src/services/providers/upload";
import type { Source, UploadJob } from "../src/services/providers/types";
const source: Source = {
  id: "s",
  provider: "google-drive",
  connectionId: "c",
  folderId: "folder",
  name: "Salsa class",
  defaultStyle: "Salsa",
  defaultLabels: [],
  writable: true,
};
const job: UploadJob = {
  id: "j",
  sourceId: "s",
  fileId: "fixed-id",
  name: "dance.mp4",
  mimeType: "video/mp4",
  size: 10,
  sessionUrl: "https://www.googleapis.com/upload/drive/v3/files?upload_id=test",
  offset: 0,
  status: "queued",
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
describe("Google Drive adapter (mock HTTP)", () => {
  it("paginates, deduplicates IDs, and keeps two folders independent", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          files: [{ id: "a", name: "A", mimeType: "video/mp4" }],
          nextPageToken: "page2",
        }),
      )
      .mockResolvedValueOnce(
        response({
          files: [
            { id: "a", name: "A", mimeType: "video/mp4" },
            { id: "b", name: "B", mimeType: "video/mp4" },
          ],
        }),
      )
      .mockResolvedValueOnce(response({ files: [] }));
    const adapter = new GoogleDriveProvider(async () => "token", request);
    expect(
      (await adapter.listVideos(source)).videos.map((v) => v.fileId),
    ).toEqual(["a", "b"]);
    await adapter.listVideos({ ...source, folderId: "other-folder" });
    expect(decodeURIComponent(request.mock.calls[2][0])).toContain(
      "other-folder",
    );
    expect(request.mock.calls[1][0]).toContain("pageToken=page2");
  });
  it.each([
    [401, "reauth"],
    [403, "permission"],
    [404, "missing"],
  ])("handles status %s as %s", async (status, code) => {
    const adapter = new GoogleDriveProvider(
      async () => "token",
      vi.fn().mockResolvedValue(response({}, status as number)),
    );
    await expect(adapter.inspectFolder("folder")).rejects.toMatchObject({
      code,
    });
  });
  it("reports read-only folders", async () => {
    const adapter = new GoogleDriveProvider(
      async () => "token",
      vi
        .fn()
        .mockResolvedValue(
          response({
            id: "folder",
            name: "Class",
            mimeType: "application/vnd.google-apps.folder",
            capabilities: { canAddChildren: false },
          }),
        ),
    );
    expect((await adapter.inspectFolder("folder")).writable).toBe(false);
  });
});
describe("resumable upload transport", () => {
  it("queries server position and keeps file identity on retry", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(response(null, 308, { Range: "bytes=0-3" }))
      .mockResolvedValueOnce(response({ id: "fixed-id" }, 200));
    const states: UploadJob[] = [];
    const read = vi.fn(
      async (start: number, end: number) =>
        new Blob([new Uint8Array(end - start)]),
    );
    const result = await resumeUpload(
      job,
      read,
      async (j) => {
        states.push(j);
      },
      async () => "token",
      request,
    );
    expect(read).toHaveBeenCalledWith(4, 10);
    expect(result.status).toBe("ready");
    expect(states.every((j) => j.fileId === "fixed-id")).toBe(true);
    expect((request.mock.calls[1][1] as RequestInit).headers).toMatchObject({
      "Content-Range": "bytes 4-9/10",
    });
  });
  it("does not repeat a completed upload", async () => {
    const request = vi.fn();
    await resumeUpload(
      { ...job, status: "ready" },
      vi.fn(),
      vi.fn(),
      vi.fn(),
      request,
    );
    expect(request).not.toHaveBeenCalled();
  });
  it("preserves resumable state after interruption", async () => {
    const persist = vi.fn();
    await expect(
      resumeUpload(
        job,
        vi.fn(),
        persist,
        async () => "token",
        vi.fn().mockRejectedValue(new Error("Offline")),
      ),
    ).rejects.toThrow("Offline");
    expect(persist).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "interrupted", fileId: "fixed-id" }),
    );
  });
  it("rejects wrong provider IDs and invalid session origins", async () => {
    await expect(
      resumeUpload(
        job,
        vi.fn(),
        vi.fn(),
        async () => "token",
        vi.fn().mockResolvedValue(response({ id: "other" })),
      ),
    ).rejects.toMatchObject({ code: "invalid" });
    await expect(
      resumeUpload(
        { ...job, sessionUrl: "https://example.com/upload" },
        vi.fn(),
        vi.fn(),
        vi.fn(),
      ),
    ).rejects.toMatchObject({ code: "invalid" });
  });
});

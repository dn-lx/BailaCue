import {
  ProviderError,
  type RemoteVideo,
  type Source,
  type VideoProvider,
} from "./types";
const API = "https://www.googleapis.com/drive/v3";
type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  videoMediaMetadata?: { durationMillis?: string };
  capabilities?: { canAddChildren?: boolean; canDownload?: boolean };
  trashed?: boolean;
};
export function mapDriveVideo(file: DriveFile): RemoteVideo {
  return {
    fileId: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: Number(file.size ?? 0),
    duration: Number(file.videoMediaMetadata?.durationMillis ?? 0) / 1000,
    modifiedAt: file.modifiedTime ?? "",
    thumbnail: file.thumbnailLink,
    canDownload: file.capabilities?.canDownload ?? false,
  };
}
export class GoogleDriveProvider implements VideoProvider {
  readonly kind = "google-drive" as const;
  // OAuth tokens come from the account's secure credential service, never app passwords.
  constructor(
    private token: () => Promise<string>,
    private request: typeof fetch = fetch,
  ) {}
  private async get(path: string) {
    const response = await this.request(`${API}${path}`, {
      headers: { Authorization: `Bearer ${await this.token()}` },
    });
    if (response.status === 401)
      throw new ProviderError(
        "Reconnect this account to continue. Your notes will be kept.",
        "reauth",
      );
    if (response.status === 403)
      throw new ProviderError(
        "You do not have permission to access this folder or video.",
        "permission",
      );
    if (response.status === 404)
      throw new ProviderError(
        "This folder or video is no longer available.",
        "missing",
      );
    if (!response.ok)
      throw new ProviderError(
        "Storage could not be reached. Try again when connected.",
        "network",
      );
    return response.json();
  }
  async inspectFolder(folderId: string) {
    const file = (await this.get(
      `/files/${encodeURIComponent(folderId)}?fields=id,name,mimeType,trashed,capabilities(canAddChildren)&supportsAllDrives=true`,
    )) as DriveFile;
    if (file.trashed || file.mimeType !== "application/vnd.google-apps.folder")
      throw new ProviderError("Choose an available folder.", "invalid");
    return { name: file.name, writable: !!file.capabilities?.canAddChildren };
  }
  async listVideos(source: Source) {
    let cursor: string | undefined;
    const videos: RemoteVideo[] = [];
    const escaped = source.folderId.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    do {
      const params = new URLSearchParams({
        q: `'${escaped}' in parents and trashed = false and mimeType contains 'video/'`,
        fields:
          "nextPageToken,files(id,name,mimeType,size,modifiedTime,thumbnailLink,videoMediaMetadata,capabilities(canDownload))",
        pageSize: "100",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });
      if (cursor) params.set("pageToken", cursor);
      const page = (await this.get(`/files?${params}`)) as {
        files: DriveFile[];
        nextPageToken?: string;
      };
      videos.push(...page.files.map(mapDriveVideo));
      cursor = page.nextPageToken;
    } while (cursor);
    return { videos: [...new Map(videos.map((v) => [v.fileId, v])).values()] };
  }
  async playback(fileId: string) {
    const metadata = (await this.get(
      `/files/${encodeURIComponent(fileId)}?fields=id,capabilities(canDownload)&supportsAllDrives=true`,
    )) as DriveFile;
    if (!metadata.capabilities?.canDownload)
      throw new ProviderError(
        "The owner has disabled downloading or streaming this video.",
        "permission",
      );
    return {
      uri: `${API}/files/${encodeURIComponent(fileId)}?alt=media`,
      headers: { Authorization: `Bearer ${await this.token()}` },
    };
  }
}

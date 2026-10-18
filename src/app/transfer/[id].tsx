import { useEffect, useRef, useState } from "react";
import { Switch } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Screen,
  Card,
  Txt,
  Button,
  Chip,
  Row,
  Badge,
} from "../../components/ui";
import { useLibrary } from "../../services/store";
import { useTheme } from "../../components/theme";
import { uid } from "../../core/types";
import { remoteId } from "../../core/sources";
import { vault } from "../../services/cloud/vault";
import { uploadVideo } from "../../services/cloud/upload";
import type { PendingUpload } from "../../services/cloud/uploadEngine";
import { deleteMedia } from "../../services/media";
export default function Transfer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { library, update } = useLibrary();
  const t = useTheme();
  const video = library.videos.find((v) => v.id === id);
  const [sourceId, setSourceId] = useState("");
  const [keepCopy, setKeepCopy] = useState(true);
  const [job, setJob] = useState<PendingUpload>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmedId, setConfirmedId] = useState("");
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    let alive = true;
    vault
      .get(`upload-for-${id}`)
      .then(async (jobId) => {
        if (!jobId) return;
        const raw = await vault.get(`upload-${jobId}`);
        if (raw && alive) {
          const pending: PendingUpload = JSON.parse(raw);
          setJob(pending);
          setSourceId(pending.sourceId);
          setKeepCopy(pending.keepCopy);
        }
      })
      .catch(() => {
        if (alive)
          setError(
            "The previous upload could not be restored. Your local video is safe.",
          );
      });
    return () => {
      alive = false;
      abort.current?.abort();
    };
  }, [id]);
  async function start() {
    if (!video || busy) return;
    setBusy(true);
    setError("");
    abort.current = new AbortController();
    try {
      const source = library.sources.find((s) => s.id === sourceId);
      const connection = library.connections.find(
        (c) => c.id === source?.connectionId && c.connected,
      );
      if (!source || !source.writable || !connection)
        throw new Error(
          "Choose a connected writable folder. For Drive, allow uploads in Storage first.",
        );
      if (!connection.writable)
        throw new Error("Allow uploads for this account in Storage first.");
      const extension =
        /\.(mov|m4v|webm|mkv|avi|3gp)$/i.exec(video.uri)?.[1]?.toLowerCase() ??
        "mp4";
      const mimeTypes: Record<string, string> = {
        mov: "video/quicktime",
        m4v: "video/x-m4v",
        webm: "video/webm",
        mkv: "video/x-matroska",
        avi: "video/x-msvideo",
        "3gp": "video/3gpp",
        mp4: "video/mp4",
      };
      const current: PendingUpload = job ?? {
        id: uid(),
        videoId: id,
        sourceId,
        provider: connection.provider,
        name: `${video.title.replace(/[\\/]/g, "_")}.${extension}`,
        mimeType: video.mimeType ?? mimeTypes[extension],
        size: video.size,
        fileId: "",
        offset: 0,
        status: "queued",
        keepCopy,
      };
      await vault.set(`upload-for-${id}`, current.id);
      await vault.set(`upload-${current.id}`, JSON.stringify(current));
      setJob(current);
      const file = await uploadVideo(
        current,
        video.uri,
        source,
        connection,
        setJob,
        abort.current.signal,
      );
      const newId = remoteId(connection, file.fileId);
      update((l) => ({
        ...l,
        videos: [
          {
            ...video,
            id: newId,
            source: connection.provider,
            uri: "",
            offlineUri: current.keepCopy ? video.uri : undefined,
            thumbnail: current.keepCopy ? video.thumbnail : undefined,
            storagePreference: current.keepCopy ? "offline" : "online",
            remote: {
              connectionId: connection.id,
              fileId: file.fileId,
              sourceIds: [source.id],
              canDownload: file.canDownload,
            },
            available: true,
          },
          ...l.videos.filter((v) => v.id !== id && v.id !== newId),
        ],
        playlists: l.playlists.map((p) => ({
          ...p,
          videoIds: [...new Set(p.videoIds.map((v) => (v === id ? newId : v)))],
        })),
        picks: l.picks.map((p) => ({
          ...p,
          videoIds: p.videoIds.map((v) => (v === id ? newId : v)),
        })),
        sessions: l.sessions.map((s) =>
          s.videoId === id ? { ...s, videoId: newId } : s,
        ),
      }));
      if (!current.keepCopy) {
        await deleteMedia(video.uri);
        if (video.thumbnail?.startsWith("file:"))
          await deleteMedia(video.thumbnail);
      }
      await vault.remove(`upload-for-${id}`);
      await vault.remove(`upload-${current.id}`);
      setConfirmedId(newId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen
      title="Choose its home"
      subtitle="Upload a new file to your own storage."
      action={
        <Button variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      }
    >
      {confirmedId ? (
        <Card>
          <Badge tone="lime">UPLOAD CONFIRMED</Badge>
          <Txt>
            Your video is saved online. Your notes, ratings and practice
            sections came along.
          </Txt>
          <Button
            onPress={() =>
              router.replace({
                pathname: "/video/[id]",
                params: { id: confirmedId },
              })
            }
          >
            Open video
          </Button>
        </Card>
      ) : video && !video.remote ? (
        <>
          <Card>
            <Txt size={23} weight="display">
              {video.title}
            </Txt>
            <Txt color={t.muted}>
              {(video.size / 1048576).toFixed(1)} MB · Your local copy is kept
              until storage confirms the upload.
            </Txt>
          </Card>
          <Card>
            <Txt weight="bold">Destination folder</Txt>
            {library.sources
              .filter(
                (s) =>
                  s.writable &&
                  library.connections.some(
                    (c) => c.id === s.connectionId && c.connected,
                  ),
              )
              .map((s) => (
                <Chip
                  key={s.id}
                  selected={sourceId === s.id}
                  onPress={() => {
                    if (!job) setSourceId(s.id);
                  }}
                >
                  {s.name} · {s.provider === "dropbox" ? "Dropbox" : "Drive"}
                </Chip>
              ))}
            <Button
              variant="soft"
              disabled={busy}
              onPress={() => router.push("/storage")}
            >
              Connect or manage folders
            </Button>
            <Row style={{ justifyContent: "space-between" }}>
              <Txt>Keep a phone copy after upload</Txt>
              <Switch
                accessibilityLabel="Keep a phone copy after upload"
                value={job?.keepCopy ?? keepCopy}
                disabled={!!job}
                onValueChange={setKeepCopy}
              />
            </Row>
            <Txt size={12} color={t.muted}>
              BailaCue creates a uniquely named file. It never overwrites a
              storage original. Upload jobs resume after interruption using the
              same destination and identity.
            </Txt>
          </Card>
          {job ? (
            <Card>
              <Badge tone="soft">{busy ? "UPLOADING" : "SAVED UPLOAD"}</Badge>
              <Txt>
                {Math.round((job.offset / job.size) * 100)}% ·{" "}
                {(job.offset / 1048576).toFixed(1)} of{" "}
                {(job.size / 1048576).toFixed(1)} MB
              </Txt>
              <Txt size={12} color={t.muted}>
                You can pause and return to this video to resume. Retrying
                checks the same file before sending more data.
              </Txt>
            </Card>
          ) : null}
          <Button onPress={start} disabled={busy || !sourceId}>
            {job ? "Resume / check upload" : "Upload to selected folder"}
          </Button>
          {busy ? (
            <Button variant="ghost" onPress={() => abort.current?.abort()}>
              Pause upload
            </Button>
          ) : null}
        </>
      ) : (
        <Card>
          <Txt>This phone video is no longer available.</Txt>
        </Card>
      )}
      {error ? (
        <Card>
          <Txt accessibilityRole="alert" color={t.primary}>
            {error}
          </Txt>
        </Card>
      ) : null}
    </Screen>
  );
}

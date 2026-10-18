import {
  assertUploadDestination,
  registerUpload,
  uploadDestination,
} from "../../core/destination";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const {
    id,
    destination,
    keepCopy: requestedCopy,
    autoUpload,
  } = useLocalSearchParams<{
    id: string;
    destination?: string;
    keepCopy?: string;
    autoUpload?: string;
  }>();
  const { library, update } = useLibrary();
  const t = useTheme();
  const video = library.videos.find((v) => v.id === id);
  const [sourceId, setSourceId] = useState(destination ?? "");
  const [keepCopy, setKeepCopy] = useState(requestedCopy !== "0");
  const [job, setJob] = useState<PendingUpload>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmedId, setConfirmedId] = useState("");
  const [restored, setRestored] = useState(false);
  const autoStarted = useRef(false);
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
      })
      .finally(() => {
        if (alive) setRestored(true);
      });
    return () => {
      alive = false;
      abort.current?.abort();
    };
  }, [id]);
  const start = useCallback(async () => {
    if (!video || busy) return;
    setBusy(true);
    setError("");
    abort.current = new AbortController();
    try {
      const { source, connection } = uploadDestination(library, sourceId);
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
        folderId: source.folderId,
        connectionId: connection.id,
        accountId: connection.accountId,
        provider: connection.provider,
        name: `${video.title.replace(/[\\/]/g, "_")}.${extension}`,
        mimeType: video.mimeType ?? mimeTypes[extension],
        size: video.size,
        fileId: "",
        offset: 0,
        status: "queued",
        keepCopy,
      };
      assertUploadDestination(current, source, connection);
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
      // Keep the owned phone file referenced until cleanup succeeds.
      update((l) => {
        const next = registerUpload(l, id, source, connection, file, true);
        if (!current.keepCopy)
          next.videos = next.videos.map((v) =>
            v.id === newId ? { ...v, storagePreference: "online" } : v,
          );
        return next;
      });
      setConfirmedId(newId);
      if (!current.keepCopy) {
        try {
          await deleteMedia(video.uri);
          if (video.thumbnail?.startsWith("file:")) {
            try {
              await deleteMedia(video.thumbnail);
            } catch {
              /* Thumbnail cleanup can be retried separately. */
            }
          }
          update((l) => ({
            ...l,
            videos: l.videos.map((v) =>
              v.id === newId
                ? { ...v, offlineUri: undefined, thumbnail: undefined }
                : v,
            ),
          }));
        } catch {
          setError(
            "Upload confirmed. The phone copy could not be removed; you can remove it from the video’s storage controls.",
          );
        }
      }
      await vault.remove(`upload-for-${id}`);
      await vault.remove(`upload-${current.id}`);
      setConfirmedId(newId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [video, busy, library, sourceId, keepCopy, job, id, update]);
  useEffect(() => {
    if (autoUpload === "1" && restored && video && !autoStarted.current) {
      autoStarted.current = true;
      void start();
    }
  }, [autoUpload, restored, video, start]);
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
            Your video is saved online in{" "}
            {
              library.sources.find((s) => s.id === (job?.sourceId ?? sourceId))
                ?.name
            }
            . Your notes, ratings and practice sections came along.
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
            {sourceId ? (
              <Txt>
                Selected:{" "}
                {library.sources.find((s) => s.id === sourceId)?.name ??
                  "Folder unavailable"}
              </Txt>
            ) : null}
            {library.sources
              .filter(
                (s) =>
                  s.writable &&
                  library.connections.some(
                    (c) => c.id === s.connectionId && c.connected && c.writable,
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

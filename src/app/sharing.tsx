import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Field,
  Screen,
  Txt,
  Badge,
} from "../components/ui";
import { useAccount } from "../services/account";
import { useLibrary } from "../services/store";
import { provider } from "../services/cloud/provider";
import { remoteId } from "../core/sources";
import { uid, type Video } from "../core/types";
type SharedCollection = {
  name: string;
  videos: {
    provider: "google-drive" | "dropbox";
    fileId: string;
    title: string;
    style: Video["style"];
  }[];
};
type Share = {
  id: string;
  user_id: string;
  sender_name: string;
  recipient_name: string;
  payload: SharedCollection;
  revoked_at: string | null;
};
export default function SharingScreen() {
  const { playlist: initial } = useLocalSearchParams<{ playlist?: string }>();
  const account = useAccount();
  const { library, update } = useLibrary();
  const [playlistId, setPlaylistId] = useState(initial ?? "");
  const [recipient, setRecipient] = useState("");
  const [shares, setShares] = useState<Share[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setShares((await account.request("shares")).shares);
  }
  async function create() {
    const playlist = library.playlists.find((p) => p.id === playlistId);
    if (!playlist) throw new Error("Choose a collection.");
    const videos = playlist.videoIds
      .map((id) => library.videos.find((v) => v.id === id))
      .filter((v): v is Video => !!v);
    if (videos.some((v) => !v.remote))
      throw new Error(
        "Upload local videos to your storage before sharing this collection.",
      );
    await account.request("share-create", {
      recipient,
      payload: {
        name: playlist.name,
        videos: videos.map((v) => ({
          provider: v.source,
          fileId: v.remote!.fileId,
          title: v.title,
          style: v.style,
        })),
      },
    });
    await refresh();
    setMessage(
      "Collection references shared. The recipient must already have access to the videos through their own storage account.",
    );
  }
  async function importShare(share: Share) {
    const payload: SharedCollection = await account.request("share-open", {
      id: share.id,
    });
    const videos: Video[] = [];
    for (const item of payload.videos) {
      const candidates = library.connections.filter(
        (c) => c.provider === item.provider && c.connected,
      );
      let found: Video | undefined;
      for (const connection of candidates) {
        try {
          await provider(connection).playback(item.fileId);
          found = {
            id: remoteId(connection, item.fileId),
            title: item.title,
            uri: "",
            duration: 0,
            size: 0,
            style: item.style,
            labels: [],
            importance: 3,
            status: "To learn",
            teacher: "",
            className: payload.name,
            location: "",
            lessonDate: "",
            createdAt: new Date().toISOString(),
            resume: 0,
            segments: [],
            bookmarks: [],
            notes: [],
            source: item.provider,
            available: true,
            storagePreference: "online",
            remote: {
              connectionId: connection.id,
              fileId: item.fileId,
              sourceIds: [],
              canDownload: true,
            },
            sharedGrantId: share.id,
          };
          break;
        } catch {
          /* Try only this recipient's connected accounts. Never use the sender's token. */
        }
      }
      if (!found)
        throw new Error(
          `Your connected ${item.provider === "dropbox" ? "Dropbox" : "Drive"} accounts cannot access “${item.title}”. Ask the owner to grant access in the provider, then reconnect and retry. No files were made public.`,
        );
      videos.push(found);
    }
    update((l) => ({
      ...l,
      videos: [
        ...l.videos,
        ...videos.filter((v) => !l.videos.some((own) => own.id === v.id)),
      ],
      playlists: [
        ...l.playlists,
        {
          id: uid(),
          name: `${payload.name} · shared by ${share.sender_name}`,
          videoIds: videos.map((v) => v.id),
        },
      ],
    }));
    setMessage(
      "Collection added. Shared-grant and provider access are checked online when opening a video.",
    );
  }
  return (
    <Screen
      title="Moves to share"
      subtitle="Share a collection with another BailaCue dancer."
      action={
        <Button variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      }
    >
      {!account.session ? (
        <Card>
          <Txt>Sign in to send or receive collection references.</Txt>
          <Button onPress={() => router.push("/account")}>
            Account & sign in
          </Button>
        </Card>
      ) : (
        <>
          <Card>
            <Badge tone="soft">PROVIDER ACCESS STAYS IN YOUR HANDS</Badge>
            <Txt>
              Sharing a collection sends its titles and video references. It
              does not change Drive or Dropbox permissions. Grant access to the
              recipient in your storage provider first. Personal notes and
              ratings are not shared.
            </Txt>
            <Txt size={12}>
              Revoking a BailaCue grant stops online access through that
              collection. Offline copies cannot be remotely revoked while a
              phone is offline. Copies saved outside BailaCue remain with their
              recipient.
            </Txt>
          </Card>
          <Card>
            {library.playlists.map((p) => (
              <Chip
                key={p.id}
                selected={playlistId === p.id}
                onPress={() => setPlaylistId(p.id)}
              >
                {p.name}
              </Chip>
            ))}
            <Field
              label="Recipient’s BailaCue username"
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
            />
            <Button
              disabled={busy || !playlistId || !recipient}
              onPress={() => run(create)}
            >
              Share collection references
            </Button>
          </Card>
          <Button variant="soft" disabled={busy} onPress={() => run(refresh)}>
            Refresh sent & received collections
          </Button>
          {shares.map((share) => (
            <Card key={share.id}>
              <Txt size={21} weight="display">
                {share.payload.name}
              </Txt>
              <Txt>
                {share.user_id === account.session!.user.id
                  ? `Sent to ${share.recipient_name}`
                  : `From ${share.sender_name}`}{" "}
                · {share.payload.videos.length} videos
              </Txt>
              {share.revoked_at ? (
                <Badge tone="soft">REVOKED</Badge>
              ) : share.user_id === account.session!.user.id ? (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onPress={() =>
                    run(async () => {
                      await account.request("share-revoke", { id: share.id });
                      await refresh();
                    })
                  }
                >
                  Revoke this share
                </Button>
              ) : (
                <Button
                  disabled={busy}
                  onPress={() => run(() => importShare(share))}
                >
                  Check my access & add collection
                </Button>
              )}
            </Card>
          ))}
        </>
      )}
      {message ? (
        <Card>
          <Txt accessibilityRole="alert">{message}</Txt>
        </Card>
      ) : null}
    </Screen>
  );
}

import { LabelPicker } from "../components/LabelPicker";
import { libraryLabels } from "../core/labels";
import { useState } from "react";
import { View, Switch } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  Card,
  Txt,
  Button,
  Field,
  Chip,
  Badge,
  Row,
  layout,
} from "../components/ui";
import { useTheme } from "../components/theme";
import { useLibrary } from "../services/store";
import { connectAccount, disconnectAccount } from "../services/cloud/accounts";
import { provider } from "../services/cloud/provider";
import { parseFolder, reconcileSource } from "../core/sources";
import {
  uid,
  type CloudFolder,
  type Connection,
  type DanceStyle,
} from "../core/types";
import { deleteMedia } from "../services/media";
export default function Storage() {
  const { library, update } = useLibrary();
  const t = useTheme();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [accountId, setAccountId] = useState("");
  const [folder, setFolder] = useState("");
  const [name, setName] = useState("");
  const [style, setStyle] = useState<DanceStyle>("Bachata");
  const [labels, setLabels] = useState<string[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [editId, setEditId] = useState("");
  const [confirmDisconnect, setConfirmDisconnect] = useState("");
  const [removeFolder, setRemoveFolder] = useState("");
  const [setup, setSetup] = useState(false);
  const [appKey, setAppKey] = useState(library.cloudSettings.dropboxAppKey);
  const selected = library.connections.find((c) => c.id === accountId);
  async function run(id: string, action: () => Promise<void>) {
    if (busy) return;
    setBusy(id);
    setError("");
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function connect(kind: Connection["provider"], write = false) {
    await run(kind, async () => {
      const connection = await connectAccount(
        kind,
        library.cloudSettings.dropboxAppKey,
        write,
      );
      update((l) => ({
        ...l,
        connections: [
          ...l.connections.filter((c) => c.id !== connection.id),
          connection,
        ],
      }));
      setAccountId(connection.id);
      setFolders([]);
    });
  }
  async function refresh(source: CloudFolder) {
    const connection = library.connections.find(
      (c) => c.id === source.connectionId,
    );
    if (!connection) throw new Error("Reconnect this account first.");
    const adapter = provider(connection);
    const info = await adapter.inspectFolder(source.folderId);
    const result = await adapter.listVideos(source);
    update((l) =>
      reconcileSource(l, { ...source, writable: info.writable }, result.videos),
    );
  }
  function edit(source: CloudFolder) {
    setAccountId(source.connectionId);
    setFolder(source.folderId);
    setName(source.name);
    setStyle(source.defaultStyle);
    setLabels(source.defaultLabels);
    setEditId(source.id);
  }
  async function saveSource() {
    if (!selected) throw new Error("Choose a connected storage account first.");
    const folderId = parseFolder(selected.provider, folder);
    if (
      library.sources.some(
        (s) =>
          s.connectionId === selected.id &&
          s.folderId === folderId &&
          s.id !== editId,
      )
    )
      throw new Error(
        "This folder is already connected. Edit its name or defaults below.",
      );
    const adapter = provider(selected);
    const info = await adapter.inspectFolder(folderId);
    const source: CloudFolder = {
      id: editId || uid(),
      connectionId: selected.id,
      provider: selected.provider,
      folderId,
      name: name.trim() || info.name,
      defaultStyle: style,
      defaultLabels: labels,
      writable: info.writable,
    };
    if (editId) {
      const old = library.sources.find((s) => s.id === editId)!;
      if (old.connectionId !== source.connectionId || old.folderId !== folderId)
        throw new Error(
          "To choose a different account or folder, add a new source. Existing video associations are preserved.",
        );
    }
    const result = await adapter.listVideos(source);
    update((l) =>
      reconcileSource(
        {
          ...l,
          sources: [...l.sources.filter((s) => s.id !== source.id), source],
        },
        source,
        result.videos,
      ),
    );
    setFolder("");
    setName("");
    setEditId("");
    setFolders([]);
  }
  async function detach(source: CloudFolder) {
    const orphaned = library.videos.filter(
      (v) =>
        v.remote?.sourceIds.includes(source.id) &&
        v.remote.sourceIds.length === 1 &&
        !v.sharedGrantId,
    );
    for (const video of orphaned) {
      if (video.offlineUri) await deleteMedia(video.offlineUri);
      if (video.thumbnail?.startsWith("file:"))
        await deleteMedia(video.thumbnail);
    }
    const ids = new Set(orphaned.map((v) => v.id));
    update((l) => ({
      ...l,
      sources: l.sources.filter((s) => s.id !== source.id),
      videos: l.videos.map((v) =>
        v.remote?.sourceIds.includes(source.id)
          ? {
              ...v,
              available: ids.has(v.id) ? false : v.available,
              offlineUri: ids.has(v.id) ? undefined : v.offlineUri,
              thumbnail: ids.has(v.id) ? undefined : v.thumbnail,
              remote: {
                ...v.remote,
                sourceIds: v.remote.sourceIds.filter((s) => s !== source.id),
              },
            }
          : v,
      ),
    }));
    setRemoveFolder("");
    if (editId === source.id) setEditId("");
  }
  async function disconnect(connection: Connection) {
    for (const video of library.videos.filter(
      (v) => v.remote?.connectionId === connection.id && v.offlineUri,
    )) {
      await deleteMedia(video.offlineUri!);
      if (video.thumbnail?.startsWith("file:"))
        await deleteMedia(video.thumbnail);
    }
    await disconnectAccount(connection.id);
    update((l) => ({
      ...l,
      connections: l.connections.map((c) =>
        c.id === connection.id ? { ...c, connected: false } : c,
      ),
      videos: l.videos.map((v) =>
        v.remote?.connectionId === connection.id
          ? {
              ...v,
              offlineUri: undefined,
              thumbnail: undefined,
              available: false,
              storagePreference: "online",
            }
          : v,
      ),
    }));
    setConfirmDisconnect("");
  }
  return (
    <Screen
      title="Your video homes"
      subtitle="Choose your accounts. Keep your videos where you want them."
      action={
        <Button variant="ghost" onPress={() => router.back()}>
          Done
        </Button>
      }
    >
      <Card>
        <Badge tone="lime">YOUR ACCOUNTS · YOUR FOLDERS</Badge>
        <Txt size={23} weight="display">
          Connect a video home
        </Txt>
        <Txt color={t.muted}>
          Sign in to your own Google or Dropbox account. BailaCue lists videos
          directly inside the folders you choose. Videos start online; download
          only the ones you want on your phone.
        </Txt>
        <Row style={{ flexWrap: "wrap" }}>
          <Button
            icon="folder"
            loading={busy === "google-drive"}
            disabled={!!busy}
            onPress={() => connect("google-drive")}
          >
            Connect Google Drive
          </Button>
          <Button
            variant="soft"
            loading={busy === "dropbox"}
            disabled={!!busy}
            onPress={() => connect("dropbox")}
          >
            Connect Dropbox
          </Button>
        </Row>
        <Txt size={12} color={t.muted}>
          You can also use Add video → Choose a video to import from Drive,
          Dropbox or another provider available in your phone’s Files picker.
        </Txt>
      </Card>
      {error ? (
        <Card>
          <Txt accessibilityRole="alert" color={t.primary}>
            {error}
          </Txt>
        </Card>
      ) : null}
      {library.connections.map((connection) => (
        <Card key={connection.id}>
          <Badge tone={connection.connected ? "lime" : "soft"}>
            {connection.provider === "google-drive"
              ? "GOOGLE DRIVE"
              : "DROPBOX"}
          </Badge>
          <Txt weight="bold">{connection.email}</Txt>
          <Txt color={t.muted}>
            {connection.connected
              ? "Connected on this device"
              : "Disconnected · notes and ratings preserved"}
          </Txt>
          <Row style={{ flexWrap: "wrap" }}>
            <Button
              variant="soft"
              disabled={!!busy}
              onPress={() => {
                setAccountId(connection.id);
                setFolders([]);
                setEditId("");
                setFolder("");
              }}
            >
              Choose this account
            </Button>
            <Button
              variant="ghost"
              disabled={!!busy}
              onPress={() => connect(connection.provider)}
            >
              Reconnect
            </Button>
          </Row>
          {connection.provider === "google-drive" && !connection.writable ? (
            <Button
              variant="ghost"
              onPress={() => connect("google-drive", true)}
              disabled={!!busy}
            >
              Allow uploads to my Drive
            </Button>
          ) : null}
          <Button
            variant="ghost"
            onPress={() => setConfirmDisconnect(connection.id)}
          >
            Disconnect & remove phone copies
          </Button>
          {confirmDisconnect === connection.id ? (
            <>
              <Txt>
                This removes this account’s downloads from BailaCue and
                disconnects storage. Your notes, ratings and original online
                files are kept.
              </Txt>
              <Row>
                <Button
                  onPress={() =>
                    run("disconnect", () => disconnect(connection))
                  }
                  disabled={!!busy}
                >
                  Confirm disconnect
                </Button>
                <Button variant="soft" onPress={() => setConfirmDisconnect("")}>
                  Keep connected
                </Button>
              </Row>
            </>
          ) : null}
        </Card>
      ))}
      {selected ? (
        <Card>
          <Badge tone="soft">{editId ? "EDIT FOLDER" : "ADD FOLDER"}</Badge>
          <Txt weight="bold">{selected.email}</Txt>
          <Button
            variant="soft"
            disabled={!!busy || !selected.connected}
            loading={busy === "browse"}
            onPress={() =>
              run("browse", async () =>
                setFolders(await provider(selected).folders()),
              )
            }
          >
            Browse my folders
          </Button>
          {folders.length ? (
            <View style={layout.wrap}>
              {folders.slice(0, 100).map((f) => (
                <Chip
                  key={f.id}
                  selected={folder === f.id}
                  onPress={() => {
                    setFolder(f.id);
                    if (!name) setName(f.name);
                  }}
                >
                  {f.name}
                </Chip>
              ))}
            </View>
          ) : null}
          <Field
            label={
              selected.provider === "google-drive"
                ? "Drive folder link or ID"
                : "Dropbox folder path"
            }
            placeholder={
              selected.provider === "google-drive"
                ? "https://drive.google.com/drive/folders/…"
                : "/Dance/Salsa"
            }
            value={folder}
            onChangeText={setFolder}
            autoCapitalize="none"
          />
          <Field
            label="Folder name in BailaCue"
            placeholder="Tuesday Salsa"
            value={name}
            onChangeText={setName}
          />
          <View style={layout.wrap}>
            {(["Bachata", "Salsa", "Other"] as DanceStyle[]).map((s) => (
              <Chip key={s} selected={style === s} onPress={() => setStyle(s)}>
                {s}
              </Chip>
            ))}
          </View>
          <LabelPicker
            label="Default labels for new videos"
            value={labels}
            options={libraryLabels(library)}
            onChange={setLabels}
          />
          <Txt size={12} color={t.muted}>
            New videos start with these labels and importance 3 ★. Your own
            edits are preserved when a folder refreshes. Browse shows top-level
            Dropbox folders; enter a path to choose a nested folder.
          </Txt>
          <Button
            onPress={() => run("source", saveSource)}
            disabled={!!busy || !selected.connected}
            loading={busy === "source"}
          >
            {editId ? "Save folder changes" : "Connect folder & find videos"}
          </Button>
          {editId ? (
            <Button
              variant="ghost"
              onPress={() => {
                setEditId("");
                setFolder("");
                setName("");
              }}
            >
              Cancel editing
            </Button>
          ) : null}
        </Card>
      ) : null}
      {library.sources.map((source) => (
        <Card key={source.id}>
          <Row style={{ justifyContent: "space-between" }}>
            <Txt size={21} weight="display" style={{ flex: 1 }}>
              {source.name}
            </Txt>
            <Badge tone={source.writable ? "lime" : "soft"}>
              {source.writable ? "WRITABLE" : "READ ONLY"}
            </Badge>
          </Row>
          <Txt color={t.muted}>
            {
              library.videos.filter((v) =>
                v.remote?.sourceIds.includes(source.id),
              ).length
            }{" "}
            videos · {source.defaultStyle} · {source.defaultLabels.join(", ")}
          </Txt>
          <Txt size={12} color={t.muted}>
            {source.lastSyncedAt
              ? `Last refreshed ${new Date(source.lastSyncedAt).toLocaleString()}`
              : "Not refreshed yet"}
          </Txt>
          <Row>
            <Button
              variant="soft"
              disabled={!!busy}
              loading={busy === source.id}
              onPress={() => run(source.id, () => refresh(source))}
            >
              Refresh videos
            </Button>
            <Button variant="ghost" onPress={() => edit(source)}>
              Edit folder
            </Button>
            <Button variant="ghost" onPress={() => setRemoveFolder(source.id)}>
              Disconnect folder
            </Button>
          </Row>
          {removeFolder === source.id ? (
            <>
              <Txt>
                Disconnect this folder and remove downloads used only by it?
                Notes and ratings stay in your library. Online originals remain
                in storage.
              </Txt>
              <Row>
                <Button
                  disabled={!!busy}
                  onPress={() => run("detach", () => detach(source))}
                >
                  Confirm folder disconnect
                </Button>
                <Button variant="soft" onPress={() => setRemoveFolder("")}>
                  Keep folder
                </Button>
              </Row>
            </>
          ) : null}
        </Card>
      ))}
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt weight="bold">Download only on Wi-Fi</Txt>
          <Switch
            accessibilityLabel="Download only on Wi-Fi"
            value={library.cloudSettings.wifiOnly}
            onValueChange={(wifiOnly) =>
              update((l) => ({
                ...l,
                cloudSettings: { ...l.cloudSettings, wifiOnly },
              }))
            }
          />
        </Row>
        <Txt color={t.muted}>
          {library.videos.filter((v) => !!v.offlineUri).length} phone downloads
          ·{" "}
          {(
            library.videos
              .filter((v) => v.offlineUri || v.source === "device")
              .reduce((n, v) => n + v.size, 0) / 1048576
          ).toFixed(1)}{" "}
          MB in BailaCue
        </Txt>
        <Txt size={12} color={t.muted}>
          Streaming needs an internet connection. Downloaded copies cannot be
          remotely revoked while offline. Disconnecting removes BailaCue’s
          copies; files already saved to Photos or shared elsewhere stay there.
        </Txt>
      </Card>
      <Card>
        <Button variant="ghost" onPress={() => setSetup(!setup)}>
          App connection setup
        </Button>
        {setup ? (
          <>
            <Txt color={t.muted}>
              These public identifiers register BailaCue with the provider. They
              do not select a user’s account. Users always sign in themselves.
            </Txt>
            <Field
              label="Dropbox app key"
              value={appKey}
              autoCapitalize="none"
              onChangeText={setAppKey}
            />
            <Button
              variant="soft"
              onPress={() => {
                update((l) => ({
                  ...l,
                  cloudSettings: {
                    ...l.cloudSettings,
                    dropboxAppKey: appKey.trim(),
                  },
                }));
                setError(
                  "Dropbox app key saved. You can connect your own account above.",
                );
              }}
            >
              Save app key
            </Button>
            <Txt size={12} color={t.muted}>
              Register callback bailacue://oauth/dropbox in the Dropbox app
              console. Drive Android sign-in requires app.bailacue.mobile and
              the APK’s certificate fingerprint registered in Google Cloud. See
              docs/CLOUD-STORAGE.md for setup.
            </Txt>
          </>
        ) : null}
      </Card>
    </Screen>
  );
}

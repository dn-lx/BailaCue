import { useState } from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Field,
  Row,
  Screen,
  Txt,
  Badge,
} from "../components/ui";
import { useTheme } from "../components/theme";
import { useAccount, SyncConflict } from "../services/account";
import { useLibrary } from "../services/store";
import { metadataSnapshot, restoreSnapshot } from "../core/sync";
import { deleteMedia } from "../services/media";
import { disconnectAccount } from "../services/cloud/accounts";
import { vault } from "../services/cloud/vault";
import { syncReminders } from "../services/reminders";
type Snapshot = ReturnType<typeof metadataSnapshot>;
export default function AccountScreen() {
  const account = useAccount();
  const { library, update, clearDeviceLibrary } = useLibrary();
  const t = useTheme();
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [cloud, setCloud] = useState<{ revision: number; payload: Snapshot }>();
  const [confirm, setConfirm] = useState<"" | "logout" | "delete">("");
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
      setPassword("");
      setNewPassword("");
    }
  }
  async function inspectCloud() {
    const value = await account.request("snapshot");
    setCloud(value);
    return value;
  }
  async function cleanup() {
    await syncReminders({ ...library.reminders, enabled: false });
    for (const video of library.videos) {
      const pendingId = await vault.get(`upload-for-${video.id}`);
      if (pendingId) {
        await vault.remove(`upload-${pendingId}`);
        await vault.remove(`upload-for-${video.id}`);
      }
      const uri = video.remote ? video.offlineUri : video.uri;
      if (uri) await deleteMedia(uri);
      if (video.thumbnail?.startsWith("file:"))
        await deleteMedia(video.thumbnail);
    }
    for (const connection of library.connections)
      await disconnectAccount(connection.id);
    await clearDeviceLibrary();
    await account.logout();
    router.replace("/settings");
  }
  return (
    <Screen
      title={
        account.session
          ? `Hello, ${account.session.user.username}`
          : "Your BailaCue account"
      }
      subtitle="Video notes and preferences, across your devices."
      action={
        <Button variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      }
    >
      {!account.configured ? (
        <Card>
          <Badge tone="soft">MOBILE ACCOUNT ACCESS</Badge>
          <Txt>
            Sign in and sync from the mobile app. This browser preview keeps
            your local library available without an account.
          </Txt>
        </Card>
      ) : null}
      {!account.session ? (
        <Card>
          <Row style={{ justifyContent: "center" }}>
            {(["login", "register", "recover"] as const).map((m) => (
              <Chip key={m} selected={mode === m} onPress={() => setMode(m)}>
                {m === "login"
                  ? "Sign in"
                  : m === "register"
                    ? "Register"
                    : "Recover"}
              </Chip>
            ))}
          </Row>
          {mode !== "recover" ? (
            <Field
              label="BailaCue username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          ) : null}
          {mode !== "login" ? (
            <Field
              label="Account email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          ) : null}
          {mode !== "recover" ? (
            <Field
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          ) : null}
          <Button
            loading={busy}
            disabled={!account.configured}
            onPress={() =>
              run(async () => {
                if (mode === "login") await account.login(username, password);
                else
                  setMessage(
                    mode === "register"
                      ? await account.register(username, email, password)
                      : await account.recover(email),
                  );
              })
            }
          >
            {mode === "login"
              ? "Sign in"
              : mode === "register"
                ? "Create account"
                : "Send recovery instructions"}
          </Button>
          <Txt size={12} color={t.muted}>
            Guest and signed-in libraries are separate on this device.
            Registration uses the shared Me+ identity/password policy. BailaCue
            receives its own scoped session and never accesses your Me+ health
            records.
          </Txt>
        </Card>
      ) : (
        <>
          <Card>
            <Badge tone="accent">SIGNED IN</Badge>
            <Txt size={21} weight="display">
              Sync your video library
            </Txt>
            <Txt color={t.muted}>
              Sync labels, ratings, notes, sections, collections and source
              references. Video files and storage credentials stay on each
              device. Reconnect your own storage account on a new phone.
            </Txt>
            <Button
              variant="soft"
              onPress={() =>
                run(async () => {
                  const result = await inspectCloud();
                  setMessage(
                    `Cloud revision ${result.revision}. Review the choices below.`,
                  );
                })
              }
            >
              Check cloud library
            </Button>
            {cloud ? (
              <>
                <Txt>
                  {cloud.payload.videos?.length ?? 0} videos in cloud · revision{" "}
                  {cloud.revision}
                </Txt>
                <Button
                  onPress={() =>
                    run(async () => {
                      try {
                        const result = await account.request("save", {
                          revision: cloud.revision,
                          payload: metadataSnapshot(library),
                        });
                        setCloud({
                          revision: result.revision,
                          payload: metadataSnapshot(library),
                        });
                        setMessage("Device metadata saved to cloud.");
                      } catch (e) {
                        if (e instanceof SyncConflict) await inspectCloud();
                        throw e;
                      }
                    })
                  }
                >
                  Save this device’s metadata to cloud
                </Button>
                {Array.isArray(cloud.payload.videos) ? (
                  <Button
                    variant="soft"
                    onPress={() => {
                      update((l) => restoreSnapshot(cloud.payload, l));
                      setMessage(
                        "Cloud metadata loaded. This device’s phone copies were retained where IDs match.",
                      );
                    }}
                  >
                    Use cloud metadata on this device
                  </Button>
                ) : null}
                <Txt size={12} color={t.muted}>
                  These choices replace metadata in the selected destination. A
                  changed cloud revision stops a save so another device’s edits
                  cannot be silently overwritten.
                </Txt>
              </>
            ) : null}
          </Card>
          <Card>
            <Txt weight="bold">Change shared account password</Txt>
            <Field
              label="Current password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Field
              label="New password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Button
              variant="soft"
              disabled={busy}
              onPress={() =>
                run(async () => {
                  await account.request("password", { password, newPassword });
                  await cleanup();
                })
              }
            >
              Change password & sign out
            </Button>
            <Txt size={12} color={t.muted}>
              This changes your shared Me+ identity password and signs out
              BailaCue sessions.
            </Txt>
          </Card>
          <Card>
            <Button variant="soft" onPress={() => setConfirm("logout")}>
              Sign out & clear this device’s app copies
            </Button>
            <Button variant="ghost" onPress={() => setConfirm("delete")}>
              Delete BailaCue account data
            </Button>
            {confirm ? (
              <>
                <Txt>
                  {confirm === "delete"
                    ? "Delete BailaCue metadata and sessions, and remove BailaCue copies from this device? Your shared Me+ identity, health data and original storage files remain. Copies on other offline devices cannot be remotely removed until they reconnect."
                    : "Sign out and remove this account’s BailaCue files and storage connections from this device? Original cloud files and cloud metadata remain."}
                </Txt>
                <Row>
                  <Button
                    loading={busy}
                    onPress={() =>
                      run(async () => {
                        if (confirm === "delete")
                          await account.request("delete");
                        await cleanup();
                      })
                    }
                  >
                    Confirm {confirm === "delete" ? "deletion" : "sign out"}
                  </Button>
                  <Button variant="soft" onPress={() => setConfirm("")}>
                    Cancel
                  </Button>
                </Row>
              </>
            ) : null}
          </Card>
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

import { router } from "expo-router";
import { useState } from "react";
import { View, Switch } from "react-native";
import {
  Screen,
  Button,
  Card,
  Txt,
  Row,
  Chip,
  Field,
  Badge,
  Icon,
  Mark,
  layout,
} from "../../components/ui";
import { useLibrary } from "../../services/store";
import { useTheme } from "../../components/theme";
import {
  requestReminderPermission,
  syncReminders,
} from "../../services/reminders";
import { reminderSchedule } from "../../core/reminders";
import { unlock } from "../../services/lock";
import { refreshDailyPicks } from "../../core/recommendations";
import type { Preferences, DanceStyle } from "../../core/types";
export default function Settings() {
  const { library, update } = useLibrary();
  const t = useTheme();
  const p = library.preferences;
  const [notice, setNotice] = useState("");
  const [reminderTime, setReminderTime] = useState(library.reminders.time);
  const [quietStart, setQuietStart] = useState(library.reminders.quietStart);
  const [quietEnd, setQuietEnd] = useState(library.reminders.quietEnd);
  const [labels, setLabels] = useState(p.labels.join(", "));
  function set(changes: Partial<Preferences>) {
    update((l) => ({ ...l, preferences: { ...l.preferences, ...changes } }));
  }
  return (
    <Screen title="Make it your own" subtitle="Your preferences. Your pace.">
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Row>
            <Icon name="spark" />
            <Txt weight="bold">Daily Picks</Txt>
          </Row>
          <Switch
            accessibilityLabel="Daily Picks"
            value={p.picksEnabled}
            onValueChange={(picksEnabled) => set({ picksEnabled })}
            trackColor={{ false: t.border, true: t.primary }}
            thumbColor={t.onPrimary}
          />
        </Row>
        <Txt color={t.muted} size={13}>
          Your star ratings lead each new selection. Labels, learning status and
          recency break ties. Recent picks get a rest when another video is
          available.
        </Txt>
        <View style={layout.wrap}>
          {(["Bachata", "Salsa", "Other"] as DanceStyle[]).map((s) => (
            <Chip
              key={s}
              selected={p.styles.includes(s)}
              onPress={() =>
                set({
                  styles: p.styles.includes(s)
                    ? p.styles.filter((x) => x !== s)
                    : [...p.styles, s],
                })
              }
            >
              {s}
            </Chip>
          ))}
        </View>
        <Field
          label="Favourite labels"
          placeholder="Footwork, Musicality"
          value={labels}
          onChangeText={setLabels}
          onBlur={() =>
            set({
              labels: labels
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            })
          }
        />
        <Row style={{ justifyContent: "space-between" }}>
          <Txt style={{ flex: 1 }}>One video per dance source or style</Txt>
          <Switch
            accessibilityLabel="One video per dance source or style"
            value={p.onePerStyle !== false}
            onValueChange={(onePerStyle) => set({ onePerStyle })}
            trackColor={{ false: t.border, true: t.primary }}
            thumbColor={t.onPrimary}
          />
        </Row>
        <Txt size={13} color={t.muted}>
          {p.onePerStyle !== false
            ? "Select Salsa and Bachata for one video from each matching source. Without a source, phone videos use their dance style. Unrated videos count as 5★ until you rate them."
            : "Choose the total number of videos for your daily selection."}
        </Txt>
        {p.onePerStyle === false ? (
          <>
            <Txt size={13} weight="bold">
              Videos per day
            </Txt>
            <Row>
              {[1, 2, 3].map((count) => (
                <Chip
                  key={count}
                  selected={p.count === count}
                  onPress={() => set({ count })}
                >
                  {count}
                </Chip>
              ))}
            </Row>
          </>
        ) : null}
        <Txt size={13} weight="bold">
          Minimum star rating for picks
        </Txt>
        <Row style={{ flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((minPickRating) => (
            <Chip
              key={minPickRating}
              selected={(p.minPickRating ?? 1) === minPickRating}
              onPress={() => set({ minPickRating })}
            >
              {minPickRating}★ or higher
            </Chip>
          ))}
        </Row>
        <Txt size={12} color={t.muted}>
          The daily mix and minimum rating apply immediately. Other rating or
          preference changes affect the next selection; update today’s picks to
          apply them now.
        </Txt>
        <Button
          variant="soft"
          disabled={!p.picksEnabled}
          onPress={() => {
            update((l) => refreshDailyPicks(l));
            setNotice("Today’s picks updated using your current ratings.");
          }}
        >
          Update today’s picks
        </Button>
      </Card>
      <Card>
        <Txt size={21} weight="display">
          Your weekly goal
        </Txt>
        <Row style={{ flexWrap: "wrap" }}>
          {[30, 60, 90, 120].map((n) => (
            <Chip
              key={n}
              selected={p.weeklyMinutes === n}
              onPress={() => set({ weeklyMinutes: n })}
            >
              {n} min
            </Chip>
          ))}
        </Row>
      </Card>
      <Card>
        <Txt size={21} weight="display">
          A look that feels like you
        </Txt>
        <View style={layout.wrap}>
          {(["system", "light", "dark"] as const).map((theme) => (
            <Chip
              key={theme}
              selected={p.theme === theme}
              onPress={() => set({ theme })}
            >
              {theme === "system"
                ? "Match device"
                : theme === "light"
                  ? "Light"
                  : "Dark"}
            </Chip>
          ))}
        </View>
      </Card>
      <Card>
        <Txt size={21} weight="display">
          A gentle nudge to practise
        </Txt>
        <Txt>
          Choose local reminders. Quiet hours move reminders to the next allowed
          time.
        </Txt>
        <Row style={{ flexWrap: "wrap" }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <Chip
              key={index}
              selected={library.reminders.weekdays.includes(index + 1)}
              onPress={() =>
                update((l) => ({
                  ...l,
                  reminders: {
                    ...l.reminders,
                    weekdays: l.reminders.weekdays.includes(index + 1)
                      ? l.reminders.weekdays.filter((d) => d !== index + 1)
                      : [...l.reminders.weekdays, index + 1],
                  },
                }))
              }
            >
              {day}
            </Chip>
          ))}
        </Row>
        <Field
          label="Reminder time (HH:MM)"
          value={reminderTime}
          onChangeText={setReminderTime}
        />
        <Row>
          <Field
            label="Quiet hours start"
            value={quietStart}
            onChangeText={setQuietStart}
          />
          <Field
            label="Quiet hours end"
            value={quietEnd}
            onChangeText={setQuietEnd}
          />
        </Row>
        <Row>
          {(["practice", "picks"] as const).map((kind) => (
            <Chip
              key={kind}
              selected={library.reminders.kind === kind}
              onPress={() =>
                update((l) => ({ ...l, reminders: { ...l.reminders, kind } }))
              }
            >
              {kind === "practice" ? "Practice" : "Daily Picks"}
            </Chip>
          ))}
        </Row>
        <Button
          onPress={async () => {
            try {
              const reminders = {
                ...library.reminders,
                enabled: true,
                time: reminderTime,
                quietStart,
                quietEnd,
              };
              reminderSchedule(reminders);
              if (!reminders.weekdays.length)
                throw new Error("Choose at least one day.");
              if (!(await requestReminderPermission()))
                throw new Error(
                  "Notifications are disabled in your phone’s settings. Daily Picks are still available in the app.",
                );
              await syncReminders(reminders);
              update((l) => ({ ...l, reminders }));
              setNotice("Reminders saved in your phone’s local timezone.");
            } catch (e) {
              setNotice((e as Error).message);
            }
          }}
        >
          Save & enable reminders
        </Button>
        {library.reminders.enabled ? (
          <Button
            variant="ghost"
            onPress={async () => {
              const reminders = { ...library.reminders, enabled: false };
              await syncReminders(reminders);
              update((l) => ({ ...l, reminders }));
              setNotice("Reminders cancelled.");
            }}
          >
            Turn reminders off
          </Button>
        ) : null}
        <Txt size={12} color={t.muted}>
          Your phone schedules these offline reminders in local time. Delivery
          may be delayed by battery settings or Do Not Disturb. Open the app to
          refresh today’s picks. New-video push alerts require the server
          scheduler and are not enabled in this preview.
        </Txt>
      </Card>
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt weight="bold" style={{ flex: 1 }}>
            Protect BailaCue with device lock
          </Txt>
          <Switch
            accessibilityLabel="Protect BailaCue with device lock"
            value={library.deviceLock}
            onValueChange={async (deviceLock) => {
              try {
                await unlock();
                update((l) => ({ ...l, deviceLock }));
              } catch (e) {
                setNotice((e as Error).message);
              }
            }}
          />
        </Row>
        <Txt size={12} color={t.muted}>
          Requires your phone’s fingerprint, face or screen lock when reopening
          BailaCue. Imported copies remain in the app’s private storage.
        </Txt>
      </Card>
      {notice ? (
        <Card>
          <Txt accessibilityRole="alert">{notice}</Txt>
        </Card>
      ) : null}
      <Card>
        <Badge tone="soft">STORAGE & ACCOUNTS</Badge>
        <Txt size={21} weight="display">
          Connected when you’re ready
        </Txt>
        <Txt color={t.muted}>
          Connect your own Drive or Dropbox folders. Stream online or keep
          selected videos on your phone.
        </Txt>
        <Button variant="soft" onPress={() => router.push("/account")}>
          Account & metadata sync
        </Button>
        <Button variant="ghost" onPress={() => router.push("/sharing")}>
          Shared collections
        </Button>
        {library.sources.map((source) => (
          <View
            key={source.id}
            style={{
              gap: 5,
              padding: 14,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 16,
            }}
          >
            <Txt weight="bold">{source.name}</Txt>
            <Txt size={13} color={t.muted}>
              {source.provider === "dropbox" ? "Dropbox" : "Google Drive"} ·{" "}
              {
                library.videos.filter((v) =>
                  v.remote?.sourceIds.includes(source.id),
                ).length
              }{" "}
              videos
            </Txt>
            <Txt size={12} color={t.muted}>
              {
                library.connections.find((c) => c.id === source.connectionId)
                  ?.email
              }
            </Txt>
            {source.error ? <Txt size={12}>{source.error}</Txt> : null}
          </View>
        ))}
        <Button icon="folder" onPress={() => router.push("/storage")}>
          Manage video storage
        </Button>
        <Txt size={13} color={t.muted}>
          {library.sources.length} folders ·{" "}
          {library.videos.filter((v) => v.offlineUri).length} phone downloads
        </Txt>
      </Card>
      <Card>
        <Row>
          <Icon name="lock" />
          <Txt size={21} weight="display">
            Your videos are personal
          </Txt>
        </Row>
        <Txt color={t.muted}>
          Imported files are private copies inside BailaCue. Remove a video from
          its detail page to delete its local copy and notes. Your original file
          is preserved. Clips saved to Photos or shared outside BailaCue remain
          there until you remove them.
        </Txt>
        <Txt size={13} color={t.muted}>
          Uninstalling the mobile app removes its local library. Browser storage
          can be cleared by your browser. This build has no cross-device backup.
        </Txt>
      </Card>
      <Row style={{ justifyContent: "center" }}>
        <View
          style={{
            backgroundColor: t.brandBlack,
            borderRadius: 16,
            padding: 4,
          }}
        >
          <Mark size={42} />
        </View>
        <View>
          <Txt size={20} weight="display">
            BailaCue.
          </Txt>
          <Txt size={12} color={t.muted}>
            Watch. Practise. Repeat. · v0.2.1 (3)
          </Txt>
        </View>
      </Row>
    </Screen>
  );
}

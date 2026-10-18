import { useState } from "react";
import { View, Switch } from "react-native";
import {
  Screen,
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
import type { Preferences, DanceStyle } from "../../core/types";
export default function Settings() {
  const { library, update } = useLibrary();
  const t = useTheme();
  const p = library.preferences;
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
            trackColor={{ true: t.primary }}
          />
        </Row>
        <Txt color={t.muted} size={13}>
          Personal suggestions from your available videos. Picks are saved for
          the day, even when you change preferences.
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
        <Badge tone="soft">STORAGE & ACCOUNTS</Badge>
        <Txt size={21} weight="display">
          Connected when you’re ready
        </Txt>
        <Txt color={t.muted}>
          This build works with videos saved on your device. Account sync and
          connected folders need development setup before they can be used.
        </Txt>
        <Row>
          <Icon name="folder" />
          <View style={{ flex: 1 }}>
            <Txt weight="bold">This device</Txt>
            <Txt size={13} color={t.muted}>
              {library.videos.length} videos ·{" "}
              {(
                library.videos.reduce((n, v) => n + v.size, 0) / 1048576
              ).toFixed(1)}{" "}
              MB
            </Txt>
          </View>
          <Badge tone="lime">AVAILABLE</Badge>
        </Row>
        <Txt size={13} color={t.muted}>
          Google Drive is the first planned connection. Dropbox and other
          sources use the same provider interface. Multiple folders will each
          have their own name and default labels.
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
        <View style={{ backgroundColor: t.plum, borderRadius: 16, padding: 4 }}>
          <Mark size={42} />
        </View>
        <View>
          <Txt size={20} weight="display">
            BailaCue.
          </Txt>
          <Txt size={12} color={t.muted}>
            Watch. Practise. Repeat. · v0.1.0 (1)
          </Txt>
        </View>
      </Row>
    </Screen>
  );
}

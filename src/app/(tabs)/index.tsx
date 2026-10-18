import { useEffect } from "react";
import { View, AppState } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Screen,
  Txt,
  Row,
  Mark,
  Badge,
  Button,
  Card,
  Empty,
  Icon,
} from "../../components/ui";
import { useTheme } from "../../components/theme";
import { VideoCard } from "../../components/VideoCard";
import { useLibrary } from "../../services/store";
import { localDay, weekStart } from "../../core/practice";
import {
  ensureDailyPick,
  rankCandidates,
  refreshDailyPicks,
  minimumPickRating,
} from "../../core/recommendations";
export default function Today() {
  const { library, update } = useLibrary();
  const t = useTheme();
  useEffect(() => {
    update((l) => ensureDailyPick(l));
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") update((l) => ensureDailyPick(l));
    });
    return () => listener.remove();
  }, [update]);
  const weekly =
    library.sessions
      .filter((s) => new Date(s.startedAt) >= weekStart())
      .reduce((sum, s) => sum + s.seconds, 0) / 60;
  const pick = library.picks.find((p) => p.day === localDay());
  const videos = pick?.skipped
    ? []
    : library.videos.filter(
        (v) => pick?.videoIds.includes(v.id) && v.available,
      );
  return (
    <Screen
      title="BailaCue."
      subtitle="Watch. Practise. Repeat."
      action={
        <View style={{ padding: 6, backgroundColor: t.plum, borderRadius: 18 }}>
          <Mark />
        </View>
      }
    >
      <LinearGradient
        colors={["#43263F", "#321D36"]}
        style={{ padding: 25, borderRadius: 28, overflow: "hidden", gap: 17 }}
      >
        <View
          style={{
            position: "absolute",
            right: -28,
            top: 20,
            opacity: 0.16,
            transform: [{ rotate: "-18deg" }],
          }}
        >
          <Mark size={240} />
        </View>
        <Badge tone="lime">A LITTLE EVERY DAY</Badge>
        <Txt
          size={35}
          color="#FFF6E8"
          weight="display"
          style={{ maxWidth: 270, lineHeight: 40 }}
        >
          Find your rhythm.{"\n"}Make it yours.
        </Txt>
        <Txt color="#E5D3DF" style={{ maxWidth: 290 }}>
          Your moves, your music, your own pace. Turn a moment from class into a
          little daily progress.
        </Txt>
        <Button
          variant="lime"
          icon={library.videos.length ? "play" : "plus"}
          style={{ alignSelf: "flex-start" }}
          onPress={() =>
            library.videos.length
              ? router.push("/practice")
              : router.push("/upload")
          }
        >
          {library.videos.length
            ? "Make time to dance"
            : "Add your first video"}
        </Button>
      </LinearGradient>
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Row>
            <Icon name="practice" color={t.primary} />
            <Txt weight="bold">Your weekly rhythm</Txt>
          </Row>
          <Txt size={13} color={t.muted}>
            {Math.floor(weekly)} / {library.preferences.weeklyMinutes} min
          </Txt>
        </Row>
        <View
          accessibilityLabel={`${Math.floor(weekly)} of ${library.preferences.weeklyMinutes} weekly minutes`}
          style={{
            height: 8,
            backgroundColor: t.soft,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 8,
              width: `${Math.min(100, (weekly / library.preferences.weeklyMinutes) * 100)}%`,
              backgroundColor: t.primary,
              borderRadius: 8,
            }}
          />
        </View>
        <Txt size={13} color={t.muted}>
          {weekly >= library.preferences.weeklyMinutes
            ? "Your goal is complete. Keep the good feeling going."
            : "Small sessions. Moves that stay with you."}
        </Txt>
      </Card>
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Txt size={24} weight="display">
            Your Daily Picks
          </Txt>
          <Txt size={13} color={t.muted}>
            {library.preferences.onePerStyle !== false
              ? "One for each selected style, led by your ratings"
              : "Your highest-rated eligible videos"}
          </Txt>
        </View>
        <Icon name="spark" color={t.primary} />
      </Row>
      {library.preferences.picksEnabled &&
      !pick?.skipped &&
      library.preferences.onePerStyle !== false
        ? [...new Set(library.preferences.styles)]
            .filter((style) => !videos.some((v) => v.style === style))
            .map((style) => (
              <Card key={style}>
                <Txt weight="bold">Your {style} pick is waiting</Txt>
                <Txt size={13} color={t.muted}>
                  Add an available {style} video rated{" "}
                  {minimumPickRating(library)}★ or higher to complete your daily
                  mix.
                </Txt>
                <Button variant="soft" onPress={() => router.push("/upload")}>
                  Add a {style} video
                </Button>
              </Card>
            ))
        : null}
      {library.preferences.picksEnabled ? (
        <Button
          variant="soft"
          onPress={() => update((l) => refreshDailyPicks(l))}
        >
          Update today’s picks
        </Button>
      ) : null}
      {!library.preferences.picksEnabled ? (
        <Empty
          title="Picks are taking a break"
          body="Turn on Daily Picks in Settings whenever you’d like a little inspiration."
        />
      ) : videos.length ? (
        videos.map((video) => (
          <View key={video.id} style={{ gap: 12 }}>
            <VideoCard video={video} featured />
            <Txt size={13} color={t.muted}>
              {
                rankCandidates(library, new Date(), true).find(
                  (c) => c.video.id === video.id,
                )?.reason
              }
            </Txt>
            <Row style={{ flexWrap: "wrap" }}>
              <Button
                variant="soft"
                onPress={() =>
                  update((l) => ({
                    ...l,
                    feedback: {
                      ...l.feedback,
                      [video.id]: Math.min(3, (l.feedback[video.id] ?? 0) + 1),
                    },
                  }))
                }
              >
                More like this
              </Button>
              <Button
                variant="ghost"
                onPress={() =>
                  update((l) => ({
                    ...l,
                    feedback: {
                      ...l.feedback,
                      [video.id]: Math.max(-3, (l.feedback[video.id] ?? 0) - 1),
                    },
                  }))
                }
              >
                Less like this
              </Button>
              <Button
                variant="ghost"
                onPress={() =>
                  update((l) => ({
                    ...l,
                    videos: l.videos.map((v) =>
                      v.id === video.id ? { ...v, status: "Learned" } : v,
                    ),
                  }))
                }
              >
                Already learned
              </Button>
            </Row>
          </View>
        ))
      ) : (
        <Empty
          title={
            pick?.skipped
              ? "A rest day counts, too."
              : "Your next favourite move awaits"
          }
          body={
            pick?.skipped
              ? "Today’s pick is paused. Your preferences haven’t changed."
              : "Add a video and choose a few labels. Your personal practice picks start here."
          }
          action={
            !pick?.skipped ? (
              <Button icon="plus" onPress={() => router.push("/upload")}>
                Add a dance video
              </Button>
            ) : undefined
          }
        />
      )}
      {videos.length ? (
        <Button
          variant="ghost"
          onPress={() =>
            update((l) => ({
              ...l,
              picks: l.picks.map((p) =>
                p.day === localDay() ? { ...p, skipped: true } : p,
              ),
            }))
          }
        >
          Skip today
        </Button>
      ) : null}
      <Row>
        <Icon name="lock" size={16} color={t.muted} />
        <Txt size={12} color={t.muted}>
          Your local videos stay on this device.
        </Txt>
      </Row>
    </Screen>
  );
}

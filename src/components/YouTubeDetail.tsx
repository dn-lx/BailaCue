import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import type { Video } from "../core/types";
import { removeVideo } from "../core/library";
import { useLibrary } from "../services/store";
import { Screen, Button, Card, Txt, Row, Chip, layout } from "./ui";
import { VideoDetails } from "./VideoDetails";
import { NotesMoments } from "./NotesMoments";
import { Disclosure } from "./Disclosure";
import YouTubeEmbed from "./YouTubeEmbed";
import { formatTime } from "../core/practice";
export function YouTubeDetail({ video }: { video: Video }) {
  const { update, updateVideo } = useLibrary();
  const [playing, setPlaying] = useState(false),
    [rate, setRate] = useState(1),
    [position, setPosition] = useState(video.resume),
    [error, setError] = useState("");
  const [rates, setRates] = useState([1]);
  const [seekRequest, setSeek] = useState({ seconds: video.resume, key: 0 }),
    [remove, setRemove] = useState(false),
    [retry, setRetry] = useState(0);
  const time = useRef(video.resume),
    lastSave = useRef(0);
  useFocusEffect(useCallback(() => () => setPlaying(false), []));
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") setPlaying(false);
    });
    return () => {
      sub.remove();
      updateVideo(video.id, { resume: time.current });
    };
  }, [video.id, updateVideo]);
  return (
    <Screen
      title={video.title}
      subtitle="YouTube · online video"
      action={
        <Button variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      }
    >
      <YouTubeEmbed
        key={retry}
        videoId={video.youtube!.id}
        playing={playing}
        rate={rate}
        onRates={setRates}
        onRate={setRate}
        seekRequest={seekRequest}
        onState={(s) => {
          time.current = s.position;
          setPosition(s.position);
          if (s.phase === "playing") setPlaying(true);
          if (s.phase === "paused" || s.phase === "ended") setPlaying(false);
          if (s.duration > 0 && Math.abs(s.duration - video.duration) > 1)
            updateVideo(video.id, { duration: s.duration });
          if (s.phase === "error") {
            setError(s.error ?? "Playback unavailable");
            setPlaying(false);
            if (s.code && [100, 101, 150].includes(s.code))
              updateVideo(video.id, {
                available: false,
                youtube: {
                  ...video.youtube!,
                  embedAllowed: false,
                  unavailableReason: s.error,
                },
              });
          }
          if (Date.now() - lastSave.current > 5000) {
            lastSave.current = Date.now();
            updateVideo(video.id, { resume: s.position });
          }
        }}
        onEnd={() => setPlaying(false)}
      />
      <Row>
        <Button
          variant="soft"
          onPress={() =>
            setSeek({ seconds: Math.max(0, position - 5), key: Date.now() })
          }
        >
          −5 sec
        </Button>
        <Button onPress={() => setPlaying(!playing)}>
          {playing ? "Pause video" : "Play video"}
        </Button>
        <Button
          variant="soft"
          onPress={() =>
            setSeek({
              seconds: Math.min(video.duration || position + 5, position + 5),
              key: Date.now(),
            })
          }
        >
          +5 sec
        </Button>
      </Row>
      <Txt>
        {formatTime(position)} / {formatTime(video.duration)}
      </Txt>
      <View style={layout.wrap}>
        {rates.map((r) => (
          <Chip key={r} selected={rate === r} onPress={() => setRate(r)}>
            {r}×
          </Chip>
        ))}
      </View>
      <VideoDetails video={video} />
      {error ? (
        <Card>
          <Txt accessibilityRole="alert">{error}</Txt>
          <Button
            variant="soft"
            onPress={() => {
              setError("");
              setRetry((n) => n + 1);
            }}
          >
            Retry YouTube player
          </Button>
        </Card>
      ) : null}
      <Button
        variant="soft"
        onPress={() => {
          setPlaying(false);
          void Linking.openURL(
            `https://www.youtube.com/watch?v=${video.youtube!.id}`,
          );
        }}
      >
        Open in YouTube
      </Button>
      <Disclosure title="Extra options">
        <NotesMoments
          video={video}
          time={position}
          onSeek={(seconds) => setSeek({ seconds, key: Date.now() })}
        />
        <Txt>
          YouTube controls provide full screen. Playback speed depends on this
          video’s supported rates. YouTube videos cannot be mirrored, downloaded
          or edited in BailaCue.
        </Txt>
        <Button variant="ghost" onPress={() => setRemove(!remove)}>
          Remove from library
        </Button>
        {remove ? (
          <Card>
            <Txt>
              Remove this library entry and its notes? The original YouTube
              video stays online.
            </Txt>
            <Button
              onPress={() => {
                update((l) => ({
                  ...removeVideo(l, video.id),
                  youtubeSources: l.youtubeSources?.map((s) => ({
                    ...s,
                    videoIds: s.videoIds.filter(
                      (id) => id !== video.youtube!.id,
                    ),
                  })),
                }));
                router.replace("/library");
              }}
            >
              Confirm remove video
            </Button>
            <Button variant="soft" onPress={() => setRemove(false)}>
              Keep video
            </Button>
          </Card>
        ) : null}
      </Disclosure>
    </Screen>
  );
}

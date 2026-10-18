import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  Txt,
  Row,
  Field,
  Chip,
  Button,
  Empty,
  Card,
  layout,
} from "../../components/ui";
import { VideoCard } from "../../components/VideoCard";
import { useLibrary } from "../../services/store";
import { useTheme } from "../../components/theme";
import { filterVideos } from "../../core/library";
import { uid, type DanceStyle, type LearningStatus } from "../../core/types";
export default function LibraryScreen() {
  const { library, update } = useLibrary();
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<DanceStyle>();
  const [status, setStatus] = useState<LearningStatus>();
  const [important, setImportant] = useState(false);
  const [name, setName] = useState("");
  const videos = filterVideos(library.videos, {
    query,
    style,
    status,
    minImportance: important ? 4 : 1,
  });
  return (
    <Screen
      title="Your dance library"
      subtitle={`${library.videos.length} videos. A world of possibilities.`}
      action={
        <Button
          variant="soft"
          icon="plus"
          onPress={() => router.push("/upload")}
        >
          Add
        </Button>
      }
    >
      <Field
        label="Search your moves"
        placeholder="Title, labels, teacher…"
        value={query}
        onChangeText={setQuery}
      />
      <View style={layout.wrap}>
        {[undefined, "Bachata", "Salsa", "Other"].map((s) => (
          <Chip
            key={s ?? "all"}
            selected={style === s}
            onPress={() => setStyle(s as DanceStyle | undefined)}
          >
            {s ?? "All styles"}
          </Chip>
        ))}
      </View>
      <View style={layout.wrap}>
        {(["To learn", "Practising", "Learned"] as const).map((s) => (
          <Chip
            key={s}
            selected={status === s}
            onPress={() => setStatus(status === s ? undefined : s)}
          >
            {s}
          </Chip>
        ))}
        <Chip selected={important} onPress={() => setImportant(!important)}>
          ★ Priority 4–5
        </Chip>
      </View>
      {videos.length ? (
        videos.map((video) => <VideoCard key={video.id} video={video} />)
      ) : (
        <Empty
          title={
            library.videos.length
              ? "No moves match just yet"
              : "A home for your dance videos"
          }
          body={
            library.videos.length
              ? "Try another search or adjust your filters."
              : "Save the moments you want to come back to, from your first basic to your favourite combination."
          }
          action={
            !library.videos.length ? (
              <Button onPress={() => router.push("/upload")} icon="plus">
                Add a video
              </Button>
            ) : undefined
          }
        />
      )}
      <Txt size={24} weight="display">
        Collections
      </Txt>
      <Txt color={t.muted}>
        Keep a class, a combination, or your next practice together.
      </Txt>
      {library.playlists.map((p) => (
        <Card key={p.id}>
          <Row style={{ justifyContent: "space-between" }}>
            <View>
              <Txt size={19} weight="display">
                {p.name}
              </Txt>
              <Txt size={13} color={t.muted}>
                {p.videoIds.length} videos
              </Txt>
            </View>
            <Button
              variant="soft"
              onPress={() =>
                router.push({
                  pathname: "/playlist/[id]",
                  params: { id: p.id },
                })
              }
            >
              Open
            </Button>
          </Row>
        </Card>
      ))}
      <Card>
        <Field
          label="New collection"
          placeholder="Sunday footwork"
          value={name}
          onChangeText={setName}
        />
        <Button
          variant="soft"
          disabled={!name.trim()}
          onPress={() => {
            update((l) => ({
              ...l,
              playlists: [
                ...l.playlists,
                { id: uid(), name: name.trim(), videoIds: [] },
              ],
            }));
            setName("");
          }}
        >
          Create collection
        </Button>
      </Card>
    </Screen>
  );
}

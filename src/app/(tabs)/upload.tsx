import { useRef, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  Card,
  Txt,
  Button,
  Row,
  Field,
  Chip,
  Badge,
  Icon,
  layout,
} from "../../components/ui";
import { useTheme } from "../../components/theme";
import { useLibrary } from "../../services/store";
import { importMedia, recordMedia, deleteMedia } from "../../services/media";
import type { ImportedMedia } from "../../services/media.native";
import { uid, type DanceStyle } from "../../core/types";
import { formatTime } from "../../core/practice";
export default function Upload() {
  const t = useTheme();
  const { update } = useLibrary();
  const [media, setMedia] = useState<ImportedMedia | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState<DanceStyle>("Bachata");
  const [labels, setLabels] = useState("");
  const [teacher, setTeacher] = useState("");
  const [className, setClassName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [importance, setImportance] = useState(3);
  const saved = useRef(false);
  async function pick(record = false) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await (record ? recordMedia() : importMedia());
      if (next) {
        if (media) await deleteMedia(media.uri);
        setMedia(next);
        setTitle(next.name.replace(/\.[^.]+$/, ""));
        saved.current = false;
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function save() {
    if (!media || !title.trim() || saved.current) return;
    saved.current = true;
    const id = uid();
    const now = new Date().toISOString();
    update((l) => ({
      ...l,
      videos: [
        {
          id,
          title: title.trim(),
          ...media,
          style,
          labels: [
            ...new Set(
              labels
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            ),
          ],
          importance,
          status: "To learn",
          teacher,
          className,
          location,
          lessonDate: date,
          createdAt: now,
          resume: 0,
          segments: [],
          bookmarks: [],
          notes: notes.trim()
            ? [{ id: uid(), text: notes.trim(), createdAt: now }]
            : [],
          available: true,
          source: "device",
        },
        ...l.videos,
      ],
    }));
    setMedia(null);
    setTitle("");
    setNotes("");
    router.push({ pathname: "/video/[id]", params: { id } });
  }
  return (
    <Screen
      title="Make room for a move"
      subtitle="A moment from class. A little inspiration. Yours to keep."
    >
      <Card style={{ alignItems: "center", paddingVertical: 28 }}>
        <View
          style={{ backgroundColor: t.soft, padding: 18, borderRadius: 22 }}
        >
          <Icon name="plus" size={32} color={t.primary} />
        </View>
        <Txt size={23} weight="display">
          Bring your videos along
        </Txt>
        <Txt color={t.muted} style={{ textAlign: "center" }}>
          Choose a video from your files or record a fresh practice. Nothing is
          uploaded automatically.
        </Txt>
        <Row style={{ flexWrap: "wrap", justifyContent: "center" }}>
          <Button icon="folder" onPress={() => pick()} loading={busy}>
            Choose a video
          </Button>
          <Button
            variant="soft"
            icon="camera"
            onPress={() => pick(true)}
            disabled={busy}
          >
            Record
          </Button>
        </Row>
      </Card>
      {error ? (
        <Card>
          <Txt color={t.primary} accessibilityRole="alert">
            {error}
          </Txt>
        </Card>
      ) : null}
      {media ? (
        <View style={{ gap: 20 }}>
          <Card>
            <Row style={{ justifyContent: "space-between" }}>
              <Badge tone="lime">READY TO ADD</Badge>
              <Txt size={12} color={t.muted}>
                {formatTime(media.duration)} ·{" "}
                {(media.size / 1048576).toFixed(1)} MB
              </Txt>
            </Row>
            <Txt>{media.name}</Txt>
          </Card>
          <Field label="Video title" value={title} onChangeText={setTitle} />
          <View style={layout.wrap}>
            {(["Bachata", "Salsa", "Other"] as const).map((s) => (
              <Chip key={s} selected={style === s} onPress={() => setStyle(s)}>
                {s}
              </Chip>
            ))}
          </View>
          <Field
            label="Labels, separated by commas"
            placeholder="Footwork, Beginner, Musicality"
            value={labels}
            onChangeText={setLabels}
          />
          <Txt weight="bold">Importance</Txt>
          <Row>
            {[1, 2, 3, 4, 5].map((n) => (
              <Chip
                key={n}
                selected={n === importance}
                onPress={() => setImportance(n)}
              >
                {n} ★
              </Chip>
            ))}
          </Row>
          <Field
            label="Teacher (optional)"
            value={teacher}
            onChangeText={setTeacher}
          />
          <Field
            label="Class or event (optional)"
            value={className}
            onChangeText={setClassName}
          />
          <Field
            label="Location (optional)"
            value={location}
            onChangeText={setLocation}
          />
          <Field
            label="Lesson date (optional)"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />
          <Field
            label="A note to yourself"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
          <Card>
            <Row>
              <Icon name="lock" />
              <View style={{ flex: 1 }}>
                <Txt weight="bold">Destination: This device</Txt>
                <Txt size={13} color={t.muted}>
                  A private local copy. Connected storage uploads are coming in
                  the next milestone.
                </Txt>
              </View>
            </Row>
          </Card>
          <Button icon="check" disabled={!title.trim()} onPress={save}>
            Add to my library
          </Button>
          <Button
            variant="ghost"
            onPress={async () => {
              try {
                await deleteMedia(media.uri);
                if (media.thumbnail?.startsWith("file:"))
                  await deleteMedia(media.thumbnail);
                setMedia(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Discard selected copy
          </Button>
        </View>
      ) : (
        <Card>
          <Badge tone="soft">YOUR STORAGE, YOUR CHOICE</Badge>
          <Txt size={21} weight="display">
            One library. Different places.
          </Txt>
          <Txt color={t.muted}>
            Your connected folders will appear here as upload destinations once
            account and storage setup is complete.
          </Txt>
          <Button variant="ghost" onPress={() => router.push("/settings")}>
            View storage setup
          </Button>
        </Card>
      )}
    </Screen>
  );
}

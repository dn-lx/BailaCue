import { Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { type Video } from "../core/types";
import { formatTime } from "../core/practice";
import { Badge, Icon, Row, Txt } from "./ui";
import { useTheme } from "./theme";
export function VideoCard({
  video,
  featured = false,
}: {
  video: Video;
  featured?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Play ${video.title}`}
      onPress={() =>
        router.push({ pathname: "/video/[id]", params: { id: video.id } })
      }
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: t.border,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: t.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          height: featured ? 210 : 160,
          backgroundColor: video.style === "Bachata" ? "#5B3C59" : "#894E45",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {video.thumbnail ? (
          <Image
            source={{ uri: video.thumbnail }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
          />
        ) : null}
        <View
          style={{
            backgroundColor: "#321D36DD",
            padding: 16,
            borderRadius: 40,
          }}
        >
          <Icon name="play" color="#FFF6E8" size={26} />
        </View>
        <View style={{ position: "absolute", top: 14, left: 14 }}>
          <Badge tone={video.style === "Bachata" ? "lime" : "coral"}>
            {video.style.toUpperCase()}
          </Badge>
        </View>
        <View
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            backgroundColor: "#321D36E6",
            borderRadius: 7,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Txt size={12} color="#FFF6E8">
            {formatTime(video.duration)}
          </Txt>
        </View>
      </View>
      <View style={{ padding: 18, gap: 9 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt size={19} weight="display" style={{ flex: 1 }}>
            {video.title}
          </Txt>
          <Txt size={13} color={t.primary}>
            ★ {video.importance}
          </Txt>
        </Row>
        <Txt size={13} color={t.muted}>
          {[
            video.status,
            video.teacher || "On this device",
            video.labels.slice(0, 2).join(" · "),
          ]
            .filter(Boolean)
            .join("  ·  ")}
        </Txt>
      </View>
    </Pressable>
  );
}

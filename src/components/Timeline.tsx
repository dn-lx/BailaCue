import { useState } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "./theme";
import { formatTime } from "../core/practice";
export type TimelineProps = {
  duration: number;
  position: number;
  disabled: boolean;
  onSeek: (seconds: number) => void;
};
export default function Timeline({
  duration,
  position,
  disabled,
  onSeek,
}: TimelineProps) {
  const t = useTheme();
  const [width, setWidth] = useState(1);
  const change = (seconds: number) =>
    onSeek(Math.max(0, Math.min(duration, seconds)));
  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel="Video position"
      accessibilityState={{ disabled }}
      disabled={disabled}
      accessibilityValue={{
        min: 0,
        max: Math.ceil(duration * 1000),
        now: Math.floor(position * 1000),
        text: `${formatTime(position)} of ${formatTime(duration)}`,
      }}
      accessibilityActions={[
        { name: "increment", label: "Forward five seconds" },
        { name: "decrement", label: "Back five seconds" },
      ]}
      onAccessibilityAction={(event) =>
        change(
          position + (event.nativeEvent.actionName === "increment" ? 5 : -5),
        )
      }
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onPress={(event) =>
        change((event.nativeEvent.locationX / width) * duration)
      }
      style={{ height: 44, justifyContent: "center" }}
    >
      <View
        pointerEvents="none"
        style={{
          height: 6,
          borderRadius: 6,
          backgroundColor: t.soft,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 6,
            borderRadius: 6,
            width: `${Math.min(100, (position / duration) * 100)}%`,
            backgroundColor: t.primary,
          }}
        />
      </View>
    </Pressable>
  );
}

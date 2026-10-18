import type { TimelineProps } from "./Timeline";
import { useTheme } from "./theme";
import { formatTime } from "../core/practice";
export default function Timeline({
  duration,
  position,
  disabled,
  onSeek,
}: TimelineProps) {
  const t = useTheme();
  return (
    <input
      type="range"
      aria-label="Video position"
      aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
      min={0}
      max={duration}
      step={0.01}
      value={Math.min(duration, Math.max(0, position))}
      disabled={disabled}
      onChange={(event) => onSeek(event.currentTarget.valueAsNumber)}
      style={{
        width: "100%",
        height: 44,
        minHeight: 44,
        margin: 0,
        accentColor: t.primary,
        colorScheme: t.dark ? "dark" : "light",
        cursor: disabled ? "wait" : "pointer",
      }}
    />
  );
}

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PanResponder, View, useWindowDimensions } from "react-native";
import { Chip, Row, Txt } from "./ui";
import { useTheme } from "./theme";
import { videoAreaHeight } from "../core/editing";

export function VideoArea({
  children,
  onDragging,
}: {
  children: ReactNode;
  onDragging: (active: boolean) => void;
}) {
  const t = useTheme();
  const { height: viewport } = useWindowDimensions();
  const [requested, setRequested] = useState(270);
  const height = videoAreaHeight(requested, viewport);
  const live = useRef({ height, viewport, onDragging });
  useLayoutEffect(() => {
    live.current = { height, viewport, onDragging };
  }, [height, viewport, onDragging]);
  const origin = useRef(270);
  // PanResponder stores these event callbacks; refs are read only when a gesture runs.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        origin.current = live.current.height;
        live.current.onDragging(true);
      },
      onPanResponderMove: (_, gesture) =>
        setRequested(
          videoAreaHeight(origin.current + gesture.dy, live.current.viewport),
        ),
      onPanResponderRelease: () => live.current.onDragging(false),
      onPanResponderTerminate: () => live.current.onDragging(false),
      onPanResponderTerminationRequest: () => false,
    }),
  );
  return (
    <View>
      <View
        testID="video-frame"
        style={{ backgroundColor: "#080D18", height, overflow: "hidden" }}
      >
        {children}
      </View>
      <View
        {...responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Resize video area"
        accessibilityValue={{
          min: 150,
          max: Math.max(150, Math.min(700, viewport * 0.75)),
          now: Math.round(height),
          text: `${Math.round(height)} pixels tall`,
        }}
        accessibilityActions={[
          { name: "increment", label: "Make video taller" },
          { name: "decrement", label: "Make video shorter" },
        ]}
        onAccessibilityAction={(event) =>
          setRequested(
            videoAreaHeight(
              height +
                (event.nativeEvent.actionName === "increment" ? 40 : -40),
              viewport,
            ),
          )
        }
        style={{
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          backgroundColor: t.surface,
        }}
      >
        <View
          style={{
            width: 44,
            height: 4,
            borderRadius: 4,
            backgroundColor: t.muted,
          }}
        />
        <Txt size={11} color={t.muted}>
          Drag to resize video
        </Txt>
      </View>
      <Row style={{ paddingHorizontal: 20, flexWrap: "wrap" }}>
        {[
          { name: "Compact video", height: 170 },
          { name: "Standard video", height: 270 },
          { name: "Large video", height: 480 },
        ].map((preset) => (
          <Chip
            key={preset.name}
            selected={height === videoAreaHeight(preset.height, viewport)}
            onPress={() => setRequested(preset.height)}
          >
            {preset.name}
          </Chip>
        ))}
      </Row>
    </View>
  );
}

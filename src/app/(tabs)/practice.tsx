import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  Card,
  Txt,
  Button,
  Chip,
  Row,
  Empty,
  layout,
} from "../../components/ui";
import { useLibrary } from "../../services/store";
import { useTheme } from "../../components/theme";
import { formatTime } from "../../core/practice";
import { uid } from "../../core/types";
export default function Practice() {
  const { library, update } = useLibrary();
  const t = useTheme();
  const [minutes, setMinutes] = useState(10);
  const [breakMinutes, setBreakMinutes] = useState(2);
  const [remaining, setRemaining] = useState(600);
  const [active, setActive] = useState(false);
  const [resting, setResting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const deadline = useRef(0);
  const started = useRef("");
  const runningSince = useRef(0);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(left);
      if (!left) {
        setActive(false);
        if (!resting) {
          setElapsed(
            (e) =>
              e +
              Math.max(
                0,
                Math.floor((Date.now() - runningSince.current) / 1000),
              ),
          );
          setResting(true);
          setRemaining(breakMinutes * 60);
        } else {
          setResting(false);
          setRemaining(minutes * 60);
        }
      }
    }, 250);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        const passed = Math.max(
          0,
          Math.floor(
            (Math.min(Date.now(), deadline.current) - runningSince.current) /
              1000,
          ),
        );
        setActive(false);
        setRemaining(
          Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
        );
        if (!resting) setElapsed((e) => e + passed);
      }
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [active, resting, breakMinutes, minutes, remaining]);
  function toggle() {
    if (active) {
      setActive(false);
      if (!resting)
        setElapsed(
          (e) => e + Math.floor((Date.now() - runningSince.current) / 1000),
        );
    } else {
      if (!started.current) started.current = new Date().toISOString();
      deadline.current = Date.now() + remaining * 1000;
      runningSince.current = Date.now();
      setActive(true);
    }
  }
  function finish() {
    const seconds =
      elapsed +
      (active && !resting
        ? Math.max(
            0,
            Math.floor(
              (Math.min(Date.now(), deadline.current) - runningSince.current) /
                1000,
            ),
          )
        : 0);
    if (seconds > 0)
      update((l) => ({
        ...l,
        sessions: [
          {
            id: uid(),
            startedAt: started.current || new Date().toISOString(),
            seconds,
          },
          ...l.sessions,
        ],
      }));
    setActive(false);
    setElapsed(0);
    setResting(false);
    setRemaining(minutes * 60);
    started.current = "";
  }
  return (
    <Screen
      title="Just you and the rhythm"
      subtitle="A few focused minutes can change a move."
    >
      <Card style={{ alignItems: "center", paddingVertical: 30, gap: 20 }}>
        <Txt
          color={t.primary}
          weight="bold"
          size={12}
          style={{ letterSpacing: 2 }}
        >
          {resting ? "BREATHE & RESET" : "TIME TO PRACTISE"}
        </Txt>
        <View
          style={{
            width: 230,
            height: 230,
            borderRadius: 120,
            borderWidth: 9,
            borderColor: t.coral,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Txt size={55} weight="display">
            {formatTime(remaining)}
          </Txt>
          <Txt color={t.muted}>{resting ? "break" : "focus session"}</Txt>
        </View>
        <Row>
          <Button icon={active ? "clock" : "play"} onPress={toggle}>
            {active
              ? "Pause"
              : remaining === minutes * 60
                ? "Start practice"
                : "Continue"}
          </Button>
          <Button variant="soft" onPress={finish}>
            Finish & save
          </Button>
        </Row>
        <Txt size={12} color={t.muted} style={{ textAlign: "center" }}>
          The timer pauses when you leave the app. Save your session to count it
          toward your weekly goal.
        </Txt>
      </Card>
      <Txt size={21} weight="display">
        Set your pace
      </Txt>
      <View style={layout.wrap}>
        {[5, 10, 15, 20].map((m) => (
          <Chip
            key={m}
            selected={minutes === m}
            onPress={() => {
              if (!active) {
                setMinutes(m);
                if (!resting) setRemaining(m * 60);
              }
            }}
          >
            {m} min
          </Chip>
        ))}
      </View>
      <Txt size={14} color={t.muted}>
        Break between sessions
      </Txt>
      <View style={layout.wrap}>
        {[1, 2, 5].map((m) => (
          <Chip
            key={m}
            selected={breakMinutes === m}
            onPress={() => {
              setBreakMinutes(m);
              if (resting && !active) setRemaining(m * 60);
            }}
          >
            {m} min
          </Chip>
        ))}
      </View>
      <Txt size={23} weight="display">
        Pick a move to work on
      </Txt>
      {library.videos.length ? (
        library.videos.slice(0, 5).map((v) => (
          <Card key={v.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Txt weight="bold">{v.title}</Txt>
                <Txt size={12} color={t.muted}>
                  {v.segments.length} saved sections · {v.style}
                </Txt>
              </View>
              <Button
                variant="soft"
                icon="play"
                onPress={() =>
                  router.push({ pathname: "/video/[id]", params: { id: v.id } })
                }
              >
                Play
              </Button>
            </Row>
          </Card>
        ))
      ) : (
        <Empty
          title="Every practice starts somewhere"
          body="Add a class video and save the section you want to work on."
          action={
            <Button onPress={() => router.push("/upload")}>Add a video</Button>
          }
        />
      )}
      <Txt size={23} weight="display">
        Your practice journal
      </Txt>
      {library.sessions.length ? (
        library.sessions.slice(0, 10).map((s) => (
          <Card key={s.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <Txt>
                {new Date(s.startedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </Txt>
              <Txt weight="bold">{formatTime(s.seconds)} practised</Txt>
            </Row>
          </Card>
        ))
      ) : (
        <Txt color={t.muted}>
          Your first session will appear here. One small start is all it takes.
        </Txt>
      )}
    </Screen>
  );
}

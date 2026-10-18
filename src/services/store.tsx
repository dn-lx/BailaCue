import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { emptyLibrary, type Library, type Video } from "../core/types";
import { ensureDailyPick } from "../core/recommendations";
const KEY = "bailacue:device-library:v1";
type Store = {
  library: Library;
  ready: boolean;
  error: string;
  update: (action: (l: Library) => Library) => void;
  updateVideo: (id: string, changes: Partial<Video>) => void;
};
const Context = createContext<Store | null>(null);
export function LibraryProvider({ children }: React.PropsWithChildren) {
  const [library, setLibrary] = useState(emptyLibrary);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.version !== 1 || !Array.isArray(parsed.videos))
            throw new Error("Unrecognised library format.");
          setLibrary(parsed);
        }
        setReady(true);
      })
      .catch(() =>
        setError(
          "Your saved library could not be opened. Restart the app; your files have not been removed.",
        ),
      );
  }, []);
  useEffect(() => {
    if (!ready) return;
    writeQueue.current = writeQueue.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(library)))
      .catch(() =>
        setError(
          "Changes could not be saved. Free some device storage and try again.",
        ),
      );
  }, [library, ready]);
  const update = useCallback(
    (action: (l: Library) => Library) =>
      setLibrary((l) => ensureDailyPick(action(l))),
    [],
  );
  const updateVideo = useCallback(
    (id: string, changes: Partial<Video>) =>
      update((l) => ({
        ...l,
        videos: l.videos.map((v) => (v.id === id ? { ...v, ...changes } : v)),
      })),
    [update],
  );
  return (
    <Context.Provider
      value={{
        library,
        ready,
        error,
        update,
        updateVideo,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLibrary() {
  const context = useContext(Context);
  if (!context) throw new Error("LibraryProvider is missing.");
  return context;
}

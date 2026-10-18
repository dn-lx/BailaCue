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
  clearDeviceLibrary: () => Promise<void>;
};
const Context = createContext<Store | null>(null);
export function LibraryProvider({
  children,
  userId,
}: React.PropsWithChildren<{ userId?: string }>) {
  const storageKey = userId ? `${KEY}:${userId}` : KEY;
  const [library, setLibrary] = useState(emptyLibrary);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const clearing = useRef(false);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.version !== 1 || !Array.isArray(parsed.videos))
            throw new Error("Unrecognised library format.");
          setLibrary({
            ...emptyLibrary(),
            ...parsed,
            cloudSettings: {
              ...emptyLibrary().cloudSettings,
              ...parsed.cloudSettings,
            },
          });
        }
        setReady(true);
      })
      .catch(() =>
        setError(
          "Your saved library could not be opened. Restart the app; your files have not been removed.",
        ),
      );
  }, [storageKey]);
  useEffect(() => {
    if (!ready || clearing.current) return;
    writeQueue.current = writeQueue.current
      .then(() => AsyncStorage.setItem(storageKey, JSON.stringify(library)))
      .catch(() =>
        setError(
          "Changes could not be saved. Free some device storage and try again.",
        ),
      );
  }, [library, ready, storageKey]);
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
        clearDeviceLibrary: async () => {
          clearing.current = true;
          await writeQueue.current;
          await AsyncStorage.removeItem(storageKey);
        },
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

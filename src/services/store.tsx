import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { emptyLibrary, type Library, type Video } from "../core/types";
import { createLibraryWriter } from "./libraryWriter";
import { migrateLibrary } from "../core/dances";
const KEY = "bailacue:device-library:v1";
type Store = {
  library: Library;
  ready: boolean;
  error: string;
  update: (action: (l: Library) => Library) => void;
  getLibrary: () => Library;
  commit: (action: (l: Library) => Library) => Promise<Library>;
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
  const [writer] = useState(() =>
    createLibraryWriter(
      async (next) => AsyncStorage.setItem(storageKey, JSON.stringify(next)),
      setLibrary,
      () =>
        setError(
          "Changes could not be saved. Free some device storage and try again.",
        ),
    ),
  );
  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.version !== 1 || !Array.isArray(parsed.videos))
            throw new Error("Unrecognised library format.");
          writer.hydrate(
            migrateLibrary({
              ...emptyLibrary(),
              ...parsed,
              cloudSettings: {
                ...emptyLibrary().cloudSettings,
                ...parsed.cloudSettings,
              },
              preferences: {
                ...emptyLibrary().preferences,
                ...parsed.preferences,
              },
              activePractice: parsed.activePractice
                ? { ...parsed.activePractice, running: false }
                : undefined,
            }),
          );
        }
        setReady(true);
      })
      .catch(() =>
        setError(
          "Your saved library could not be opened. Restart the app; your files have not been removed.",
        ),
      );
  }, [storageKey, writer]);
  const update = writer.update;
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
        getLibrary: writer.get,
        commit: writer.commit,
        clearDeviceLibrary: async () => {
          await writer.close();
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

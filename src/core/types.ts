export type DanceStyle = "Bachata" | "Salsa" | "Other";
export type LearningStatus = "To learn" | "Practising" | "Learned";
export type Segment = { id: string; name: string; start: number; end: number };
export type Bookmark = { id: string; name: string; time: number };
export type Note = {
  id: string;
  text: string;
  time?: number;
  createdAt: string;
};
export type Video = {
  id: string;
  title: string;
  uri: string;
  thumbnail?: string;
  duration: number;
  size: number;
  style: DanceStyle;
  labels: string[];
  importance: number;
  status: LearningStatus;
  teacher: string;
  className: string;
  location: string;
  lessonDate: string;
  createdAt: string;
  lastPractisedAt?: string;
  resume: number;
  segments: Segment[];
  bookmarks: Bookmark[];
  notes: Note[];
  available: boolean;
  source: "device";
  parentId?: string;
};
export type PracticeSession = {
  id: string;
  startedAt: string;
  seconds: number;
  videoId?: string;
};
export type Playlist = { id: string; name: string; videoIds: string[] };
export type Pick = { day: string; videoIds: string[]; skipped: boolean };
export type Preferences = {
  styles: DanceStyle[];
  labels: string[];
  picksEnabled: boolean;
  weeklyMinutes: number;
  theme: "system" | "light" | "dark";
  cooldownDays: number;
  count: number;
};
export type Library = {
  version: 1;
  videos: Video[];
  sessions: PracticeSession[];
  playlists: Playlist[];
  picks: Pick[];
  feedback: Record<string, number>;
  preferences: Preferences;
};
export const emptyLibrary = (): Library => ({
  version: 1,
  videos: [],
  sessions: [],
  playlists: [],
  picks: [],
  feedback: {},
  preferences: {
    styles: ["Bachata", "Salsa"],
    labels: ["Footwork"],
    picksEnabled: true,
    weeklyMinutes: 60,
    theme: "system",
    cooldownDays: 3,
    count: 1,
  },
});
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export interface Video {
  id: string;
  provider: string;
  providerId: string;
  dance: string;
  title: string;
  kind?: string;
  url?: string;
  filename?: string;
  addedAt?: string;
  updatedAt?: string;
  size?: number;
}
export interface Metadata {
  rating?: number | null;
  favorite?: boolean;
  notes?: string;
  title?: string;
  status?: string;
  lastPractised?: string | null;
}
export interface State {
  version: number;
  meta: Record<string, Metadata>;
  youtube: Video[];
  queue: string[];
  history: { id: string; at: string }[];
  daily: { day: string; ids: string[] } | null;
  theme: string;
}
export interface Filters {
  query?: string;
  dance?: string;
  provider?: string;
  favorite?: boolean;
  rating?: string;
  sort?: string;
}

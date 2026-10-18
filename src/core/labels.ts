import type { Library } from "./types";

export const cleanLabel = (label: string) =>
  label.normalize("NFC").trim().replace(/\s+/g, " ");
const key = (label: string) => cleanLabel(label).toLowerCase();

/** Keep the first spelling, including accents and artist punctuation. */
export function uniqueLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  return labels.map(cleanLabel).filter((label) => {
    if (!label || seen.has(key(label))) return false;
    seen.add(key(label));
    return true;
  });
}

export function libraryLabels(library: Library): string[] {
  return uniqueLabels([
    ...library.videos.flatMap((video) => video.labels),
    ...library.sources.flatMap((source) => source.defaultLabels),
  ]).sort((a, b) => a.localeCompare(b));
}

export function labelChoices(
  existing: string[],
  selected: string[],
  query: string,
) {
  const all = uniqueLabels([...existing, ...selected]);
  const selectedKeys = new Set(selected.map(key));
  const search = key(query);
  return {
    matches: all.filter(
      (label) => !selectedKeys.has(key(label)) && key(label).includes(search),
    ),
    create:
      search && !all.some((label) => key(label) === search)
        ? cleanLabel(query)
        : "",
  };
}

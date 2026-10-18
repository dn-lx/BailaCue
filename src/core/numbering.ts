import type { CloudFolder } from "./types";
import type { RemoteVideo } from "../services/providers/types";
export type NumberEntry = { number: number; originalName: string };
export type SourceNumbering = {
  next: number;
  files: Record<string, NumberEntry>;
};
const prefix = /^(\d{4,})(?:\s+[—-]\s+|(?=\.[a-z0-9]+$)|$)/i;
export function safeVideoName(name: string) {
  const cleaned = name.replace(/[\\/\x00-\x1f]/g, "_").trim();
  const extension = /\.[a-z0-9]{1,8}$/i.exec(cleaned)?.[0] ?? ".mp4";
  const stem = cleaned.endsWith(extension)
    ? cleaned.slice(0, -extension.length)
    : cleaned;
  let result = "";
  for (const c of stem) {
    if (new TextEncoder().encode(result + c + extension).length > 220) break;
    result += c;
  }
  return `${result || "video"}${extension}`;
}
export function numberedName(number: number, original: string) {
  return safeVideoName(
    `${String(number).padStart(4, "0")} — ${original.replace(prefix, "") || "video.mp4"}`,
  );
}
export function stagedUploadNames(source: CloudFolder) {
  return new Map(
    Object.entries(source.numbering?.files ?? {})
      .filter(([key]) => key.startsWith("upload:"))
      .map(([key, entry]) => [
        safeVideoName(
          `${key.slice(7)}-${numberedName(entry.number, entry.originalName)}`,
        ),
        entry,
      ]),
  );
}
export function planNumbering(source: CloudFolder, files: RemoteVideo[]) {
  const state: SourceNumbering = {
    next: Math.max(1, source.numbering?.next ?? 1),
    files: { ...source.numbering?.files },
  };
  const assignedNumbers = new Set(
    Object.entries(state.files)
      .filter(([key]) => !key.startsWith("upload:"))
      .map(([, entry]) => entry.number),
  );
  const reservations = new Map(
    Object.entries(state.files)
      .filter(
        ([key, entry]) =>
          key.startsWith("upload:") && !assignedNumbers.has(entry.number),
      )
      .map(([key, entry]) => [
        `${entry.number}:${numberedName(entry.number, entry.originalName)}`,
        key,
      ]),
  );
  const staged = stagedUploadNames(source);
  const used = new Set(Object.values(state.files).map((v) => v.number));
  for (const entry of Object.values(state.files))
    state.next = Math.max(state.next, entry.number + 1);
  // Adopt existing numbered files before assigning new numbers. This also recovers
  // identity after reconnect/new-device sync, without renumbering older files.
  const sorted = [...files].sort(
    (a, b) =>
      a.name.localeCompare(b.name, "en") || a.fileId.localeCompare(b.fileId),
  );
  for (const file of sorted) {
    if (state.files[file.fileId]) continue;
    const stage = staged.get(file.name);
    if (stage && !assignedNumbers.has(stage.number)) {
      state.files[file.fileId] = { ...stage };
      assignedNumbers.add(stage.number);
      continue;
    }
    const match = prefix.exec(file.name);
    const number = Number(match?.[1]);
    const reservation = reservations.get(`${number}:${file.name}`);
    if (
      match &&
      Number.isSafeInteger(number) &&
      number > 0 &&
      (!used.has(number) || reservation)
    ) {
      state.files[file.fileId] = {
        number,
        originalName: file.name.replace(prefix, "") || "video.mp4",
      };
      if (reservation) {
        delete state.files[reservation];
        reservations.delete(`${number}:${file.name}`);
      }
      used.add(number);
      state.next = Math.max(state.next, number + 1);
    }
  }
  const names = new Map<string, string>();
  for (const file of sorted) {
    if (!state.files[file.fileId]) {
      state.files[file.fileId] = {
        number: state.next++,
        originalName: file.name.replace(prefix, "") || "video.mp4",
      };
    }
    const entry = state.files[file.fileId];
    names.set(file.fileId, numberedName(entry.number, entry.originalName));
  }
  return { numbering: state, names };
}
export function reserveUploadNumber(
  source: CloudFolder,
  jobId: string,
  name: string,
) {
  const plan = planNumbering(source, []);
  const key = `upload:${jobId}`;
  const entry = plan.numbering.files[key] ?? {
    number: plan.numbering.next++,
    originalName: name.replace(prefix, "") || "video.mp4",
  };
  plan.numbering.files[key] = entry;
  return {
    numbering: plan.numbering,
    number: entry.number,
    name: numberedName(entry.number, entry.originalName),
  };
}
export function sourceStyle(source: CloudFolder) {
  const salsa = /\bsalsa\b/i.test(source.name),
    bachata = /\bbachata\b/i.test(source.name);
  return salsa !== bachata
    ? salsa
      ? ("Salsa" as const)
      : ("Bachata" as const)
    : source.defaultStyle;
}

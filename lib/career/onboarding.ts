export interface Selection {
  major: string;
  grade: string;
}
export function validateSelection(value: unknown): Selection | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.major !== "string" ||
    !v.major.trim() ||
    !/^[\p{L}\p{N} /（）。()、-]+$/u.test(v.major.trim()) ||
    !/\p{L}/u.test(v.major) ||
    v.major.trim().length > 80 ||
    typeof v.grade !== "string" ||
    !["1", "2", "3", "4"].includes(v.grade)
  )
    return null;
  return { major: v.major.trim(), grade: v.grade };
}
export function selectionKey(owner: string | null): string {
  return `career-workspace:v1:${owner ? `account:${owner}` : "guest"}`;
}
export function readSelection(
  storage: Pick<Storage, "getItem">,
  owner: string | null,
): Selection | null {
  try {
    return validateSelection(
      JSON.parse(storage.getItem(selectionKey(owner)) ?? "null"),
    );
  } catch {
    return null;
  }
}
export function saveSelection(
  storage: Pick<Storage, "setItem">,
  owner: string | null,
  value: unknown,
): boolean {
  const selection = validateSelection(value);
  if (!selection) return false;
  try {
    storage.setItem(selectionKey(owner), JSON.stringify(selection));
    return true;
  } catch {
    return false;
  }
}
export const yearLabel = (grade: string) =>
  ({ "1": "大一", "2": "大二", "3": "大三", "4": "大四" })[grade] ?? "";

// Shared (pure) helpers for the Hugging Face dataset viewer. No server-only imports.
export const HF_REPO = "aiguy712/study-os-past-papers";
export const HF_ROOT = "past-papers";

export function sanitizeHfPath(input: string | null | undefined): string | null {
  if (!input) return HF_ROOT;
  const p = input.replace(/\\/g, "/").trim().replace(/\/+/g, "/");
  if (p.includes("\0")) return null;
  const segs = p.split("/").filter((s) => s.length > 0 && s !== ".");
  if (segs.some((s) => s === "..")) return null;
  const clean = segs.join("/");
  if (clean === HF_ROOT) return HF_ROOT;
  if (!clean.startsWith(HF_ROOT + "/")) return null;
  return clean;
}

export function splitHfPath(clean: string): string[] {
  return clean.split("/").filter(Boolean);
}

export function formatBytes(n?: number): string {
  if (n === undefined || Number.isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb >= 100 ? Math.round(kb) : kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function hfFileHref(path: string, download = false): string {
  const enc = path.split("/").map(encodeURIComponent).join("/");
  return `/api/hf/file?path=${enc}${download ? "&download=1" : ""}`;
}

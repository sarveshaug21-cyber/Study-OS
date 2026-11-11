import "server-only";
import { sanitizeRelativePath, sanitizeFileName } from "@/lib/drive-shared";

// Parse a browser-supplied relative path ("A/B/file.pdf") or bare filename.
// Returns folder segments (parents) and a safe filename.
export function parseRelativeFilePath(input: string | undefined | null, fallbackName: string):
  | { ok: true; folderSegments: string[]; fileName: string; folderPath: string }
  | { ok: false; error: string } {
  const trimmed = (input ?? "").trim();
  if (trimmed) {
    const s = sanitizeRelativePath(trimmed);
    if (!s.ok) return { ok: false, error: s.error };
    if (s.segments.length === 0) {
      // relativePath was all separators
      const fb = sanitizeFileName(fallbackName);
      if (!fb.ok) return { ok: false, error: fb.error };
      return { ok: true, folderSegments: [], fileName: fb.name, folderPath: "" };
    }
    const fileName = s.segments[s.segments.length - 1];
    const folderSegments = s.segments.slice(0, -1);
    return { ok: true, folderSegments, fileName, folderPath: folderSegments.join("/") };
  }
  const fb = sanitizeFileName(fallbackName);
  if (!fb.ok) return { ok: false, error: fb.error };
  return { ok: true, folderSegments: [], fileName: fb.name, folderPath: "" };
}

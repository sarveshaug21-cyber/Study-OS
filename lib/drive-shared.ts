// Shared, pure helpers for the Drive upload/import feature.
// No server-only imports — consumed by API routes, UI code and the test suite.

export const SUPPORTED_EXTENSIONS = [
  "pdf", "docx", "pptx", "xlsx", "txt", "md", "doc", "ppt", "jpg", "jpeg", "png",
] as const;

export const SUPPORTED_UPLOAD_MIME = new Set<string>([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-powerpoint",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
]);

// Google Workspace files have no md5/size in list responses; they are
// exported on import. Map to (extension, export MIME type).
export const WORKSPACE_EXPORT: Record<string, { ext: string; mime: string }> = {
  "application/vnd.google-apps.document": { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  "application/vnd.google-apps.presentation": { ext: "pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  "application/vnd.google-apps.spreadsheet": { ext: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  "application/vnd.google-apps.drawing": { ext: "pdf", mime: "application/pdf" },
};

export const MAX_FILE_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_INLINE_UPLOAD_BYTES = 4 * 1024 * 1024; // multipart path
export const MAX_WORKSPACE_EXPORT_BYTES = 10 * 1024 * 1024; // Google export cap
export const MAX_IMPORT_FILES = 500;
export const MAX_PATH_DEPTH = 10;
export const MAX_SEGMENT_LENGTH = 100;
export const MAX_PATH_LENGTH = 400;

export function fileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function isSupportedName(name: string, mimeType: string | undefined | null): boolean {
  const ext = fileExtension(name);
  if (SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])) return true;
  if (mimeType && SUPPORTED_UPLOAD_MIME.has(mimeType)) return true;
  return false;
}

export function isGoogleForm(mimeType: string | undefined | null): boolean {
  return mimeType === "application/vnd.google-apps.form";
}

export function isWorkspaceExportable(mimeType: string | undefined | null): boolean {
  return !!mimeType && mimeType in WORKSPACE_EXPORT;
}

export function exportSpec(mimeType: string | undefined | null): { ext: string; mime: string } | null {
  return (mimeType && WORKSPACE_EXPORT[mimeType]) || null;
}

// Sanitize a browser-supplied relative path. Returns sanitized segments
// (path, without leading slash) or an error. Never allows traversal.
export function sanitizeRelativePath(input: string | undefined | null): { ok: true; segments: string[] } | { ok: false; error: string } {
  if (input == null) return { ok: true, segments: [] };
  if (typeof input !== "string") return { ok: false, error: "relativePath must be a string" };
  const trimmed = input.trim();
  if (trimmed.length === 0) return { ok: true, segments: [] };
  if (trimmed.length > MAX_PATH_LENGTH) return { ok: false, error: `relativePath too long (max ${MAX_PATH_LENGTH})` };
  if (trimmed.includes("\0")) return { ok: false, error: "relativePath contains NUL" };
  // Normalise separators; backslash is not a separator on our server.
  const raw = trimmed.replace(/\\/g, "/");
  const parts = raw.split("/");
  const segments: string[] = [];
  for (const part of parts) {
    const seg = part.trim();
    if (seg === "" || seg === ".") continue;
    if (seg === "..") return { ok: false, error: "relativePath may not contain '..'" };
    if (seg.length > MAX_SEGMENT_LENGTH) return { ok: false, error: `segment too long (max ${MAX_SEGMENT_LENGTH}): ${seg.slice(0, 32)}…` };
    // Strip characters that are unsafe on common filesystems / Drive (Drive allows most, keep conservative).
    const cleaned = seg.replace(/[:*?"<>|]/g, " ").replace(/\s{2,}/g, " ").trim();
    if (!cleaned) return { ok: false, error: "segment became empty after sanitisation" };
    segments.push(cleaned);
  }
  if (segments.length > MAX_PATH_DEPTH) return { ok: false, error: `path too deep (max ${MAX_PATH_DEPTH})` };
  return { ok: true, segments };
}

export function sanitizeFileName(name: string): { ok: true; name: string } | { ok: false; error: string } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return { ok: false, error: "filename is empty" };
  if (trimmed.length > MAX_SEGMENT_LENGTH) return { ok: false, error: `filename too long (max ${MAX_SEGMENT_LENGTH})` };
  const clean = trimmed.replace(/[:*?"<>|]/g, " ").replace(/\s{2,}/g, " ").trim();
  if (!clean || clean === "." || clean === "..") return { ok: false, error: "filename is invalid" };
  return { ok: true, name: clean };
}

export type ImportClassification =
  | { action: "copy" }                    // native binary → Drive files.copy
  | { action: "export"; ext: string; mime: string }  // Google Workspace → export
  | { action: "skipped"; reason: string };

export function classifyImportFile(fileName: string, mimeType: string | undefined | null, size: number | undefined): ImportClassification {
  if (isGoogleForm(mimeType)) return { action: "skipped", reason: "Google Forms cannot be exported" };
  const spec = exportSpec(mimeType);
  if (spec) {
    if (size !== undefined && size > MAX_WORKSPACE_EXPORT_BYTES) return { action: "skipped", reason: `exceeds ${MAX_WORKSPACE_EXPORT_BYTES / 1024 / 1024}MB export limit` };
    return { action: "export", ...spec };
  }
  if (isWorkspaceExportable(mimeType)) return { action: "skipped", reason: "unsupported Google Workspace type" };
  if (mimeType?.startsWith("application/vnd.google-apps.")) return { action: "skipped", reason: `unsupported Google Workspace type (${mimeType})` };
  if (size !== undefined && size > MAX_FILE_BYTES) return { action: "skipped", reason: `exceeds ${MAX_FILE_BYTES / 1024 / 1024}MB limit` };
  if (!isSupportedName(fileName, mimeType ?? undefined)) return { action: "skipped", reason: "unsupported file type" };
  return { action: "copy" };
}

// Group manifest entries into a nested folder tree for display.
export interface TreeNode {
  name: string;
  files: Array<{ id: string; name: string; size?: string; mimeType?: string }>;
  children: Map<string, TreeNode>;
}

export function buildTree(files: Array<{ id: string; name: string; size?: string; mimeType?: string; folderPath?: string }>): TreeNode {
  const root: TreeNode = { name: "", files: [], children: new Map() };
  for (const f of files) {
    const segs = (f.folderPath ?? "").split("/").filter(Boolean);
    let node = root;
    for (const seg of segs) {
      if (!node.children.has(seg)) node.children.set(seg, { name: seg, files: [], children: new Map() });
      node = node.children.get(seg)!;
    }
    node.files.push({ id: f.id, name: f.name, size: f.size, mimeType: f.mimeType });
  }
  return root;
}

export function dedupeDecision(
  existing: Array<{ name: string; md5Checksum?: string; size?: string }> | undefined,
  candidate: { name: string; md5?: string; size?: string | number | undefined },
): "import" | "duplicate" {
  if (!existing) return "import";
  const candSize = candidate.size === undefined ? undefined : String(candidate.size);
  const match = existing.find((e) => e.name === candidate.name && ((candidate.md5 && e.md5Checksum && e.md5Checksum === candidate.md5) || (candSize && e.size === candSize)));
  return match ? "duplicate" : "import";
}

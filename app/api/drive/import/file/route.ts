import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { upsertFileMeta } from "@/lib/google-drive-storage";
import {
  getMetadata, ensureFolderPath, findChildFiles, copyFileToFolder, exportWorkspaceFile, uploadFile,
} from "@/lib/google-drive";
import { sanitizeRelativePath, classifyImportFile, dedupeDecision } from "@/lib/drive-shared";

const FOLDER_ID_RE = /^[A-Za-z0-9_-]{10,}$/;

interface SourceMeta { id: string; name: string; mimeType: string; size?: string; md5Checksum?: string; parents?: string[] }

// Phase 2 of a Google Drive folder import: copy or export one source file
// into the caller's Study OS root, preserving its relative path.
// Idempotent — safe to retry; duplicates are detected against the destination.
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const { accessToken, folderId: rootId } = await requireDriveAccess();
    const body = await req.json().catch(() => ({}));
    const sourceId = typeof body?.sourceId === "string" ? body.sourceId : "";
    if (!FOLDER_ID_RE.test(sourceId)) return json({ error: "sourceId is invalid" }, 400);
    const relativePath = typeof body?.relativePath === "string" ? body.relativePath : "";
    const sourceFolder = typeof body?.sourceFolder === "string" ? body.sourceFolder.slice(0, 200) : undefined;

    let meta: SourceMeta;
    try {
      const m = await getMetadata(accessToken, sourceId);
      meta = { ...m, md5Checksum: (m as { md5Checksum?: string }).md5Checksum };
    } catch {
      return json({ action: "inaccessible", sourceId, reason: "cannot read source file (no access or deleted)" });
    }

    // Decide copy vs export from the server-side metadata, never client claims.
    const size = meta.size !== undefined ? Number(meta.size) : undefined;
    const cls = classifyImportFile(meta.name, meta.mimeType, Number.isFinite(size) ? size : undefined);
    if (cls.action === "skipped") return json({ action: "skipped", sourceId, name: meta.name, reason: cls.reason });

    const targetName = cls.action === "export" && !meta.name.toLowerCase().endsWith(`.${cls.ext}`) ? `${meta.name}.${cls.ext}` : meta.name;
    // Folder hierarchy comes from the source relativePath (its filename segment is ignored).
    const rel = sanitizeRelativePath(relativePath);
    if (!rel.ok) return json({ error: rel.error }, 400);
    const folderSegments = rel.segments.slice(0, -1);
    const folderPath = folderSegments.join("/");

    const parentId = await ensureFolderPath(accessToken, rootId, folderSegments);

    // Duplicate detection against destination folder.
    const existing = await findChildFiles(accessToken, parentId, targetName);
    const md5 = cls.action === "copy" ? meta.md5Checksum : undefined;
    if (dedupeDecision(existing, { name: targetName, md5, size: cls.action === "copy" ? meta.size : undefined }) === "duplicate") {
      return json({ action: "skipped-duplicate", sourceId, name: targetName, folderPath });
    }

    try {
      if (cls.action === "export") {
        const buf = await exportWorkspaceFile(accessToken, sourceId, cls.mime);
        const uploaded = await uploadFile(accessToken, parentId, { name: targetName, type: cls.mime, data: buf });
        await upsertFileMeta(userId, { id: uploaded.id, name: uploaded.name, mimeType: cls.mime, size: uploaded.size, parentId, folderPath, source: "drive-import", sourceFolder, sourceFileId: sourceId, status: "imported", importedAt: new Date().toISOString() });
        return json({ action: "imported", sourceId, name: uploaded.name, fileId: uploaded.id, folderPath, via: "export" });
      }
      const copied = await copyFileToFolder(accessToken, sourceId, parentId, targetName);
      await upsertFileMeta(userId, { id: copied.id, name: copied.name, mimeType: copied.mimeType, size: copied.size, parentId, folderPath, source: "drive-import", sourceFolder, sourceFileId: sourceId, status: "imported", importedAt: new Date().toISOString() });
      return json({ action: "imported", sourceId, name: copied.name, fileId: copied.id, folderPath, via: "copy" });
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 403 || status === 404) {
        return json({ action: "inaccessible", sourceId, name: meta.name, reason: "no access to this file (drive.file scope)" });
      }
      throw e; // withUser maps to 500 without leaking internals
    }
  });
}

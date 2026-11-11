import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { listFolderRecursive } from "@/lib/google-drive";
import { classifyImportFile } from "@/lib/drive-shared";

export const dynamic = "force-dynamic";

const FOLDER_ID_RE = /^[A-Za-z0-9_-]{10,}$/;

// Phase 1 of a Google Drive folder import: enumerate the source folder
// recursively and classify every file. Returns a manifest for the client to
// drive phase 2 (one /api/drive/import/file call per file).
export async function POST(req: Request) {
  return withUser(async () => {
    const { accessToken } = await requireDriveAccess();
    const body = await req.json().catch(() => ({}));
    const sourceFolderId = typeof body?.sourceFolderId === "string" ? body.sourceFolderId : "";
    if (!FOLDER_ID_RE.test(sourceFolderId)) return json({ error: "sourceFolderId is invalid" }, 400);

    const enumerated = await listFolderRecursive(accessToken, sourceFolderId);
    const files: Array<{ id: string; name: string; mimeType: string; size?: string; md5Checksum?: string; relativePath: string; action: "copy" | "export"; exportExt?: string }> = [];
    const skipped: Array<{ name: string; path: string; reason: string }> = [];

    for (const f of enumerated.files) {
      const size = f.size !== undefined ? Number(f.size) : undefined;
      const spec = classifyImportFile(f.name, f.mimeType, Number.isFinite(size) ? size : undefined);
      if (spec.action === "skipped") {
        skipped.push({ name: f.name, path: f.relativePath, reason: spec.reason });
      } else if (spec.action === "export") {
        files.push({ id: f.id, name: f.name, mimeType: f.mimeType, size: f.size, md5Checksum: f.md5Checksum, relativePath: f.relativePath, action: "export", exportExt: spec.ext });
      } else {
        files.push({ id: f.id, name: f.name, mimeType: f.mimeType, size: f.size, md5Checksum: f.md5Checksum, relativePath: f.relativePath, action: "copy" });
      }
    }

    return json({
      sourceFolderId,
      files,
      skipped,
      issues: enumerated.issues,
      emptyFolders: enumerated.emptyFolders,
      truncated: enumerated.truncated,
      total: files.length + skipped.length,
    });
  });
}

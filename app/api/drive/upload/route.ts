import { createHash } from "node:crypto";
import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { uploadFile, isWithinRoot, ensureFolderPath, findChildFiles } from "@/lib/google-drive";
import { upsertFileMeta } from "@/lib/google-drive-storage";
import { parseRelativeFilePath } from "@/lib/drive-route";
import { dedupeDecision, MAX_FILE_BYTES } from "@/lib/drive-shared";

export async function POST(req: Request) {
  return withUser(async (userId) => {
    const { accessToken, folderId } = await requireDriveAccess();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "file is required" }, 400);
    if (file.size > MAX_FILE_BYTES) return json({ error: `file exceeds ${MAX_FILE_BYTES / 1024 / 1024}MB limit` }, 400);

    const board = (form.get("board") as string) || undefined;
    const qualification = (form.get("qualification") as string) || undefined;
    const subject = (form.get("subject") as string) || undefined;

    const parsed = parseRelativeFilePath(form.get("relativePath") as string | null, file.name);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const { folderSegments, fileName, folderPath } = parsed;

    let parentId: string;
    if (folderSegments.length > 0 || (form.get("relativePath") as string | null)?.trim()) {
      parentId = await ensureFolderPath(accessToken, folderId, folderSegments);
    } else {
      const requestedParent = (form.get("parentId") as string) || folderId;
      if (!(await isWithinRoot(accessToken, requestedParent, folderId))) return json({ error: "Parent folder is outside the Study OS root." }, 400);
      parentId = requestedParent;
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const md5 = createHash("md5").update(buf).digest("hex");

    // De-duplicate against what is already in the destination folder.
    const existing = await findChildFiles(accessToken, parentId, fileName);
    if (dedupeDecision(existing, { name: fileName, md5, size: buf.length }) === "duplicate") {
      return json({ duplicate: true, parentId, folderPath, name: fileName }, 200);
    }

    const uploaded = await uploadFile(accessToken, parentId, { name: fileName, type: file.type, data: buf });
    await upsertFileMeta(userId, { id: uploaded.id, name: uploaded.name, mimeType: uploaded.mimeType, size: uploaded.size, parentId, board, qualification, subject, folderPath, source: "upload", status: "imported", importedAt: new Date().toISOString() });
    return json({ file: uploaded, folderPath }, 201);
  });
}

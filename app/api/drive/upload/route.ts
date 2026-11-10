import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { uploadFile } from "@/lib/google-drive";
import { upsertFileMeta } from "@/lib/google-drive-storage";
import { requireUserId } from "@/lib/auth";
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const { accessToken, folderId } = await requireDriveAccess();
    const form = await req.formData();
    const file = form.get("file");
    const requestedParent = (form.get("parentId") as string) || folderId;
    if (!(await (await import("@/lib/google-drive")).isWithinRoot(accessToken, requestedParent, folderId))) return json({ error: "Parent folder is outside the Study OS root." }, 400);
    const parentId = requestedParent;
    const board = (form.get("board") as string) || undefined;
    const qualification = (form.get("qualification") as string) || undefined;
    const subject = (form.get("subject") as string) || undefined;
    if (!(file instanceof File)) return json({ error: "file is required" }, 400);
    const buf = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFile(accessToken, parentId, { name: file.name, type: file.type, data: buf });
    await upsertFileMeta(userId, { id: uploaded.id, name: uploaded.name, mimeType: uploaded.mimeType, size: uploaded.size, parentId, board, qualification, subject, importedAt: new Date().toISOString() });
    return json({ file: uploaded }, 201);
  });
}

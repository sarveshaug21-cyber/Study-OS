import { withUser, json, requireString } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { upsertFileMeta } from "@/lib/google-drive-storage";
import { requireUserId } from "@/lib/auth";
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const body = await req.json().catch(() => ({}));
    const fileId = requireString(body, "fileId", 200);
    const name = requireString(body, "name", 500);
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "application/octet-stream";
    const size = typeof body.size === "string" ? body.size : (typeof body.size === "number" ? String(body.size) : undefined);
    const parentId = typeof body.parentId === "string" ? body.parentId : "";
    await upsertFileMeta(userId, { id: fileId, name, mimeType, size, parentId, board: body.board, qualification: body.qualification, subject: body.subject, importedAt: new Date().toISOString() });
    return json({ ok: true, fileId });
  });
}

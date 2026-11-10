import { withUser, json, requireString } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { upsertFileMeta } from "@/lib/google-drive-storage";
import { getMetadata, isWithinRoot } from "@/lib/google-drive";
export async function POST(req: Request) {
  return withUser(async (userId) => {
    const { accessToken, folderId: rootId } = await requireDriveAccess();
    const body = await req.json().catch(() => ({}));
    const fileId = requireString(body, "fileId", 200);
    // Verify against Google Drive — never trust browser-supplied metadata.
    let meta: { id: string; name: string; mimeType: string; size?: string; parents?: string[] };
    try { meta = await getMetadata(accessToken, fileId); } catch { return json({ error: "Uploaded file not found on Google Drive." }, 404); }
    const parent = meta.parents?.[0];
    if (!parent || !(await isWithinRoot(accessToken, parent, rootId))) return json({ error: "Uploaded file is outside the Study OS root." }, 400);
    await upsertFileMeta(userId, { id: meta.id, name: meta.name, mimeType: meta.mimeType, size: meta.size, parentId: parent, board: typeof body.board === "string" ? body.board : undefined, qualification: typeof body.qualification === "string" ? body.qualification : undefined, subject: typeof body.subject === "string" ? body.subject : undefined, importedAt: new Date().toISOString() });
    return json({ ok: true, fileId: meta.id });
  });
}

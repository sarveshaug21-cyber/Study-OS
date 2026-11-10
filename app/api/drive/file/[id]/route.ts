import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { renameFile, deleteFile, isWithinRoot } from "@/lib/google-drive";
import { removeFileMeta } from "@/lib/google-drive-storage";
import { requireString } from "@/lib/api-helpers";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withUser(async () => {
    const { accessToken, folderId: rootId } = await requireDriveAccess();
    const { id } = await ctx.params;
    if (!(await isWithinRoot(accessToken, id, rootId))) return json({ error: "File is outside the Study OS root." }, 403);
    const body = await req.json().catch(() => ({}));
    const name = requireString(body, "name", 500);
    const f = await renameFile(accessToken, id, name);
    return json({ file: f });
  });
}
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withUser(async (userId) => {
    const { accessToken, folderId: rootId } = await requireDriveAccess();
    const { id } = await ctx.params;
    if (!(await isWithinRoot(accessToken, id, rootId))) return json({ error: "File is outside the Study OS root." }, 403);
    await deleteFile(accessToken, id);
    await removeFileMeta(userId, id);
    return json({ ok: true });
  });
}

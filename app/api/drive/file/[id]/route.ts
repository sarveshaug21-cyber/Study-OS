import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { renameFile, deleteFile } from "@/lib/google-drive";
import { removeFileMeta } from "@/lib/google-drive-storage";
import { requireString } from "@/lib/api-helpers";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withUser(async () => {
    const { accessToken } = await requireDriveAccess();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const name = requireString(body, "name", 500);
    const f = await renameFile(accessToken, id, name);
    return json({ file: f });
  });
}
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withUser(async (userId) => {
    const { accessToken } = await requireDriveAccess();
    const { id } = await ctx.params;
    await deleteFile(accessToken, id);
    await removeFileMeta(userId, id);
    return json({ ok: true });
  });
}

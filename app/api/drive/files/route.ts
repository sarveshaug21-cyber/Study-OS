import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { listFiles } from "@/lib/google-drive";
import { listFileMeta } from "@/lib/google-drive-storage";
export async function GET(req: Request) {
  return withUser(async () => {
    const { accessToken, folderId } = await requireDriveAccess();
    const parentId = new URL(req.url).searchParams.get("folderId") || folderId;
    const files = await listFiles(accessToken, parentId);
    const meta = await listFileMeta((await (await import("@/lib/auth")).requireUserId()));
    return json({ files, meta, rootFolderId: folderId, parentId });
  });
}

import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { searchFiles } from "@/lib/google-drive";
export async function GET(req: Request) {
  return withUser(async () => {
    const { accessToken, folderId } = await requireDriveAccess();
    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (!q) return json({ files: [] });
    const files = await searchFiles(accessToken, folderId, q);
    return json({ files });
  });
}

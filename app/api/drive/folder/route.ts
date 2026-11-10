import { withUser, json, requireString } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { createFolder } from "@/lib/google-drive";
export async function POST(req: Request) {
  return withUser(async () => {
    const { accessToken, folderId } = await requireDriveAccess();
    const body = await req.json().catch(() => ({}));
    const name = requireString(body, "name", 200);
    const parentId = (body.parentId as string) || folderId;
    const f = await createFolder(accessToken, name, parentId);
    return json({ folder: f }, 201);
  });
}

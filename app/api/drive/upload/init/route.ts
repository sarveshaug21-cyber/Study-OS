import { withUser, json, requireString } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { isWithinRoot, ensureFolderPath, findChildFiles } from "@/lib/google-drive";
import { parseRelativeFilePath } from "@/lib/drive-route";
import { dedupeDecision, MAX_FILE_BYTES } from "@/lib/drive-shared";

export async function POST(req: Request) {
  return withUser(async () => {
    const { accessToken, folderId: rootId } = await requireDriveAccess();
    const body = await req.json().catch(() => ({}));
    const name = requireString(body, "name", 500);
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "application/octet-stream";
    const size = typeof body.size === "number" ? body.size : undefined;
    if (size !== undefined && size > MAX_FILE_BYTES) return json({ error: `file exceeds ${MAX_FILE_BYTES / 1024 / 1024}MB limit` }, 400);

    const parsed = parseRelativeFilePath(typeof body.relativePath === "string" ? body.relativePath : undefined, name);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const { folderSegments, fileName, folderPath } = parsed;

    let parentId: string;
    const hasRelative = typeof body.relativePath === "string" && body.relativePath.trim().length > 0;
    if (hasRelative) {
      parentId = await ensureFolderPath(accessToken, rootId, folderSegments);
    } else {
      const requestedParent = typeof body.parentId === "string" && body.parentId ? body.parentId : rootId;
      if (!(await isWithinRoot(accessToken, requestedParent, rootId))) return json({ error: "Parent folder is outside the Study OS root." }, 400);
      parentId = requestedParent;
    }

    // De-duplicate before opening a resumable session.
    if (hasRelative) {
      const existing = await findChildFiles(accessToken, parentId, fileName);
      if (dedupeDecision(existing, { name: fileName, size }) === "duplicate") {
        return json({ duplicate: true, parentId, folderPath, name: fileName });
      }
    }

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        ...(size ? { "X-Upload-Content-Length": String(size) } : {}),
      },
      body: JSON.stringify({ name: fileName, parents: [parentId] }),
    });
    if (!res.ok) return json({ error: `Failed to init resumable upload (${res.status})` }, 502);
    const uploadUrl = res.headers.get("Location");
    if (!uploadUrl) return json({ error: "No upload URL returned" }, 502);
    return json({ uploadUrl, parentId, name: fileName, mimeType, folderPath });
  });
}

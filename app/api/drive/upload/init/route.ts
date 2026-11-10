import { withUser, json, requireString } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
export async function POST(req: Request) {
  return withUser(async () => {
    const { accessToken, folderId } = await requireDriveAccess();
    const body = await req.json().catch(() => ({}));
    const name = requireString(body, "name", 500);
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "application/octet-stream";
    const parentId = typeof body.parentId === "string" && body.parentId ? body.parentId : folderId;
    const size = typeof body.size === "number" ? body.size : undefined;
    // Create a resumable upload session.
    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        ...(size ? { "X-Upload-Content-Length": String(size) } : {}),
      },
      body: JSON.stringify({ name, parents: [parentId] }),
    });
    if (!res.ok) return json({ error: `Failed to init resumable upload (${res.status})` }, 502);
    const uploadUrl = res.headers.get("Location");
    if (!uploadUrl) return json({ error: "No upload URL returned" }, 502);
    return json({ uploadUrl, parentId, name, mimeType });
  });
}

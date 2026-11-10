import { withUser } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { downloadFile } from "@/lib/google-drive";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  return withUser(async () => {
    const { accessToken } = await requireDriveAccess();
    const fileId = new URL(req.url).searchParams.get("fileId");
    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });
    const f = await downloadFile(accessToken, fileId);
    return new NextResponse(new Uint8Array(f.data), { headers: { "Content-Type": f.mimeType, "Content-Disposition": `attachment; filename="${f.name}"` } });
  });
}

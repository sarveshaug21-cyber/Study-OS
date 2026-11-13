import { NextResponse } from "next/server";
import { withUser, json } from "@/lib/api-helpers";
import { hfConfigured, fetchHfFile } from "@/lib/hf";
import { sanitizeHfPath } from "@/lib/hf-shared";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withUser(async () => {
    if (!hfConfigured()) return json({ error: "Hugging Face viewer not configured (HF_TOKEN missing on server)." }, 503);
    const url = new URL(req.url);
    const raw = url.searchParams.get("path");
    const path = sanitizeHfPath(raw);
    if (!path) return json({ error: "Invalid path." }, 400);
    const download = url.searchParams.get("download") === "1";
    try {
      const { upstream, fileName } = await fetchHfFile(path);
      const headers = new Headers();
      headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "application/pdf");
      const len = upstream.headers.get("Content-Length");
      if (len) headers.set("Content-Length", len);
      headers.set("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${fileName.replace(/"/g, "_")}"`);
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Cache-Control", "private, max-age=3600");
      return new NextResponse(upstream.body as unknown as ReadableStream, { status: 200, headers });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch file.";
      return json({ error: msg }, 502);
    }
  });
}

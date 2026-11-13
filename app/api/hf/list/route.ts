import { withUser, json } from "@/lib/api-helpers";
import { hfConfigured, listHfFolder } from "@/lib/hf";
import { sanitizeHfPath } from "@/lib/hf-shared";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withUser(async () => {
    if (!hfConfigured()) return json({ error: "Hugging Face viewer not configured (HF_TOKEN missing on server)." }, 503);
    const rawPath = new URL(req.url).searchParams.get("path");
    const path = sanitizeHfPath(rawPath);
    if (!path) return json({ error: "Invalid path." }, 400);
    try {
      const { entries } = await listHfFolder(path);
      return json({ path, entries });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to list Hugging Face folder.";
      return json({ error: msg }, 502);
    }
  });
}

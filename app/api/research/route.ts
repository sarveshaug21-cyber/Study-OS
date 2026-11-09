import { withUser, json, requireString } from "@/lib/api-helpers";
import { openNotebookRequest } from "@/lib/ai/provider";
// Server-side-only proxy to Open Notebook. Never exposes provider keys or raw upstream errors.
export async function GET() {
  return withUser(async () => {
    try {
      const notebooks = await openNotebookRequest("/api/notebooks");
      return json({ notebooks });
    } catch (e) {
      return json({ error: "Open Notebook is currently unavailable. Research features will be unavailable until services are restored.", detail: e instanceof Error ? e.message : String(e) }, 502);
    }
  });
}
export async function POST(req: Request) {
  return withUser(async () => {
    const body = await req.json().catch(() => ({}));
    const query = requireString(body, "query", 500);
    try {
      const results = await openNotebookRequest("/api/search", { method: "POST", body: JSON.stringify({ query, limit: 10 }) });
      return json({ results });
    } catch (e) {
      return json({ error: "Open Notebook search is currently unavailable.", detail: e instanceof Error ? e.message : String(e) }, 502);
    }
  });
}

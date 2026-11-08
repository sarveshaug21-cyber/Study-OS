import "server-only";
import { env } from "@/lib/env";
export type AiMessage = { role: "user" | "assistant" | "system"; content: string };
export async function generateAiReply(messages: AiMessage[]): Promise<{ content: string; provider: string; model: string }> {
  const cfg = env.aiConfig();
  if (cfg.provider === "openrouter") {
    if (!cfg.openRouterKey) throw new Error("OPENROUTER_API_KEY is not configured.");
    const res = await fetch(`${cfg.openRouterBaseUrl}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${cfg.openRouterKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: cfg.openRouterModel, messages }) });
    if (!res.ok) throw new Error(`OpenRouter request failed (${res.status}).`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content; if (!content) throw new Error("OpenRouter returned no content.");
    return { content, provider: "openrouter", model: cfg.openRouterModel };
  }
  // Default: Open Notebook API. Try common endpoints; surface a clear error if unreachable.
  const base = cfg.openNotebookApiUrl.replace(/\/$/, "");
  const attempts = [`${base}/chat`, `${base}/api/chat`, `${base}/api/v1/chat`];
  let lastError: unknown = null;
  for (const url of attempts) {
    try { const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }), signal: AbortSignal.timeout(15000) }); if (res.ok) { const data = (await res.json().catch(()=>null)) as { response?: string; reply?: string; content?: string; message?: string } | null; const content = data?.response ?? data?.reply ?? data?.content ?? data?.message; if (content) return { content, provider: "open-notebook", model: "open-notebook" }; } lastError = new Error(`Open Notebook ${url} returned ${res.status}`); } catch (e) { lastError = e; }
  }
  throw new Error(`Open Notebook API unreachable at ${base}. Set OPEN_NOTEBOOK_API_URL or AI_PROVIDER=openrouter. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

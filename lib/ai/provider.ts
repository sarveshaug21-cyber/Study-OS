import "server-only";
import { env } from "@/lib/env";
import { createProvider } from "./providers";
export type AiMessage = { role: "user" | "assistant" | "system"; content: string };
export async function generateAiReply(messages: AiMessage[], systemPrompt?: string): Promise<{ content: string; provider: string; model: string }> {
  const cfg = env.aiConfig();
  if (cfg.provider === "openrouter" && !cfg.openRouterKey) throw new Error("OPENROUTER_API_KEY is not configured.");
  const fullMessages: AiMessage[] = systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages;
  try {
    const provider = createProvider({
      provider: cfg.provider,
      openRouterKey: cfg.openRouterKey,
      openRouterModel: cfg.openRouterModel,
      openRouterBaseUrl: cfg.openRouterBaseUrl,
      openNotebookApiUrl: cfg.openNotebookApiUrl,
    });
    const result = await provider.generate(fullMessages, systemPrompt);
    return { content: result.content, provider: provider.id, model: result.model };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    throw new Error(`AI provider unreachable (${cfg.provider} at ${cfg.provider === "openrouter" ? cfg.openRouterBaseUrl : cfg.openNotebookApiUrl}): ${reason}. Check Open Notebook is running or set AI_PROVIDER=openrouter.`);
  }
}
export async function openNotebookRequest(path: string, init?: RequestInit): Promise<unknown> {
  const cfg = env.aiConfig();
  const base = cfg.openNotebookApiUrl.replace(/\/$/, "");
  const res = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Open Notebook ${path} returned ${res.status}.`);
  return res.json();
}

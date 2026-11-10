import "server-only";
// Provider abstraction inspired by ORION's src/ai/providers/base.ts + router logic,
// simplified to OpenAI-compatible adapters that fit Study OS's existing env config.
export type AiProviderId = "open-notebook" | "openrouter";

export interface AiProvider {
  readonly id: AiProviderId;
  generate(messages: { role: "user" | "assistant" | "system"; content: string }[], systemPrompt?: string): Promise<{ content: string; model: string }>;
  isConfigured(): boolean;
}

export function openRouterProvider(key: string, model: string, baseUrl: string): AiProvider {
  return {
    id: "openrouter",
    isConfigured: () => Boolean(key),
    async generate(messages, systemPrompt) {
      const msgs = systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages;
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: msgs }),
      });
      if (!res.ok) throw new Error(`OpenRouter request failed (${res.status}).`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("OpenRouter returned no content.");
      return { content, model };
    },
  };
}

export class OpenNotebookProvider {
  readonly id: AiProviderId = "open-notebook";
  constructor(private readonly baseUrl: string) {}
  isConfigured(): boolean { return Boolean(this.baseUrl); }
  private async request(path: string, init?: RequestInit) {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Open Notebook ${path} returned ${res.status}.`);
    return res.json() as Promise<unknown>;
  }
  async generate(messages: { role: "user" | "assistant" | "system"; content: string }[], systemPrompt?: string): Promise<{ content: string; model: string }> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) throw new Error("Open Notebook requires a user message.");
    // Open Notebook's chat API needs a session + context object.
    const session = (await this.request("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ name: "Study OS tutor" }),
    })) as { id?: string; session_id?: string };
    const sessionId = session.id ?? session.session_id;
    if (!sessionId) throw new Error("Open Notebook did not return a chat session.");
    const result = (await this.request("/api/chat/execute", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message: lastUser.content, context: systemPrompt ? { system: systemPrompt } : {} }),
    })) as { messages?: { type?: string; role?: string; content?: string }[] };
    const reply = [...(result.messages ?? [])].reverse().find((m) => (m.type ?? m.role) === "ai" && m.content);
    if (!reply?.content) throw new Error("Open Notebook returned no AI reply.");
    return { content: reply.content, model: "open-notebook" };
  }
}

export function createProvider(cfg: { provider: string; openRouterKey?: string; openRouterModel: string; openRouterBaseUrl: string; openNotebookApiUrl: string }): AiProvider {
  if (cfg.provider === "openrouter") return openRouterProvider(cfg.openRouterKey ?? "", cfg.openRouterModel, cfg.openRouterBaseUrl);
  return new OpenNotebookProvider(cfg.openNotebookApiUrl);
}

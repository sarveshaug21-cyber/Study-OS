const lang = {
  supabaseConfigured() {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
  databaseConfigured() { return Boolean(process.env.DATABASE_URL); },
  requireSupabase() {
    if (!this.supabaseConfigured()) throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  },
  googleDriveConfigured() { return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_TOKEN_ENCRYPTION_KEY); },
  aiConfig() {
    return {
      provider: process.env.AI_PROVIDER ?? "open-notebook",
      openNotebookUrl: process.env.OPEN_NOTEBOOK_URL ?? process.env.NEXT_PUBLIC_OPEN_NOTEBOOK_URL ?? "http://192.168.1.191:8502",
      openNotebookApiUrl: process.env.OPEN_NOTEBOOK_API_URL ?? process.env.NEXT_PUBLIC_OPEN_NOTEBOOK_API_URL ?? "http://192.168.1.191:5055",
      openRouterKey: process.env.OPENROUTER_API_KEY,
      openRouterModel: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    };
  },
};
export const env = lang;
export function isDemoMode() { return !env.supabaseConfigured(); }

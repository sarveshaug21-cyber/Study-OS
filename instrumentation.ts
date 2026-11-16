// Next.js instrumentation hook — runs once when the server starts.
// Sentry is optional: with no SENTRY_DSN (and no @sentry/nextjs installed)
// initSentry() is a no-op, so this is safe to always call.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentry } = await import("@/lib/sentry");
    await initSentry();
  }
}

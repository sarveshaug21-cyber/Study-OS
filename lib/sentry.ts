// Error tracking integration (opt-in).
//
// Sentry is NOT a dependency of this app: it is loaded lazily and only when
// SENTRY_DSN is set. To enable it, add the SDK yourself:
//
//   npm i @sentry/nextjs
//
// then set SENTRY_DSN in .env.local. Without the SDK (or without a DSN) every
// function here is a no-op, so the app never hard-depends on it.
//
// The module specifier is intentionally indirect: that keeps TypeScript from
// requiring the optional package at build time.

type SentryLike = {
  init: (options: Record<string, unknown>) => void;
  captureException: (error: unknown, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, context?: Record<string, unknown>) => void;
  BrowserTracing?: { new (): unknown };
  Replay?: { new (): unknown };
};

const SENTRY_MODULE = "@sentry/nextjs";

let sentry: SentryLike | null = null;

async function loadSentry(): Promise<SentryLike | null> {
  if (sentry !== null) return sentry;
  if (!process.env.SENTRY_DSN) return null;
  try {
    const specifier = SENTRY_MODULE;
    const mod = (await import(/* webpackIgnore: true */ specifier)) as unknown as SentryLike;
    sentry = mod;
    return sentry;
  } catch {
    return null;
  }
}

export async function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  const S = await loadSentry();
  if (!S) return;
  const integrations: unknown[] = [];
  if (S.BrowserTracing) integrations.push(new S.BrowserTracing());
  if (S.Replay) integrations.push(new S.Replay());
  S.init({
    dsn,
    integrations,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? "0.01"),
    replaysOnErrorSampleRate: Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? "0.1"),
    environment: process.env.NODE_ENV,
  });
}

export async function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  const S = await loadSentry();
  if (!S) return;
  S.captureException(error, { extra: context });
}

export async function captureMessage(message: string, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  const S = await loadSentry();
  if (!S) return;
  S.captureMessage(message, { extra: context });
}

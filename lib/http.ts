// Build the public origin for absolute redirects when the app runs behind a
// reverse proxy (Tailscale Funnel). The standalone server constructs req.url
// from its bind address (e.g. localhost:3100), so the Host/Forwarded headers
// — or an explicit APP_PUBLIC_URL — are the reliable source of the public origin.
export function forwardedOrigin(req: Request): string {
  const configured = process.env.APP_PUBLIC_URL?.trim();
  if (configured) {
    try {
      const u = new URL(configured);
      u.pathname = "/";
      u.search = "";
      u.hash = "";
      return u.origin;
    } catch {
      // fall through to headers on malformed value
    }
  }
  const xfh = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = xfh || req.headers.get("host")?.trim();
  const proto = (req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() || "http") + ":";
  return host ? `${proto}//${host}` : "http://127.0.0.1:3100";
}

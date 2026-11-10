import { createHash } from "node:crypto";
// Pure, testable helpers. No server-only imports.
export function validateAndDeriveKey(input: string | undefined): Buffer {
  if (!input) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is not configured (server-only). Generate with: openssl rand -hex 32");
  if (/^[0-9a-f]{64}$/i.test(input)) return Buffer.from(input, "hex");
  try {
    const b = Buffer.from(input, "base64");
    if (b.length === 32) return b;
  } catch { /* fall through */ }
  throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (use `openssl rand -hex 32` or `openssl rand -base64 32`).");
}
export function deriveKey(input: string): Buffer {
  return createHash("sha256").update(input).digest();
}

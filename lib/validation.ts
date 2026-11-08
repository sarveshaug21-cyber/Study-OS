// Pure validation helpers (no server-only / Next imports) so they can be unit-tested.
export class ValidationError extends Error {
  status = 400;
  constructor(message: string) { super(message); this.name = "ValidationError"; }
}
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string { return typeof v === "string" && UUID_RE.test(v); }
export function requireString(body: Record<string, unknown>, key: string, maxLen = 5000): string {
  const v = body[key];
  if (typeof v !== "string" || !v.trim()) throw new ValidationError(`${key} is required`);
  if (v.length > maxLen) throw new ValidationError(`${key} is too long`);
  return v;
}
export function optionalString(body: Record<string, unknown>, key: string): string | undefined {
  const v = body[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") throw new ValidationError(`${key} must be a string`);
  return v;
}
export function requireUuid(body: Record<string, unknown>, key: string): string {
  const v = requireString(body, key);
  if (!isUuid(v)) throw new ValidationError(`${key} must be a UUID`);
  return v;
}
export function optionalUuid(body: Record<string, unknown>, key: string): string | undefined {
  const v = body[key];
  if (v === undefined || v === null || v === "") return undefined;
  if (!isUuid(v)) throw new ValidationError(`${key} must be a UUID`);
  return v;
}
export function assertUuidParam(value: string, label = "id"): string {
  if (!isUuid(value)) throw new ValidationError(`${label} must be a UUID`);
  return value;
}
export function requireIntInRange(body: Record<string, unknown>, key: string, min: number, max: number): number {
  const v = body[key];
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw new ValidationError(`${key} must be an integer between ${min} and ${max}`);
  return v;
}
export function optionalIntInRange(body: Record<string, unknown>, key: string, min: number, max: number): number | undefined {
  const v = body[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw new ValidationError(`${key} must be an integer between ${min} and ${max}`);
  return v;
}
export function optionalBoolean(body: Record<string, unknown>, key: string): boolean | undefined {
  const v = body[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "boolean") throw new ValidationError(`${key} must be a boolean`);
  return v;
}
export function requireBoolean(body: Record<string, unknown>, key: string): boolean {
  const v = body[key];
  if (typeof v !== "boolean") throw new ValidationError(`${key} must be a boolean`);
  return v;
}
export function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}
export function requireEmail(body: Record<string, unknown>, key: string): string {
  const v = requireString(body, key, 254);
  if (!isValidEmail(v)) throw new ValidationError(`${key} is not a valid email`);
  return v;
}
export function optionalUrl(body: Record<string, unknown>, key: string): string | undefined {
  const v = optionalString(body, key);
  if (v === undefined) return undefined;
  try { new URL(v); return v; } catch { throw new ValidationError(`${key} must be a valid URL`); }
}
export function requireEnum<T extends string>(value: unknown, allowed: readonly T[], key: string): T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) throw new ValidationError(`${key} must be one of: ${allowed.join(", ")}`);
  return value as T;
}
export function parseAdminEmails(envValue: string | undefined): string[] {
  return (envValue ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}
export function isAdminEmail(authEmail: string | undefined, adminsEnv: string | undefined): boolean {
  const admins = parseAdminEmails(adminsEnv);
  if (!admins.length) return false;
  return !!authEmail && admins.includes(authEmail.toLowerCase());
}

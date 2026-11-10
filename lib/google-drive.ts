import "server-only";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

function env(name: string): string | undefined {
  return process.env[name];
}

export function googleConfigured(): boolean {
  return Boolean(env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET") && env("GOOGLE_REDIRECT_URI"));
}

export function encryptionKey(): Buffer | null {
  const k = env("GOOGLE_TOKEN_ENCRYPTION_KEY");
  if (!k) return null;
  // Accept 32-byte hex or any string (hashed to 32 bytes).
  if (/^[0-9a-f]{64}$/i.test(k)) return Buffer.from(k, "hex");
  return createHash("sha256").update(k).digest();
}

export function encryptToken(plain: string): string {
  const key = encryptionKey();
  if (!key) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is not configured (server-only).");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptToken(blob: string): string {
  const key = encryptionKey();
  if (!key) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is not configured (server-only).");
  const buf = Buffer.from(blob, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env("GOOGLE_CLIENT_ID")!,
    redirect_uri: env("GOOGLE_REDIRECT_URI")!,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env("GOOGLE_CLIENT_ID")!,
      client_secret: env("GOOGLE_CLIENT_SECRET")!,
      redirect_uri: env("GOOGLE_REDIRECT_URI")!,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status}).`);
  const data = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env("GOOGLE_CLIENT_ID")!,
      client_secret: env("GOOGLE_CLIENT_SECRET")!,
      grant_type: "refresh_token",
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status}).`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

async function driveFetch(accessToken: string, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${DRIVE_API}${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers ?? {}) } });
}

export interface DriveFile { id: string; name: string; mimeType: string; size?: string; modifiedTime?: string; parents?: string[]; }

export async function findFolder(accessToken: string, name: string, parentId?: string): Promise<DriveFile | null> {
  const q = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentId ? ` and '${parentId}' in parents` : ""}`;
  const res = await driveFetch(accessToken, `/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,parents)&pageSize=10`);
  if (!res.ok) throw new Error(`Drive list failed (${res.status}).`);
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files?.[0] ?? null;
}

export async function listFiles(accessToken: string, folderId: string): Promise<DriveFile[]> {
  const q = `'${folderId}' in parents and trashed=false`;
  const res = await driveFetch(accessToken, `/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size,modifiedTime,parents)&pageSize=200&orderBy=folder,name`);
  if (!res.ok) throw new Error(`Drive list failed (${res.status}).`);
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

export async function createFolder(accessToken: string, name: string, parentId: string): Promise<DriveFile> {
  const res = await driveFetch(accessToken, "/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] }),
  });
  if (!res.ok) throw new Error(`Drive create folder failed (${res.status}).`);
  return (await res.json()) as DriveFile;
}

export async function renameFile(accessToken: string, fileId: string, name: string): Promise<DriveFile> {
  const res = await driveFetch(accessToken, `/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Drive rename failed (${res.status}).`);
  return (await res.json()) as DriveFile;
}

export async function deleteFile(accessToken: string, fileId: string): Promise<void> {
  const res = await driveFetch(accessToken, `/files/${fileId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Drive delete failed (${res.status}).`);
}

export async function searchFiles(accessToken: string, folderId: string, query: string): Promise<DriveFile[]> {
  const q = `'${folderId}' in parents and name contains '${query.replace(/'/g, "\\'")}' and trashed=false`;
  const res = await driveFetch(accessToken, `/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=50`);
  if (!res.ok) throw new Error(`Drive search failed (${res.status}).`);
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

export async function getQuota(accessToken: string): Promise<{ limit?: string; usage?: string; usageInDrive?: string }> {
  const res = await driveFetch(accessToken, "/about?fields=storageQuota");
  if (!res.ok) throw new Error(`Drive about failed (${res.status}).`);
  const data = (await res.json()) as { storageQuota?: { limit?: string; usage?: string; usageInDrive?: string } };
  return data.storageQuota ?? {};
}

export async function uploadFile(accessToken: string, parentId: string, file: { name: string; type: string; data: Buffer }): Promise<DriveFile> {
  const metadata = JSON.stringify({ name: file.name, parents: [parentId] });
  const boundary = "studyos_boundary_" + randomBytes(8).toString("hex");
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`),
    file.data,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,size`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!res.ok) throw new Error(`Drive upload failed (${res.status}).`);
  return (await res.json()) as DriveFile;
}

export async function downloadFile(accessToken: string, fileId: string): Promise<{ data: Buffer; mimeType: string; name: string }> {
  const metaRes = await driveFetch(accessToken, `/files/${fileId}?fields=name,mimeType`);
  if (!metaRes.ok) throw new Error(`Drive metadata failed (${metaRes.status}).`);
  const meta = (await metaRes.json()) as { name: string; mimeType: string };
  const res = await driveFetch(accessToken, `/files/${fileId}?alt=media`);
  if (!res.ok) throw new Error(`Drive download failed (${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { data: buf, mimeType: meta.mimeType, name: meta.name };
}

import "server-only";
import { getDb } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encryptToken, decryptToken } from "@/lib/google-drive";

export interface DriveConnection {
  refreshTokenEncrypted: string;
  folderId: string;
  connectedAt: string;
  email?: string;
}

export interface DriveFileMeta {
  id: string; // Drive file id
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parentId: string;
  board?: string;
  qualification?: string;
  subject?: string;
  specCode?: string;
  resourceType?: string;
  sourceUrl?: string;
  verified?: boolean;
  importedAt: string;
  folderPath?: string;          // e.g. "Physics/Past Papers/2024" (root = "")
  source?: "upload" | "drive-import";  // how it entered Cloud Files
  sourceFolder?: string;        // for drive imports: top-level source folder name
  status?: "imported" | "duplicate";   // result of the import
  sourceFileId?: string;        // for drive imports: source Drive file id
}

interface StoredBlob { googleDrive?: DriveConnection; driveFiles?: DriveFileMeta[]; }

async function readBlob(userId: string): Promise<StoredBlob> {
  const db = getDb();
  const [row] = await db.select({ n: userSettings.notificationsJson }).from(userSettings).where(eq(userSettings.userId, userId));
  if (!row?.n) return {};
  try { return JSON.parse(row.n) as StoredBlob; } catch { return {}; }
}

// Concurrency note: read-modify-write on a single JSON blob is NOT safe under concurrent
// requests (notifications vs Drive metadata). For production, migrate to dedicated tables
// (google_drive_connections, drive_files) prepared in db/schema.ts. Until then, callers
// should serialize updates or accept last-write-wins.
async function writeBlob(userId: string, blob: StoredBlob): Promise<void> {
  const db = getDb();
  const json = JSON.stringify(blob);
  const [existing] = await db.select({ id: userSettings.id }).from(userSettings).where(eq(userSettings.userId, userId));
  if (existing) {
    await db.update(userSettings).set({ notificationsJson: json }).where(eq(userSettings.userId, userId));
  } else {
    await db.insert(userSettings).values({ userId, notificationsJson: json });
  }
}

export async function getConnection(userId: string): Promise<DriveConnection | null> {
  const blob = await readBlob(userId);
  return blob.googleDrive ?? null;
}

export async function saveConnection(userId: string, refreshToken: string, folderId: string, email?: string): Promise<void> {
  const blob = await readBlob(userId);
  blob.googleDrive = { refreshTokenEncrypted: encryptToken(refreshToken), folderId, connectedAt: new Date().toISOString(), email };
  await writeBlob(userId, blob);
}

export async function clearConnection(userId: string): Promise<void> {
  const blob = await readBlob(userId);
  delete blob.googleDrive;
  await writeBlob(userId, blob);
}

export async function getDecryptedRefreshToken(userId: string): Promise<string | null> {
  const conn = await getConnection(userId);
  if (!conn) return null;
  return decryptToken(conn.refreshTokenEncrypted);
}

export async function listFileMeta(userId: string): Promise<DriveFileMeta[]> {
  const blob = await readBlob(userId);
  return blob.driveFiles ?? [];
}

export async function upsertFileMeta(userId: string, meta: DriveFileMeta): Promise<void> {
  const blob = await readBlob(userId);
  const files = blob.driveFiles ?? [];
  const idx = files.findIndex((f) => f.id === meta.id);
  if (idx >= 0) files[idx] = meta; else files.push(meta);
  blob.driveFiles = files;
  await writeBlob(userId, blob);
}

export async function removeFileMeta(userId: string, fileId: string): Promise<void> {
  const blob = await readBlob(userId);
  blob.driveFiles = (blob.driveFiles ?? []).filter((f) => f.id !== fileId);
  await writeBlob(userId, blob);
}

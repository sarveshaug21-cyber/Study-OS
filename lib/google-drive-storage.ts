import "server-only";
import { getDb } from "@/db";
import { googleDriveConnections, driveFiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

export async function getConnection(userId: string): Promise<DriveConnection | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(googleDriveConnections)
    .where(eq(googleDriveConnections.userId, userId));
  if (!row) return null;
  return {
    refreshTokenEncrypted: row.refreshTokenEncrypted,
    folderId: row.folderId,
    connectedAt: row.connectedAt.toISOString(),
    email: row.email ?? undefined,
  };
}

export async function saveConnection(userId: string, refreshToken: string, folderId: string, email?: string): Promise<void> {
  const db = getDb();
  const refreshTokenEncrypted = encryptToken(refreshToken);
  const connectedAt = new Date();
  await db
    .insert(googleDriveConnections)
    .values({ userId, refreshTokenEncrypted, folderId, connectedAt, email })
    .onConflictDoUpdate({
      target: googleDriveConnections.userId,
      set: { refreshTokenEncrypted, folderId, connectedAt, email },
    });
}

export async function clearConnection(userId: string): Promise<void> {
  const db = getDb();
  await db.delete(googleDriveConnections).where(eq(googleDriveConnections.userId, userId));
}

export async function getDecryptedRefreshToken(userId: string): Promise<string | null> {
  const conn = await getConnection(userId);
  if (!conn) return null;
  return decryptToken(conn.refreshTokenEncrypted);
}

export async function listFileMeta(userId: string): Promise<DriveFileMeta[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(driveFiles)
    .where(eq(driveFiles.userId, userId));
  return rows.map((row) => ({
    id: row.driveFileId,
    name: row.name,
    mimeType: row.mimeType,
    size: row.size ?? undefined,
    parentId: row.parentId,
    board: row.board ?? undefined,
    qualification: row.qualification ?? undefined,
    subject: row.subject ?? undefined,
    specCode: row.specCode ?? undefined,
    resourceType: row.resourceType ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    verified: row.verified,
    importedAt: row.importedAt.toISOString(),
  }));
}

export async function upsertFileMeta(userId: string, meta: DriveFileMeta): Promise<void> {
  const db = getDb();
  await db
    .insert(driveFiles)
    .values({
      userId,
      driveFileId: meta.id,
      name: meta.name,
      mimeType: meta.mimeType,
      size: meta.size,
      parentId: meta.parentId,
      board: meta.board as typeof driveFiles.$inferInsert["board"],
      qualification: meta.qualification as typeof driveFiles.$inferInsert["qualification"],
      subject: meta.subject,
      specCode: meta.specCode,
      resourceType: meta.resourceType,
      sourceUrl: meta.sourceUrl,
      verified: meta.verified ?? false,
      importedAt: meta.importedAt ? new Date(meta.importedAt) : new Date(),
    })
    .onConflictDoUpdate({
      target: [driveFiles.userId, driveFiles.driveFileId],
      set: {
        name: meta.name,
        mimeType: meta.mimeType,
        size: meta.size,
        parentId: meta.parentId,
        board: meta.board as typeof driveFiles.$inferInsert["board"],
        qualification: meta.qualification as typeof driveFiles.$inferInsert["qualification"],
        subject: meta.subject,
        specCode: meta.specCode,
        resourceType: meta.resourceType,
        sourceUrl: meta.sourceUrl,
        verified: meta.verified ?? false,
        importedAt: meta.importedAt ? new Date(meta.importedAt) : new Date(),
      },
    });
}

export async function removeFileMeta(userId: string, fileId: string): Promise<void> {
  const db = getDb();
  await db
    .delete(driveFiles)
    .where(and(eq(driveFiles.userId, userId), eq(driveFiles.driveFileId, fileId)));
}

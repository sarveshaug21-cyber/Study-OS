import { getDb } from "@/db";
import { specUpdates } from "@/db/schema";
import { withUser, json } from "@/lib/api-helpers";
import { OFFICIAL_UPDATES_URLS } from "@/lib/catalog";
export async function GET() { return withUser(async () => { let rows: unknown[] = []; if (process.env.DATABASE_URL) { try { rows = await getDb().select().from(specUpdates); } catch { rows = []; } } return json({ updates: rows, sources: OFFICIAL_UPDATES_URLS, note: "Verify status on the official source before treating a change as confirmed." }); }); }
export async function POST(req: Request) { return withUser(async () => { const body = await req.json().catch(()=>({})); const status = body.status ?? "unverified"; if (!["confirmed","proposed","unverified"].includes(status)) throw new Error("Invalid status"); const rows = await getDb().insert(specUpdates).values({ board: body.board, level: body.level, subjectName: body.subjectName, title: body.title, sourceUrl: body.sourceUrl, status, publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined, summary: body.summary }).returning(); return json({ update: rows[0] }, 201); }); }

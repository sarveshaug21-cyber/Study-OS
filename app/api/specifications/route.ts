import { getDb } from "@/db";
import { specifications } from "@/db/schema";
import { withUser, json } from "@/lib/api-helpers";
export async function GET() { return withUser(async () => { const rows = await getDb().select().from(specifications); return json({ specifications: rows }); }); }

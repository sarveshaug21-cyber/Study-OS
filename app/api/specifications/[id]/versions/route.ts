import { getDb } from "@/db";
import { specificationVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { withUser, json, assertUuidParam } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return withUser(async () => {
    const { id } = await ctx.params;
    assertUuidParam(id);

    const rows = await getDb()
      .select()
      .from(specificationVersions)
      .where(eq(specificationVersions.specificationId, id))
      .orderBy(desc(specificationVersions.publishedAt));

    return json({ versions: rows });
  });
}

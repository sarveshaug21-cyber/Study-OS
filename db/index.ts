import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

const g = globalThis as typeof globalThis & { _studyDb?: Database };

export function getDb(): Database {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Copy .env.example to .env.local and add your Supabase connection string.",
    );
  }
  if (!g._studyDb) {
    const client = postgres(connectionString, { prepare: false });
    g._studyDb = drizzle(client, { schema });
  }
  return g._studyDb;
}

export { schema };

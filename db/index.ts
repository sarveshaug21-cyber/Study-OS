import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

let database: Database | undefined;

export function getDb(): Database {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Copy .env.example to .env.local and add your Supabase connection string.",
    );
  }

  if (!database) {
    const client = postgres(connectionString, { prepare: false });
    database = drizzle(client, { schema });
  }

  return database;
}

export { schema };

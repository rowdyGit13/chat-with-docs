import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { documentsTable } from "./schema/documents-schema";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const dbSchema = {
  // Tables
  documents: documentsTable
};

function initializeDb(url: string) {
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema: dbSchema });
}

export const db = initializeDb(databaseUrl);
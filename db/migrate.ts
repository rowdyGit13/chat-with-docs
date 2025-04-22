import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Load environment variables from .env.local
config({ path: ".env.local" });

const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });

// This will run migrations on the database
async function main() {
  const db = drizzle(migrationClient);
  console.log("Running migrations...");
  
  await migrate(db, { migrationsFolder: "db/migrations" });
  
  console.log("Migrations complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
}); 
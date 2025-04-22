import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!, { max: 1 });

// This script deletes all data from the documents table
async function clearDatabase() {
  console.log("⚠️ WARNING: About to delete ALL data from the documents table ⚠️");
  console.log("Waiting 5 seconds in case you want to cancel (Ctrl+C)...");
  
  // Wait for 5 seconds to give the user a chance to cancel
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const db = drizzle(client);
  
  try {
    console.log("Deleting all data from documents table...");
    
    // Check if the table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'documents'
      ) AS table_exists;
    `);
    
    if (tableExists[0]?.table_exists) {
      // TRUNCATE is faster than DELETE for removing all rows
      await db.execute(sql`TRUNCATE TABLE documents;`);
      console.log("✅ All data deleted successfully");
    } else {
      console.log("Table 'documents' doesn't exist yet, nothing to delete");
    }
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}

clearDatabase().catch((error) => {
  console.error("Failed to clear database:", error);
  process.exit(1);
}); 
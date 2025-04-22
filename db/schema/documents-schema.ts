import { index, pgTable, serial, text, timestamp, vector } from "drizzle-orm/pg-core";

export const documentsTable = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    embedding: vector("embedding", {
      dimensions: 256
    }),
    sessionId: text("session_id").notNull(),
    lastAccessed: timestamp("last_accessed").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
  },
  (table) => ({
    embedding_index: index("documents_embedding_index").using("hnsw", table.embedding.op("vector_cosine_ops")),
    session_index: index("documents_session_index").on(table.sessionId)
  })
);

export type InsertDocument = typeof documentsTable.$inferInsert;
export type SelectDocument = typeof documentsTable.$inferSelect;
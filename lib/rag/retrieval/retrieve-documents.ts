import { db } from "@/db";
import { documentsTable } from "@/db/schema/documents-schema";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { generateEmbeddings } from "../generate/generate-embeddings";

// Retrieves relevant documents from the database based on semantic similarity to input text
export async function retrieveDocuments(
  input: string, 
  sessionId: string,
  options: { limit?: number; minSimilarity?: number } = {}
) {
  // Set default options for result limit, minimum similarity threshold, and name filter
  const { limit = 10, minSimilarity = 0.3 } = options;

  // Generate vector embedding for input text
  const embeddings = await generateEmbeddings([input]);
  // Calculate cosine similarity between input embedding and stored embeddings
  const similarity = sql<number>`1 - (${cosineDistance(documentsTable.embedding, embeddings[0])})`;

  // Update lastAccessed timestamp for all documents of this session
  const now = new Date();
  await db
    .update(documentsTable)
    .set({ lastAccessed: now })
    .where(eq(documentsTable.sessionId, sessionId));

  // Query database for relevant documents from this session
  const documents = await db
    .select({
      id: documentsTable.id,
      content: documentsTable.content,
      similarity
    })
    .from(documentsTable)
    // Filter by minimum similarity and by session ID
    .where(
      and(
        gt(similarity, minSimilarity),
        eq(documentsTable.sessionId, sessionId)
      )
    )
    // Sort by highest similarity first
    .orderBy((t) => desc(t.similarity))
    // Limit number of results
    .limit(limit);

  return documents;
}

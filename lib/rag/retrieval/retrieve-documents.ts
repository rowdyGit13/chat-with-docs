import { db } from "@/db";
import { documentsTable } from "@/db/schema/documents-schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { generateEmbeddings } from "../generate/generate-embeddings";

// Retrieves relevant documents from the database based on semantic similarity to input text
export async function retrieveDocuments(input: string, options: { limit?: number; minSimilarity?: number } = {}) {
  // Set default options for result limit, minimum similarity threshold, and name filter
  const { limit = 10, minSimilarity = 0.3 } = options;

  // Generate vector embedding for input text
  const embeddings = await generateEmbeddings([input]);
  // Calculate cosine similarity between input embedding and stored embeddings
  const similarity = sql<number>`1 - (${cosineDistance(documentsTable.embedding, embeddings[0])})`;

  // Query database for relevant documents
  const documents = await db
    .select({
      // name: documentsTable.name,
      content: documentsTable.content,
      similarity
    })
    .from(documentsTable)
    // Filter by minimum similarity and optionally by case-insensitive name match
    .where(gt(similarity, minSimilarity))
    // Sort by highest similarity first
    .orderBy((t) => desc(t.similarity))
    // Limit number of results
    .limit(limit);

  return documents;
}

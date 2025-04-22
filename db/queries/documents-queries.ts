import { and, cosineDistance, desc, eq, gt, lt } from "drizzle-orm";
import { db } from "../index";
import { documentsTable, InsertDocument, SelectDocument } from "../schema/documents-schema";
import { sql } from "drizzle-orm";
import { generateEmbeddings } from "@/lib/rag/generate/generate-embeddings";

export const createDocument = async (data: InsertDocument) => {
  try {
    const [newDocument] = await db.insert(documentsTable).values(data).returning();
    return newDocument;
  } catch (error) {
    console.error("Error creating document:", error);
    throw new Error("Failed to create document");
  }
};

export const createDocumentsFromChunks = async (chunks: string[], sessionId: string, embeddings: number[][]) => {
  try {
    const now = new Date();
    
    const documents = await db.insert(documentsTable).values(
      chunks.map((chunk, i) => ({
        content: chunk,
        embedding: embeddings[i],
        sessionId,
        lastAccessed: now
      }))
    ).returning();
    
    return documents;
  } catch (error) {
    console.error("Error creating documents from chunks:", error);
    throw new Error("Failed to create documents from chunks");
  }
};

export const getDocumentById = async (id: number) => {
  try {
    const document = await db.select().from(documentsTable).where(eq(documentsTable.id, id)).limit(1);
    return document[0];
  } catch (error) {
    console.error("Error getting document by ID:", error);
    throw new Error("Failed to get document");
  }
};

export const getDocumentsBySessionId = async (sessionId: string) => {
  try {
    return db.select().from(documentsTable).where(eq(documentsTable.sessionId, sessionId));
  } catch (error) {
    console.error("Error getting documents by session ID:", error);
    throw new Error("Failed to get documents");
  }
};

export const updateSessionLastAccessed = async (sessionId: string) => {
  try {
    const now = new Date();
    await db
      .update(documentsTable)
      .set({ lastAccessed: now })
      .where(eq(documentsTable.sessionId, sessionId));
    return true;
  } catch (error) {
    console.error("Error updating session last accessed:", error);
    throw new Error("Failed to update session last accessed");
  }
};

export const deleteDocumentsBySessionId = async (sessionId: string) => {
  try {
    await db.delete(documentsTable).where(eq(documentsTable.sessionId, sessionId));
    return true;
  } catch (error) {
    console.error("Error deleting documents by session ID:", error);
    throw new Error("Failed to delete documents");
  }
};

export const deleteExpiredSessions = async (expiryTime: Date) => {
  try {
    await db.delete(documentsTable).where(lt(documentsTable.lastAccessed, expiryTime));
    return true;
  } catch (error) {
    console.error("Error deleting expired sessions:", error);
    throw new Error("Failed to delete expired sessions");
  }
};

export const retrieveRelevantDocuments = async (
  input: string,
  sessionId: string,
  options: { limit?: number; minSimilarity?: number } = {}
) => {
  try {
    // Set default options
    const { limit = 10, minSimilarity = 0.3 } = options;

    // Generate vector embedding for input text
    const embeddings = await generateEmbeddings([input]);
    // Calculate cosine similarity
    const similarity = sql<number>`1 - (${cosineDistance(documentsTable.embedding, embeddings[0])})`;

    // Update lastAccessed timestamp
    await updateSessionLastAccessed(sessionId);

    // Query database for relevant documents
    const documents = await db
      .select({
        id: documentsTable.id,
        content: documentsTable.content,
        similarity
      })
      .from(documentsTable)
      // Filter by minimum similarity and session ID
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
  } catch (error) {
    console.error("Error retrieving relevant documents:", error);
    throw new Error("Failed to retrieve relevant documents");
  }
}; 
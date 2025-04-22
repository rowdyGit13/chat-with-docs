"use server";

import { createDocument, createDocumentsFromChunks, deleteDocumentsBySessionId, deleteExpiredSessions, getDocumentById, getDocumentsBySessionId, retrieveRelevantDocuments, updateSessionLastAccessed } from "@/db/queries/documents-queries";
import { InsertDocument } from "@/db/schema/documents-schema";
import { generateEmbeddings } from "@/lib/rag/generate/generate-embeddings";
import { revalidatePath } from "next/cache";

export type ActionState = {
  status: "success" | "error";
  message: string;
  data?: any;
};

// Helper function for simple character-based splitting
function splitTextByChars(text: string, maxChars: number = 1500): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  // Attempt to split by paragraphs first, then sentences, then fall back to characters
  const paragraphs = text.split(/\n\s*\n/); // Split by double newline

  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) continue;

    if (currentChunk.length + paragraph.length + 1 <= maxChars) {
      currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paragraph;
    } else {
      // If paragraph itself is too long, split it further (e.g., by sentences or hard char limit)
      if (paragraph.length <= maxChars) {
        // If the current chunk isn't empty, push it first
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }
        currentChunk = paragraph;
      } else {
        // Paragraph is too long, split by character respecting word boundaries
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
        let startIndex = 0;
        while (startIndex < paragraph.length) {
          let endIndex = Math.min(startIndex + maxChars, paragraph.length);
          // Try to end at a space if possible within the last ~100 chars
          if (endIndex < paragraph.length) {
             const lastSpace = paragraph.lastIndexOf(" ", endIndex);
             if (lastSpace > startIndex && endIndex - lastSpace < 100) {
                 endIndex = lastSpace;
             }
          }
          chunks.push(paragraph.substring(startIndex, endIndex).trim());
          startIndex = endIndex;
          // Skip potential leading space for the next chunk
          if (paragraph[startIndex] === ' ') {
            startIndex++;
          }
        }
      }
    }
  }

  // Add the last remaining chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  // Filter out any potentially empty chunks just in case
  return chunks.filter(chunk => chunk.length > 0);
}

export async function createDocumentAction(data: InsertDocument): Promise<ActionState> {
  try {
    const newDocument = await createDocument(data);
    revalidatePath("/");
    return { status: "success", message: "Document created successfully", data: newDocument };
  } catch (error) {
    return { status: "error", message: "Error creating document" };
  }
}

export async function processDocumentAction(text: string, sessionId: string): Promise<ActionState> {
  console.log(`processDocumentAction invoked. Session: ${sessionId}, Text length: ${text.length}`); // Keep basic invocation log
  console.log(`OPENAI_API_KEY available: ${!!process.env.OPENAI_API_KEY}`); // Keep API key check log

  try {
    // Split input text into smaller chunks using the new character-based method
    const chunks = splitTextByChars(text); // Use the new function
    console.log(`Text split into ${chunks.length} chunks (char-based).`); // Log chunk count

    if (chunks.length === 0) {
       console.warn("Text resulted in 0 chunks after splitting.");
       return { status: "success", message: "Document processed (empty or whitespace only), no chunks created.", data: [] };
    }

    // Generate vector embeddings for each text chunk
    console.log("Generating embeddings for chunks...");
    const embeddings = await generateEmbeddings(chunks);
    console.log("Embeddings generated successfully.");

    // Store chunks and their embeddings in the database
    console.log("Storing documents in database...");
    const documents = await createDocumentsFromChunks(chunks, sessionId, embeddings);
    console.log(`${documents.length} document chunks stored successfully.`);

    revalidatePath("/");
    return { status: "success", message: "Document processed successfully", data: documents };
    
  } catch (error) {
    console.error("Error processing document:", error); // Keep detailed error logging
    return { status: "error", message: "Failed to process document" };
  }
}

export async function getDocumentByIdAction(id: number): Promise<ActionState> {
  try {
    const document = await getDocumentById(id);
    if (!document) {
      return { status: "error", message: "Document not found" };
    }
    return { status: "success", message: "Document retrieved successfully", data: document };
  } catch (error) {
    return { status: "error", message: "Failed to get document" };
  }
}

export async function getDocumentsBySessionIdAction(sessionId: string): Promise<ActionState> {
  try {
    const documents = await getDocumentsBySessionId(sessionId);
    return { status: "success", message: "Documents retrieved successfully", data: documents };
  } catch (error) {
    return { status: "error", message: "Failed to get documents" };
  }
}

export async function updateSessionLastAccessedAction(sessionId: string): Promise<ActionState> {
  try {
    await updateSessionLastAccessed(sessionId);
    return { status: "success", message: "Session last accessed updated successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to update session last accessed" };
  }
}

export async function deleteDocumentsBySessionIdAction(sessionId: string): Promise<ActionState> {
  try {
    await deleteDocumentsBySessionId(sessionId);
    revalidatePath("/");
    return { status: "success", message: "Documents deleted successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to delete documents" };
  }
}

export async function runRagPipelineAction(query: string, sessionId: string): Promise<ActionState> {
  try {
    // Retrieve relevant documents
    const relevantDocs = await retrieveRelevantDocuments(query, sessionId);
    
    return { 
      status: "success", 
      message: "RAG pipeline executed successfully", 
      data: relevantDocs 
    };
  } catch (error) {
    console.error("Error running RAG pipeline:", error);
    return { status: "error", message: "Failed to run RAG pipeline" };
  }
}

export async function cleanupExpiredSessionsAction(): Promise<ActionState> {
  try {
    const expiryTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 1 day
    await deleteExpiredSessions(expiryTime);
    return { status: "success", message: "Expired sessions cleaned up successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to clean up expired sessions" };
  }
} 
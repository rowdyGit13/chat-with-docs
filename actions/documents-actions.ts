"use server";

import { createDocument, createDocumentsFromChunks, deleteDocumentsBySessionId, deleteExpiredSessions, getDocumentById, getDocumentsBySessionId, retrieveRelevantDocuments, updateSessionLastAccessed } from "@/db/queries/documents-queries";
import { InsertDocument } from "@/db/schema/documents-schema";
import { generateEmbeddings } from "@/lib/rag/generate/generate-embeddings";
import { splitText } from "@/lib/rag/processing/split-text";
import { revalidatePath } from "next/cache";

export type ActionState = {
  status: "success" | "error";
  message: string;
  data?: any;
};

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
  try {
    // Split input text into smaller chunks
    const chunks = await splitText(text);

    // Generate vector embeddings for each text chunk
    const embeddings = await generateEmbeddings(chunks);

    // Store chunks and their embeddings in the database
    const documents = await createDocumentsFromChunks(chunks, sessionId, embeddings);

    revalidatePath("/");
    return { status: "success", message: "Document processed successfully", data: documents };
  } catch (error) {
    console.error("Error processing document:", error);
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
    const expiryTime = new Date(Date.now() - (15 * 60 * 1000)); // 15 minutes
    await deleteExpiredSessions(expiryTime);
    return { status: "success", message: "Expired sessions cleaned up successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to clean up expired sessions" };
  }
} 
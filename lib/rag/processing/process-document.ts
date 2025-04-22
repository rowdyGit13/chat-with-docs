// This file is used to process a document by splitting it into chunks, generating embeddings, and storing in DB

"use server";

import { processDocumentAction } from "@/actions/documents-actions";

// Processes a document by splitting it into chunks, generating embeddings, and storing in DB
export async function processDocument(text: string, sessionId: string) {
  const result = await processDocumentAction(text, sessionId);
  
  if (result.status === "error") {
    throw new Error(result.message);
  }
  
  return result.data;
}

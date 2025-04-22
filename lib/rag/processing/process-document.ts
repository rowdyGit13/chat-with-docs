// This file is used to process a document by splitting it into chunks, generating embeddings, and storing in DB

"use server";

import { processDocumentAction } from "@/actions/documents-actions";

// Processes a document by splitting it into chunks, generating embeddings, and storing in DB
export async function processDocument(text: string, sessionId: string) {
  // console.log("processDocument called. Session ID:", sessionId, "Text length:", text.length); // Removed log
  try {
    const result = await processDocumentAction(text, sessionId);
    // console.log("processDocumentAction result:", result); // Removed log
    
    if (result.status === "error") {
      // Throw error to be caught by handleUpload
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    // console.error("Error calling/processing processDocumentAction:", error); // Keep original error throw
    // Re-throw the error so handleUpload catches it
    throw error;
  }
}

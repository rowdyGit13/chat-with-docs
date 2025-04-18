
// This file is used to process a document by splitting it into chunks, generating embeddings, and storing in DB

"use server";

import { db } from "@/db";
import { documentsTable } from "@/db/schema/documents-schema";
import { generateEmbeddings } from "../generate/generate-embeddings";
import { splitText } from "./split-text";

// Processes a document by splitting it into chunks, generating embeddings, and storing in DB
export async function processDocument(text: string) {
  // Split input text into smaller chunks for processing
  const chunks = await splitText(text);

  // Generate vector embeddings for each text chunk
  const embeddings = await generateEmbeddings(chunks);

  // Store chunks and their embeddings in the database
  await db.insert(documentsTable).values(
    chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i]
    }))
  );
}

"use server";

import { runRagPipelineAction } from "@/actions/documents-actions";
import { getOptimizedQuery } from "./optimize-query";
import { rankDocuments } from "./rerank-documents";

// Main RAG pipeline that combines all components
export async function runRagPipeline(query: string, sessionId: string) {
  // 1. Optimize the input query for better retrieval
  const optimizedQuery = await getOptimizedQuery(query);
  console.log("Optimized query:", optimizedQuery);

  // 2. Retrieve relevant documents and rerank them
  const result = await runRagPipelineAction(optimizedQuery, sessionId);
  
  if (result.status === "error") {
    throw new Error(result.message);
  }
  
  const retrievedDocs = result.data;
  console.log("Retrieved documents:", retrievedDocs);
  console.log("Retrieved documents count:", retrievedDocs.length);

  // 3. Rerank chunks for final selection
  const rankedResults = await rankDocuments(optimizedQuery, retrievedDocs, 3);
  console.log("Final ranked results:", rankedResults);

  return rankedResults;
}

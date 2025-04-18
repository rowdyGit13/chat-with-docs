"use server";

import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// Re-ranks documents using Cohere's reranking model for more accurate relevance scoring
export async function rankDocuments(query: string, documents: { content: string }[], limit = 3) {
  // Call Cohere's rerank API to score and reorder documents based on relevance to query
  const rerank = await cohere.v2.rerank({
    documents: documents.map((doc) => doc.content), // Format docs for API
    query,
    topN: limit, // Number of top results to return
    model: "rerank-english-v3.0" // Latest English reranking model
  });

  // Map reranked results back to original document format with relevance scores
  return rerank.results.map((result) => ({
    // name: documents[result.index].name,
    content: documents[result.index].content,
    relevanceScore: result.relevanceScore // Score indicating relevance
  }));
}

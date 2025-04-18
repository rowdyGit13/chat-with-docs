
// This file is used to optimize a user query for better RAG retrieval

import OpenAI from "openai";

const openai = new OpenAI();

// Takes a user query and returns an optimized version for better RAG retrieval
export async function getOptimizedQuery(query: string) {
  // Call OpenAI API to optimize the query
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using smaller model for better latency/cost
    messages: [
      {
        role: "system",
        content: `You are an AI assistant tasked with optimizing queries for a RAG (Retrieval-Augmented Generation) system. Your goal is to refine the original query to improve the retrieval of relevant information from the knowledge base.
    
    Follow these guidelines to optimize the query:
    1. Remove unnecessary words or phrases that don't contribute to the core meaning.
    2. Identify and emphasize key concepts or entities.
    3. Use more specific or technical terms if appropriate.
    4. Ensure the query is clear and concise.
    5. Maintain the original intent of the query.
    
    Output only the refined query text, without any additional explanation or formatting, on a single line.
  
    Examples:
    - "What is the capital of France?" -> "France capital"
    - "Explain the main points of the book '1984' by George Orwell" -> "'1984' George Orwell main points"
    - "What is the weather in Tokyo?" -> "Tokyo weather"
    - "Who painted the Mona Lisa?" -> "Mona Lisa painter"
    - "Location of the Great Wall of China" -> "Great Wall of China location"
    - "Show me the latest news about the iPhone" -> "iPhone latest news"
    `
      },
      { role: "user", content: query } // Pass original query as user message
    ]
  });

  // Extract and return the optimized query text
  return response.choices[0].message.content ?? query;
}

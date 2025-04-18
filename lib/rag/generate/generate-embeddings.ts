
// This file is used to generate embeddings for the text data

// directive to let server know this code is running on the server, not the client
"use server";

// Import openai sdk
import OpenAI from "openai";

// Initialize openai client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Takes an array of strings and returns an array of their vector embeddings
export async function generateEmbeddings(texts: string[]) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    dimensions: 256,
    input: texts // array of text strings to embed
  });
// Extract just the embeddings from the response (response holds more info)
  return response.data.map((item) => item.embedding);
}
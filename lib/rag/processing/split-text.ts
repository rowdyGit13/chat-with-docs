"use server";

// Import Tiktoken class and model definition for cl100k_base
import { Tiktoken } from "tiktoken/lite";
import cl100k_base from "tiktoken/encoders/cl100k_base.json";

// Splits input text into chunks of roughly equal token size for processing
export async function splitText(text: string) {
  const chunks: string[] = [];
  // Target size for each chunk in tokens
  const CHUNK_SIZE = 500;
  
  // Initialize tokenizer using the loaded model definition
  const encoding = new Tiktoken(
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str
  );

  try {
    // Convert text to token IDs
    const tokens = encoding.encode(text);

    // Split tokens into chunks of CHUNK_SIZE, push each chunk into the chunks array
    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      // Get subset of tokens for this chunk
      const chunkTokens = tokens.slice(i, i + CHUNK_SIZE);
      // Convert token IDs back to text
      // Note: The lite version's decode might behave differently, but TextDecoder should still work
      // If issues arise here, we might need encoding.decode(chunkTokens) directly if it returns Uint8Array
      const chunk = new TextDecoder().decode(encoding.decode(chunkTokens));
      chunks.push(chunk);
    }

    return chunks;
  } finally {
    // Clean up tokenizer resources (no explicit free needed for lite version)
    // encoding.free(); // No longer needed/available
  }
}

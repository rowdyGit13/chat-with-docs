// This file is used to generate completions for the text data

// directive to let server know this code is running on the server, not the client
"use server";

// Import openai sdk
import OpenAI from "openai";

// Initialize openai client, note you don't need to pass in an api key here, it's already set in the .env.local file
const openai = new OpenAI();

// Takes context and user input, returns AI completion incorporating the context
export async function generateCompletionWithContext(context: string, input: string) {
  // Call OpenAI API to generate completion
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using smaller model for better latency/cost
    temperature: 0, // Set to 0 for more deterministic outputs
    max_tokens: 1000, // Maximum output length of completion
    messages: [
      {
        role: "system",
        content: `Answer based on the provided context.
Context:
${context}
`
      },
      { role: "user", content: `${input}` }
    ]
  });

  // Extract and return just the completion text
  return completion.choices[0].message.content;
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateCompletionWithContext } from "@/lib/rag/generate/generate-completions";
import { runRagPipeline } from "@/lib/rag/retrieval/run-rag-pipeline";
import { getSessionId, updateSessionTimestamp } from "@/lib/session";
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiChat() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [currentDocs, setCurrentDocs] = useState<string[]>([]);
  const [expandedSources, setExpandedSources] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Get session ID on component mount
    setSessionId(getSessionId());
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    // Update session timestamp on interaction
    updateSessionTimestamp(sessionId);
    // Add "You: " to the user's message in bold
    setMessages((prev) => [...prev, { role: "user", content: `${input}` }]);
    setCurrentDocs([]);

    try {
      const relevantDocs = await runRagPipeline(input, sessionId);
      const context = relevantDocs.map((doc) => doc.content).join("\n\n");

      setCurrentDocs(relevantDocs.map((doc) => doc.content));
      const answer = await generateCompletionWithContext(context, input);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `**AI:** ${answer}`
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "**AI:** Sorry, there was an error processing your request."
        }
      ]);
    }

    setInput("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4 border rounded p-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-500">Ask the AI about your documents...</p>
        )}
        {messages.map((message, index) => (
          <div key={`message-block-${index}`}>
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[85%] ${ 
                message.role === "user" 
                ? "bg-emerald-100 ml-auto text-emerald-900" 
                : "bg-gray-100 mr-auto text-gray-800"
              }`}
            >
              {message.role === "ai" ? (
                <div className="prose prose-sm max-w-none text-justify">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
            {message.role === "ai" && currentDocs.length > 0 && index === messages.length - 1 && (
              <div
                key={`docs-${index}`}
                className="my-4"
              >
                <button
                  onClick={() => setExpandedSources(expandedSources === index ? null : index)}
                  className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1 ml-auto w-fit"
                >
                  <span>
                    {expandedSources === index ? "Hide" : "Show"} {currentDocs.length} Sources
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${expandedSources === index ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {expandedSources === index && (
                  <div className="mt-2 p-3 rounded bg-white border border-gray-200 font-mono text-xs text-gray-700">
                    {currentDocs.map((doc, i) => (
                      <div
                        key={i}
                        className="mt-3 first:mt-0 pt-3 border-t first:border-t-0 border-gray-200 flex gap-3"
                      >
                        <span className="text-2xl font-bold text-emerald-300 flex-shrink-0">{i + 1}</span>
                        <div className="whitespace-pre-wrap break-words">{doc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center pt-4 border-t border-gray-200">
        <Input
          className="flex-grow mr-2 border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button
          onClick={handleSendMessage}
          className="mr-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={!input.trim() || !sessionId}
        >
          Send
        </Button>
        <Button
          onClick={() => {
            setMessages([]);
            setCurrentDocs([]);
            setExpandedSources(null);
          }}
          variant="outline"
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

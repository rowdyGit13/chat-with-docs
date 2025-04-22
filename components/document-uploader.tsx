"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { processDocument } from "@/lib/rag/processing/process-document";
import { getSessionId, updateSessionTimestamp } from "@/lib/session";
import { useEffect, useState } from "react";

export default function DocumentUploader() {
  const [document, setDocument] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Get session ID on component mount
    setSessionId(getSessionId());
  }, []);

  const handleUpload = async () => {
    try {
      if (!sessionId) return;
      
      // Update session timestamp
      updateSessionTimestamp(sessionId);
      
      // Process document with session ID
      await processDocument(document, sessionId);
      setDocument("");
    } catch (error) {
      console.error("Error processing document:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Textarea
        className="flex-grow mb-4 p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 resize-none overflow-y-auto"
        placeholder="Paste your document text here..."
        value={document}
        onChange={(e) => setDocument(e.target.value)}
      />
      <Button
        onClick={handleUpload}
        disabled={!document.trim() || !sessionId}
        className="mt-auto bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
      >
        Upload Document
      </Button>
    </div>
  );
}

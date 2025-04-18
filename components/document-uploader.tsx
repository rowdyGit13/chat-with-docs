"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { processDocument } from "@/lib/rag/processing/process-document";
import { useState } from "react";

export default function DocumentUploader() {
  const [document, setDocument] = useState("");

  const handleUpload = async () => {
    try {
      await processDocument(document);
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
        disabled={!document.trim()}
        className="mt-auto bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
      >
        Upload Document
      </Button>
    </div>
  );
}

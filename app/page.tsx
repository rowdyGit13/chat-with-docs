import AiChat from "@/components/ai-chat";
import DocumentUploader from "@/components/document-uploader";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-700 mt-6">Welcome to ChatWithDocs</h1>
        <p className="text-lg text-gray-600 mt-2">Upload your files and ask questions to get LLM-driven insights.</p>
      </div>
      <div className="flex w-full max-w-6xl h-[80vh] bg-white shadow-lg rounded-lg">
        {/* Left Column: Document Uploader */}
        <div className="w-1/2 p-6 border-r border-gray-200 flex flex-col min-h-0">
          <h1 className="text-2xl font-semibold mb-6 text-emerald-700 flex-shrink-0">Upload Documents</h1>
          <div className="flex-grow overflow-y-auto pr-2">
            <DocumentUploader />
          </div>
        </div>

        {/* Right Column: AI Chat */}
        <div className="w-1/2 p-6 flex flex-col min-h-0">
          <h1 className="text-2xl font-semibold mb-6 text-emerald-700 flex-shrink-0">Chat with AI</h1>
          <div className="flex-grow overflow-y-auto pr-2">
            <AiChat />
          </div>
        </div>
      </div>

      <div className="mt-12 w-full text-left px-4">
        <h2 className="text-xl font-semibold text-emerald-700 mt-6">How it works</h2>
        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
          When a document is uploaded, it gets embedded into a vector database.
          When you ask the AI editor a question, a RAG pipeline retrieves the most relevant aspects of your uploaded docs,
          feeds them to the gpt-4o-mini API as context, and prints the response.
        </p>
        <h2 className="text-xl font-semibold text-emerald-700 mt-6">Why not just use ChatGPT?</h2>
        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
          ChatGPT is a general-purpose AI model that can answer questions about a wide range of topics.
          ChatWithDocs will only answer questions for which answers can be found within your document.
          It will not hallucinate an answer when the answer the the user query is not in the uploaded documents.
        </p>
      </div>
    </main>
  );
}

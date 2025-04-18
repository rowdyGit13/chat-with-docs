# ChatWithDocs

Welcome to ChatWithDocs! This application allows you to upload documents and engage in a conversation with an AI assistant that uses the content of your documents as its knowledge base.

## Features

*   **Document Upload:** Upload various document formats.
*   **AI Chat:** Ask questions about the content of your uploaded documents.
*   **RAG Pipeline:** Uses a Retrieval-Augmented Generation (RAG) pipeline to fetch relevant document sections.
*   **GPT-4o-mini Integration:** Leverages the gpt-4o-mini model for generating contextual answers.
*   **Session-Based Data:** Uploaded documents and associated data are stored securely per session and erased afterward.

## Tech Stack

*   [Next.js](https://nextjs.org/) - React Framework
*   [React](https://reactjs.org/) - UI Library
*   [TypeScript](https://www.typescriptlang.org/) - Language
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
*   [Supabase](https://supabase.io/) - Vector Database (likely, based on UI description)
*   [OpenAI API](https://openai.com/api/) - Language Model (gpt-4o-mini)

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd chat-with-docs
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Update `.env.local` with your specific API keys and configuration:
    ```env
    # Example - Replace with your actual keys
    OPENAI_API_KEY=your_openai_api_key
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key

    # Add any other required variables
    ```
    *Note: You might need to create the `.env.example` file if it doesn't exist, outlining the necessary variables.*

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
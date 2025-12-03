# RAG Chatbot System Implementation Plan

This document outlines the architecture and implementation plan for the Retrieval-Augmented Generation (RAG) chatbot system.

## 1. System Architecture

The system will consist of three main parts: a frontend React component integrated into the Docusaurus site, a FastAPI backend, and a Qdrant vector database.

**Flow:**
1.  **User Interaction:** User asks a question or selects text on the frontend.
2.  **API Call:** The frontend sends the query and any contextual text to the FastAPI backend.
3.  **Query Embedding:** The backend creates a vector embedding of the user's query using a Google `text-embedding` model.
4.  **Vector Search:** The backend queries the Qdrant database with this embedding to find the most relevant "chunks" of the book content.
5.  **Prompt Construction:** A prompt is constructed for the Gemini LLM, including the original user query and the retrieved context chunks.
6.  **LLM Call:** The prompt is sent to the Gemini API.
7.  **Response Generation:** Gemini generates an answer based on the provided context. The response will also include citations derived from the metadata of the retrieved chunks.
8.  **Stream to Frontend:** The answer is streamed back to the frontend and displayed in the chat panel.

## 2. Document Ingestion Pipeline

This pipeline will run once to populate the Qdrant database.

1.  **Content Source:** All chapter markdown files from the Docusaurus project.
2.  **Chunking Strategy:**
    -   Documents will be split semantically. The primary strategy will be splitting by section headings (e.g., `##`, `###`).
    -   If a section is too large (e.g., > 500 words), it will be further split by paragraphs.
    -   Each chunk will have metadata attached: `chapter_title`, `section_title`, and a unique `chunk_id`.
3.  **Embedding Model:** `models/text-embedding-004` (or a similar suitable model available from Google AI).
4.  **Qdrant Setup:**
    -   A new collection named `ai_robotics_book` will be created in Qdrant Cloud.
    -   The vector size will match the output dimension of the chosen embedding model (e.g., 768).
    -   The distance metric will be `Cosine` similarity.
5.  **Ingestion Script:** A Python script (`ingest.py`) will be created to:
    -   Read all markdown files.
    -   Apply the chunking strategy.
    -   Generate embeddings for each chunk using the Google AI API.
    -   Upload the vectors and their corresponding metadata to the Qdrant collection.

## 3. Chatbot Feature Implementation

### Frontend (React Components):
-   **`FloatingChatbotButton`:** A simple `button` element with `position: fixed`, styled to match the design. On click, it will toggle the visibility of the `ChatbotPanel`.
-   **`ChatbotPanel`:**
    -   A container with a header, a scrollable message area, and a text input form.
    -   Will manage its own state (e.g., messages, loading status, user input).
    -   The message area will render a list of messages, styled differently for user and bot.
    -   The input form will handle user input and trigger the API call on submit.
-   **Text Selection Logic (`useTextSelection.js` hook):**
    -   A custom React hook will add a `mouseup` event listener to the document.
    -   On `mouseup`, it will check `window.getSelection()`. If text is selected, it will display a small, absolutely positioned "Ask about this" button near the selection.
    -   Clicking this button will open the chatbot and pass the selected text into its context.

### Backend (FastAPI):
-   A main endpoint (e.g., `/api/chat`) will be created.
-   It will accept a POST request with the user's query and optional selected text.
-   **Pydantic Models:** Define models for the request (`QueryRequest`) and response (`ChatResponse`).
-   **Query Processing:**
    1.  Concatenate user query and selected text for a richer embedding.
    2.  Call the embedding model.
    3.  Query Qdrant for the top 3-5 relevant chunks.
    4.  Format a prompt for Gemini, instructing it to answer the user's query *only* based on the provided context chunks and to cite the sources using the metadata.
    5.  Use streaming response (`StreamingResponse` in FastAPI) to send the answer back to the frontend token by token for a better UX.
-   **Citation Logic:** The metadata from the Qdrant search results (`chapter_title`, `section_title`) will be included in the final prompt to Gemini, with instructions to format them as citations in the response.

## 4. Deployment Plan

-   **Frontend (Docusaurus site):**
    -   Will be deployed to **GitHub Pages**.
    -   A GitHub Actions workflow will be set up to automatically build and deploy the site on every push to the `main` branch.
-   **Backend (FastAPI app):**
    -   Will be deployed to **Vercel** as a serverless function.
    -   A `vercel.json` file will be configured to point to the FastAPI application.
    -   API keys (for Google AI, Qdrant) will be stored securely as environment variables in Vercel, not in the repository.

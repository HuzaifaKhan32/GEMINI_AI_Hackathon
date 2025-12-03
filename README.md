# AI Robotics: A Comprehensive Guide & RAG Chatbot

This project is an AI-native educational platform featuring a comprehensive guide on AI Robotics, complemented by an intelligent Retrieval-Augmented Generation (RAG) chatbot. The platform aims to provide an interactive learning experience, allowing users to explore AI and robotics concepts and get instant, context-aware answers directly from the book content.

## Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Architecture](#architecture)
-   [Setup Instructions](#setup-instructions)
    -   [Prerequisites](#prerequisites)
    -   [Frontend Setup (Docusaurus)](#frontend-setup-docusaurus)
    -   [Backend Setup (FastAPI)](#backend-setup-fastapi)
-   [Deployment](#deployment)
-   [Project Structure](#project-structure)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   **Interactive AI Robotics Guide:** 8 comprehensive chapters covering AI and Robotics fundamentals.
-   **Engaging Content:** Each chapter includes learning objectives, detailed explanations, Python code examples, and illustrative diagrams.
-   **Responsive Design:** Optimized for seamless viewing on desktop, tablet, and mobile devices.
-   **Intelligent RAG Chatbot:**
    -   Answers questions based *only* on the book's content.
    -   Provides precise citations (Chapter, Section) for its answers.
    -   Supports text selection queries: select any text on a page and ask the chatbot questions related to it.
    -   Intuitive chat UI with typing indicators and error handling.
-   **Zero-Cost Infrastructure:** Leverages free tiers of cloud services for deployment and AI capabilities.

## Tech Stack

### Frontend
-   **Framework:** Docusaurus (React, TypeScript)
-   **Styling:** Custom CSS, Tailwind CSS utilities (via Docusaurus theming)
-   **Icons:** Material Symbols Outlined
-   **Deployment:** GitHub Pages

### Backend
-   **Framework:** FastAPI (Python)
-   **Vector Database:** Qdrant Cloud (Free Tier)
-   **AI Integration:** Google Gemini API (for embeddings and completions)
-   **Deployment:** Vercel Serverless Functions

### RAG System
-   **Chunking:** Langchain's RecursiveCharacterTextSplitter
-   **Embeddings:** Google `models/text-embedding-004`
-   **LLM:** Google Gemini (`gemini-pro`)

## Architecture

```mermaid
graph TD
    User[User] --> Frontend[Frontend (Docusaurus/React)];
    Frontend -- Chat Queries --> FastAPI[FastAPI Backend (Vercel)];
    FastAPI -- Embeddings & LLM --> GeminiAPI[Google Gemini API];
    FastAPI -- Vector Search & Storage --> Qdrant[Qdrant Cloud (Vector DB)];
    BookContent[Book Content (Markdown files)] --> Ingestion[Ingestion Script (Python)];
    Ingestion -- Embeddings & Metadata --> Qdrant;
    Qdrant -- Retrieved Context --> FastAPI;
    GeminiAPI -- Generated Response --> FastAPI;
    FastAPI -- Streaming Response & Citations --> Frontend;
```
_High-level architecture of the AI Robotics Guide and RAG Chatbot system._

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v18.x or higher) & **npm** (or yarn)
-   **Python** (v3.9 or higher) & **pip**
-   **Git**

You will also need API keys and cloud accounts for:

-   **Google Gemini API Key:** Obtain from [Google AI Studio](https://aistudio.google.com/).
-   **Qdrant Cloud Account:** Sign up for a free tier account and create a new collection. Obtain your Host and API Key.

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
QDRANT_HOST="YOUR_QDRANT_CLOUD_HOST"
QDRANT_API_KEY="YOUR_QDRANT_CLOUD_API_KEY"
GOOGLE_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
```

### Frontend Setup (Docusaurus)

1.  Navigate to the `website` directory:
    ```bash
    cd website
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    The Docusaurus site should now be running locally, typically at `http://localhost:3000`.

### Backend Setup (FastAPI)

1.  Navigate to the `api` directory:
    ```bash
    cd api
    ```
2.  Create a Python virtual environment and activate it:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the ingestion script to populate Qdrant (ensure your `.env` is configured correctly):
    ```bash
    python ingestion.py
    ```
5.  Start the FastAPI development server:
    ```bash
    uvicorn main:app --reload
    ```
    The FastAPI application should be running locally, typically at `http://127.0.0.1:8000`. You can test the `/` endpoint in your browser.

## Deployment

### Frontend (GitHub Pages)

The Docusaurus site is configured for deployment to GitHub Pages. A GitHub Actions workflow (to be set up in Phase 4) will automate this.

### Backend (Vercel)

The FastAPI application is configured for deployment as a serverless function on Vercel. Ensure you have the Vercel CLI installed and authenticated. Vercel automatically detects the `vercel.json` file.

1.  Install Vercel CLI: `npm install -g vercel`
2.  Login: `vercel login`
3.  Deploy from the `api` directory: `vercel`

Remember to configure your environment variables (QDRANT_HOST, QDRANT_API_KEY, GOOGLE_API_KEY) in your Vercel project settings.

## Project Structure

```
.
├── api/                        # FastAPI Backend
│   ├── ingestion.py            # Document chunking and Qdrant population
│   ├── main.py                 # Main FastAPI application with RAG logic
│   ├── rag_service.py          # Embedding generation service
│   ├── requirements.txt        # Python dependencies
│   └── vercel.json             # Vercel deployment configuration
├── design/                     # Design mockups
│   └── stitch_ai_robotics_book_homepage/
│       ├── ai_robotics_book_homepage/
│       ├── ai_robotics_chapter_page/
│       └── ai_robotics_chapter_page_with_chatbot/
├── website/                    # Docusaurus Frontend
│   ├── docs/                   # Markdown files for book chapters
│   ├── src/                    # React components, CSS, custom themes
│   │   ├── components/         # Custom React components (HomepageFeatures, Chatbot)
│   │   ├── css/                # Global CSS styling
│   │   ├── hooks/              # Custom React hooks (useTextSelection)
│   │   └── theme/              # Custom Docusaurus theme overrides (Root.tsx)
│   ├── docusaurus.config.ts    # Docusaurus configuration
│   ├── sidebars.ts             # Docusaurus sidebar configuration
│   └── package.json            # Node.js dependencies
├── .env                        # Environment variables (local)
├── .gitignore                  # Git ignore rules
├── .specify/                   # Spec-Kit Plus configurations and plans
│   ├── plans/
│   │   ├── book-chapters-plan.md
│   │   ├── design-implementation-plan.md
│   │   └── rag-system-plan.md
│   └── tasks/
│       └── hackathon-ai-robotics-book.md
└── README.md                   # Project overview (this file)
```

## Contributing

Contributions are welcome! Please ensure you adhere to the project's coding standards and follow the spec-driven development guidelines.

## License

This project is licensed under the MIT License.

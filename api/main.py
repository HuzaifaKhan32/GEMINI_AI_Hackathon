from fastapi import FastAPI, Response, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from qdrant_client import QdrantClient, models
from qdrant_client.http.exceptions import UnexpectedResponse
import os
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

from .rag_service import embedding_service # Import the embedding service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize Qdrant client
qdrant_host = os.getenv("QDRANT_HOST")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if not qdrant_host or not qdrant_api_key:
    logger.warning("QDRANT_HOST or QDRANT_API_KEY not set. Qdrant client may not initialize correctly.")
    qdrant_client = None
else:
    qdrant_client = QdrantClient(host=qdrant_host, api_key=qdrant_api_key)

COLLECTION_NAME = "ai_robotics_book" # Defined in ingestion.py

# Initialize Gemini Chat Model
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    logger.error("GOOGLE_API_KEY environment variable not set. Gemini model will not be available.")
    llm = None
else:
    genai.configure(api_key=google_api_key) # Configure genai for direct embedding calls
    llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)


class QueryRequest(BaseModel):
    query: str
    selected_text: str | None = None

class ChatResponse(BaseModel):
    response: str
    citations: list[str] = []

@app.get("/")
async def read_root():
    return {"message": "AI Robotics RAG Chatbot API is running!"}

@app.post("/api/chat")
async def chat_with_rag(request: QueryRequest):
    logger.info(f"Received chat request: Query='{request.query}', Selected Text='{request.selected_text}'")
    
    # Check if LLM is initialized
    if llm is None:
        logger.error("Gemini LLM not initialized due to missing API key.")
        raise HTTPException(status_code=500, detail="LLM service is not available. Please check server configuration.")

    try:
        query_to_embed = request.query
        if request.selected_text:
            query_to_embed = f"Context: {request.selected_text}. Question: {request.query}"
        
        # Generate embedding for the query
        query_embedding = embedding_service.get_embedding(query_to_embed)

        if qdrant_client is None:
            logger.error("Qdrant client not initialized due to missing host/API key.")
            raise HTTPException(status_code=500, detail="Retrieval service is not available. Please check server configuration.")

        # Perform similarity search in Qdrant
        try:
            search_result = qdrant_client.query(
                collection_name=COLLECTION_NAME,
                query_vector=query_embedding,
                limit=5 # Retrieve top 5 relevant chunks
            )
        except UnexpectedResponse as e:
            logger.error(f"Qdrant query failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve context from Qdrant. Please check Qdrant service.")

        context_chunks = []
        citations_list = []
        for hit in search_result.hits:
            context_chunks.append(hit.payload["content"])
            # Extract citation from metadata
            citation_info = f"{hit.payload['chapter_title']}: {hit.payload['section_title']}"
            if citation_info not in citations_list:
                citations_list.append(citation_info)

        # Construct prompt for Gemini
        context = "\\n\\n".join(context_chunks)
        prompt_template = f"""
        You are an AI assistant specialized in AI Robotics. Answer the following question
        based ONLY on the provided context. If the answer cannot be found in the context,
        politely state that you don't have enough information.

        Context:
        {context}

        Question: {request.query}

        Answer:
        """
        
        # Call Gemini model
        ai_response = llm.invoke(prompt_template)
        response_content = ai_response.content

        logger.info("Chat response generated successfully.")
        return ChatResponse(response=response_content, citations=citations_list)

    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail=f"Configuration error: {e}")
    except Exception as e:
        logger.exception("An unexpected error occurred during chat processing.")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")





import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmbeddingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set.")
        
        genai.configure(api_key=google_api_key)
        self.model = genai.GenerativeModel('gemini-pro') # Using gemini-pro for text generation
        self.embedding_model = 'models/text-embedding-004' # Specific embedding model

    def get_embedding(self, text: str) -> list[float]:
        """Generates an embedding for the given text using the Gemini embedding model."""
        if not text:
            return []
        response = genai.embed_content(
            model=self.embedding_model,
            content=text
        )
        return response['embedding']

# Singleton instance
embedding_service = EmbeddingService()

if __name__ == "__main__":
    # Example Usage:
    # Ensure GOOGLE_API_KEY is set in your .env file
    try:
        sample_text = "This is a test sentence for embedding."
        embedding = embedding_service.get_embedding(sample_text)
        print(f"Embedding for '{sample_text}': {embedding[:5]}...") # Print first 5 dimensions
        print(f"Embedding dimension: {len(embedding)}")

        long_text = " ".join([sample_text] * 100) # Longer text
        long_embedding = embedding_service.get_embedding(long_text)
        print(f"Embedding for long text (first 5 dims): {long_embedding[:5]}...")
        print(f"Long Embedding dimension: {len(long_embedding)}")

    except ValueError as e:
        print(f"Error: {e}")
        print("Please ensure GOOGLE_API_KEY is set in your .env file and is valid.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

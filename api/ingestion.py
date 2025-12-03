import os
import re
from typing import List, Dict, Any

from langchain.text_splitter import RecursiveCharacterTextSplitter

def get_chapter_title_from_content(markdown_content: str) -> str:
    """Extracts the main chapter title from markdown content."""
    match = re.search(r'^#\s*(Chapter\s+\d+:.*)', markdown_content, re.MULTILINE | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return "Unknown Chapter"

def get_section_title_from_chunk(chunk_content: str) -> str:
    """Extracts the most prominent section title from a chunk."""
    # Look for the first H2 or H3 heading
    match_h2 = re.search(r'^##\s*(.*)', chunk_content, re.MULTILINE)
    if match_h2:
        return match_h2.group(1).strip()
    match_h3 = re.search(r'^###\s*(.*)', chunk_content, re.MULTILINE)
    if match_h3:
        return match_h3.group(1).strip()
    return "Introduction/Summary" # Default for chunks without clear section headings


def chunk_markdown_document(filepath: str, max_words_per_chunk: int = 500) -> List[Dict[str, Any]]:
    """
    Reads a markdown document, chunks it based on headings and word count,
    and extracts metadata.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    chapter_title = get_chapter_title_from_content(content)
    
    # Split initially by headings
    # This regex splits by H1, H2, H3 while keeping the heading in the chunk
    # (Chapter title is H1, sections are H2/H3)
    heading_splitter = re.compile(r'(^#\s.*|^##\s.*|^###\s.*)', re.MULTILINE)
    
    # Use a basic text splitter for sub-chunking if a section is too long
    # RecursiveCharacterTextSplitter is good for markdown as it tries to preserve structure
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=max_words_per_chunk * 5, # Estimate characters per word
        chunk_overlap=int(max_words_per_chunk * 0.1 * 5), # 10% overlap
        separators=["\n\n", "\n", " ", ""],
        length_function=lambda text: len(text.split(" ")) # Use word count
    )

    chunks = []
    current_chunk_id = 0

    # Split by headings first
    parts = heading_splitter.split(content)
    
    # The split method will return [preamble, heading1, content1, heading2, content2, ...]
    # We need to re-assemble heading + content correctly
    
    # Handle preamble if exists before first heading
    if parts[0].strip():
        # Sub-chunk preamble if too long
        preamble_sub_chunks = text_splitter.split_text(parts[0].strip())
        for sub_chunk_content in preamble_sub_chunks:
            chunks.append({
                "content": sub_chunk_content,
                "metadata": {
                    "chapter_title": chapter_title,
                    "section_title": "Introduction", # Default for preamble
                    "chunk_id": f"{chapter_title.replace(' ', '_').lower()}_chunk_{current_chunk_id}",
                    "source_filepath": filepath
                }
            })
            current_chunk_id += 1

    # Process headings and their contents
    for i in range(1, len(parts)):
        if i % 2 == 1: # It's a heading
            heading = parts[i]
            section_content = parts[i+1] if (i+1) < len(parts) else ""
            
            # Combine heading with its content
            full_section_text = heading.strip() + "\n" + section_content.strip()

            if not full_section_text.strip():
                continue

            # Check word count of the full section
            if len(full_section_text.split(" ")) > max_words_per_chunk:
                # Sub-chunk if section is too large
                sub_chunks_content = text_splitter.split_text(full_section_text)
                for sub_chunk in sub_chunks_content:
                    chunks.append({
                        "content": sub_chunk,
                        "metadata": {
                            "chapter_title": chapter_title,
                            "section_title": get_section_title_from_chunk(heading),
                            "chunk_id": f"{chapter_title.replace(' ', '_').lower()}_chunk_{current_chunk_id}",
                            "source_filepath": filepath
                        }
                    })
                    current_chunk_id += 1
            else:
                # Add as a single chunk
                chunks.append({
                    "content": full_section_text,
                    "metadata": {
                        "chapter_title": chapter_title,
                        "section_title": get_section_title_from_chunk(heading),
                        "chunk_id": f"{chapter_title.replace(' ', '_').lower()}_chunk_{current_chunk_id}",
                        "source_filepath": filepath
                    }
                })
                current_chunk_id += 1
        
        # Skip the content part as it's handled when processing the heading
        if i % 2 == 0:
            continue

    return chunks

def load_and_chunk_docs(docs_dir: str = "website/docs") -> List[Dict[str, Any]]:
    """
    Loads all markdown documents from the specified directory, chunks them,
    and returns a list of dictionaries with content and metadata.
    """
    all_chunks = []
    for filename in os.listdir(docs_dir):
        if filename.endswith(".md"):
            filepath = os.path.join(docs_dir, filename)
            print(f"Processing {filepath}...")
            chunks_from_file = chunk_markdown_document(filepath)
            all_chunks.extend(chunks_from_file)
    return all_chunks

if __name__ == "__main__":
    # Example Usage:
    # Assuming your docs are in a directory named 'docs' at the root
    docs_path = os.path.join(os.getcwd(), "website", "docs")
    
    if not os.path.exists(docs_path):
        print(f"Error: Directory '{docs_path}' not found. Please ensure your Docusaurus docs are in this location.")
    else:
        processed_chunks = load_and_chunk_docs(docs_path)
        print(f"\nSuccessfully processed {len(processed_chunks)} chunks from the documentation.")
        
        # Print first few chunks for verification
        for i, chunk in enumerate(processed_chunks[:5]):
            print(f"\n--- Chunk {i+1} ---")
            print(f"Metadata: {chunk['metadata']}")
            print("Content (first 200 chars):")
            print(chunk['content'][:200] + "..." if len(chunk['content']) > 200 else chunk['content'])

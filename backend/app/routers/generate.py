import os
import re
import random
import requests
import chromadb
import time
from fastapi import APIRouter
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from collections import Counter

# Load environment variables
load_dotenv()

router = APIRouter()

# Setup ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="medibot_chunks")

# Embedding model
model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

# DeepSeek API
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

class GenerateRequest(BaseModel):
    category: str
    query: str = ""
    k: int = 5
    num_questions: int = 3

def jaccard_similarity(a: str, b: str) -> float:
    """Simple Jaccard similarity based on words."""
    a_set = set(a.lower().split())
    b_set = set(b.lower().split())
    intersection = a_set.intersection(b_set)
    union = a_set.union(b_set)
    if not union:
        return 0
    return len(intersection) / len(union)

@router.post("/")
async def generate_questions(request: GenerateRequest):
    # Step 1: Embed query
    query_embedding = model.encode([request.query]).tolist()[0]

    # Step 2: Over-query lots of documents
    overquery_k = request.k * 10  # Increased from 5 to 10 for more diversity
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=overquery_k,
        include=["documents"]
    )

    all_docs = results["documents"][0]
    random.shuffle(all_docs)  # Shuffle to randomize concepts

    # Step 3: Deduplicate (diverse documents)
    selected_docs = []
    used_docs = []

    for doc in all_docs:
        if len(selected_docs) >= request.k:
            break
        too_similar = False
        for prev in used_docs:
            if jaccard_similarity(doc, prev) > 0.3:  # 30% similarity threshold
                too_similar = True
                break
        if not too_similar:
            selected_docs.append(doc)
            used_docs.append(doc)

    if not selected_docs:
        return {"error": "No diverse matching content found."}

    questions = []

    timestamp = int(time.time())

    for idx, context in enumerate(selected_docs[:request.num_questions]):
        # Generate random patient parameters
        age = random.randint(18, 90)
        gender = random.choice(["Male", "Female"])
        setting = random.choice(["clinic", "ER", "ICU", "hospital ward"])

        prompt = f"""
You are an expert USMLE Step 1 question writer.

TASK:
- Write **one multiple-choice clinical vignette** based on the provided CONTEXT.
- Create a **high-quality USMLE-style question** following these rules:

1. **Patient Profile (MANDATORY)**
   - Age: {age} years
   - Gender: {gender}
   - Setting: {setting}
2. **Question Stem:**
   - Focus on clinical reasoning (e.g., diagnosis, next best step, pathophysiology, pharmacology).
   - Include realistic vital signs or physical exam findings if appropriate.
   - Keep stem under 5 sentences.
3. **Answer Choices:**
   - Provide 4 plausible options (A-D).
   - Ensure distractors are realistic DIFFERENTIAL diagnoses, common mistakes, or close but wrong management options.
   - Only ONE definitively correct answer.
4. **Explanation:**
   - **Explain why the correct answer is right.**
   - **Briefly explain why EACH wrong answer is wrong.**
   - Use clear, concise USMLE-level language (avoid excessive fluff).
5. **Difficulty:**
   - Label question as easy / medium / hard based on clinical subtlety.

OUTPUT STRICTLY IN THIS FORMAT:
---
Stem: {{Write the full question stem here}}
A: {{Option A}}
B: {{Option B}}
C: {{Option C}}
D: {{Option D}}
Correct Answer: {{A/B/C/D}}
Explanation:
- Correct: {{Explanation why the correct option is right.}}
- Incorrect A: {{Explanation why A is wrong.}}
- Incorrect B: {{Explanation why B is wrong.}}
- Incorrect C: {{Explanation why C is wrong.}}
- Incorrect D: {{Explanation why D is wrong.}}
Difficulty: {{easy/medium/hard}}
---

CONTEXT:
{context}
"""

        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=30)
            response_json = response.json()

            if "choices" not in response_json:
                continue

            raw_text = response_json["choices"][0]["message"]["content"]
            
            # Clean up any asterisks or other formatting marks
            raw_text = raw_text.replace('**', '').strip()

            # Parsing
            stem_match = re.search(r"Stem:\s*(.+?)(?:\nA:|\n\nA:)", raw_text, re.DOTALL)
            a_match = re.search(r"A:\s*(.+?)\n", raw_text)
            b_match = re.search(r"B:\s*(.+?)\n", raw_text)
            c_match = re.search(r"C:\s*(.+?)\n", raw_text)
            d_match = re.search(r"D:\s*(.+?)\n", raw_text)
            correct_match = re.search(r"Correct Answer:\s*([A-D])", raw_text)
            explanation_match = re.search(r"Explanation:\s*(.+?)(?:\n|$)", raw_text, re.DOTALL)
            difficulty_match = re.search(r"Difficulty:\s*(easy|medium|hard)", raw_text, re.IGNORECASE)

            parsed = {
                "id": f"generated-{timestamp}-{idx}",
                "stem": stem_match.group(1).strip() if stem_match else "Stem not found",
                "answers": [
                    {"id": "a", "text": a_match.group(1).strip() if a_match else "A not found"},
                    {"id": "b", "text": b_match.group(1).strip() if b_match else "B not found"},
                    {"id": "c", "text": c_match.group(1).strip() if c_match else "C not found"},
                    {"id": "d", "text": d_match.group(1).strip() if d_match else "D not found"},
                ],
                "correctAnswer": correct_match.group(1).lower() if correct_match else "a",
                "explanation": explanation_match.group(1).strip() if explanation_match else "Explanation not found.",
                "difficulty": difficulty_match.group(1).lower() if difficulty_match else "medium",
                "category": request.category,
                "lastPracticed": None,
            }

            questions.append(parsed)

        except Exception as e:
            continue

    return {"questions": questions}

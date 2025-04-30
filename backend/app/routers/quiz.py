from fastapi import APIRouter, Query
from typing import List, Dict
from pydantic import BaseModel

router = APIRouter()

class QuizQuestion(BaseModel):
    stem: str
    choices: Dict[str, str]
    correct_answer: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

@router.get("/quiz", response_model=QuizResponse)
async def get_quiz(topic: str = Query(...), difficulty: str = Query(...)):
    # Placeholder response matching expected format
    sample_questions = [
        QuizQuestion(
            stem="What is the capital of France?",
            choices={"A": "Paris", "B": "London", "C": "Berlin", "D": "Madrid"},
            correct_answer="A",
        ),
        QuizQuestion(
            stem="What is 2 + 2?",
            choices={"A": "3", "B": "4", "C": "5", "D": "6"},
            correct_answer="B",
        ),
    ]
    return QuizResponse(questions=sample_questions)

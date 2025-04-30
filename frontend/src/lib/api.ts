// lib/api.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const generateQuestions = async (
  category: string,
  query: string = "",
  k: number = 5,
  num_questions: number = 3
) => {
  const response = await axios.post(`${API_BASE_URL}/generate/`, {
    category,
    query,
    k,
    num_questions,
  });
  return response.data.questions;
};

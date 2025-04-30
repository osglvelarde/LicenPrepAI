import React, { useState, useEffect } from "react";
import axios from "axios";

interface QuizQuestion {
  stem: string;
  choices: Record<string, string>;
  correct_answer: string;
}

const loadingMessages = [
  "🧠 Thinking hard...",
  "📚 Analyzing textbook chapters...",
  "🛠️ Building clinical vignettes...",
  "🔍 Searching for distractors...",
  "✍️ Crafting tricky questions...",
  "🧩 Assembling answer choices...",
  "📈 Calibrating difficulty...",
  "💬 Preparing your quiz...",
  "🚀 Almost ready!",
];

const Practice: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (loading) {
      setLoadingMessage(
        loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
      );
      intervalId = setInterval(() => {
        setLoadingMessage(
          loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
        );
      }, 2000);
    } else if (intervalId !== undefined) {
      clearInterval(intervalId);
    }
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [loading]);

  const generateQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:8000/generate/", {
        query: "acute heart failure",
        k: 5,
        num_questions: 3,
      });
      setQuestions(response.data.questions);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex: number, choice: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: choice }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        🧠 Medibot Quiz
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={generateQuestions}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      {loading && (
        <div
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "20px",
            transition: "0.5s",
          }}
        >
          {loadingMessage}
        </div>
      )}

      {questions.length > 0 && showResults && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "18px",
          }}
        >
          🎯 Score: {calculateScore()} / {questions.length}
        </div>
      )}

      {!loading &&
        questions.map((q, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "30px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3>
              Q{idx + 1}: {q.stem}
            </h3>
            <div style={{ marginTop: "10px" }}>
              {Object.entries(q.choices).map(([letter, text]) => {
                const isCorrect = letter === q.correct_answer;
                const isSelected = selectedAnswers[idx] === letter;
                const showColor = showResults && isSelected;

                return (
                  <label
                    key={letter}
                    style={{
                      display: "block",
                      padding: "8px 12px",
                      margin: "5px 0",
                      borderRadius: "5px",
                      backgroundColor: showColor
                        ? isCorrect
                          ? "#d4edda"
                          : "#f8d7da"
                        : "#f9f9f9",
                      border: "1px solid #ccc",
                      cursor: showResults ? "default" : "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={letter}
                      onChange={() => handleSelect(idx, letter)}
                      disabled={showResults}
                      style={{ marginRight: "10px" }}
                    />
                    {letter}: {text}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

      {!loading && questions.length > 0 && !showResults && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Submit Answers
          </button>
        </div>
      )}
    </div>
  );
};

export default Practice;

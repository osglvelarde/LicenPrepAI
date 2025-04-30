import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Timer, ChevronRight, ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { generateQuestions } from "../lib/api"; // 👈 Your FastAPI client

const Practice = () => {
  const { mcqs, practice, actions } = useStore();
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [numQuestions, setNumQuestions] = useState(3);
  const [loading, setLoading] = useState(false);
  const [quizReady, setQuizReady] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [shakeAnswer, setShakeAnswer] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState("");
  const [progress, setProgress] = useState(0);
  const [infoIndex, setInfoIndex] = useState(0);

  const categories = [
    "Oncology and Hematology",
    "Infectious Diseases",
    "Disorders of the Cardiovascular System",
    "Disorders of the Respiratory System",
  ];

  const categoryFacts = {
    "Oncology and Hematology": [
      "Leukemias often present with fatigue and infections.",
      "Tumor staging is more prognostic than grading.",
      "Chemotherapy-induced neutropenia is a medical emergency.",
    ],
    "Infectious Diseases": [
      "Sepsis is life-threatening organ dysfunction caused by infection.",
      "Vaccination prevents millions of deaths yearly.",
      "MRSA is resistant to all beta-lactam antibiotics.",
    ],
    "Disorders of the Cardiovascular System": [
      "Hypertension is the most common modifiable risk factor for stroke.",
      "ST-elevation on ECG suggests acute myocardial infarction.",
      "Heart failure has reduced vs preserved ejection fraction types.",
    ],
    "Disorders of the Respiratory System": [
      "COPD is the third leading cause of death worldwide.",
      "Asthma is reversible airway obstruction.",
      "Pneumothorax can present with sudden chest pain and dyspnea.",
    ],
  };

  const randomFactFrom = (facts: string[]) =>
    facts[Math.floor(Math.random() * facts.length)];

  // ✅ Now it's safe
  const currentQuestion = mcqs[practice.currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="text-center mt-20 text-muted-foreground">
        {/* Error no questions */}
      </div>
    );
  }
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (quizReady) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizReady]);

  useEffect(() => {
    setTimeElapsed(0);
    setConfetti(false);
    setShakeAnswer(false);
  }, [practice.currentQuestionIndex]);

  const handleAnswerSelect = (answerId: string) => {
    if (!practice.isAnswered) {
      actions.selectAnswer(answerId);
    }
  };

  const handleAnswerSubmit = (answerId: string) => {
    if (answerId === currentQuestion.correctAnswer) {
      setConfetti(true);
      toast({ title: "Correct!", description: "Great job!" });
      const liveRegion = document.getElementById("answer-result");
      if (liveRegion) {
        liveRegion.textContent = "Correct answer!";
      }
    } else {
      setShakeAnswer(true);
      toast({
        title: "Incorrect",
        description: "Study the explanation to learn why.",
        variant: "destructive",
      });
      const liveRegion = document.getElementById("answer-result");
      if (liveRegion) {
        liveRegion.textContent =
          "Incorrect answer. The correct answer is " +
          currentQuestion.answers.find(
            (a) => a.id === currentQuestion.correctAnswer
          )?.text;
      }
    }
  };

  useEffect(() => {
    if (loading && selectedCategory) {
      const interval = setInterval(() => {
        setInfoIndex(
          (prev) => (prev + 1) % categoryFacts[selectedCategory].length
        );
        setCategoryInfo(categoryFacts[selectedCategory][infoIndex]);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [loading, selectedCategory, infoIndex]);

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      setProgress(0);
      setInfoIndex(0);
      setCategoryInfo(categoryFacts[selectedCategory][0]);

      // Simulate progress updates (replace with actual API progress events)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const newQuestions = await generateQuestions(
        selectedCategory,
        selectedCategory,
        5,
        numQuestions
      );

      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        actions.setQuestions(newQuestions);
        actions.addToFacultyPending(newQuestions); // Send to faculty review
        setQuizReady(true);
      }, 300);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate questions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = () => {
    switch (currentQuestion.difficulty) {
      case "easy":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Easy
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Medium
          </Badge>
        );
      case "hard":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Hard
          </Badge>
        );
    }
  };

  if (!quizReady) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-md mx-auto mt-12">
        <h1 className="text-3xl font-bold text-center">Start a New Quiz</h1>

        {/* Category Selector */}
        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Select Category:</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Choose a Category --" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of Questions */}
        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Number of Questions:</label>
          <Select
            value={numQuestions.toString()}
            onValueChange={(val) => setNumQuestions(Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select number" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateQuiz}
          disabled={!selectedCategory || loading}
          className="w-full"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </Button>

        {/* Progress + Random Fact */}
        {loading && (
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-muted-foreground animate-fade-in">
              {categoryInfo}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 max-w-3xl mx-auto pb-16 md:pb-0">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold tracking-tight">Practice Quiz</h1>
        <Badge variant="outline" className="flex gap-1 items-center">
          <span className="font-medium">
            {practice.currentQuestionIndex + 1}
          </span>
          <span className="text-muted-foreground">of</span>
          <span className="font-medium">{mcqs.length}</span>
        </Badge>
      </div>

      {/* Live region for accessibility */}
      <div id="answer-result" className="sr-only" aria-live="polite"></div>

      {/* Main Question Card */}
      <Card
        className={cn(
          "w-full animate-in",
          confetti && "relative overflow-hidden",
          shakeAnswer && "animate-shake"
        )}
      >
        {confetti && (
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {/* Confetti effect */}
          </div>
        )}

        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Question {practice.currentQuestionIndex + 1}</CardTitle>
            {getDifficultyBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg">{currentQuestion.stem}</p>
          </div>

          {/* Answer Choices */}
          <RadioGroup
            value={practice.selectedAnswer || ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {currentQuestion.answers.map((answer, index) => (
              <div key={answer.id} className="flex items-start space-x-2">
                <RadioGroupItem
                  value={answer.id}
                  id={answer.id}
                  disabled={practice.isAnswered}
                  className={cn(
                    practice.isAnswered &&
                      answer.id === currentQuestion.correctAnswer &&
                      "ring-2 ring-green-500",
                    practice.isAnswered &&
                      answer.id === practice.selectedAnswer &&
                      answer.id !== currentQuestion.correctAnswer &&
                      "ring-2 ring-red-500"
                  )}
                />
                <Label
                  htmlFor={answer.id}
                  className={cn(
                    "flex-1 p-4 rounded-md border cursor-pointer transition-colors",
                    practice.isAnswered &&
                      answer.id === currentQuestion.correctAnswer &&
                      "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
                    practice.isAnswered &&
                      answer.id === practice.selectedAnswer &&
                      answer.id !== currentQuestion.correctAnswer &&
                      "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                  )}
                >
                  <div className="flex gap-2">
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>{" "}
                    {answer.text}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {practice.isAnswered && (
            <Accordion type="single" collapsible defaultValue="explanation">
              <AccordionItem value="explanation" className="border-none">
                <AccordionTrigger className="font-semibold">
                  Explanation
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none text-muted-foreground">
                  {currentQuestion.explanation}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => actions.nextQuestion()}
            disabled={practice.currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {!practice.isAnswered ? (
            <Button
              onClick={() =>
                practice.selectedAnswer &&
                handleAnswerSubmit(practice.selectedAnswer)
              }
              disabled={!practice.selectedAnswer}
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={() => actions.nextQuestion()}>
              Next Question
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Quiz Stats (Sheet) */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Timer className="h-4 w-4" />
              <span>{formatTime(timeElapsed)}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Quiz Stats</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Time Elapsed</h4>
                <div className="text-2xl font-bold">
                  {formatTime(timeElapsed)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Questions</h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="px-3">
                    {practice.currentQuestionIndex + 1} of {mcqs.length}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Difficulty</h4>
                {getDifficultyBadge()}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Category</h4>
                <Badge variant="outline">{currentQuestion.category}</Badge>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => actions.resetPractice()}>
                Restart Quiz
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Practice;

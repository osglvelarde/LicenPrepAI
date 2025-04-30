
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock data for sample textbook and MCQs
const mockData = {
  textbooks: [
    {
      id: 'tb1',
      title: 'First Aid for the USMLE Step 1',
      pages: 816,
      uploadedAt: new Date().toISOString(),
      status: 'processed',
      mimeType: 'application/pdf',
      chapters: ['Biochemistry', 'Immunology', 'Microbiology', 'Pathology']
    }
  ],
  mcqs: [
    {
      id: 'q1',
      stem: 'A 45-year-old male presents with progressive muscle weakness and difficulty swallowing. Physical examination reveals fasciculations of the tongue. What is the most likely diagnosis?',
      answers: [
        { id: 'a', text: 'Multiple Sclerosis' },
        { id: 'b', text: 'Amyotrophic Lateral Sclerosis' },
        { id: 'c', text: 'Myasthenia Gravis' },
        { id: 'd', text: 'Guillain-Barré Syndrome' },
      ],
      correctAnswer: 'b',
      explanation: 'The combination of upper and lower motor neuron signs, including tongue fasciculations, suggests ALS.',
      difficulty: 'medium',
      category: 'Neurology',
      lastPracticed: null,
    },
    {
      id: 'q2',
      stem: 'Which enzyme deficiency is associated with Tay-Sachs disease?',
      answers: [
        { id: 'a', text: 'Hexosaminidase A' },
        { id: 'b', text: 'Glucocerebrosidase' },
        { id: 'c', text: 'Sphingomyelinase' },
        { id: 'd', text: 'α-Galactosidase A' },
      ],
      correctAnswer: 'a',
      explanation: 'Tay-Sachs disease is caused by deficiency of hexosaminidase A, leading to GM2 ganglioside accumulation.',
      difficulty: 'easy',
      category: 'Biochemistry',
      lastPracticed: null,
    },
    {
      id: 'q3',
      stem: 'A patient with a BMI of 28 kg/m² and type 2 diabetes presents with an elevated HbA1c of 8.2%. What is the most appropriate first-line treatment?',
      answers: [
        { id: 'a', text: 'Insulin glargine' },
        { id: 'b', text: 'Metformin' },
        { id: 'c', text: 'Sitagliptin' },
        { id: 'd', text: 'Glimepiride' },
      ],
      correctAnswer: 'b',
      explanation: 'Metformin is the first-line treatment for type 2 diabetes, especially in overweight or obese patients.',
      difficulty: 'medium',
      category: 'Endocrinology',
      lastPracticed: null,
    }
  ],
  systemProgress: [
    { system: 'Cardiovascular', progress: 68 },
    { system: 'Respiratory', progress: 42 },
    { system: 'Gastrointestinal', progress: 55 },
    { system: 'Renal', progress: 23 },
    { system: 'Neurology', progress: 77 },
    { system: 'Endocrinology', progress: 39 },
    { system: 'Hematology', progress: 51 },
    { system: 'Immunology', progress: 65 },
  ],
  streak: 7,
  userStats: {
    questionsAnswered: 213,
    correctAnswers: 164,
    timeSpent: 1234, // minutes
    lastActive: new Date().toISOString(),
  }
};

type Textbook = {
  id: string;
  title: string;
  pages: number;
  uploadedAt: string;
  status: 'processing' | 'processed' | 'failed';
  mimeType: string;
  chapters: string[];
};

type Answer = {
  id: string;
  text: string;
};

type MCQ = {
  id: string;
  stem: string;
  answers: Answer[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  lastPracticed: string | null;
};

type SystemProgress = {
  system: string;
  progress: number;
};

type UserStats = {
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; // minutes
  lastActive: string;
};

type PracticeState = {
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  showExplanation: boolean;
};

type AppState = {
  textbooks: Textbook[];
  mcqs: MCQ[];
  systemProgress: SystemProgress[];
  streak: number;
  userStats: UserStats;
  practice: PracticeState;
  faculty: {
    pending: MCQ[];
    approved: MCQ[];
    flagged: MCQ[];
  };
  settings: {
    modelTier: string;
    tokenBudget: number;
    theme: 'light' | 'dark' | 'system';
  };
  actions: {
    addTextbook: (textbook: Textbook) => void;
    updateTextbookStatus: (id: string, status: Textbook['status']) => void;
    selectAnswer: (answerId: string) => void;
    nextQuestion: () => void;
    toggleExplanation: () => void;
    resetPractice: () => void;
    moveMCQToCategory: (mcqId: string, from: string, to: string) => void;
    updateSettings: (settings: Partial<AppState['settings']>) => void;
  };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      textbooks: mockData.textbooks,
      mcqs: mockData.mcqs,
      systemProgress: mockData.systemProgress,
      streak: mockData.streak,
      userStats: mockData.userStats,
      practice: {
        currentQuestionIndex: 0,
        selectedAnswer: null,
        isAnswered: false,
        isCorrect: null,
        showExplanation: false,
      },
      faculty: {
        pending: mockData.mcqs.slice(0, 1),
        approved: mockData.mcqs.slice(1, 2),
        flagged: mockData.mcqs.slice(2),
      },
      settings: {
        modelTier: 'gpt-4',
        tokenBudget: 500000,
        theme: 'system',
      },
      actions: {
        addTextbook: (textbook) => set((state) => ({
          textbooks: [...state.textbooks, textbook]
        })),
        updateTextbookStatus: (id, status) => set((state) => ({
          textbooks: state.textbooks.map((tb) => 
            tb.id === id ? { ...tb, status } : tb
          )
        })),
        selectAnswer: (answerId) => set((state) => {
          const currentQuestion = state.mcqs[state.practice.currentQuestionIndex];
          const isCorrect = answerId === currentQuestion.correctAnswer;
          
          return {
            practice: {
              ...state.practice,
              selectedAnswer: answerId,
              isAnswered: true,
              isCorrect,
              showExplanation: true,
            }
          };
        }),
        nextQuestion: () => set((state) => {
          const nextIndex = (state.practice.currentQuestionIndex + 1) % state.mcqs.length;
          return {
            practice: {
              ...state.practice,
              currentQuestionIndex: nextIndex,
              selectedAnswer: null,
              isAnswered: false,
              isCorrect: null,
              showExplanation: false,
            }
          };
        }),
        toggleExplanation: () => set((state) => ({
          practice: {
            ...state.practice,
            showExplanation: !state.practice.showExplanation,
          }
        })),
        resetPractice: () => set((state) => ({
          practice: {
            currentQuestionIndex: 0,
            selectedAnswer: null,
            isAnswered: false,
            isCorrect: null,
            showExplanation: false,
          }
        })),
        moveMCQToCategory: (mcqId, from, to) => set((state) => {
          const mcq = state.faculty[from as keyof typeof state.faculty].find(m => m.id === mcqId);
          if (!mcq) return state;
          
          return {
            faculty: {
              ...state.faculty,
              [from]: state.faculty[from as keyof typeof state.faculty].filter(m => m.id !== mcqId),
              [to]: [...state.faculty[to as keyof typeof state.faculty], mcq]
            }
          };
        }),
        updateSettings: (settings) => set((state) => ({
          settings: { ...state.settings, ...settings }
        })),
      }
    }),
    {
      name: 'licenprep-storage',
      partialize: (state) => ({
        textbooks: state.textbooks,
        mcqs: state.mcqs,
        systemProgress: state.systemProgress,
        streak: state.streak,
        userStats: state.userStats,
        settings: state.settings
      }),
    }
  )
);

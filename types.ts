import { Type } from "@google/genai";

export enum ViewMode {
  MODULES = 'MODULES',
  TUTOR = 'TUTOR',
  ARCH_BUILDER = 'ARCH_BUILDER',
  MOCK_INTERVIEW = 'MOCK_INTERVIEW',
  QUIZ = 'QUIZ',
  FLASHCARDS = 'FLASHCARDS'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  topics: string[];
  icon: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface ArchitectureNode {
  type: 'master' | 'data' | 'coordinating' | 'ml' | 'ingest';
  count: number;
  specs: string;
}

export interface ArchitectureDesign {
  nodes: ArchitectureNode[];
  shardsPerIndex: number;
  replicaCount: number;
  ilmPolicy: string;
  summary: string;
  costEstimation: string;
}

export interface InterviewConfig {
  type: 'technical' | 'sales' | 'behavioral' | 'director';
  difficulty: 'beginner' | 'intermediate' | 'expert';
}

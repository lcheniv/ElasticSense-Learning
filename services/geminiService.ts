import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { SYSTEM_INSTRUCTION_BASE, ARCHITECTURE_SYSTEM_INSTRUCTION, CORE_KNOWLEDGE_BASE } from "../constants";
import { ArchitectureDesign, QuizQuestion } from "../types";

// Helper to ensure API key exists
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. General Chat / Tutor
export const generateTutorResponse = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  message: string,
  context?: string
) => {
  const ai = getClient();
  // We explicitly inject the Core Knowledge Base again in the prompt context to ensure it stays fresh
  const systemInstruction = context 
    ? `${SYSTEM_INSTRUCTION_BASE}\n\nAdditional Context for this specific query: ${context}`
    : SYSTEM_INSTRUCTION_BASE;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
    history: history
  });

  // Append a request for visual/structured output to the user message invisibly
  const enhancedMessage = `${message} 
  
  (IMPORTANT INSTRUCTIONS: 
   1. Use **Bold** for emphasis. 
   2. Use \`code\` for technical terms. 
   3. DEFINE all acronyms on first use. 
   4. Include a > "David's Tip" blockquote.
   5. Include [Link Title](URL) for Google/YouTube resources.)`;

  const result = await chat.sendMessage({ message: enhancedMessage });
  return result.text;
};

// 2. Quiz Generator
export const generateQuizQuestions = async (topic: string): Promise<QuizQuestion[]> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate 3 multiple-choice questions about "${topic}" for an Elastic Solutions Architect interview. 
    Use the following knowledge base for context on difficulty and style:
    ${CORE_KNOWLEDGE_BASE}
    
    Ensure questions test conceptual understanding (sizing, architecture, value) and scenarios, not just trivia.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  if (!response.text) return [];
  return JSON.parse(response.text) as QuizQuestion[];
};

// 3. Architecture Builder
export const generateArchitectureDesign = async (scenario: string): Promise<ArchitectureDesign | null> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Design an Elastic Cluster for this scenario: "${scenario}". 
    Consider ingestion rate, retention, query load, and redundancy.
    Follow the sizing rules (20-50GB shards, <32GB Heap) explicitly.`,
    config: {
      systemInstruction: ARCHITECTURE_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["master", "data", "coordinating", "ml", "ingest"] },
                count: { type: Type.INTEGER },
                specs: { type: Type.STRING, description: "e.g., 64GB RAM, 16 vCPU" }
              }
            }
          },
          shardsPerIndex: { type: Type.INTEGER },
          replicaCount: { type: Type.INTEGER },
          ilmPolicy: { type: Type.STRING },
          summary: { type: Type.STRING },
          costEstimation: { type: Type.STRING }
        }
      }
    }
  });

  if (!response.text) return null;
  return JSON.parse(response.text) as ArchitectureDesign;
};

// 4. Mock Interview Initializer
export const startMockInterviewSession = async (type: string, difficulty: string) => {
  const ai = getClient();
  const prompt = `Start a mock interview. You are a ${difficulty} level interviewer conducting a ${type} interview for an Elastic Solutions Architect role.
  
  If "Sales Discovery":
  - Act like a CTO or Director.
  - Focus on business value, ROI, and "Why Elastic?".
  - Challenge the user: "Splunk is already installed, why change?"

  If "Technical Deep Dive":
  - Act like a Principal Engineer.
  - Grill them on Sharding, Heap, ILM, and diagnosing latency.
  - Ask: "I have 500M docs and slow search. What do I check?"

  Start by asking the first question. Do not output anything else but the question.`;
  
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction: SYSTEM_INSTRUCTION_BASE }
  });

  const result = await chat.sendMessage({ message: prompt });
  return {
    initialMessage: result.text,
    chatSession: chat
  };
};
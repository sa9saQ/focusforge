import type { TaskDecomposer } from "@/lib/ai/types";
import { GeminiTaskDecomposer } from "@/lib/ai/gemini-decomposer";
import { MockTaskDecomposer } from "@/lib/ai/mock-decomposer";

export const createTaskDecomposer = (): TaskDecomposer => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (apiKey) {
    return new GeminiTaskDecomposer(apiKey);
  }
  // Fallback to mock if no API key
  return new MockTaskDecomposer();
};

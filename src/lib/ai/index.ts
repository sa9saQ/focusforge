import type { TaskDecomposer } from "@/lib/ai/types";
import { MockTaskDecomposer } from "@/lib/ai/mock-decomposer";

export const createTaskDecomposer = (): TaskDecomposer => {
  // NOTE: OpenAI実装への差し替えを想定し、ここで実装を切り替える。
  return new MockTaskDecomposer();
};

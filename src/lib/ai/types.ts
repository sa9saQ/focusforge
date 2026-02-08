import type { SubtaskSuggestion } from "@/lib/types";

export type TaskDecomposeInput = {
  taskTitle: string;
  taskDescription?: string;
};

export interface TaskDecomposer {
  decompose(input: TaskDecomposeInput): Promise<SubtaskSuggestion[]>;
}

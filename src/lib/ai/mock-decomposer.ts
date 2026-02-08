import type { SubtaskSuggestion } from "@/lib/types";
import type { TaskDecomposer, TaskDecomposeInput } from "@/lib/ai/types";

const templates: Record<string, SubtaskSuggestion[]> = {
  write: [
    { title: "Open a blank document and write a 2-line goal", estimated_minutes: 5, tips: "Silence notifications before you begin." },
    { title: "Create a quick outline with 3 bullet points", estimated_minutes: 10, tips: "Use simple words first; polish later." },
    { title: "Draft only the first section", estimated_minutes: 20, tips: "Set a timer and stop when it ends." },
    { title: "Take a 5-minute walk and return for edits", estimated_minutes: 10, tips: "Movement can reset attention quickly." },
  ],
  study: [
    { title: "Collect study materials in one tab/window", estimated_minutes: 8, tips: "Remove unrelated tabs to reduce friction." },
    { title: "Review one concept and write 3 key notes", estimated_minutes: 15, tips: "Handwritten notes can improve retention." },
    { title: "Solve two practice questions", estimated_minutes: 20, tips: "Treat mistakes as checkpoints, not failure." },
  ],
};

const fallback: SubtaskSuggestion[] = [
  { title: "Define what done looks like in one sentence", estimated_minutes: 5, tips: "Clarity first prevents procrastination." },
  { title: "Do the smallest visible first action", estimated_minutes: 10, tips: "Start with an action that takes under 10 minutes." },
  { title: "Continue with one focused sprint", estimated_minutes: 20, tips: "Use headphones or white noise if helpful." },
  { title: "Close with a short review and next step", estimated_minutes: 8, tips: "Leave a clear restart point for later." },
];

const detectTemplate = (title: string): SubtaskSuggestion[] => {
  const loweredTitle = title.toLowerCase();

  if (loweredTitle.includes("write") || loweredTitle.includes("essay") || loweredTitle.includes("report")) {
    return templates.write;
  }

  if (loweredTitle.includes("study") || loweredTitle.includes("exam") || loweredTitle.includes("learn")) {
    return templates.study;
  }

  return fallback;
};

export class MockTaskDecomposer implements TaskDecomposer {
  public async decompose(input: TaskDecomposeInput): Promise<SubtaskSuggestion[]> {
    return detectTemplate(input.taskTitle).slice(0, 5);
  }
}

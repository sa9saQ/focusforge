import type { TaskDecomposeInput, TaskDecomposer } from "@/lib/ai/types";
import type { SubtaskSuggestion } from "@/lib/types";

export class GeminiTaskDecomposer implements TaskDecomposer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async decompose(input: TaskDecomposeInput): Promise<SubtaskSuggestion[]> {
    const prompt = `You are a productivity coach specializing in ADHD-friendly task management.

Break down this task into 3-5 small, actionable subtasks that each take 5-25 minutes.

Task: "${input.taskTitle}"${input.taskDescription ? `\nDetails: ${input.taskDescription}` : ""}

Respond ONLY with a JSON array. Each item must have:
- "title": short actionable step (max 80 chars)
- "estimated_minutes": number between 5 and 25
- "tips": one brief ADHD-friendly tip (max 100 chars)

Example: [{"title":"Write outline","estimated_minutes":10,"tips":"Start with bullet points, don't overthink"}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error", { status: response.status, body: errorText });
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract JSON array from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response as JSON array");
    }

    const subtasks: SubtaskSuggestion[] = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    return subtasks
      .slice(0, 5)
      .map((s) => ({
        title: String(s.title).slice(0, 80),
        estimated_minutes: Math.min(25, Math.max(5, Number(s.estimated_minutes) || 15)),
        tips: String(s.tips).slice(0, 100),
      }));
  }
}

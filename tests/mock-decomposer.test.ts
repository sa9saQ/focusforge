import { describe, expect, it } from "vitest";
import { MockTaskDecomposer } from "@/lib/ai/mock-decomposer";

describe("MockTaskDecomposer", () => {
  it("returns study template suggestions when title contains study keywords", async () => {
    const decomposer = new MockTaskDecomposer();
    const result = await decomposer.decompose({ taskTitle: "Study for biology exam" });

    expect(result).toHaveLength(3);
    expect(result[0]?.title.toLowerCase()).toContain("study");
  });

  it("returns fallback suggestions for unknown tasks", async () => {
    const decomposer = new MockTaskDecomposer();
    const result = await decomposer.decompose({ taskTitle: "Clean garage" });

    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.every((suggestion) => suggestion.estimated_minutes >= 5)).toBe(true);
  });
});

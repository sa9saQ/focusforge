import { describe, expect, it } from "vitest";
import { getLevelFromXp, getXpForLevel, getXpProgress } from "@/lib/gamification";

describe("gamification helpers", () => {
  it("starts at level 1 for zero XP", () => {
    expect(getLevelFromXp(0)).toBe(1);
  });

  it("increases level when XP passes threshold", () => {
    const threshold = getXpForLevel(2);
    expect(getLevelFromXp(threshold - 1)).toBe(1);
    expect(getLevelFromXp(threshold)).toBe(2);
  });

  it("returns bounded progress information", () => {
    const progress = getXpProgress(150);
    expect(progress.level).toBeGreaterThanOrEqual(1);
    expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
    expect(progress.progressPercent).toBeLessThanOrEqual(100);
    expect(progress.nextLevelXp).toBeGreaterThan(progress.currentLevelXp);
  });
});

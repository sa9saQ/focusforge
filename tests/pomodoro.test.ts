import { describe, expect, it } from "vitest";
import {
  formatRemainingTime,
  getDurationForPhase,
  getNextPhase,
  minutesToSeconds,
} from "@/lib/pomodoro";

describe("pomodoro utilities", () => {
  it("converts minutes to seconds", () => {
    expect(minutesToSeconds(25)).toBe(1500);
  });

  it("formats remaining time as mm:ss", () => {
    expect(formatRemainingTime(1500)).toBe("25:00");
    expect(formatRemainingTime(65)).toBe("01:05");
  });

  it("returns expected durations and next phase", () => {
    expect(getDurationForPhase("work", 25, 5)).toBe(1500);
    expect(getDurationForPhase("break", 25, 5)).toBe(300);
    expect(getNextPhase("work")).toBe("break");
    expect(getNextPhase("break")).toBe("work");
  });
});

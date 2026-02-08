export type PomodoroPhase = "work" | "break";

export const DEFAULT_WORK_MINUTES = 25;
export const DEFAULT_BREAK_MINUTES = 5;

export const minutesToSeconds = (minutes: number): number => {
  return Math.max(0, Math.floor(minutes * 60));
};

export const formatRemainingTime = (seconds: number): string => {
  const clampedSeconds = Math.max(0, seconds);
  const minutesPart = Math.floor(clampedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secondsPart = (clampedSeconds % 60).toString().padStart(2, "0");

  return `${minutesPart}:${secondsPart}`;
};

export const getNextPhase = (phase: PomodoroPhase): PomodoroPhase => {
  return phase === "work" ? "break" : "work";
};

export const getDurationForPhase = (
  phase: PomodoroPhase,
  workMinutes: number,
  breakMinutes: number,
): number => {
  return phase === "work" ? minutesToSeconds(workMinutes) : minutesToSeconds(breakMinutes);
};

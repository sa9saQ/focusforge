export const TASK_COMPLETE_XP = 10;
export const POMODORO_COMPLETE_XP = 15;

export const getXpForLevel = (level: number): number => {
  if (level <= 1) {
    return 0;
  }

  return Math.floor(100 * Math.pow(level - 1, 1.5));
};

export const getLevelFromXp = (xp: number): number => {
  if (xp <= 0) {
    return 1;
  }

  let level = 1;
  while (xp >= getXpForLevel(level + 1)) {
    level += 1;
  }

  return level;
};

export const getXpProgress = (
  xp: number,
): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} => {
  const level = getLevelFromXp(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const levelSpan = Math.max(1, nextLevelXp - currentLevelXp);
  const progressPercent = ((xp - currentLevelXp) / levelSpan) * 100;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
  };
};

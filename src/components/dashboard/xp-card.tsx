"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Star } from "lucide-react";
import { getXpProgress } from "@/lib/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type XpCardProps = {
  xp: number;
  dailyXp: number;
  dailyXpGoal: number;
  celebrationToken?: number | null;
};

const CIRCLE_SIZE = 124;
const STROKE_WIDTH = 10;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const XpCard = ({ xp, dailyXp, dailyXpGoal, celebrationToken = null }: XpCardProps): React.ReactElement => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const { level, currentLevelXp, nextLevelXp, progressPercent } = useMemo(() => getXpProgress(xp), [xp]);
  const xpToNextLevel = Math.max(0, nextLevelXp - xp);
  const dailyRemaining = Math.max(0, dailyXpGoal - dailyXp);
  const ringOffset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;

  useEffect(() => {
    if (!celebrationToken) {
      return;
    }

    setIsCelebrating(true);
    const timeoutId = window.setTimeout(() => {
      setIsCelebrating(false);
    }, 820);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [celebrationToken]);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Star className="size-4 text-primary" /> Level {level}
          </p>
          <p className="text-sm text-muted-foreground">{xp} XP</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} aria-hidden>
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                className="text-secondary/80"
                fill="transparent"
              />
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                className="text-primary transition-all duration-500"
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-xl font-bold">{Math.round(progressPercent)}%</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">to next</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {xpToNextLevel} XP to reach Level {level + 1}.
            </p>
            <p className="text-sm text-muted-foreground">
              {xp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP in this level
            </p>
            <p className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
              {dailyRemaining > 0 ? `${dailyRemaining} XP to daily goal` : "Daily XP goal complete"}
            </p>
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm font-medium text-accent-foreground break-words">
          <Flame className="size-4 shrink-0 text-accent-foreground" /> Keep your streak by finishing one task today.
        </p>

        {isCelebrating ? (
          <>
            <span aria-hidden className="xp-confetti-piece xp-confetti-one bg-primary" />
            <span aria-hidden className="xp-confetti-piece xp-confetti-two bg-emerald-400" />
            <span aria-hidden className="xp-confetti-piece xp-confetti-three bg-amber-400" />
            <span aria-hidden className="xp-confetti-piece xp-confetti-four bg-sky-400" />
            <span aria-hidden className="xp-confetti-piece xp-confetti-five bg-rose-400" />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import {
  DEFAULT_BREAK_MINUTES,
  DEFAULT_WORK_MINUTES,
  formatRemainingTime,
  getDurationForPhase,
  getNextPhase,
  type PomodoroPhase,
} from "@/lib/pomodoro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PomodoroPanelProps = {
  onWorkSessionCompleted: () => Promise<void>;
};

export const PomodoroPanel = ({ onWorkSessionCompleted }: PomodoroPanelProps): React.ReactElement => {
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [secondsLeft, setSecondsLeft] = useState(getDurationForPhase("work", DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES));
  const [isRunning, setIsRunning] = useState(false);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(getDurationForPhase(phase, workMinutes, breakMinutes));
    }
  }, [breakMinutes, isRunning, phase, workMinutes]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((previousSeconds) => {
        if (previousSeconds > 1) {
          return previousSeconds - 1;
        }

        const wasWorkPhase = phase === "work";
        const nextPhase = getNextPhase(phase);

        if (wasWorkPhase) {
          setCompletedWorkSessions((value) => value + 1);
          void onWorkSessionCompleted();
        }

        setPhase(nextPhase);
        return getDurationForPhase(nextPhase, workMinutes, breakMinutes);
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [breakMinutes, isRunning, onWorkSessionCompleted, phase, workMinutes]);

  const phaseLabel = useMemo(() => (phase === "work" ? "Focus" : "Break"), [phase]);

  const resetTimer = (): void => {
    setIsRunning(false);
    setPhase("work");
    setSecondsLeft(getDurationForPhase("work", workMinutes, breakMinutes));
  };

  const updateWorkMinutes = (nextValue: string): void => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 120) {
      return;
    }

    setWorkMinutes(parsed);
  };

  const updateBreakMinutes = (nextValue: string): void => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 60) {
      return;
    }

    setBreakMinutes(parsed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro</CardTitle>
        <CardDescription>25/5 by default. Fully customizable.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={phase === "work" ? "default" : "secondary"}>{phaseLabel}</Badge>
          <p className="text-sm text-muted-foreground">Completed focus sessions: {completedWorkSessions}</p>
        </div>

        <p className="text-center font-[var(--font-heading)] text-5xl font-bold tracking-tight sm:text-6xl">{formatRemainingTime(secondsLeft)}</p>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-sm">
            Work (min)
            <Input type="number" min={1} max={120} value={workMinutes} onChange={(event) => updateWorkMinutes(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            Break (min)
            <Input type="number" min={1} max={60} value={breakMinutes} onChange={(event) => updateBreakMinutes(event.target.value)} />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setIsRunning((state) => !state)}>
            {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button type="button" variant="outline" onClick={resetTimer}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

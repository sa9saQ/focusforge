"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Waves } from "lucide-react";
import {
  DEFAULT_BREAK_MINUTES,
  DEFAULT_WORK_MINUTES,
  formatRemainingTime,
  getDurationForPhase,
  getNextPhase,
  type PomodoroPhase,
} from "@/lib/pomodoro";
import type { AmbientSoundOption, LocalSettings } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SOUND_OPTIONS: Array<{ value: AmbientSoundOption; label: string; url: string }> = [
  { value: "none", label: "None", url: "" },
  { value: "rain", label: "Rain", url: "https://cdn.example.com/focusforge/rain.mp3" },
  { value: "lofi", label: "Lo-fi", url: "https://cdn.example.com/focusforge/lofi.mp3" },
  { value: "forest", label: "Forest", url: "https://cdn.example.com/focusforge/forest.mp3" },
];

type PomodoroPanelProps = {
  onWorkSessionCompleted: () => Promise<void>;
  settings: LocalSettings;
  onUpdateSettings: (patch: Partial<LocalSettings>) => Promise<void>;
};

const RING_SIZE = 210;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const PomodoroPanel = ({ onWorkSessionCompleted, settings, onUpdateSettings }: PomodoroPanelProps): React.ReactElement => {
  const [workMinutes, setWorkMinutes] = useState(settings.pomodoroWorkMinutes || DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(settings.pomodoroBreakMinutes || DEFAULT_BREAK_MINUTES);
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [secondsLeft, setSecondsLeft] = useState(getDurationForPhase("work", settings.pomodoroWorkMinutes, settings.pomodoroBreakMinutes));
  const [isRunning, setIsRunning] = useState(false);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [autoStartNextSession, setAutoStartNextSession] = useState(settings.pomodoroAutoStartNextSession);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundOption>(settings.ambientSound);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setWorkMinutes(settings.pomodoroWorkMinutes || DEFAULT_WORK_MINUTES);
    setBreakMinutes(settings.pomodoroBreakMinutes || DEFAULT_BREAK_MINUTES);
    setAutoStartNextSession(settings.pomodoroAutoStartNextSession);
    setAmbientSound(settings.ambientSound);
  }, [
    settings.ambientSound,
    settings.pomodoroAutoStartNextSession,
    settings.pomodoroBreakMinutes,
    settings.pomodoroWorkMinutes,
  ]);

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

        if (!autoStartNextSession) {
          setIsRunning(false);
        }

        return getDurationForPhase(nextPhase, workMinutes, breakMinutes);
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [autoStartNextSession, breakMinutes, isRunning, onWorkSessionCompleted, phase, workMinutes]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    const currentAudio = audioRef.current;
    const selected = SOUND_OPTIONS.find((option) => option.value === ambientSound);

    if (!selected || selected.value === "none") {
      currentAudio.pause();
      currentAudio.removeAttribute("src");
      return;
    }

    if (currentAudio.src !== selected.url) {
      currentAudio.src = selected.url;
    }

    if (isRunning) {
      void currentAudio.play().catch(() => {});
    } else {
      currentAudio.pause();
    }
  }, [ambientSound, isRunning]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const phaseLabel = useMemo(() => (phase === "work" ? "Focus" : "Break"), [phase]);
  const currentSession = Math.min(4, completedWorkSessions + 1);
  const totalPhaseSeconds = getDurationForPhase(phase, workMinutes, breakMinutes);
  const elapsedPercent = totalPhaseSeconds > 0 ? ((totalPhaseSeconds - secondsLeft) / totalPhaseSeconds) * 100 : 0;
  const ringOffset = CIRCUMFERENCE - (Math.max(0, Math.min(100, elapsedPercent)) / 100) * CIRCUMFERENCE;

  const resetTimer = (): void => {
    setIsRunning(false);
    setPhase("work");
    setSecondsLeft(getDurationForPhase("work", workMinutes, breakMinutes));
  };

  const updateWorkMinutes = (nextValue: string): void => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed) || parsed < 5 || parsed > 120) {
      return;
    }

    setWorkMinutes(parsed);
    void onUpdateSettings({ pomodoroWorkMinutes: parsed });
  };

  const updateBreakMinutes = (nextValue: string): void => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 60) {
      return;
    }

    setBreakMinutes(parsed);
    void onUpdateSettings({ pomodoroBreakMinutes: parsed });
  };

  const toggleAutoStart = (): void => {
    const nextValue = !autoStartNextSession;
    setAutoStartNextSession(nextValue);
    void onUpdateSettings({ pomodoroAutoStartNextSession: nextValue });
  };

  const updateAmbientSound = (nextValue: string): void => {
    const sound = SOUND_OPTIONS.find((option) => option.value === nextValue)?.value ?? "none";
    setAmbientSound(sound);
    void onUpdateSettings({ ambientSound: sound });
  };

  return (
    <Card id="timer">
      <CardHeader>
        <CardTitle>Pomodoro</CardTitle>
        <CardDescription>Focus in visible cycles and keep your pace steady.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={phase === "work" ? "default" : "secondary"}>{phaseLabel}</Badge>
          <p className="text-sm text-muted-foreground">Session {currentSession} of 4</p>
        </div>

        <div className="relative mx-auto flex w-full max-w-[240px] items-center justify-center">
          <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} aria-hidden>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-secondary/70"
              fill="transparent"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="currentColor"
              strokeWidth={STROKE}
              strokeLinecap="round"
              className="text-primary transition-all duration-700"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-[var(--font-heading)] text-5xl font-bold tracking-tight">{formatRemainingTime(secondsLeft)}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{phaseLabel} mode</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-sm">
            Work (min)
            <Input
              type="number"
              min={5}
              max={120}
              value={workMinutes}
              onChange={(event) => updateWorkMinutes(event.target.value)}
              aria-label="Set work minutes"
            />
          </label>
          <label className="space-y-1 text-sm">
            Break (min)
            <Input
              type="number"
              min={1}
              max={60}
              value={breakMinutes}
              onChange={(event) => updateBreakMinutes(event.target.value)}
              aria-label="Set break minutes"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span className="inline-flex items-center gap-2">
            <Waves className="size-4 text-primary" /> Ambient sound
          </span>
          <select
            value={ambientSound}
            onChange={(event) => updateAmbientSound(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Choose ambient sound"
          >
            {SOUND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center justify-between rounded-md border border-border/70 bg-secondary/35 px-3 py-2">
          <p className="text-sm">Auto-start next session</p>
          <button
            type="button"
            onClick={toggleAutoStart}
            aria-pressed={autoStartNextSession}
            className={`relative h-7 w-12 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              autoStartNextSession ? "border-primary/60 bg-primary/20" : "border-border bg-background"
            }`}
          >
            <span
              className={`absolute top-[3px] h-5 w-5 rounded-full bg-card shadow transition-transform ${
                autoStartNextSession ? "translate-x-6" : "translate-x-1"
              }`}
            />
            <span className="sr-only">Toggle auto start next session</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setIsRunning((state) => !state)} aria-label={isRunning ? "Pause timer" : "Start timer"}>
            {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button type="button" variant="outline" onClick={resetTimer} aria-label="Reset timer">
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

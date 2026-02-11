"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const playCompletionDing = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  if (!window.AudioContext) {
    return;
  }

  try {
    const context = new window.AudioContext();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.12);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.035, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    oscillator.onended = () => {
      void context.close();
    };
  } catch (error: unknown) {
    console.error("Task completion ding failed", { error });
  }
};

type TaskPanelProps = {
  tasks: Task[];
  disabled?: boolean;
  pendingTaskId?: string | null;
  celebrationEvent?: {
    taskId: string;
    token: number;
  } | null;
  onCreateTask: (title: string) => Promise<void>;
  onToggleTask: (task: Task, completed: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
};

export const TaskPanel = ({
  tasks,
  disabled = false,
  pendingTaskId = null,
  celebrationEvent = null,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
}: TaskPanelProps): React.ReactElement => {
  const t = useTranslations("TaskPanel");
  const [title, setTitle] = useState("");
  const [showAddedFlash, setShowAddedFlash] = useState(false);
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.parent_task_id), [tasks]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showAddedFlash) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowAddedFlash(false);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showAddedFlash]);

  useEffect(() => {
    if (!celebrationEvent) {
      return;
    }

    setCelebratingTaskId(celebrationEvent.taskId);
    playCompletionDing();

    const timeoutId = window.setTimeout(() => {
      setCelebratingTaskId((currentTaskId) => (currentTaskId === celebrationEvent.taskId ? null : currentTaskId));
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [celebrationEvent]);

  const submitTask = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }

    try {
      await onCreateTask(normalizedTitle);
      setTitle("");
      setShowAddedFlash(true);
      inputRef.current?.focus();
    } catch {
      return;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-1" onSubmit={(event) => void submitTask(event)}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              ref={inputRef}
              placeholder={t("placeholder")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={disabled}
              maxLength={120}
              autoComplete="off"
            />
            <Button type="submit" disabled={disabled || !title.trim()}>
              {t("add")}
            </Button>
          </div>
          <p
            className={cn(
              "h-4 text-xs font-medium text-primary transition-opacity duration-150",
              showAddedFlash ? "opacity-100" : "opacity-0",
            )}
            role="status"
            aria-live="polite"
          >
            {t("added")}
          </p>
        </form>

        <div className="space-y-2">
          {activeTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-muted/20 p-5 text-center">
              <p className="text-2xl leading-none" aria-hidden>
                🌱
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{t("empty")}</p>
            </div>
          ) : null}

          {activeTasks.map((task) => {
            const isBusy = pendingTaskId === task.id;
            const isCompleted = task.status === "completed";
            const isCelebrating = celebratingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between rounded-md border border-border/70 bg-card px-3 py-2",
                  isCompleted && "opacity-70",
                  isCelebrating && "task-item-celebrating",
                )}
              >
                <label className="flex flex-1 items-start gap-3">
                  <div className="relative mt-0.5">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={(value) => void onToggleTask(task, Boolean(value))}
                      disabled={disabled || isBusy}
                      className={cn(isCelebrating && "task-checkbox-celebrating")}
                    />
                    {isCelebrating ? (
                      <>
                        <span aria-hidden className="task-sparkle task-sparkle-one" />
                        <span aria-hidden className="task-sparkle task-sparkle-two" />
                        <span aria-hidden className="task-sparkle task-sparkle-three" />
                        <span aria-hidden className="task-sparkle task-sparkle-four" />
                      </>
                    ) : null}
                  </div>
                  <span className={cn("text-sm", isCompleted && "line-through text-muted-foreground")}>{task.title}</span>
                </label>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void onDeleteTask(task.id)}
                  disabled={disabled || isBusy}
                  aria-label={t("deleteTask")}
                >
                  {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

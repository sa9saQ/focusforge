"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { AiBreakdownPanel } from "@/components/dashboard/ai-breakdown-panel";
import { PomodoroPanel } from "@/components/dashboard/pomodoro-panel";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { TaskPanel } from "@/components/dashboard/task-panel";
import { XpCard } from "@/components/dashboard/xp-card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { POMODORO_COMPLETE_XP, TASK_COMPLETE_XP } from "@/lib/gamification";
import { awardXp, getOrCreateProfile } from "@/lib/profile";
import type { DailyCompletionCounts, LocalSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS, storage } from "@/lib/storage";
import { adjustDailyCompletionCount, getDailyCompletionCounts, getDateKeyFromTimestamp } from "@/lib/streaks";
import { createTask, listTasks, removeTask, updateTaskStatus } from "@/lib/tasks";
import type { Profile, SubtaskSuggestion, Task } from "@/lib/types";

export const DashboardShell = (): React.ReactElement => {
  const t = useTranslations("DashboardShell");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [streakCounts, setStreakCounts] = useState<DailyCompletionCounts>({});
  const [celebrationEvent, setCelebrationEvent] = useState<{ taskId: string; token: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);

  const clearStatus = useCallback(() => {
    setStatusMessage("");
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    const [nextProfile, nextTasks, nextStreakCounts, settingsResult] = await Promise.all([
      getOrCreateProfile(),
      listTasks(),
      getDailyCompletionCounts(),
      storage.settings.get(),
    ]);
    setProfile(nextProfile);
    setTasks(nextTasks);
    setStreakCounts(nextStreakCounts);
    if (settingsResult.data) setSettings(settingsResult.data);
  }, []);

  const handleUpdateSettings = useCallback(
    async (patch: Partial<LocalSettings>): Promise<void> => {
      const next = { ...settings, ...patch };
      await storage.settings.set(next);
      setSettings(next);
    },
    [settings],
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async (): Promise<void> => {
      try {
        await refreshData();
      } catch (error: unknown) {
        console.error("Dashboard initialization failed", { error });
        if (isMounted) {
          setStatusMessage(t("errors.load"));
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [refreshData, t]);

  const handleCreateTask = useCallback(
    async (title: string): Promise<void> => {
      clearStatus();
      setIsMutating(true);

      try {
        const createdTask = await createTask({ title });
        setTasks((previousTasks) => [createdTask, ...previousTasks]);
      } catch (error: unknown) {
        console.error("Create task failed", { error });
        const message = t("errors.createTask");
        setStatusMessage(message);
        throw new Error(message);
      } finally {
        setIsMutating(false);
      }
    },
    [clearStatus, t],
  );

  const handleToggleTask = useCallback(
    async (task: Task, completed: boolean): Promise<void> => {
      clearStatus();
      setPendingTaskId(task.id);

      try {
        const nextStatus = completed ? "completed" : "pending";
        const updatedTask = await updateTaskStatus({ taskId: task.id, status: nextStatus });

        setTasks((previousTasks) =>
          previousTasks.map((existingTask) => (existingTask.id === updatedTask.id ? updatedTask : existingTask)),
        );

        if (completed && task.status !== "completed") {
          const updatedProfile = await awardXp(task.xp_reward || TASK_COMPLETE_XP);
          setProfile(updatedProfile);

          if (updatedTask.completed_at) {
            const completionDateKey = getDateKeyFromTimestamp(updatedTask.completed_at);
            const nextStreakCounts = await adjustDailyCompletionCount(completionDateKey, 1);
            setStreakCounts(nextStreakCounts);
          }

          setCelebrationEvent({ taskId: task.id, token: Date.now() });
        }

        if (!completed && task.status === "completed") {
          const xpToDeduct = task.xp_reward || TASK_COMPLETE_XP;
          const deductedProfile = await awardXp(-xpToDeduct);
          setProfile(deductedProfile);

          if (task.completed_at) {
            const completionDateKey = getDateKeyFromTimestamp(task.completed_at);
            const nextStreakCounts = await adjustDailyCompletionCount(completionDateKey, -1);
            setStreakCounts(nextStreakCounts);
          }
        }
      } catch (error: unknown) {
        console.error("Toggle task failed", { error, taskId: task.id, completed });
        setStatusMessage(t("errors.updateTask"));
      } finally {
        setPendingTaskId(null);
      }
    },
    [clearStatus, t],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      clearStatus();
      setPendingTaskId(taskId);

      try {
        await removeTask(taskId);
        setTasks((previousTasks) => previousTasks.filter((task) => task.id !== taskId));
      } catch (error: unknown) {
        console.error("Delete task failed", { error, taskId });
        setStatusMessage(t("errors.deleteTask"));
      } finally {
        setPendingTaskId(null);
      }
    },
    [clearStatus, t],
  );

  const handleCreateSuggestedTasks = useCallback(
    async (suggestions: SubtaskSuggestion[]): Promise<void> => {
      clearStatus();
      setIsMutating(true);

      try {
        const created = await Promise.all(
          suggestions.map((suggestion) =>
            createTask({
              title: suggestion.title,
              aiGenerated: true,
            }),
          ),
        );

        setTasks((previousTasks) => [...created, ...previousTasks]);
      } catch (error: unknown) {
        console.error("Create suggested tasks failed", { error });
        setStatusMessage(t("errors.saveSuggestions"));
      } finally {
        setIsMutating(false);
      }
    },
    [clearStatus, t],
  );

  const handlePomodoroCompleted = useCallback(async (): Promise<void> => {
    try {
      const updatedProfile = await awardXp(POMODORO_COMPLETE_XP);
      setProfile(updatedProfile);
    } catch (error: unknown) {
      console.error("Award pomodoro XP failed", { error });
      setStatusMessage(t("errors.addPomodoroXp"));
    }
  }, [t]);

  const totalTasks = useMemo(() => tasks.length, [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.status === "completed").length, [tasks]);

  if (isInitialLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("loading")}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="font-[var(--font-heading)] text-2xl font-bold tracking-tight">
            FocusForge
          </Link>
          <p className="text-sm text-muted-foreground">
            {t("completedTasks", { completed: completedTasks, total: totalTasks })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <Separator className="my-4" />

      {statusMessage ? (
        <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{statusMessage}</p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 md:col-span-2 lg:col-span-2">
          <TaskPanel
            tasks={tasks}
            disabled={isMutating}
            pendingTaskId={pendingTaskId}
            celebrationEvent={celebrationEvent}
            onCreateTask={handleCreateTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
          <AiBreakdownPanel onCreateSuggestedTasks={handleCreateSuggestedTasks} />
        </div>

        <div className="space-y-4">
          <XpCard xp={profile?.xp ?? 0} dailyXp={profile?.daily_xp ?? 0} dailyXpGoal={settings.dailyXpGoal} />
          <StreakCalendar counts={streakCounts} />
          <PomodoroPanel onWorkSessionCompleted={handlePomodoroCompleted} settings={settings} onUpdateSettings={handleUpdateSettings} />
        </div>
      </section>
    </main>
  );
};

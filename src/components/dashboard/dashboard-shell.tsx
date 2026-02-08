"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AiBreakdownPanel } from "@/components/dashboard/ai-breakdown-panel";
import { PomodoroPanel } from "@/components/dashboard/pomodoro-panel";
import { TaskPanel } from "@/components/dashboard/task-panel";
import { XpCard } from "@/components/dashboard/xp-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { POMODORO_COMPLETE_XP, TASK_COMPLETE_XP } from "@/lib/gamification";
import { awardXp, getOrCreateProfile } from "@/lib/profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createTask, listTasks, removeTask, updateTaskStatus } from "@/lib/tasks";
import type { Profile, SubtaskSuggestion, Task } from "@/lib/types";

export const DashboardShell = (): React.ReactElement => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const clearStatus = useCallback(() => {
    setStatusMessage("");
  }, []);

  const refreshData = useCallback(
    async (currentUserId: string): Promise<void> => {
      const supabase = getSupabaseBrowserClient();
      const [nextProfile, nextTasks] = await Promise.all([
        getOrCreateProfile(supabase, currentUserId),
        listTasks(supabase, currentUserId),
      ]);

      setProfile(nextProfile);
      setTasks(nextTasks);
    },
    [],
  );

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;

    const initialize = async (): Promise<void> => {
      try {
        const supabase = getSupabaseBrowserClient();
        const sessionResult = await supabase.auth.getSession();
        const currentUser = sessionResult.data.session?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        setUserId(currentUser.id);
        await refreshData(currentUser.id);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!session?.user) {
            router.replace("/login");
          }
        });
        unsubscribeAuth = () => subscription.unsubscribe();
      } catch (error: unknown) {
        console.error("Dashboard initialization failed", { error });
        setStatusMessage(error instanceof Error ? error.message : "Unable to load dashboard.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    void initialize();

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, [refreshData, router]);

  const handleCreateTask = useCallback(
    async (title: string): Promise<void> => {
      if (!userId) {
        return;
      }

      clearStatus();
      setIsMutating(true);

      try {
        const supabase = getSupabaseBrowserClient();
        const createdTask = await createTask(supabase, { userId, title });
        setTasks((previousTasks) => [createdTask, ...previousTasks]);
      } catch (error: unknown) {
        console.error("Create task failed", { error });
        setStatusMessage(error instanceof Error ? error.message : "Unable to create task.");
      } finally {
        setIsMutating(false);
      }
    },
    [clearStatus, userId],
  );

  const handleToggleTask = useCallback(
    async (task: Task, completed: boolean): Promise<void> => {
      if (!userId) {
        return;
      }

      clearStatus();
      setPendingTaskId(task.id);

      try {
        const supabase = getSupabaseBrowserClient();
        const nextStatus = completed ? "completed" : "pending";
        const updatedTask = await updateTaskStatus(supabase, { taskId: task.id, status: nextStatus });

        setTasks((previousTasks) => previousTasks.map((existingTask) => (existingTask.id === updatedTask.id ? updatedTask : existingTask)));

        if (completed && task.status !== "completed") {
          const updatedProfile = await awardXp(supabase, userId, task.xp_reward || TASK_COMPLETE_XP);
          setProfile(updatedProfile);
        }
      } catch (error: unknown) {
        console.error("Toggle task failed", { error, taskId: task.id, completed });
        setStatusMessage(error instanceof Error ? error.message : "Unable to update task.");
      } finally {
        setPendingTaskId(null);
      }
    },
    [clearStatus, userId],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      clearStatus();
      setPendingTaskId(taskId);

      try {
        const supabase = getSupabaseBrowserClient();
        await removeTask(supabase, taskId);
        setTasks((previousTasks) => previousTasks.filter((task) => task.id !== taskId));
      } catch (error: unknown) {
        console.error("Delete task failed", { error, taskId });
        setStatusMessage(error instanceof Error ? error.message : "Unable to delete task.");
      } finally {
        setPendingTaskId(null);
      }
    },
    [clearStatus],
  );

  const handleCreateSuggestedTasks = useCallback(
    async (suggestions: SubtaskSuggestion[]): Promise<void> => {
      if (!userId) {
        return;
      }

      clearStatus();
      setIsMutating(true);

      try {
        const supabase = getSupabaseBrowserClient();
        const created = await Promise.all(
          suggestions.map((suggestion) =>
            createTask(supabase, {
              userId,
              title: suggestion.title,
              aiGenerated: true,
            }),
          ),
        );

        setTasks((previousTasks) => [...created, ...previousTasks]);
      } catch (error: unknown) {
        console.error("Create suggested tasks failed", { error });
        setStatusMessage(error instanceof Error ? error.message : "Unable to save suggested tasks.");
      } finally {
        setIsMutating(false);
      }
    },
    [clearStatus, userId],
  );

  const handlePomodoroCompleted = useCallback(async (): Promise<void> => {
    if (!userId) {
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const updatedProfile = await awardXp(supabase, userId, POMODORO_COMPLETE_XP);
      setProfile(updatedProfile);
    } catch (error: unknown) {
      console.error("Award pomodoro XP failed", { error });
      setStatusMessage(error instanceof Error ? error.message : "Unable to add XP for pomodoro.");
    }
  }, [userId]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error: unknown) {
      console.error("Sign out failed", { error });
      setStatusMessage(error instanceof Error ? error.message : "Unable to sign out.");
    }
  }, [router]);

  const totalTasks = useMemo(() => tasks.length, [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.status === "completed").length, [tasks]);

  if (isInitialLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="font-[var(--font-heading)] text-2xl font-bold tracking-tight">
            FocusForge
          </Link>
          <p className="text-sm text-muted-foreground">
            {completedTasks}/{totalTasks} tasks completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button type="button" variant="outline" onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <Separator className="my-4" />

      {statusMessage ? <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{statusMessage}</p> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TaskPanel
            tasks={tasks}
            disabled={isMutating}
            pendingTaskId={pendingTaskId}
            onCreateTask={handleCreateTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
          <AiBreakdownPanel onCreateSuggestedTasks={handleCreateSuggestedTasks} />
        </div>

        <div className="space-y-4">
          <XpCard xp={profile?.xp ?? 0} />
          <PomodoroPanel onWorkSessionCompleted={handlePomodoroCompleted} />
        </div>
      </section>
    </main>
  );
};

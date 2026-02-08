"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TaskPanelProps = {
  tasks: Task[];
  disabled?: boolean;
  pendingTaskId?: string | null;
  onCreateTask: (title: string) => Promise<void>;
  onToggleTask: (task: Task, completed: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
};

export const TaskPanel = ({ tasks, disabled = false, pendingTaskId = null, onCreateTask, onToggleTask, onDeleteTask }: TaskPanelProps): React.ReactElement => {
  const [title, setTitle] = useState("");

  const activeTasks = useMemo(() => tasks.filter((task) => !task.parent_task_id), [tasks]);

  const submitTask = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }

    await onCreateTask(normalizedTitle);
    setTitle("");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Create, complete, and clear your list.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => void submitTask(event)}>
          <Input
            placeholder="Add a task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={disabled}
            maxLength={120}
          />
          <Button type="submit" disabled={disabled || !title.trim()}>
            Add
          </Button>
        </form>

        <div className="space-y-2">
          {activeTasks.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No tasks yet. Add your first one above.</p>
          ) : null}

          {activeTasks.map((task) => {
            const isBusy = pendingTaskId === task.id;
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between rounded-md border border-border/70 bg-card px-3 py-2",
                  isCompleted && "opacity-70",
                )}
              >
                <label className="flex flex-1 items-start gap-3">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(value) => void onToggleTask(task, Boolean(value))}
                    disabled={disabled || isBusy}
                    className="mt-0.5"
                  />
                  <span className={cn("text-sm", isCompleted && "line-through text-muted-foreground")}>{task.title}</span>
                </label>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void onDeleteTask(task.id)}
                  disabled={disabled || isBusy}
                  aria-label="Delete task"
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

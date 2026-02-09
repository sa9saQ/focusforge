"use client";

import { LOCAL_USER_ID, storage } from "@/lib/storage";
import type { Task, TaskPriority } from "@/lib/types";

const byCreatedAtDesc = (left: Task, right: Task): number => {
  return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
};

export const listTasks = async (): Promise<Task[]> => {
  const result = await storage.tasks.select();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return [...result.data].sort(byCreatedAtDesc);
};

export const createTask = async (input: {
  title: string;
  parentTaskId?: string;
  aiGenerated?: boolean;
  priority?: TaskPriority;
}): Promise<Task> => {
  void input.aiGenerated;
  const result = await storage.tasks.insert({
    user_id: LOCAL_USER_ID,
    title: input.title,
    description: null,
    parent_task_id: input.parentTaskId ?? null,
    status: "pending",
    priority: input.priority ?? "medium",
    xp_reward: 10,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
};

export const updateTaskStatus = async (input: { taskId: string; status: Task["status"] }): Promise<Task> => {
  const result = await storage.tasks.update(input.taskId, {
    status: input.status,
    completed_at: input.status === "completed" ? new Date().toISOString() : null,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
};

export const removeTask = async (taskId: string): Promise<void> => {
  const result = await storage.tasks.remove(taskId);

  if (result.error) {
    throw new Error(result.error.message);
  }
};

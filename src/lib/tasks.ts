"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { Task } from "@/lib/types";

type TaskRow = Pick<
  Database["public"]["Tables"]["tasks"]["Row"],
  "id" | "user_id" | "title" | "description" | "parent_task_id" | "status" | "xp_reward" | "completed_at" | "created_at"
>;

const mapTask = (row: TaskRow): Task => {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    parent_task_id: row.parent_task_id,
    status: row.status,
    xp_reward: row.xp_reward,
    completed_at: row.completed_at,
    created_at: row.created_at,
  };
};

export const listTasks = async (client: SupabaseClient<Database>, userId: string): Promise<Task[]> => {
  const result = await (client as any)
    .from("tasks")
    .select("id,user_id,title,description,parent_task_id,status,xp_reward,completed_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data.map((row) => mapTask(row));
};

export const createTask = async (
  client: SupabaseClient<Database>,
  input: { userId: string; title: string; parentTaskId?: string; aiGenerated?: boolean },
): Promise<Task> => {
  const result = await (client as any)
    .from("tasks")
    .insert({
      user_id: input.userId,
      title: input.title,
      parent_task_id: input.parentTaskId ?? null,
      ai_generated: input.aiGenerated ?? false,
      xp_reward: 10,
    })
    .select("id,user_id,title,description,parent_task_id,status,xp_reward,completed_at,created_at")
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return mapTask(result.data);
};

export const updateTaskStatus = async (
  client: SupabaseClient<Database>,
  input: { taskId: string; status: Task["status"] },
): Promise<Task> => {
  const result = await (client as any)
    .from("tasks")
    .update({
      status: input.status,
      completed_at: input.status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", input.taskId)
    .select("id,user_id,title,description,parent_task_id,status,xp_reward,completed_at,created_at")
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return mapTask(result.data);
};

export const removeTask = async (client: SupabaseClient<Database>, taskId: string): Promise<void> => {
  const result = await (client as any).from("tasks").delete().eq("id", taskId);

  if (result.error) {
    throw new Error(result.error.message);
  }
};

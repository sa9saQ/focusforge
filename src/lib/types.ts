export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";
export type TaskPriority = "high" | "medium" | "low";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  parent_task_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  xp_reward: number;
  completed_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  level: number;
  xp: number;
  daily_xp: number;
  streak_days: number;
  last_active_date: string | null;
};

export type SubtaskSuggestion = {
  title: string;
  estimated_minutes: number;
  tips: string;
};

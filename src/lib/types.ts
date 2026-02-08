export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  parent_task_id: string | null;
  status: TaskStatus;
  xp_reward: number;
  completed_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  level: number;
  xp: number;
};

export type SubtaskSuggestion = {
  title: string;
  estimated_minutes: number;
  tips: string;
};

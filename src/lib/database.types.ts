export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          level: number;
          xp: number;
          streak_days: number;
          last_active_date: string | null;
          settings: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          level?: number;
          xp?: number;
          streak_days?: number;
          last_active_date?: string | null;
          settings?: Json;
          created_at?: string;
        };
        Update: {
          display_name?: string | null;
          level?: number;
          xp?: number;
          streak_days?: number;
          last_active_date?: string | null;
          settings?: Json;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          parent_task_id: string | null;
          status: "pending" | "in_progress" | "completed" | "skipped";
          priority: "low" | "medium" | "high" | "urgent";
          estimated_minutes: number | null;
          actual_minutes: number | null;
          xp_reward: number;
          due_date: string | null;
          completed_at: string | null;
          ai_generated: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          parent_task_id?: string | null;
          status?: "pending" | "in_progress" | "completed" | "skipped";
          priority?: "low" | "medium" | "high" | "urgent";
          estimated_minutes?: number | null;
          actual_minutes?: number | null;
          xp_reward?: number;
          due_date?: string | null;
          completed_at?: string | null;
          ai_generated?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          parent_task_id?: string | null;
          status?: "pending" | "in_progress" | "completed" | "skipped";
          priority?: "low" | "medium" | "high" | "urgent";
          estimated_minutes?: number | null;
          actual_minutes?: number | null;
          xp_reward?: number;
          due_date?: string | null;
          completed_at?: string | null;
          ai_generated?: boolean;
          sort_order?: number;
        };
      };
    };
  };
};

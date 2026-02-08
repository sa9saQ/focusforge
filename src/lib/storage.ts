"use client";

import type { Profile, Task } from "@/lib/types";

export const STORAGE_KEYS = {
  tasks: "focusforge_tasks",
  profile: "focusforge_profile",
  settings: "focusforge_settings",
} as const;

export const LOCAL_USER_ID = "local-user";
export const LOCAL_PROFILE_ID = "local-profile";

export type LocalSettings = {
  theme: "light" | "dark" | "system";
};

export type StorageResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: Error;
    };

const isBrowser = (): boolean => typeof window !== "undefined";

const createError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Unexpected localStorage error.");
};

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const readValue = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) {
    return fallback;
  }

  return safeParse<T>(window.localStorage.getItem(key), fallback);
};

const writeValue = <T>(key: string, value: T): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const withResult = async <T>(operation: () => T): Promise<StorageResult<T>> => {
  try {
    return {
      data: operation(),
      error: null,
    };
  } catch (error: unknown) {
    return {
      data: null,
      error: createError(error),
    };
  }
};

const createUuid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `focusforge-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createDefaultProfile = (): Profile => {
  return {
    id: LOCAL_PROFILE_ID,
    display_name: null,
    level: 1,
    xp: 0,
    streak_days: 0,
    last_active_date: null,
  };
};

export const storage = {
  tasks: {
    select: async (): Promise<StorageResult<Task[]>> =>
      withResult(() => {
        return readValue<Task[]>(STORAGE_KEYS.tasks, []);
      }),
    insert: async (
      input: Omit<Task, "id" | "created_at" | "completed_at"> & { completed_at?: string | null },
    ): Promise<StorageResult<Task>> =>
      withResult(() => {
        const tasks = readValue<Task[]>(STORAGE_KEYS.tasks, []);
        const now = new Date().toISOString();
        const createdTask: Task = {
          ...input,
          id: createUuid(),
          created_at: now,
          completed_at: input.completed_at ?? null,
        };
        writeValue<Task[]>(STORAGE_KEYS.tasks, [createdTask, ...tasks]);
        return createdTask;
      }),
    update: async (taskId: string, patch: Partial<Task>): Promise<StorageResult<Task>> =>
      withResult(() => {
        const tasks = readValue<Task[]>(STORAGE_KEYS.tasks, []);
        const index = tasks.findIndex((task) => task.id === taskId);

        if (index === -1) {
          throw new Error("Task not found.");
        }

        const updatedTask: Task = {
          ...tasks[index],
          ...patch,
        };
        const nextTasks = [...tasks];
        nextTasks[index] = updatedTask;
        writeValue<Task[]>(STORAGE_KEYS.tasks, nextTasks);
        return updatedTask;
      }),
    remove: async (taskId: string): Promise<StorageResult<null>> =>
      withResult(() => {
        const tasks = readValue<Task[]>(STORAGE_KEYS.tasks, []);
        writeValue<Task[]>(
          STORAGE_KEYS.tasks,
          tasks.filter((task) => task.id !== taskId),
        );
        return null;
      }),
  },
  profile: {
    get: async (): Promise<StorageResult<Profile | null>> =>
      withResult(() => {
        return readValue<Profile | null>(STORAGE_KEYS.profile, null);
      }),
    upsert: async (patch: Partial<Profile>): Promise<StorageResult<Profile>> =>
      withResult(() => {
        const current = readValue<Profile | null>(STORAGE_KEYS.profile, null);
        const base = current ?? createDefaultProfile();
        const nextProfile: Profile = {
          ...base,
          ...patch,
        };
        writeValue<Profile>(STORAGE_KEYS.profile, nextProfile);
        return nextProfile;
      }),
  },
  settings: {
    get: async (): Promise<StorageResult<LocalSettings>> =>
      withResult(() => {
        return readValue<LocalSettings>(STORAGE_KEYS.settings, { theme: "system" });
      }),
    set: async (settings: LocalSettings): Promise<StorageResult<LocalSettings>> =>
      withResult(() => {
        writeValue<LocalSettings>(STORAGE_KEYS.settings, settings);
        return settings;
      }),
  },
};

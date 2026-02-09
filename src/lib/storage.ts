"use client";

import type { Profile, Task, TaskPriority, TaskStatus } from "@/lib/types";

export const STORAGE_KEYS = {
  tasks: "focusforge_tasks",
  profile: "focusforge_profile",
  settings: "focusforge_settings",
  streaks: "focusforge_streaks",
} as const;

export const LOCAL_USER_ID = "local-user";
export const LOCAL_PROFILE_ID = "local-profile";

export const ACCENT_COLORS = ["purple", "blue", "green", "orange"] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

export const AMBIENT_SOUND_OPTIONS = ["none", "rain", "lofi", "forest"] as const;
export type AmbientSoundOption = (typeof AMBIENT_SOUND_OPTIONS)[number];

export type LocalSettings = {
  theme: "light" | "dark" | "system";
  accentColor: AccentColor;
  dailyXpGoal: number;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroAutoStartNextSession: boolean;
  ambientSound: AmbientSoundOption;
};

export const DEFAULT_SETTINGS: LocalSettings = {
  theme: "system",
  accentColor: "purple",
  dailyXpGoal: 100,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroAutoStartNextSession: false,
  ambientSound: "none",
};

export type DailyCompletionCounts = Record<string, number>;

export type StorageResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: Error;
    };

const TASK_STATUSES: TaskStatus[] = ["pending", "in_progress", "completed", "skipped"];
const TASK_PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isBrowser = (): boolean => typeof window !== "undefined";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const createError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Unexpected localStorage error.");
};

const safeParse = (value: string | null): unknown => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.floor(value)));
};

const normalizeString = (value: unknown, fallback = ""): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  return value;
};

const toTaskStatus = (value: unknown): TaskStatus => {
  return TASK_STATUSES.includes(value as TaskStatus) ? (value as TaskStatus) : "pending";
};

const toTaskPriority = (value: unknown): TaskPriority => {
  return TASK_PRIORITIES.includes(value as TaskPriority) ? (value as TaskPriority) : "medium";
};

const toTheme = (value: unknown): LocalSettings["theme"] => {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return DEFAULT_SETTINGS.theme;
};

const toAccentColor = (value: unknown): AccentColor => {
  return ACCENT_COLORS.includes(value as AccentColor) ? (value as AccentColor) : DEFAULT_SETTINGS.accentColor;
};

const toAmbientSound = (value: unknown): AmbientSoundOption => {
  return AMBIENT_SOUND_OPTIONS.includes(value as AmbientSoundOption)
    ? (value as AmbientSoundOption)
    : DEFAULT_SETTINGS.ambientSound;
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
    daily_xp: 0,
    streak_days: 0,
    last_active_date: null,
  };
};

const normalizeTask = (input: unknown): Task | null => {
  if (!isObject(input)) {
    return null;
  }

  const title = normalizeString(input.title).trim();
  if (!title) {
    return null;
  }

  const createdAt = normalizeString(input.created_at, new Date().toISOString());
  const completedAtValue = input.completed_at;
  const completedAt = typeof completedAtValue === "string" ? completedAtValue : null;

  return {
    id: normalizeString(input.id, createUuid()),
    user_id: normalizeString(input.user_id, LOCAL_USER_ID),
    title: title.slice(0, 160),
    description: typeof input.description === "string" ? input.description : null,
    parent_task_id: typeof input.parent_task_id === "string" ? input.parent_task_id : null,
    status: toTaskStatus(input.status),
    priority: toTaskPriority(input.priority),
    xp_reward: clampInt(input.xp_reward, 1, 1000, 10),
    completed_at: completedAt,
    created_at: createdAt,
  };
};

const normalizeTaskList = (input: unknown): Task[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.reduce<Task[]>((accumulator, value) => {
    const normalized = normalizeTask(value);
    if (normalized) {
      accumulator.push(normalized);
    }
    return accumulator;
  }, []);
};

const normalizeProfile = (input: unknown): Profile | null => {
  if (!isObject(input)) {
    return null;
  }

  const base = createDefaultProfile();
  return {
    ...base,
    id: normalizeString(input.id, base.id),
    display_name: typeof input.display_name === "string" ? input.display_name : null,
    level: clampInt(input.level, 1, 999, base.level),
    xp: clampInt(input.xp, 0, 9_999_999, base.xp),
    daily_xp: clampInt(input.daily_xp, 0, 9_999, base.daily_xp),
    streak_days: clampInt(input.streak_days, 0, 99_999, base.streak_days),
    last_active_date: typeof input.last_active_date === "string" ? input.last_active_date : null,
  };
};

const normalizeSettings = (input: unknown): LocalSettings => {
  if (!isObject(input)) {
    return DEFAULT_SETTINGS;
  }

  return {
    theme: toTheme(input.theme),
    accentColor: toAccentColor(input.accentColor),
    dailyXpGoal: clampInt(input.dailyXpGoal, 50, 500, DEFAULT_SETTINGS.dailyXpGoal),
    pomodoroWorkMinutes: clampInt(input.pomodoroWorkMinutes, 5, 120, DEFAULT_SETTINGS.pomodoroWorkMinutes),
    pomodoroBreakMinutes: clampInt(input.pomodoroBreakMinutes, 1, 60, DEFAULT_SETTINGS.pomodoroBreakMinutes),
    pomodoroAutoStartNextSession:
      typeof input.pomodoroAutoStartNextSession === "boolean"
        ? input.pomodoroAutoStartNextSession
        : DEFAULT_SETTINGS.pomodoroAutoStartNextSession,
    ambientSound: toAmbientSound(input.ambientSound),
  };
};

const normalizeStreaks = (input: unknown): DailyCompletionCounts => {
  if (!isObject(input)) {
    return {};
  }

  return Object.entries(input).reduce<DailyCompletionCounts>((accumulator, [dateKey, count]) => {
    if (!DATE_KEY_PATTERN.test(dateKey)) {
      return accumulator;
    }

    const normalizedCount = clampInt(count, 0, 500, 0);
    if (normalizedCount > 0) {
      accumulator[dateKey] = normalizedCount;
    }

    return accumulator;
  }, {});
};

const writeRaw = <T>(key: string, value: T): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const readRaw = <T>(key: string, fallback: T, normalize: (value: unknown) => T): T => {
  if (!isBrowser()) {
    return fallback;
  }

  const parsed = safeParse(window.localStorage.getItem(key));
  const normalized = normalize(parsed);

  if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
    writeRaw<T>(key, normalized);
  }

  return normalized;
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

export const storage = {
  tasks: {
    select: async (): Promise<StorageResult<Task[]>> =>
      withResult(() => {
        return readRaw<Task[]>(STORAGE_KEYS.tasks, [], normalizeTaskList);
      }),
    insert: async (
      input: Omit<Task, "id" | "created_at" | "completed_at"> & { completed_at?: string | null },
    ): Promise<StorageResult<Task>> =>
      withResult(() => {
        const tasks = readRaw<Task[]>(STORAGE_KEYS.tasks, [], normalizeTaskList);
        const now = new Date().toISOString();
        const createdTask: Task = {
          ...input,
          id: createUuid(),
          created_at: now,
          completed_at: input.completed_at ?? null,
        };
        writeRaw<Task[]>(STORAGE_KEYS.tasks, [createdTask, ...tasks]);
        return createdTask;
      }),
    update: async (taskId: string, patch: Partial<Task>): Promise<StorageResult<Task>> =>
      withResult(() => {
        const tasks = readRaw<Task[]>(STORAGE_KEYS.tasks, [], normalizeTaskList);
        const index = tasks.findIndex((task) => task.id === taskId);

        if (index === -1) {
          throw new Error("Task not found.");
        }

        const updatedTask = normalizeTask({
          ...tasks[index],
          ...patch,
        });

        if (!updatedTask) {
          throw new Error("Invalid task update.");
        }

        const nextTasks = [...tasks];
        nextTasks[index] = updatedTask;
        writeRaw<Task[]>(STORAGE_KEYS.tasks, nextTasks);
        return updatedTask;
      }),
    remove: async (taskId: string): Promise<StorageResult<null>> =>
      withResult(() => {
        const tasks = readRaw<Task[]>(STORAGE_KEYS.tasks, [], normalizeTaskList);
        writeRaw<Task[]>(
          STORAGE_KEYS.tasks,
          tasks.filter((task) => task.id !== taskId),
        );
        return null;
      }),
    replaceAll: async (tasks: Task[]): Promise<StorageResult<Task[]>> =>
      withResult(() => {
        const normalized = normalizeTaskList(tasks);
        writeRaw<Task[]>(STORAGE_KEYS.tasks, normalized);
        return normalized;
      }),
  },
  profile: {
    get: async (): Promise<StorageResult<Profile | null>> =>
      withResult(() => {
        const result = readRaw<Profile | null>(STORAGE_KEYS.profile, null, normalizeProfile);
        return result;
      }),
    upsert: async (patch: Partial<Profile>): Promise<StorageResult<Profile>> =>
      withResult(() => {
        const current = readRaw<Profile | null>(STORAGE_KEYS.profile, null, normalizeProfile);
        const base = current ?? createDefaultProfile();
        const nextProfile = normalizeProfile({
          ...base,
          ...patch,
        });

        if (!nextProfile) {
          throw new Error("Invalid profile payload.");
        }

        writeRaw<Profile>(STORAGE_KEYS.profile, nextProfile);
        return nextProfile;
      }),
    replace: async (profile: Profile): Promise<StorageResult<Profile>> =>
      withResult(() => {
        const normalized = normalizeProfile(profile);
        if (!normalized) {
          throw new Error("Invalid profile payload.");
        }
        writeRaw<Profile>(STORAGE_KEYS.profile, normalized);
        return normalized;
      }),
  },
  settings: {
    get: async (): Promise<StorageResult<LocalSettings>> =>
      withResult(() => {
        return readRaw<LocalSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS, normalizeSettings);
      }),
    set: async (settings: LocalSettings): Promise<StorageResult<LocalSettings>> =>
      withResult(() => {
        const normalized = normalizeSettings(settings);
        writeRaw<LocalSettings>(STORAGE_KEYS.settings, normalized);
        return normalized;
      }),
  },
  streaks: {
    get: async (): Promise<StorageResult<DailyCompletionCounts>> =>
      withResult(() => {
        return readRaw<DailyCompletionCounts>(STORAGE_KEYS.streaks, {}, normalizeStreaks);
      }),
    set: async (counts: DailyCompletionCounts): Promise<StorageResult<DailyCompletionCounts>> =>
      withResult(() => {
        const normalized = normalizeStreaks(counts);
        writeRaw<DailyCompletionCounts>(STORAGE_KEYS.streaks, normalized);
        return normalized;
      }),
    replace: async (counts: DailyCompletionCounts): Promise<StorageResult<DailyCompletionCounts>> =>
      withResult(() => {
        const normalized = normalizeStreaks(counts);
        writeRaw<DailyCompletionCounts>(STORAGE_KEYS.streaks, normalized);
        return normalized;
      }),
  },
  resetAll: async (): Promise<StorageResult<null>> =>
    withResult(() => {
      if (!isBrowser()) {
        return null;
      }

      window.localStorage.removeItem(STORAGE_KEYS.tasks);
      window.localStorage.removeItem(STORAGE_KEYS.profile);
      window.localStorage.removeItem(STORAGE_KEYS.settings);
      window.localStorage.removeItem(STORAGE_KEYS.streaks);
      return null;
    }),
};

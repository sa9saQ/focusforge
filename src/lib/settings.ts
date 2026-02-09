"use client";

import type { Profile, Task } from "@/lib/types";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  createDefaultProfile,
  storage,
  type AccentColor,
  type DailyCompletionCounts,
  type LocalSettings,
} from "@/lib/storage";

export const applyAccentColor = (accentColor: AccentColor): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-accent", accentColor);
};

export const getLocalSettings = async (): Promise<LocalSettings> => {
  const result = await storage.settings.get();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
};

export const setLocalSettings = async (settings: LocalSettings): Promise<LocalSettings> => {
  const result = await storage.settings.set(settings);
  if (result.error) {
    throw new Error(result.error.message);
  }

  applyAccentColor(result.data.accentColor);
  return result.data;
};

export const updateLocalSettings = async (patch: Partial<LocalSettings>): Promise<LocalSettings> => {
  const current = await getLocalSettings();
  return setLocalSettings({
    ...current,
    ...patch,
  });
};

type ExportPayload = {
  exported_at: string;
  tasks: Task[];
  profile: Profile | null;
  settings: LocalSettings;
  streaks: DailyCompletionCounts;
};

export const exportLocalData = async (): Promise<string> => {
  const [tasksResult, profileResult, settingsResult, streaksResult] = await Promise.all([
    storage.tasks.select(),
    storage.profile.get(),
    storage.settings.get(),
    storage.streaks.get(),
  ]);

  if (tasksResult.error || profileResult.error || settingsResult.error || streaksResult.error) {
    throw new Error("Unable to export local data.");
  }

  const payload: ExportPayload = {
    exported_at: new Date().toISOString(),
    tasks: tasksResult.data,
    profile: profileResult.data,
    settings: settingsResult.data,
    streaks: streaksResult.data,
  };

  return JSON.stringify(payload, null, 2);
};

const triggerDownload = (filename: string, content: string): void => {
  if (typeof document === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const exportLocalDataToFile = async (): Promise<void> => {
  const content = await exportLocalData();
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(`focusforge-backup-${dateStamp}.json`, content);
};

type ImportPayload = Partial<{
  tasks: Task[];
  profile: Profile;
  settings: LocalSettings;
  streaks: DailyCompletionCounts;
}>;

export const importLocalData = async (rawJson: string): Promise<void> => {
  let parsed: ImportPayload;

  try {
    parsed = JSON.parse(rawJson) as ImportPayload;
  } catch {
    throw new Error("Invalid JSON file.");
  }

  const [taskReplace, profileReplace, settingsSet, streaksReplace] = await Promise.all([
    storage.tasks.replaceAll(Array.isArray(parsed.tasks) ? parsed.tasks : []),
    parsed.profile ? storage.profile.replace(parsed.profile) : storage.profile.replace(createDefaultProfile()),
    storage.settings.set(parsed.settings ?? DEFAULT_SETTINGS),
    storage.streaks.replace(parsed.streaks ?? {}),
  ]);

  if (taskReplace.error || profileReplace.error || settingsSet.error || streaksReplace.error) {
    throw new Error("Import failed. File format is invalid.");
  }

  applyAccentColor(settingsSet.data.accentColor);
};

export const resetAllLocalData = async (): Promise<void> => {
  const [resetResult, settingsResult, profileResult] = await Promise.all([
    storage.resetAll(),
    storage.settings.set(DEFAULT_SETTINGS),
    storage.profile.replace(createDefaultProfile()),
  ]);

  if (resetResult.error || settingsResult.error || profileResult.error) {
    throw new Error("Unable to reset data.");
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEYS.tasks);
    window.localStorage.removeItem(STORAGE_KEYS.streaks);
  }

  applyAccentColor(DEFAULT_SETTINGS.accentColor);
};

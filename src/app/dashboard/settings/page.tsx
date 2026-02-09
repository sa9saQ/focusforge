"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, Loader2, RotateCcw, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  applyAccentColor,
  exportLocalDataToFile,
  getLocalSettings,
  importLocalData,
  resetAllLocalData,
  updateLocalSettings,
} from "@/lib/settings";
import { getOrCreateProfile } from "@/lib/profile";
import {
  DEFAULT_SETTINGS,
  storage,
  type AccentColor,
  type AmbientSoundOption,
  type LocalSettings,
} from "@/lib/storage";

const accentOptions: Array<{ value: AccentColor; label: string; swatchClassName: string }> = [
  { value: "purple", label: "Purple", swatchClassName: "bg-violet-500" },
  { value: "blue", label: "Blue", swatchClassName: "bg-blue-500" },
  { value: "green", label: "Green", swatchClassName: "bg-emerald-500" },
  { value: "orange", label: "Orange", swatchClassName: "bg-orange-500" },
];

const ambientSoundOptions: Array<{ value: AmbientSoundOption; label: string }> = [
  { value: "rain", label: "Rain" },
  { value: "lofi", label: "Lo-fi" },
  { value: "forest", label: "Forest" },
  { value: "none", label: "None" },
];

const clampInt = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
};

export default function DashboardSettingsPage(): React.ReactElement {
  const { showToast } = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);
  const [isSavingName, setIsSavingName] = useState(false);
  const [dataAction, setDataAction] = useState<"export" | "import" | "reset" | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const [profile, localSettings] = await Promise.all([getOrCreateProfile(), getLocalSettings()]);
      const nextDisplayName = profile.display_name ?? "";
      setDisplayName(nextDisplayName);
      setSavedDisplayName(nextDisplayName);
      setSettings(localSettings);
    } catch (error: unknown) {
      showToast({
        title: "Unable to load settings",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSettingsPatch = useCallback(
    async (patch: Partial<LocalSettings>): Promise<void> => {
      setSettings((current) => ({
        ...current,
        ...patch,
      }));

      try {
        const next = await updateLocalSettings(patch);
        setSettings(next);
      } catch (error: unknown) {
        showToast({
          title: "Unable to save setting",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "error",
        });

        try {
          const fallback = await getLocalSettings();
          setSettings(fallback);
        } catch {
          setSettings(DEFAULT_SETTINGS);
        }
      }
    },
    [showToast],
  );

  const handleSaveDisplayName = useCallback(async (): Promise<void> => {
    const normalizedDisplayName = displayName.trim().slice(0, 80);
    setIsSavingName(true);

    try {
      const result = await storage.profile.upsert({
        display_name: normalizedDisplayName || null,
      });

      if (result.error) {
        throw result.error;
      }

      setSavedDisplayName(normalizedDisplayName);
      showToast({
        title: "Display name saved",
        variant: "success",
      });
    } catch (error: unknown) {
      showToast({
        title: "Unable to save display name",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSavingName(false);
    }
  }, [displayName, showToast]);

  const handleExportData = useCallback(async (): Promise<void> => {
    setDataAction("export");

    try {
      await exportLocalDataToFile();
      showToast({
        title: "Export completed",
        description: "Backup JSON downloaded.",
        variant: "success",
      });
    } catch (error: unknown) {
      showToast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setDataAction(null);
    }
  }, [showToast]);

  const handleImportData = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const inputElement = event.currentTarget;
      const file = inputElement.files?.[0];
      if (!file) {
        return;
      }

      setDataAction("import");

      try {
        const fileContent = await file.text();
        await importLocalData(fileContent);
        await loadData();
        showToast({
          title: "Import completed",
          description: "Local data was restored from backup.",
          variant: "success",
        });
      } catch (error: unknown) {
        showToast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Please use a valid backup file.",
          variant: "error",
        });
      } finally {
        inputElement.value = "";
        setDataAction(null);
      }
    },
    [loadData, showToast],
  );

  const handleResetData = useCallback(async (): Promise<void> => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Reset all FocusForge local data? This cannot be undone.");
      if (!confirmed) {
        return;
      }
    }

    setDataAction("reset");

    try {
      await resetAllLocalData();
      applyAccentColor(DEFAULT_SETTINGS.accentColor);
      await loadData();
      showToast({
        title: "All data reset",
        description: "Local tasks, profile, and settings were cleared.",
        variant: "success",
      });
    } catch (error: unknown) {
      showToast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setDataAction(null);
    }
  }, [loadData, showToast]);

  const isDisplayNameDirty = useMemo(() => displayName.trim() !== savedDisplayName.trim(), [displayName, savedDisplayName]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pb-8">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading settings...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="font-[var(--font-heading)] text-2xl font-bold tracking-tight">
            FocusForge
          </Link>
          <p className="text-sm text-muted-foreground">Settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile</CardTitle>
            <CardDescription>Update how your name appears in FocusForge.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="space-y-1 text-sm">
              Display name
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                maxLength={80}
                autoComplete="name"
                aria-label="Display name"
              />
            </label>
            <Button type="button" onClick={() => void handleSaveDisplayName()} disabled={!isDisplayNameDirty || isSavingName}>
              {isSavingName ? <Loader2 className="size-4 animate-spin" /> : null}
              Save name
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Appearance</CardTitle>
            <CardDescription>Choose an accent color for buttons and highlights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {accentOptions.map((option) => {
                const selected = settings.accentColor === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={selected ? "border-primary text-primary" : ""}
                    onClick={() => {
                      applyAccentColor(option.value);
                      void handleSettingsPatch({ accentColor: option.value });
                    }}
                    aria-pressed={selected}
                    aria-label={`Select ${option.label} accent color`}
                  >
                    <span className={`size-2.5 rounded-full ${option.swatchClassName}`} aria-hidden />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Focus Defaults</CardTitle>
            <CardDescription>Tune your daily XP target, Pomodoro timing, and ambient sound.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="block space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Daily XP goal</span>
                <span className="font-medium">{settings.dailyXpGoal} XP</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={settings.dailyXpGoal}
                onChange={(event) =>
                  void handleSettingsPatch({
                    dailyXpGoal: clampInt(Number(event.target.value), 50, 500),
                  })
                }
                className="h-2 w-full cursor-pointer accent-primary"
                aria-label="Set daily XP goal"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                Work minutes
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.pomodoroWorkMinutes}
                  onChange={(event) =>
                    void handleSettingsPatch({
                      pomodoroWorkMinutes: clampInt(Number(event.target.value), 5, 120),
                    })
                  }
                  aria-label="Set default pomodoro work minutes"
                />
              </label>
              <label className="space-y-1 text-sm">
                Break minutes
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.pomodoroBreakMinutes}
                  onChange={(event) =>
                    void handleSettingsPatch({
                      pomodoroBreakMinutes: clampInt(Number(event.target.value), 1, 60),
                    })
                  }
                  aria-label="Set default pomodoro break minutes"
                />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              Ambient sound
              <select
                value={settings.ambientSound}
                onChange={(event) =>
                  void handleSettingsPatch({
                    ambientSound: (ambientSoundOptions.find((option) => option.value === event.target.value)?.value ?? "none") as AmbientSoundOption,
                  })
                }
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Choose default ambient sound"
              >
                {ambientSoundOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Data Management</CardTitle>
            <CardDescription>Export backups, import backups, or reset all local data.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void handleExportData()} disabled={dataAction !== null}>
              {dataAction === "export" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Export JSON
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => importInputRef.current?.click()}
              disabled={dataAction !== null}
            >
              {dataAction === "import" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Import JSON
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => void handleImportData(event)}
              aria-label="Import backup JSON file"
            />

            <Button type="button" variant="destructive" onClick={() => void handleResetData()} disabled={dataAction !== null}>
              {dataAction === "reset" ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
              Reset all data
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">About</CardTitle>
            <CardDescription>FocusForge local-first ADHD task manager.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Version <span className="font-medium text-foreground">1.1.0</span>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

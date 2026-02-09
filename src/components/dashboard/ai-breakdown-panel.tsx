"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { SubtaskSuggestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AiBreakdownPanelProps = {
  onCreateSuggestedTasks: (suggestions: SubtaskSuggestion[]) => Promise<void>;
};

export const AiBreakdownPanel = ({ onCreateSuggestedTasks }: AiBreakdownPanelProps): React.ReactElement => {
  const [taskTitle, setTaskTitle] = useState("");
  const [suggestions, setSuggestions] = useState<SubtaskSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generate = async (): Promise<void> => {
    const normalizedTitle = taskTitle.trim();
    if (!normalizedTitle) {
      setErrorMessage("Enter a task title first.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/decompose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskTitle: normalizedTitle }),
      });

      const payload = (await response.json()) as { subtasks?: SubtaskSuggestion[]; message?: string };

      if (!response.ok || !payload.subtasks) {
        throw new Error(payload.message ?? "Failed to generate suggestions.");
      }

      setSuggestions(payload.subtasks);
    } catch (error: unknown) {
      console.error("Generate AI subtasks failed", { error });
      const message = error instanceof Error ? error.message : "Unable to generate subtasks.";
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAll = async (): Promise<void> => {
    if (suggestions.length === 0) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await onCreateSuggestedTasks(suggestions);
    } catch (error: unknown) {
      console.error("Persist generated subtasks failed", { error });
      const message = error instanceof Error ? error.message : "Unable to save generated subtasks.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Breakdown</CardTitle>
        <CardDescription>Break any task into 3-5 small, actionable steps.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder="e.g. Write my project proposal"
            maxLength={120}
          />
          <Button type="button" onClick={() => void generate()} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Generate
          </Button>
        </div>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => {
            return (
              <li key={`${suggestion.title}-${index}`} className="rounded-md border border-border/70 bg-secondary/30 p-3">
                <p className="text-sm font-medium">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.estimated_minutes} min · Tip: {suggestion.tips}
                </p>
              </li>
            );
          })}
        </ul>

        <Button type="button" variant="outline" onClick={() => void saveAll()} disabled={isSaving || suggestions.length === 0}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save all as tasks
        </Button>
      </CardContent>
    </Card>
  );
};

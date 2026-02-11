"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { SubtaskSuggestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AiBreakdownPanelProps = {
  onCreateSuggestedTasks: (suggestions: SubtaskSuggestion[]) => Promise<void>;
};

export const AiBreakdownPanel = ({ onCreateSuggestedTasks }: AiBreakdownPanelProps): React.ReactElement => {
  const t = useTranslations("AiBreakdown");
  const locale = useLocale();
  const [taskTitle, setTaskTitle] = useState("");
  const [suggestions, setSuggestions] = useState<SubtaskSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generate = async (): Promise<void> => {
    const normalizedTitle = taskTitle.trim();
    if (!normalizedTitle) {
      setErrorMessage(t("errors.enterTaskTitle"));
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
        body: JSON.stringify({ taskTitle: normalizedTitle, locale }),
      });

      const payload = (await response.json()) as { subtasks?: SubtaskSuggestion[] };

      if (!response.ok || !payload.subtasks) {
        if (response.status === 429) {
          throw new Error("RATE_LIMITED");
        }

        throw new Error("GENERATE_FAILED");
      }

      setSuggestions(payload.subtasks);
    } catch (error: unknown) {
      console.error("Generate AI subtasks failed", { error });
      if (error instanceof Error && error.message === "RATE_LIMITED") {
        setErrorMessage(t("errors.rateLimited"));
      } else {
        setErrorMessage(t("errors.generate"));
      }
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
      setErrorMessage(t("errors.save"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder={t("placeholder")}
            maxLength={120}
          />
          <Button type="button" onClick={() => void generate()} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {t("generate")}
          </Button>
        </div>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        {suggestions.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => {
              return (
                <li key={`${suggestion.title}-${index}`} className="rounded-md border border-border/70 bg-secondary/30 p-3">
                  <p className="text-sm font-medium">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("estimate", { minutes: suggestion.estimated_minutes, tip: suggestion.tips })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        <Button type="button" variant="outline" onClick={() => void saveAll()} disabled={isSaving || suggestions.length === 0}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("saveAll")}
        </Button>
      </CardContent>
    </Card>
  );
};

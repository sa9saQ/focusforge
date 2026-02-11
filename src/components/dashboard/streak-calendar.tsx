import { Flame } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyCompletionCounts } from "@/lib/storage";
import { getDateKeyFromDate } from "@/lib/streaks";
import { cn } from "@/lib/utils";

type StreakCalendarProps = {
  counts: DailyCompletionCounts;
};

type CalendarDay = {
  dateKey: string;
  label: string;
  completedCount: number;
};

const buildCalendarDays = (counts: DailyCompletionCounts, locale: string): CalendarDay[] => {
  const formatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (27 - index));
    const dateKey = getDateKeyFromDate(date);

    return {
      dateKey,
      label: formatter.format(date),
      completedCount: counts[dateKey] ?? 0,
    };
  });
};

const getCurrentStreakCount = (counts: DailyCompletionCounts): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;

  for (let index = 0; index < 365; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const dateKey = getDateKeyFromDate(date);

    if ((counts[dateKey] ?? 0) > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
};

const getCompletionTone = (completedCount: number): string => {
  if (completedCount >= 3) {
    return "border-emerald-700/80 bg-emerald-600 dark:border-emerald-400/80 dark:bg-emerald-400";
  }

  if (completedCount >= 2) {
    return "border-emerald-500/70 bg-emerald-400 dark:border-emerald-500/80 dark:bg-emerald-500";
  }

  if (completedCount >= 1) {
    return "border-emerald-300/80 bg-emerald-200 dark:border-emerald-700/80 dark:bg-emerald-700";
  }

  return "border-border/80 bg-muted/60";
};

export const StreakCalendar = ({ counts }: StreakCalendarProps): React.ReactElement => {
  const t = useTranslations("StreakCalendar");
  const locale = useLocale();
  const calendarDays = buildCalendarDays(counts, locale);
  const currentStreak = getCurrentStreakCount(counts);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Flame className="size-4" /> {currentStreak > 0 ? t("streak", { count: currentStreak }) : t("startToday")}
          </p>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-flow-col grid-rows-7 justify-start gap-1.5 overflow-x-auto pb-2">
          {calendarDays.map((day) => {
            return (
              <div key={day.dateKey} className="group relative">
                <button
                  type="button"
                  className={cn(
                    "size-5 rounded-sm border transition-transform duration-150 group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    getCompletionTone(day.completedCount),
                  )}
                  title={t("daySummary", { date: day.label, count: day.completedCount })}
                  aria-label={t("dayAria", { date: day.label, count: day.completedCount })}
                />
                <div className="pointer-events-none absolute bottom-[120%] left-1/2 z-10 hidden -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-sm group-hover:block">
                  {t("daySummary", { date: day.label, count: day.completedCount })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("less")}</span>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-border/80 bg-muted/60" />
            <span className="h-3 w-3 rounded-[3px] border border-emerald-300/80 bg-emerald-200 dark:border-emerald-700/80 dark:bg-emerald-700" />
            <span className="h-3 w-3 rounded-[3px] border border-emerald-500/70 bg-emerald-400 dark:border-emerald-500/80 dark:bg-emerald-500" />
            <span className="h-3 w-3 rounded-[3px] border border-emerald-700/80 bg-emerald-600 dark:border-emerald-400/80 dark:bg-emerald-400" />
          </div>
          <span>{t("more")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

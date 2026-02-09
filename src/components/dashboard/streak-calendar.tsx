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

const buildCalendarDays = (counts: DailyCompletionCounts): CalendarDay[] => {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
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

const getCompletionTone = (completedCount: number): string => {
  if (completedCount >= 3) {
    return "border-emerald-700/80 bg-emerald-600 dark:border-emerald-400/70 dark:bg-emerald-400";
  }

  if (completedCount >= 1) {
    return "border-emerald-400/70 bg-emerald-300 dark:border-emerald-600/70 dark:bg-emerald-700";
  }

  return "border-border/80 bg-muted/60";
};

export const StreakCalendar = ({ counts }: StreakCalendarProps): React.ReactElement => {
  const calendarDays = buildCalendarDays(counts);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Streak Calendar</CardTitle>
        <CardDescription>Tasks completed in the last 4 weeks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-flow-col grid-rows-7 justify-start gap-1.5">
          {calendarDays.map((day) => {
            return (
              <div
                key={day.dateKey}
                className={cn("size-5 rounded-sm border", getCompletionTone(day.completedCount))}
                title={`${day.label}: ${day.completedCount} completed`}
                aria-label={`${day.label}, ${day.completedCount} tasks completed`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-border/80 bg-muted/60" />
            <span className="h-3 w-3 rounded-[3px] border border-emerald-400/70 bg-emerald-300 dark:border-emerald-600/70 dark:bg-emerald-700" />
            <span className="h-3 w-3 rounded-[3px] border border-emerald-700/80 bg-emerald-600 dark:border-emerald-400/70 dark:bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};

"use client";

import { storage } from "@/lib/storage";
import type { DailyCompletionCounts } from "@/lib/storage";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeCounts = (input: DailyCompletionCounts): DailyCompletionCounts => {
  return Object.entries(input).reduce<DailyCompletionCounts>((accumulator, [dateKey, count]) => {
    if (!DATE_KEY_PATTERN.test(dateKey)) {
      return accumulator;
    }

    const normalizedCount = Math.max(0, Math.floor(count));
    if (normalizedCount === 0) {
      return accumulator;
    }

    accumulator[dateKey] = normalizedCount;
    return accumulator;
  }, {});
};

export const getDateKeyFromDate = (date: Date): string => {
  return toDateKey(date);
};

export const getDateKeyFromTimestamp = (timestamp: string): string => {
  return toDateKey(new Date(timestamp));
};

export const getDailyCompletionCounts = async (): Promise<DailyCompletionCounts> => {
  const result = await storage.streaks.get();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return normalizeCounts(result.data);
};

export const setDailyCompletionCounts = async (counts: DailyCompletionCounts): Promise<DailyCompletionCounts> => {
  const normalizedCounts = normalizeCounts(counts);
  const result = await storage.streaks.set(normalizedCounts);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
};

export const adjustDailyCompletionCount = async (dateKey: string, delta: number): Promise<DailyCompletionCounts> => {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    return getDailyCompletionCounts();
  }

  const currentCounts = await getDailyCompletionCounts();
  const nextCount = Math.max(0, (currentCounts[dateKey] ?? 0) + delta);
  const nextCounts: DailyCompletionCounts = {
    ...currentCounts,
  };

  if (nextCount === 0) {
    delete nextCounts[dateKey];
  } else {
    nextCounts[dateKey] = nextCount;
  }

  return setDailyCompletionCounts(nextCounts);
};

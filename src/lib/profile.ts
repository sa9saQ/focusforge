"use client";

import { getLevelFromXp } from "@/lib/gamification";
import { createDefaultProfile, storage } from "@/lib/storage";
import type { Profile } from "@/lib/types";

const getIsoDate = (offsetDays = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const normalizeProfile = (profile: Profile | null): Profile => {
  return {
    ...createDefaultProfile(),
    ...(profile ?? {}),
  };
};

export const getOrCreateProfile = async (): Promise<Profile> => {
  const profileResult = await storage.profile.get();

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (profileResult.data) {
    return normalizeProfile(profileResult.data);
  }

  const insertResult = await storage.profile.upsert(createDefaultProfile());

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  return insertResult.data;
};

const getNextStreakDays = (profile: Profile, today: string): number => {
  if (profile.last_active_date === today) {
    return profile.streak_days;
  }

  if (profile.last_active_date === getIsoDate(-1)) {
    return Math.max(1, profile.streak_days + 1);
  }

  return 1;
};

export const awardXp = async (amount: number): Promise<Profile> => {
  const profile = await getOrCreateProfile();
  const nextXp = Math.max(0, profile.xp + amount);
  const nextLevel = getLevelFromXp(nextXp);
  const today = getIsoDate();

  const updateResult = await storage.profile.upsert({
    ...profile,
    xp: nextXp,
    level: nextLevel,
    streak_days: getNextStreakDays(profile, today),
    last_active_date: today,
  });

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  return updateResult.data;
};

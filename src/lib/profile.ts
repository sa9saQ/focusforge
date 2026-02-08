"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getLevelFromXp } from "@/lib/gamification";
import type { Database } from "@/lib/database.types";
import type { Profile } from "@/lib/types";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "display_name" | "level" | "xp"
>;

const mapProfile = (row: ProfileRow): Profile => {
  return {
    id: row.id,
    display_name: row.display_name,
    level: row.level,
    xp: row.xp,
  };
};

export const getOrCreateProfile = async (
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Profile> => {
  const profileResult = await (client as any).from("profiles").select("id,display_name,level,xp").eq("id", userId).maybeSingle();

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (profileResult.data) {
    return mapProfile(profileResult.data);
  }

  const insertResult = await (client as any)
    .from("profiles")
    .insert({ id: userId, level: 1, xp: 0 })
    .select("id,display_name,level,xp")
    .single();

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  return mapProfile(insertResult.data);
};

export const awardXp = async (
  client: SupabaseClient<Database>,
  userId: string,
  amount: number,
): Promise<Profile> => {
  const profile = await getOrCreateProfile(client, userId);
  const nextXp = Math.max(0, profile.xp + amount);
  const nextLevel = getLevelFromXp(nextXp);

  const updateResult = await (client as any)
    .from("profiles")
    .update({ xp: nextXp, level: nextLevel })
    .eq("id", userId)
    .select("id,display_name,level,xp")
    .single();

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  return mapProfile(updateResult.data);
};

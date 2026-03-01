"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TrickStatus } from "@/lib/types";

export async function setTrickStatus(trickId: string, status: TrickStatus | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (status === null) {
    const { error } = await supabase
      .from("user_tricks")
      .delete()
      .eq("user_id", user.id)
      .eq("trick_id", trickId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("user_tricks")
      .upsert(
        { user_id: user.id, trick_id: trickId, status, updated_at: new Date().toISOString() },
        { onConflict: "user_id,trick_id" }
      );

    if (error) return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getUserTricks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("user_tricks")
    .select("*")
    .eq("user_id", user.id);

  return data ?? [];
}

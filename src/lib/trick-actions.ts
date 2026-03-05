"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TrickStatus } from "@/lib/types";
import { redirect } from "next/navigation";

export async function setTrickStatus(
  trickId: string, 
  status: TrickStatus | null, 
  consistency: number | null = null
) {
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
        { 
          user_id: user.id, 
          trick_id: trickId, 
          status, 
          consistency,
          updated_at: new Date().toISOString() 
        },
        { onConflict: "user_id,trick_id" }
      );

    if (error) return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteTrick(trickId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== 'justinreeves00@gmail.com') return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tricks")
    .delete()
    .eq("id", trickId);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function renameTrick(trickId: string, newName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== 'justinreeves00@gmail.com') return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tricks")
    .update({ name: newName })
    .eq("id", trickId);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateTrick(trickId: string, updates: Partial<{ name: string, category: string, difficulty: number, youtube_query: string }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== 'justinreeves00@gmail.com') return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tricks")
    .update(updates)
    .eq("id", trickId);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function submitTrickLevelSuggestion(trickId: string, level: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("trick_suggestions")
    .insert({
      user_id: user.id,
      trick_id: trickId,
      suggested_level: level,
      status: 'pending'
    });

  if (error) return { error: error.message };

  return { success: true };
}

export async function handleTrickSuggestion(suggestionId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== 'justinreeves00@gmail.com') {
    return;
  }

  // If approved, update the actual trick level first
  if (status === 'approved') {
    const { data: suggestion } = await supabase
      .from("trick_suggestions")
      .select("trick_id, suggested_level")
      .eq("id", suggestionId)
      .single();

    if (suggestion) {
      await supabase
        .from("tricks")
        .update({ difficulty: suggestion.suggested_level })
        .eq("id", suggestion.trick_id);
    }
  }

  const { error } = await supabase
    .from("trick_suggestions")
    .update({ status })
    .eq("id", suggestionId);

  if (error) {
    console.error(error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/admin");
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

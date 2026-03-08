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

    if (error) {
      console.error('Failed to delete trick status:', error.message);
      return { error: error.message };
    }
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

    if (error) {
      console.error('Failed to upsert trick status:', error.message, 'Status:', status);
      return { error: error.message };
    }
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

export async function addTrick(trick: { name: string, category: string, difficulty: number, youtube_query?: string }, isUserSubmitted: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // For user-submitted tricks, allow any authenticated user
  if (!user) return { error: "Not authenticated" };
  
  // For admin direct adds, verify email
  if (!isUserSubmitted && user?.email !== 'justinreeves00@gmail.com') return { error: "Unauthorized" };

  // Auto-generate YouTube search query: "How to X" where X is the trick name
  const trickWithQuery = {
    ...trick,
    youtube_query: trick.youtube_query || `How to ${trick.name}`,
    awaiting_approval: isUserSubmitted ? true : null
  };

  const { data, error } = await supabase
    .from("tricks")
    .insert([trickWithQuery])
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, data };
}

export async function submitUserTrick(trick: { name: string, category: string, difficulty: number, description?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Auto-generate YouTube search query
  const trickData = {
    name: trick.name,
    category: trick.category,
    difficulty: trick.difficulty,
    youtube_query: `How to ${trick.name}`,
    awaiting_approval: true,
    description: trick.description || null
  };

  const { data, error } = await supabase
    .from("tricks")
    .insert([trickData])
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, data };
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

export async function submitNewTrickSuggestion(name: string, category: string, description?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("new_trick_suggestions")
    .insert({
      user_id: user.id,
      name,
      category,
      description,
      status: 'pending'
    });

  if (error) return { error: error.message };

  return { success: true };
}

export async function approveTrick(trickId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== 'justinreeves00@gmail.com') return { error: "Unauthorized" };

  // Remove the awaiting_approval flag
  const { error } = await supabase
    .from("tricks")
    .update({ awaiting_approval: null })
    .eq("id", trickId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function rejectTrick(trickId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== 'justinreeves00@gmail.com') return { error: "Unauthorized" };

  // Delete the trick
  const { error } = await supabase
    .from("tricks")
    .delete()
    .eq("id", trickId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function handleNewTrickSuggestion(suggestionId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== 'justinreeves00@gmail.com') return { error: "Unauthorized" };

  const { error } = await supabase
    .from("new_trick_suggestions")
    .update({ status })
    .eq("id", suggestionId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function reportTrickIssue(input: {
  trickName: string;
  category: string;
  difficulty: number | null;
  issueType: string;
  details?: string;
  reporterName?: string | null;
}) {
  const title = `[Trick] ${input.trickName}: ${input.issueType}`;
  const body = [
    `Trick: ${input.trickName}`,
    `Category: ${input.category}`,
    `Difficulty: ${input.difficulty ?? "Unknown"}`,
    `Issue type: ${input.issueType}`,
    `Reporter: ${input.reporterName || "Anonymous"}`,
    "",
    "Details:",
    input.details?.trim() || "(no extra details provided)",
  ].join("\n");

  const draftUrl = `https://github.com/justinreeves00/SkateBag/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  const token = process.env.GITHUB_ISSUES_TOKEN;

  if (!token) {
    return { success: true, mode: "draft", url: draftUrl };
  }

  const response = await fetch("https://api.github.com/repos/justinreeves00/SkateBag/issues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      title,
      body,
    }),
  });

  if (!response.ok) {
    return { success: true, mode: "draft", url: draftUrl };
  }

  const data = await response.json();
  return { success: true, mode: "created", url: data.html_url as string };
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

export async function updateTrickOrder(trickId: string, newOrder: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // If Admin, update the global canonical order
  if (user.email === 'justinreeves00@gmail.com') {
    const { error: globalError } = await supabase
      .from("tricks")
      .update({ sort_order: newOrder })
      .eq("id", trickId);
    
    if (globalError) return { error: globalError.message };
  }

  // Also update user's personal sort preference
  const { error } = await supabase
    .from("user_tricks")
    .update({ 
      sort_order: newOrder,
      is_manually_sorted: true 
    })
    .eq("user_id", user.id)
    .eq("trick_id", trickId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateTricksOrder(updates: { id: string, sort_order: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== 'justinreeves00@gmail.com') {
    return { error: "Admin authorization required" };
  }

  // Update global tricks table in bulk
  // We use a simple loop here because Supabase doesn't have a native 'upsert' for specific columns without unique constraints on those columns
  for (const update of updates) {
    await supabase
      .from("tricks")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id);
  }

  revalidatePath("/");
  return { success: true };
}

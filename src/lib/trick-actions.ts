"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TrickStatus } from "@/lib/types";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth, requireAdmin } from "@/lib/auth-helpers";

// Zod schemas for validation
const TrickStatusSchema = z.enum(["landed", "locked", "learning"]);

const SetTrickStatusSchema = z.object({
  trickId: z.string().uuid("Invalid trick ID"),
  status: TrickStatusSchema.nullable(),
  consistency: z.number().min(0).max(100).nullable().optional(),
});

const DeleteTrickSchema = z.object({
  trickId: z.string().uuid("Invalid trick ID"),
});

const RenameTrickSchema = z.object({
  trickId: z.string().uuid("Invalid trick ID"),
  newName: z.string().min(1, "Name is required").max(100, "Name too long"),
});

const UpdateTrickSchema = z.object({
  trickId: z.string().uuid("Invalid trick ID"),
  updates: z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.string().min(1).optional(),
    difficulty: z.number().min(1).max(5).optional(),
    youtube_query: z.string().max(200).optional(),
  }),
});

const AddTrickSchema = z.object({
  trick: z.object({
    name: z.string().min(1, "Name is required").max(100),
    category: z.string().min(1, "Category is required"),
    difficulty: z.number().min(1).max(5, "Difficulty must be 1-5"),
    youtube_query: z.string().max(200).optional(),
  }),
  isUserSubmitted: z.boolean().default(false),
});

const SubmitUserTrickSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required"),
  difficulty: z.number().min(1).max(5),
  description: z.string().max(500).optional(),
});

const SubmitTrickLevelSuggestionSchema = z.object({
  trickId: z.string().uuid("Invalid trick ID"),
  level: z.number().min(1).max(5, "Level must be 1-5"),
});

const HandleTrickSuggestionSchema = z.object({
  suggestionId: z.string().uuid("Invalid suggestion ID"),
  status: z.enum(["approved", "rejected"]),
});

const SubmitNewTrickSuggestionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(500).optional(),
});

const ApproveRejectTrickSchema = z.object({
  trickId: z.string().uuid("Invalid trick ID"),
});

const HandleNewTrickSuggestionSchema = z.object({
  suggestionId: z.string().uuid("Invalid suggestion ID"),
  status: z.enum(["approved", "rejected"]),
});

const ReportTrickIssueSchema = z.object({
  trickName: z.string().min(1),
  category: z.string(),
  difficulty: z.number().min(1).max(5).nullable(),
  issueType: z.string().min(1),
  details: z.string().max(2000).optional(),
  reporterName: z.string().max(100).nullable().optional(),
});

const UpdateTrickOrderSchema = z.object({
  trickId: z.string().uuid("Invalid trick ID"),
  newOrder: z.number().int(),
});

const UpdateTricksOrderSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid("Invalid trick ID"),
    sort_order: z.number().int(),
  })),
});

export async function setTrickStatus(
  trickId: string, 
  status: TrickStatus | null, 
  consistency: number | null = null
) {
  // Validate input
  const validation = SetTrickStatusSchema.safeParse({ trickId, status, consistency });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAuth();
  if (!auth.user) {
    return { error: auth.error || "Not authenticated" };
  }

  const supabase = await createClient();

  if (status === null) {
    const { error } = await supabase
      .from("user_tricks")
      .delete()
      .eq("user_id", auth.user.id)
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
          user_id: auth.user.id, 
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
  // Validate input
  const validation = DeleteTrickSchema.safeParse({ trickId });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const supabase = await createClient();
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
  // Validate input
  const validation = RenameTrickSchema.safeParse({ trickId, newName });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const supabase = await createClient();
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
  // Validate input
  const validation = UpdateTrickSchema.safeParse({ trickId, updates });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const supabase = await createClient();
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
  // Validate input
  const validation = AddTrickSchema.safeParse({ trick, isUserSubmitted });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAuth();
  if (!auth.user) {
    return { error: auth.error || "Not authenticated" };
  }
  
  // For admin direct adds, verify admin role
  if (!isUserSubmitted && !auth.isAdmin) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

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
  // Validate input
  const validation = SubmitUserTrickSchema.safeParse(trick);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAuth();
  if (!auth.user) {
    return { error: auth.error || "Not authenticated" };
  }

  const supabase = await createClient();

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
  // Validate input
  const validation = SubmitTrickLevelSuggestionSchema.safeParse({ trickId, level });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAuth();
  if (!auth.user) {
    return { error: auth.error || "Not authenticated" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("trick_suggestions")
    .insert({
      user_id: auth.user.id,
      trick_id: trickId,
      suggested_level: level,
      status: 'pending'
    });

  if (error) return { error: error.message };

  return { success: true };
}

export async function handleTrickSuggestion(suggestionId: string, status: 'approved' | 'rejected') {
  // Validate input
  const validation = HandleTrickSuggestionSchema.safeParse({ suggestionId, status });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const supabase = await createClient();

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
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function submitNewTrickSuggestion(name: string, category: string, description?: string) {
  // Validate input
  const validation = SubmitNewTrickSuggestionSchema.safeParse({ name, category, description });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAuth();
  if (!auth.user) {
    return { error: auth.error || "Not authenticated" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("new_trick_suggestions")
    .insert({
      user_id: auth.user.id,
      name,
      category,
      description,
      status: 'pending'
    });

  if (error) return { error: error.message };

  return { success: true };
}

export async function approveTrick(trickId: string) {
  // Validate input
  const validation = ApproveRejectTrickSchema.safeParse({ trickId });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const supabase = await createClient();

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
  // Validate input
  const validation = ApproveRejectTrickSchema.safeParse({ trickId });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const supabase = await createClient();

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
  // Validate input
  const validation = HandleNewTrickSuggestionSchema.safeParse({ suggestionId, status });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Unauthorized" };
  }

  const supabase = await createClient();
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
  // Validate input
  const validation = ReportTrickIssueSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

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
  const auth = await requireAuth();
  if (!auth.user) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_tricks")
    .select("*")
    .eq("user_id", auth.user.id);

  return data ?? [];
}

export async function updateTrickOrder(trickId: string, newOrder: number) {
  // Validate input
  const validation = UpdateTrickOrderSchema.safeParse({ trickId, newOrder });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAuth();
  if (!auth.user) {
    return { error: auth.error || "Not authenticated" };
  }

  const supabase = await createClient();

  // If Admin, update the global canonical order
  if (auth.isAdmin) {
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
    .eq("user_id", auth.user.id)
    .eq("trick_id", trickId);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateTricksOrder(updates: { id: string, sort_order: number }[]) {
  // Validate input
  const validation = UpdateTricksOrderSchema.safeParse({ updates });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAdmin();
  if (!auth.user) {
    return { error: auth.error || "Admin authorization required" };
  }

  const supabase = await createClient();

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

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-helpers";

// Zod schemas for validation
const UpdateProfileSchema = z.object({
  displayName: z.string()
    .min(1, "Display name is required")
    .max(50, "Display name must be 50 characters or less")
    .trim(),
  username: z.string()
    .max(30, "Username must be 30 characters or less")
    .regex(/^[a-zA-Z0-9_]*$/, "Username can only contain letters, numbers, and underscores")
    .nullable()
    .optional(),
});

const DisplayNameSchema = z.string()
  .min(1, "Display name is required")
  .max(50, "Display name must be 50 characters or less")
  .trim();

export async function updateProfile(displayName: string, username?: string) {
  // Validate input
  const validation = UpdateProfileSchema.safeParse({ displayName, username });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const auth = await requireAuth();
  if (!auth.user) {
    return { error: auth.error || "Not authenticated" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: auth.user.id,
      display_name: displayName.trim(),
      username: username?.trim() || null,
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function getProfile() {
  const auth = await requireAuth();
  if (!auth.user) {
    return { data: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (error) return { data: null };

  return { data };
}

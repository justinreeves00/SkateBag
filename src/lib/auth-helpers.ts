"use server";

import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  error?: string;
}

export async function getAuthInfo(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false };
  }

  // Check if user has admin role
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  return {
    user: { id: user.id, email: user.email },
    isAdmin: !!adminRole,
  };
}

export async function requireAuth(): Promise<AuthResult> {
  const auth = await getAuthInfo();
  if (!auth.user) {
    return { user: null, isAdmin: false, error: "Not authenticated" };
  }
  return auth;
}

export async function requireAdmin(): Promise<AuthResult> {
  const auth = await getAuthInfo();
  if (!auth.user) {
    return { user: null, isAdmin: false, error: "Not authenticated" };
  }
  if (!auth.isAdmin) {
    return { user: null, isAdmin: false, error: "Unauthorized" };
  }
  return auth;
}

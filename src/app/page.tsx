import { createClient } from "@/lib/supabase/server";
import { TrickList } from "@/components/TrickList";
import { signOut } from "@/lib/auth-actions";
import type { TrickWithStatus } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all tricks
  const { data: tricks } = await supabase
    .from("tricks")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("difficulty", { ascending: true })
    .order("name", { ascending: true });

  // Fetch user's trick statuses and profile if logged in
  let userTricksMap: Record<string, { 
    status: "landed" | "locked" | "learning", 
    consistency: number | null,
    sort_order: number | null,
    is_manually_sorted: boolean | null
  }> = {};
  let userProfile = null;

  if (user) {
    const [tricksRes, profileRes] = await Promise.all([
      supabase
        .from("user_tricks")
        .select("trick_id, status, consistency, sort_order, is_manually_sorted")
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle() // Use maybeSingle to avoid 406 errors if table exists but no row
    ]);

    if (tricksRes.data) {
      userTricksMap = Object.fromEntries(
        tricksRes.data.map((ut) => [ut.trick_id, { 
          status: ut.status, 
          consistency: ut.consistency,
          sort_order: ut.sort_order,
          is_manually_sorted: ut.is_manually_sorted
        }])
      );
    }
    
    // If the profile query fails because the table doesn't exist, profileRes.data will be null
    userProfile = profileRes.data;
  }

  const tricksWithStatus: TrickWithStatus[] = (tricks ?? []).map((trick) => ({
    ...trick,
    userStatus: userTricksMap[trick.id]?.status ?? null,
    userConsistency: userTricksMap[trick.id]?.consistency ?? null,
    sortOrder: userTricksMap[trick.id]?.sort_order ?? null,
    isManuallySorted: userTricksMap[trick.id]?.is_manually_sorted ?? null,
  }));

  return (
    <div className="relative">
      <TrickList 
        tricks={tricksWithStatus} 
        isAuthenticated={!!user} 
        userEmail={user?.email ?? null} 
        userProfile={userProfile}
      />
    </div>
  );
}

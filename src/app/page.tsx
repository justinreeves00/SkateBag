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
    .order("difficulty")
    .order("name");

  // Fetch user's trick statuses and profile if logged in
  let userTricksMap: Record<string, { status: "landed" | "locked", consistency: number | null }> = {};
  let userProfile = null;

  if (user) {
    const [tricksRes, profileRes] = await Promise.all([
      supabase
        .from("user_tricks")
        .select("trick_id, status, consistency")
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
    ]);

    if (tricksRes.data) {
      userTricksMap = Object.fromEntries(
        tricksRes.data.map((ut) => [ut.trick_id, { status: ut.status, consistency: ut.consistency }])
      );
    }
    userProfile = profileRes.data;
  }

  const tricksWithStatus: TrickWithStatus[] = (tricks ?? []).map((trick) => ({
    ...trick,
    userStatus: userTricksMap[trick.id]?.status ?? null,
    userConsistency: userTricksMap[trick.id]?.consistency ?? null,
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

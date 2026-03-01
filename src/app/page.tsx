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

  // Fetch user's trick statuses if logged in
  let userTricksMap: Record<string, { status: "landed" | "locked", consistency: number | null }> = {};
  if (user) {
    const { data: userTricks } = await supabase
      .from("user_tricks")
      .select("trick_id, status, consistency")
      .eq("user_id", user.id);

    if (userTricks) {
      userTricksMap = Object.fromEntries(
        userTricks.map((ut) => [ut.trick_id, { status: ut.status, consistency: ut.consistency }])
      );
    }
  }

  const tricksWithStatus: TrickWithStatus[] = (tricks ?? []).map((trick) => ({
    ...trick,
    userStatus: userTricksMap[trick.id]?.status ?? null,
    userConsistency: userTricksMap[trick.id]?.consistency ?? null,
  }));

  return (
    <div className="relative">
      {/* User menu */}
      {user && (
        <div className="fixed top-8 right-12 z-50">
          <form action={signOut}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1a1a1a] text-[10px] text-[#444] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div className="fixed top-8 right-12 z-50">
          <a
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-[#e8ff00] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            Sign in
          </a>
        </div>
      )}

      <TrickList tricks={tricksWithStatus} isAuthenticated={!!user} />
    </div>
  );
}

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
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="flex flex-col pointer-events-auto bg-black/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl">
          {!user ? (
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none py-1">
              Sign in to log tricks 🛹
            </span>
          ) : (
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">Bag Holder</span>
              <span className="text-[10px] text-blue-400 font-bold leading-none mt-1">{user.email}</span>
            </div>
          )}
        </div>

        <div className="pointer-events-auto">
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all shadow-xl"
              >
                Sign out
              </button>
            </form>
          ) : (
            <a
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      <TrickList tricks={tricksWithStatus} isAuthenticated={!!user} />
    </div>
  );
}

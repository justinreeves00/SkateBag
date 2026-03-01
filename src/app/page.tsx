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
    .order("category")
    .order("name");

  // Fetch user's trick statuses if logged in
  let userTricksMap: Record<string, "landed" | "locked"> = {};
  if (user) {
    const { data: userTricks } = await supabase
      .from("user_tricks")
      .select("trick_id, status")
      .eq("user_id", user.id);

    if (userTricks) {
      userTricksMap = Object.fromEntries(
        userTricks.map((ut) => [ut.trick_id, ut.status])
      );
    }
  }

  const tricksWithStatus: TrickWithStatus[] = (tricks ?? []).map((trick) => ({
    ...trick,
    userStatus: userTricksMap[trick.id] ?? null,
  }));

  return (
    <div>
      {/* User menu */}
      {user && (
        <div className="fixed top-0 right-0 z-30 p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-[#444] hover:text-[#888] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div className="fixed top-0 right-0 z-30 p-4">
          <a
            href="/login"
            className="text-xs text-[#e8ff00] hover:text-white transition-colors font-semibold"
          >
            Sign in
          </a>
        </div>
      )}

      <TrickList tricks={tricksWithStatus} isAuthenticated={!!user} />
    </div>
  );
}

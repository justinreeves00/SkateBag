import { createClient } from "@/lib/supabase/server";
import { SkateBagLogo } from "@/components/Logo";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // Fetch users and their landed trick counts
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url");

  // Fetch trick counts
  const { data: trickCounts } = await supabase
    .from("user_tricks")
    .select("user_id")
    .in("status", ["landed", "locked"]);

  const countsMap: Record<string, number> = {};
  (trickCounts ?? []).forEach((ut) => {
    countsMap[ut.user_id] = (countsMap[ut.user_id] || 0) + 1;
  });

  const sortedLeaderboard = (profiles ?? [])
    .map((p) => ({
      ...p,
      landedCount: countsMap[p.id] || 0,
    }))
    .sort((a, b) => b.landedCount - a.landedCount);

  return (
    <main className="min-h-screen text-white p-6 md:p-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <header className="flex justify-between items-center border-b border-[var(--border)] pb-8">
          <div className="flex items-center gap-4">
            <SkateBagLogo size={48} className="transform -rotate-2" />
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Leaderboard</h1>
              <p className="text-[var(--board-accent)] text-[10px] font-black uppercase tracking-[0.4em] mt-1">
                Top Skaters
              </p>
            </div>
          </div>
          <a
            href="/"
            className="px-6 py-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-elevated)] transition-all"
          >
            Exit
          </a>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {sortedLeaderboard.map((user, index) => (
            <div
              key={user.id}
              className={`cyber-card p-6 rounded-2xl flex items-center justify-between gap-6 transition-all ${
                index === 0
                  ? "border-[var(--board-accent)] bg-[var(--board-accent)]/10"
                  : index === 1
                    ? "border-slate-400/50"
                    : index === 2
                      ? "border-orange-400/50"
                      : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-6">
                <span
                  className={`text-2xl font-black italic w-8 ${
                    index === 0
                      ? "text-[var(--board-accent)]"
                      : index === 1
                        ? "text-slate-400"
                        : index === 2
                          ? "text-orange-400"
                          : "text-white/20"
                  }`}
                >
                  #{index + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic">{user.display_name || "Unknown Skater"}</h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.landedCount > 0 ? "bg-[var(--board-accent)]" : "bg-slate-800"
                      }`}
                    />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tricks Bagged</p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-4xl font-black tracking-tighter italic text-white">{user.landedCount}</span>
                <p className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest mt-1">Landed</p>
              </div>
            </div>
          ))}
        </div>

        {sortedLeaderboard.length === 0 && (
          <div className="py-20 text-center space-y-4 cyber-card rounded-2xl border-dashed">
            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">No skaters found</p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-[var(--board-accent)] text-black text-[10px] font-black uppercase tracking-widest rounded-sm"
            >
              Back to Base
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

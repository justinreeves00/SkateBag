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
    .eq("status", "landed");

  const countsMap: Record<string, number> = {};
  (trickCounts ?? []).forEach(ut => {
    countsMap[ut.user_id] = (countsMap[ut.user_id] || 0) + 1;
  });

  const sortedLeaderboard = (profiles ?? [])
    .map(p => ({
      ...p,
      landedCount: countsMap[p.id] || 0
    }))
    .sort((a, b) => b.landedCount - a.landedCount);

  return (
    <main className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 z-[-1] opacity-20">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <header className="flex justify-between items-center border-b border-white/10 pb-8">
          <div className="flex items-center gap-4">
            <SkateBagLogo size={48} className="shadow-[0_0_20px_rgba(0,243,255,0.2)] transform -rotate-3" />
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Leaderboard</h1>
              <p className="text-[var(--neon-cyan)] text-[10px] font-black uppercase tracking-[0.4em] mt-1">Top Skaters</p>
            </div>
          </div>
          <a href="/" className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Exit
          </a>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {sortedLeaderboard.map((user, index) => (
            <div 
              key={user.id} 
              className={`cyber-card p-6 rounded-2xl flex items-center justify-between gap-6 transition-all hover:scale-[1.01] ${
                index === 0 ? "border-[var(--neon-cyan)] shadow-[0_0_30px_rgba(0,243,255,0.15)] bg-[var(--neon-cyan)]/5" : 
                index === 1 ? "border-slate-400/50" :
                index === 2 ? "border-orange-400/50" : "border-white/5"
              }`}
            >
              <div className="flex items-center gap-6">
                <span className={`text-2xl font-black italic w-8 ${
                  index === 0 ? "text-[var(--neon-cyan)]" : 
                  index === 1 ? "text-slate-400" :
                  index === 2 ? "text-orange-400" : "text-white/20"
                }`}>
                  #{index + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic">{user.display_name || "Unknown Skater"}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.landedCount > 0 ? "bg-[var(--neon-cyan)] animate-pulse" : "bg-slate-800"}`} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tricks Bagged</p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-4xl font-black tracking-tighter italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {user.landedCount}
                </span>
                <p className="text-[9px] font-black text-[var(--neon-cyan)] uppercase tracking-widest mt-1">Landed</p>
              </div>
            </div>
          ))}
        </div>

        {sortedLeaderboard.length === 0 && (
          <div className="py-20 text-center space-y-4 cyber-card rounded-3xl border-dashed">
            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">No skaters found</p>
            <a href="/" className="inline-block px-8 py-4 bg-[var(--neon-cyan)] text-black text-[10px] font-black uppercase tracking-widest shadow-xl">Back to Base</a>
          </div>
        )}
      </div>
    </main>
  );
}

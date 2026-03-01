import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateTrickLevel, handleTrickSuggestion } from "@/lib/trick-actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Simple admin check
  if (!user || user.email !== "justinreeves00@gmail.com") {
    redirect("/");
  }

  const { data: tricks } = await supabase
    .from("tricks")
    .select("*")
    .order("difficulty", { ascending: true })
    .order("name", { ascending: true });

  const { data: suggestions } = await supabase
    .from("trick_suggestions")
    .select(`
      *,
      tricks (name, difficulty, category)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-center border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Command Center</h1>
            <p className="text-emerald-400 text-xs font-mono uppercase tracking-[0.3em] mt-2">Trick Level Calibration</p>
          </div>
          <a href="/" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Exit Admin
          </a>
        </header>

        {/* Suggestions Section */}
        {suggestions && suggestions.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black italic uppercase">Pending Review</h2>
              <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{suggestions.length}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((s: any) => (
                <div key={s.id} className="bg-white/5 border border-emerald-500/30 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold uppercase italic">{s.tricks?.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      Current: LVL {s.tricks?.difficulty} ➡️ Suggested: <span className="text-emerald-400">LVL {s.suggested_level}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form action={handleTrickSuggestion.bind(null, s.id, "approved")}>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-emerald-500/20">
                        Approve
                      </button>
                    </form>
                    <form action={handleTrickSuggestion.bind(null, s.id, "rejected")}>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-black italic uppercase">Database Master List</h2>
          <div className="grid grid-cols-1 gap-4">
            {tricks?.map((trick) => (
              <div key={trick.id} className="aurora-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold uppercase italic">{trick.name}</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {trick.category} // CURRENT: LVL {trick.difficulty}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    // Bind arguments to the server action
                    const updateWithArgs = updateTrickLevel.bind(null, trick.id, lvl);
                    
                    return (
                      <form key={lvl} action={updateWithArgs}>
                        <button
                          type="submit"
                          className={`w-12 h-12 rounded-xl font-black transition-all border ${
                            trick.difficulty === lvl
                              ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                              : "bg-white/5 text-slate-500 border-white/5 hover:border-emerald-500/50 hover:text-emerald-400"
                          }`}
                        >
                          {lvl}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

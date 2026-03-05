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
    <main className="min-h-screen bg-[var(--background)] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-center border-b-8 border-black pb-8">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter drop-shadow-[4px_4px_0px_#000]">Command Center</h1>
            <p className="text-[var(--safety-orange)] text-xs font-black uppercase tracking-widest mt-2 bg-black px-2 py-0.5 w-fit">Trick Level Calibration</p>
          </div>
          <a href="/" className="px-6 py-3 bg-white text-black border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Exit
          </a>
        </header>

        {/* Suggestions Section */}
        {suggestions && suggestions.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black italic uppercase bg-black px-4 py-1">Pending Review</h2>
              <span className="bg-[var(--safety-orange)] text-white text-xs font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">{suggestions.length}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {suggestions.map((s: any) => (
                <div key={s.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6 rotate-[0.5deg]">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-black uppercase italic">{s.tricks?.name}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 w-fit">
                      Current: LVL {s.tricks?.difficulty} ➡️ Suggested: <span className="text-[var(--safety-orange)]">LVL {s.suggested_level}</span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <form action={handleTrickSuggestion.bind(null, s.id, "approved")}>
                      <button type="submit" className="px-6 py-3 bg-[var(--safety-orange)] text-white text-xs font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                        Approve
                      </button>
                    </form>
                    <form action={handleTrickSuggestion.bind(null, s.id, "rejected")}>
                      <button type="submit" className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
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
          <h2 className="text-2xl font-black italic uppercase bg-black px-4 py-1 w-fit">Database Master</h2>
          <div className="grid grid-cols-1 gap-6">
            {tricks?.map((trick) => (
              <div key={trick.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-black uppercase italic">{trick.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 w-fit">
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
                          className={`w-12 h-12 font-black border-2 border-black transition-all shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                            trick.difficulty === lvl
                              ? "bg-[var(--safety-orange)] text-white scale-110"
                              : "bg-white text-black hover:bg-[var(--caution-yellow)]"
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

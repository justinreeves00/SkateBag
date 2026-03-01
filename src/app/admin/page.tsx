import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateTrickLevel } from "@/lib/trick-actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Simple admin check
  if (!user || user.email !== "justin_reeves@me.com") {
    redirect("/");
  }

  const { data: tricks } = await supabase
    .from("tricks")
    .select("*")
    .order("difficulty", { ascending: true })
    .order("name", { ascending: true });

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

        <div className="grid grid-cols-1 gap-4">
          {tricks?.map((trick) => (
            <div key={trick.id} className="aurora-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold uppercase italic">{trick.name}</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{trick.category} // CURRENT: LVL {trick.difficulty}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <form key={lvl} action={async () => {
                    "use server";
                    await updateTrickLevel(trick.id, lvl);
                  }}>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

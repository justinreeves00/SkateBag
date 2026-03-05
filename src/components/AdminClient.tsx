"use client";

import { useState } from "react";
import { updateTrick, deleteTrick, handleTrickSuggestion, addTrick } from "@/lib/trick-actions";
import { SkateBagLogo } from "@/components/Logo";
import type { Trick, TrickCategory } from "@/lib/types";

const CATEGORIES: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill"
];

interface AdminClientProps {
  initialTricks: Trick[];
  suggestions: any[];
}

export function AdminClient({ initialTricks, suggestions }: AdminClientProps) {
  const [tricks, setTricks] = useState<Trick[]>(initialTricks);
  const [filterCategory, setFilterCategory] = useState<TrickCategory | "all">("all");
  const [searchQuery, setSearchSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Trick>>({});
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<{ name: string, category: TrickCategory, difficulty: number, youtube_query: string }>({
    name: "",
    category: "flatground",
    difficulty: 1,
    youtube_query: ""
  });

  const filteredTricks = tricks.filter(t => {
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function handleUpdate(id: string, updates: any) {
    const res = await updateTrick(id, updates);
    if (res.success) {
      setTricks(tricks.map(t => t.id === id ? { ...t, ...updates } : t));
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirm deletion of this trick?")) return;
    const res = await deleteTrick(id);
    if (res.success) {
      setTricks(tricks.filter(t => t.id !== id));
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    
    const res = await addTrick(addForm);
    if (res.success && res.data) {
      setTricks([res.data as Trick, ...tricks]);
      setShowAddForm(false);
      setAddForm({ name: "", category: "flatground", difficulty: 1, youtube_query: "" });
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <SkateBagLogo size={48} className="shadow-[0_0_20px_rgba(0,243,255,0.2)] transform -rotate-3" />
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Command Center</h1>
            <p className="text-[var(--neon-cyan)] text-xs font-black uppercase tracking-[0.3em] mt-2 text-glow">Database Integrity Manager</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 rounded-lg bg-[var(--neon-cyan)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]"
          >
            {showAddForm ? "Cancel Add" : "Deploy New Trick"}
          </button>
          <a href="/" className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Exit
          </a>
        </div>
      </header>

      {/* Add Trick Form */}
      {showAddForm && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="cyber-card p-10 rounded-3xl border-[var(--neon-cyan)]/40 bg-[var(--neon-cyan)]/5">
            <h2 className="text-2xl font-black italic uppercase mb-8 text-[var(--neon-cyan)]">New Trick Deployment</h2>
            <form onSubmit={handleAdd} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Identification (Name)</label>
                  <input 
                    type="text" 
                    placeholder="E.G. KICKFLIP..."
                    value={addForm.name}
                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    required
                    autoFocus
                    className="w-full bg-black border border-white/20 rounded-xl px-6 py-4 text-sm font-black uppercase italic text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sector Assignment</label>
                  <select 
                    value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value as any})}
                    className="w-full bg-black border border-white/20 rounded-xl px-6 py-4 text-sm font-black uppercase text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Custom YouTube Query (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="E.G. HOW TO KICKFLIP PROPERLY..."
                    value={addForm.youtube_query}
                    onChange={(e) => setAddForm({...addForm, youtube_query: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm font-black text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-8 pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Threat Level (Difficulty)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button 
                        key={lvl}
                        type="button"
                        onClick={() => setAddForm({...addForm, difficulty: lvl})}
                        className={`w-12 h-12 rounded-xl font-black transition-all border-2 ${addForm.difficulty === lvl ? "bg-[var(--neon-cyan)] text-black border-[var(--neon-cyan)] shadow-[0_0_15px_var(--neon-cyan)]" : "bg-black text-slate-500 border-white/10 hover:border-white/30"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  type="submit"
                  className="px-12 py-4 bg-[var(--neon-cyan)] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:brightness-110 shadow-xl shadow-[var(--neon-cyan)]/20 active:scale-95 transition-all"
                >
                  Authorize Entry
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Suggestions Section */}
      {suggestions && suggestions.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black italic uppercase text-[var(--neon-magenta)]">Incoming Suggestions</h2>
            <span className="bg-[var(--neon-magenta)] text-white text-[10px] font-black px-2 py-0.5 rounded-sm">{suggestions.length}</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((s: any) => (
              <div key={s.id} className="cyber-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-[var(--neon-magenta)]/30">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic">{s.tricks?.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Current: LVL {s.tricks?.difficulty} ➡️ Suggested: <span className="text-[var(--neon-magenta)]">LVL {s.suggested_level}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleTrickSuggestion(s.id, "approved")} className="px-5 py-2.5 rounded-lg bg-[var(--neon-magenta)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[var(--neon-magenta)]/20">
                    Approve
                  </button>
                  <button onClick={() => handleTrickSuggestion(s.id, "rejected")} className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-all">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Database Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-black italic uppercase whitespace-nowrap">Master Database</h2>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="SEARCH BY NAME..." 
              value={searchQuery}
              onChange={(e) => setSearchSearchQuery(e.target.value)}
              className="flex-1 md:w-64 bg-black border border-white/10 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest focus:border-[var(--neon-cyan)] outline-none"
            />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="bg-black border border-white/10 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest focus:border-[var(--neon-cyan)] outline-none"
            >
              <option value="all">ALL SECTORS</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTricks.map((trick) => (
            <div key={trick.id} className={`cyber-card p-6 rounded-2xl transition-all ${editingId === trick.id ? "border-[var(--neon-cyan)] ring-1 ring-[var(--neon-cyan)]/50" : "hover:border-white/20"}`}>
              {editingId === trick.id ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Identification</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm font-black uppercase italic text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sector Assignment</label>
                      <select 
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value as any})}
                        className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm font-black uppercase text-white"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Threat Level</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <button 
                            key={lvl}
                            onClick={() => setEditForm({...editForm, difficulty: lvl})}
                            className={`w-10 h-10 rounded-lg font-black transition-all border ${editForm.difficulty === lvl ? "bg-[var(--neon-cyan)] text-black border-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]" : "bg-black text-slate-500 border-white/10 hover:border-white/30"}`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUpdate(trick.id, editForm)}
                        className="px-8 py-3 bg-[var(--neon-cyan)] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 shadow-lg shadow-[var(--neon-cyan)]/20"
                      >
                        Commit Changes
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-500 hover:text-white"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase italic group-hover:text-[var(--neon-cyan)] transition-colors">{trick.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{trick.category}</span>
                      <span className="text-[10px] font-black text-[var(--neon-cyan)] uppercase tracking-widest">LVL {trick.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingId(trick.id); setEditForm(trick); }}
                      className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--neon-cyan)] hover:text-black hover:border-[var(--neon-cyan)] transition-all"
                    >
                      Calibrate
                    </button>
                    <button 
                      onClick={() => handleDelete(trick.id)}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all"
                      title="Delete Entry"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { updateTrick, deleteTrick, handleTrickSuggestion, addTrick, handleNewTrickSuggestion, updateTrickOrder } from "@/lib/trick-actions";
import { SkateBagLogo } from "@/components/Logo";
import type { Trick, TrickCategory } from "@/lib/types";

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CATEGORIES: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill"
];

const LEVELS = [1, 2, 3, 4, 5];

interface AdminClientProps {
  initialTricks: Trick[];
  suggestions: any[];
  newTrickSuggestions: any[];
}

// Sortable Wrapper Component
function SortableTrickItem({ 
  trick, 
  onEdit, 
  onDelete,
  isEditing,
  editForm,
  setEditForm,
  onUpdate,
  onAbort
}: { 
  trick: Trick; 
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  editForm: any;
  setEditForm: any;
  onUpdate: () => void;
  onAbort: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: trick.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`cyber-card p-6 rounded-2xl transition-all relative group/sortable ${isEditing ? "border-[var(--board-accent)] ring-1 ring-[var(--board-accent)]/50" : "hover:border-[var(--board-accent)]/35"}`}>
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center cursor-grab active:cursor-grabbing z-30 transition-all bg-[var(--surface-muted)] rounded-l-xl border border-white/5 border-r-0 opacity-40 group-hover/sortable:opacity-100"
      >
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
            <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
            <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
            <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
          </div>
        </div>
      </div>

      {isEditing ? (
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
          
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-[var(--border)]">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Threat Level</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(lvl => (
                  <button 
                    key={lvl}
                    onClick={() => setEditForm({...editForm, difficulty: lvl})}
                    className={`w-10 h-10 rounded-lg font-black transition-all border ${editForm.difficulty === lvl ? "bg-[var(--board-accent)] text-black border-[var(--board-accent)] shadow-lg shadow-black/30" : "bg-black text-slate-500 border-[var(--border)] hover:border-[var(--board-accent)]/35"}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onUpdate}
                className="px-8 py-3 bg-[var(--board-accent)] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 shadow-lg shadow-black/30"
              >
                Commit Changes
              </button>
              <button 
                onClick={onAbort}
                className="px-8 py-3 bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-500 hover:text-white"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase italic group-hover/sortable:text-[var(--board-accent)] transition-colors">{trick.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-[var(--surface-muted)] px-2 py-0.5 rounded">{trick.category}</span>
              <span className="text-[10px] font-black text-[var(--board-accent)] uppercase tracking-widest">LVL {trick.difficulty}</span>
              {trick.sort_order && <span className="text-[9px] text-slate-700 font-bold tracking-tighter italic">ORDER: {trick.sort_order}</span>}
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={onEdit}
              className="px-5 py-2.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--board-accent)] hover:text-black hover:border-[var(--board-accent)] transition-all"
            >
              Calibrate
            </button>
            <button 
              onClick={onDelete}
              className="p-2.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-slate-500 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all"
              title="Delete Entry"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminClient({ initialTricks, suggestions, newTrickSuggestions: initialNewTrickSuggestions }: AdminClientProps) {
  const [tricks, setTricks] = useState<Trick[]>(initialTricks);
  const [newSugs, setNewSugs] = useState<any[]>(initialNewTrickSuggestions);
  const [filterCategory, setFilterCategory] = useState<TrickCategory | "all">("all");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");
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
  const [addError, setAddError] = useState<string | null>(null);

  // Sync state if initialTricks changes
  useEffect(() => {
    setTricks(initialTricks);
  }, [initialTricks]);

  const filteredTricks = useMemo(() => {
    return tricks
      .filter(t => {
        const matchesCategory = filterCategory === "all" || t.category === filterCategory;
        const matchesLevel = filterLevel === "all" || t.difficulty === filterLevel;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesLevel && matchesSearch;
      })
      .sort((a, b) => {
        const orderA = a.sort_order ?? 999999;
        const orderB = b.sort_order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        if (a.difficulty !== b.difficulty) return (a.difficulty ?? 0) - (b.difficulty ?? 0);
        return a.name.localeCompare(b.name);
      });
  }, [tricks, filterCategory, filterLevel, searchQuery]);

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
    setAddError(null);
    
    const res = await addTrick(addForm);
    if (res.success && res.data) {
      setTricks([res.data as Trick, ...tricks]);
      setShowAddForm(false);
      setAddForm({ name: "", category: "flatground", difficulty: 1, youtube_query: "" });
    } else {
      setAddError(res.error || "Failed to add trick");
    }
  }

  async function handleNewSug(id: string, status: 'approved' | 'rejected') {
    const res = await handleNewTrickSuggestion(id, status);
    if (res.success) {
      setNewSugs(newSugs.filter(s => s.id !== id));
    }
  }

  // DnD Handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredTricks.findIndex((t) => t.id === active.id);
      const newIndex = filteredTricks.findIndex((t) => t.id === over.id);

      const newFiltered = arrayMove(filteredTricks, oldIndex, newIndex);
      
      // Update local state immediately
      const updatedTricks = tricks.map(t => {
        const foundIndex = newFiltered.findIndex(nf => nf.id === t.id);
        if (foundIndex !== -1) {
          return { ...t, sort_order: foundIndex + 1 };
        }
        return t;
      });
      setTricks(updatedTricks);

      // Save to database
      await updateTrickOrder(active.id as string, newIndex + 1);
    }
  }

  // Dragging only makes sense when sorting a specific category/level view or the whole thing without search
  const isSortingEnabled = searchQuery === "";

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border)] pb-8">
        <div className="flex items-center gap-4">
          <SkateBagLogo size={48} className="shadow-lg shadow-black/30 transform -rotate-3" />
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Command Center</h1>
            <p className="text-[var(--board-accent)] text-xs font-black uppercase tracking-[0.3em] mt-2 text-glow">Database Integrity Manager</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 rounded-lg bg-[var(--board-accent)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/30"
          >
            {showAddForm ? "Cancel Add" : "Deploy New Trick"}
          </button>
          <a href="/" className="px-6 py-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-elevated)] transition-all">
            Exit
          </a>
        </div>
      </header>

      {/* Add Trick Form */}
      {showAddForm && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="cyber-card p-10 rounded-2xl border-[var(--board-accent)]/40 bg-[var(--board-accent)]/5">
            <h2 className="text-2xl font-black italic uppercase mb-8 text-[var(--board-accent)]">New Trick Deployment</h2>
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
                    className="w-full bg-black border border-white/20 rounded-lg px-6 py-4 text-sm font-black uppercase italic text-white focus:border-[var(--board-accent)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sector Assignment</label>
                  <select 
                    value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value as any})}
                    className="w-full bg-black border border-white/20 rounded-lg px-6 py-4 text-sm font-black uppercase text-white focus:border-[var(--board-accent)] outline-none transition-all"
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
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg px-6 py-4 text-sm font-black text-white focus:border-[var(--board-accent)] outline-none transition-all"
                  />
                </div>
              </div>

              {addError && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{addError}</p>}

              <div className="flex flex-wrap items-center justify-between gap-8 pt-6 border-t border-[var(--border)]">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Threat Level (Difficulty)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button 
                        key={lvl}
                        type="button"
                        onClick={() => setAddForm({...addForm, difficulty: lvl})}
                        className={`w-12 h-12 rounded-lg font-black transition-all border-2 ${addForm.difficulty === lvl ? "bg-[var(--board-accent)] text-black border-[var(--board-accent)] shadow-lg shadow-black/30" : "bg-black text-slate-500 border-[var(--border)] hover:border-[var(--board-accent)]/35"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  type="submit"
                  className="px-12 py-4 bg-[var(--board-accent)] text-black text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 shadow-lg shadow-black/30 active:scale-95 transition-all"
                >
                  Authorize Entry
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Incoming New Trick Suggestions */}
      {newSugs && newSugs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black italic uppercase text-[var(--board-accent)]">Missing Trick Suggestions</h2>
            <span className="bg-[var(--board-accent)] text-white text-[10px] font-black px-2 py-0.5 rounded-sm">{newSugs.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {newSugs.map((s: any) => (
              <div key={s.id} className="cyber-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-[var(--board-accent)]/30">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic">{s.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.category}</span>
                    {s.description && <span className="text-[10px] text-slate-600 italic">"{s.description}"</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setAddForm({ name: s.name, category: s.category as any, difficulty: 1, youtube_query: "" }); setShowAddForm(true); setEditingId(null); }} className="px-5 py-2.5 rounded-lg bg-[var(--board-accent)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/30">
                    Use Info
                  </button>
                  <button onClick={() => handleNewSug(s.id, "approved")} className="px-5 py-2.5 rounded-lg bg-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">
                    Mark Done
                  </button>
                  <button onClick={() => handleNewSug(s.id, "rejected")} className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions Section (Levels) */}
      {suggestions && suggestions.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black italic uppercase text-[#f59e0b]">Level Calibration Requests</h2>
            <span className="bg-[#f59e0b] text-white text-[10px] font-black px-2 py-0.5 rounded-sm">{suggestions.length}</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((s: any) => (
              <div key={s.id} className="cyber-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-[#f59e0b]/30">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic">{s.tricks?.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Current: LVL {s.tricks?.difficulty} ➡️ Suggested: <span className="text-[#f59e0b]">LVL {s.suggested_level}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleTrickSuggestion(s.id, "approved")} className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/30">
                    Approve
                  </button>
                  <button onClick={() => handleTrickSuggestion(s.id, "rejected")} className="px-5 py-2.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-all">
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
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-[var(--surface-muted)] p-6 rounded-2xl border border-[var(--border)]">
          <div className="space-y-1">
            <h2 className="text-xl font-black italic uppercase whitespace-nowrap">Master Database</h2>
            {isSortingEnabled && <p className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest animate-pulse">Drag handles to set learning order</p>}
          </div>
          
          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
            <input 
              type="text" 
              placeholder="SEARCH BY NAME..." 
              value={searchQuery}
              onChange={(e) => setSearchSearchQuery(e.target.value)}
              className="flex-1 md:w-48 bg-black border border-[var(--border)] rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:border-[var(--board-accent)] outline-none"
            />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="bg-black border border-[var(--border)] rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:border-[var(--board-accent)] outline-none"
            >
              <option value="all">ALL SECTORS</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="bg-black border border-[var(--border)] rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:border-[var(--board-accent)] outline-none"
            >
              <option value="all">ALL LEVELS</option>
              {LEVELS.map(lvl => <option key={lvl} value={lvl}>LEVEL {lvl}</option>)}
            </select>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 pb-20">
            <SortableContext
              items={filteredTricks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTricks.map((trick) => (
                <SortableTrickItem
                  key={trick.id}
                  trick={trick}
                  onEdit={() => { setEditingId(trick.id); setEditForm(trick); }}
                  onDelete={() => handleDelete(trick.id)}
                  isEditing={editingId === trick.id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onUpdate={() => handleUpdate(trick.id, editForm)}
                  onAbort={() => setEditingId(null)}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </section>
    </div>
  );
}

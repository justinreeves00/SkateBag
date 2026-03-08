"use client";

import { useState, useMemo, useEffect } from "react";
import { updateTrick, deleteTrick, handleTrickSuggestion, addTrick, handleNewTrickSuggestion, updateTrickOrder, updateTricksOrder } from "@/lib/trick-actions";
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

const CATEGORIES: { value: TrickCategory | "all"; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "flatground", label: "FLAT" },
  { value: "street", label: "STREET" },
  { value: "ledge/rail", label: "LEDGE/RAIL" },
  { value: "transition", label: "TRANNY" },
  { value: "gaps", label: "GAPS" },
  { value: "freestyle", label: "FREESTYLE" },
  { value: "downhill", label: "DOWNHILL" },
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
    <div ref={setNodeRef} style={style} className={`cyber-card p-6 rounded-2xl transition-all relative group/sortable ${isEditing ? "border-[var(--board-accent)] ring-1 ring-[var(--board-accent)]/50" : "hover:border-[var(--board-accent)]/35"}`} {...attributes}>
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        onClick={(e) => e.stopPropagation()}
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
                {CATEGORIES.filter(c => c.value !== 'all').map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
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
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
              className="p-2.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-slate-500 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all"
              title="Delete Entry"
              type="button"
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
    const trickToDelete = tricks.find(t => t.id === id);
    
    // Use setTimeout to ensure confirm happens outside of any event bubbling
    const confirmed = await new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(confirm(`CONFIRM DELETION: "${trickToDelete?.name}"?\n\nThis cannot be undone.`));
      }, 10);
    });
    
    if (!confirmed) return;
    
    console.log('Deleting trick:', id);
    const res = await deleteTrick(id);
    
    if (res.error) {
      alert(`DELETE FAILED: ${res.error}`);
      console.error('Delete failed:', res.error);
      return;
    }
    
    if (res.success) {
      setTricks(tricks.filter(t => t.id !== id));
      console.log('Trick deleted successfully');
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
      
      const bulkUpdates = newFiltered.map((t, idx) => ({
        id: t.id,
        sort_order: idx + 1
      }));

      const updatedTricks = tricks.map(t => {
        const update = bulkUpdates.find(u => u.id === t.id);
        if (update) return { ...t, sort_order: update.sort_order };
        return t;
      });
      setTricks(updatedTricks);

      await updateTricksOrder(bulkUpdates);
    }
  }

  // Dragging only makes sense when sorting a specific category/level view or the whole thing without search
  const isSortingEnabled = searchQuery === "";

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-40">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border)] pb-8">
        <div className="flex items-center gap-4">
          <SkateBagLogo size={48} className="shadow-lg shadow-black/30 transform -rotate-3" />
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Command Center</h1>
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

      {/* Add Trick Form (omitted for brevity, same as before) */}
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
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="px-12 py-4 bg-[var(--board-accent)] text-black text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 shadow-lg"
              >
                Authorize Entry
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Main Database Section */}
      <section className="space-y-8">
        <div className="space-y-6 bg-[var(--surface-muted)] p-8 rounded-3xl border border-[var(--border)]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black italic uppercase whitespace-nowrap text-white">Master Database</h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{filteredTricks.length} UNITS DETECTED</span>
                {isSortingEnabled && <span className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest animate-pulse border border-[var(--board-accent)]/30 px-2 py-0.5 rounded">Sorting Active</span>}
              </div>
            </div>
            
            <input 
              type="text" 
              placeholder="QUICK SEARCH..." 
              value={searchQuery}
              onChange={(e) => setSearchSearchQuery(e.target.value)}
              className="w-full lg:w-64 bg-black border border-[var(--border)] rounded-xl px-6 py-3.5 text-xs font-black uppercase tracking-widest focus:border-[var(--board-accent)] outline-none"
            />
          </div>

          <div className="space-y-6 pt-4 border-t border-white/5">
            {/* Category Tabs */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Sector Filter</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      filterCategory === cat.value
                        ? "bg-[var(--board-accent)] text-black border-[var(--board-accent)] shadow-lg scale-105"
                        : "bg-black/40 text-slate-500 border-white/5 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Tabs */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Threat Level Filter</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterLevel("all")}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    filterLevel === "all"
                      ? "bg-white text-black border-white shadow-lg scale-105"
                      : "bg-black/40 text-slate-500 border-white/5 hover:border-white/10 hover:text-white"
                  }`}
                >
                  ALL LEVELS
                </button>
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`w-12 h-10 rounded-xl text-xs font-black uppercase transition-all border ${
                      filterLevel === lvl
                        ? "bg-[var(--board-accent)] text-black border-[var(--board-accent)] shadow-lg scale-110"
                        : "bg-black/40 text-slate-500 border-white/5 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4">
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

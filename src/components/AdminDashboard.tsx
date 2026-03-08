"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { updateTrick, deleteTrick, addTrick, updateTricksOrder } from "@/lib/trick-actions";
import { SkateBagLogo } from "@/components/Logo";
import type { Trick, TrickCategory } from "@/lib/types";

// DnD Kit imports - isolated to drag handle only
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

interface AdminDashboardProps {
  initialTricks: Trick[];
  suggestions: any[];
  newTrickSuggestions: any[];
}

// Sortable Trick Item Component
function SortableTrickRow({ 
  trick, 
  onEdit, 
  onSave,
  onCancel,
  isEditing,
  editData,
  setEditData,
  onDeleteClick
}: { 
  trick: Trick; 
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  editData: any;
  setEditData: any;
  onDeleteClick: () => void;
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
    <div ref={setNodeRef} style={style} className={`grid grid-cols-12 gap-4 items-center p-4 rounded-xl transition-all ${isEditing ? "bg-[var(--board-accent)]/10 border border-[var(--board-accent)]" : "bg-[var(--surface)] border border-white/5"} ${isDragging ? "opacity-50" : ""}`}>
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="col-span-1 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <div className="flex flex-col gap-0.5">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
              <div className="w-1 h-1 rounded-full bg-[var(--board-accent)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Trick Name / Edit Input */}
      <div className="col-span-5">
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm font-black text-white"
          />
        ) : (
          <h3 className="text-lg font-black uppercase italic text-white">{trick.name}</h3>
        )}
      </div>

      {/* Category */}
      <div className="col-span-2">
        {isEditing ? (
          <select
            value={editData.category}
            onChange={(e) => setEditData({...editData, category: e.target.value})}
            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-xs font-black text-white"
          >
            {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--surface-muted)] px-2 py-1 rounded">{trick.category}</span>
        )}
      </div>

      {/* Level */}
      <div className="col-span-2">
        {isEditing ? (
          <select
            value={editData.difficulty}
            onChange={(e) => setEditData({...editData, difficulty: parseInt(e.target.value)})}
            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-xs font-black text-white"
          >
            {LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-black text-[var(--board-accent)] uppercase tracking-widest">LVL {trick.difficulty}</span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex gap-2 justify-end">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-[var(--board-accent)] text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-[var(--surface-muted)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest rounded-lg text-slate-500 hover:text-white transition-all"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-[var(--surface-muted)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[var(--board-accent)] hover:text-black hover:border-[var(--board-accent)] transition-all"
            >
              Edit
            </button>
            <button
              onClick={onDeleteClick}
              className="p-2 bg-[var(--surface-muted)] border border-[var(--border)] text-slate-500 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all rounded-lg"
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ initialTricks, suggestions, newTrickSuggestions }: AdminDashboardProps) {
  const [tricks, setTricks] = useState<Trick[]>(initialTricks);
  const [filterCategory, setFilterCategory] = useState<TrickCategory | "all">("all");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<{ name: string, category: TrickCategory, difficulty: number, youtube_query: string }>({
    name: "",
    category: "flatground",
    difficulty: 1,
    youtube_query: ""
  });
  
  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add form state
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  function handleEdit(trick: Trick) {
    setEditingId(trick.id);
    setEditData({
      name: trick.name,
      category: trick.category,
      difficulty: trick.difficulty,
      youtube_query: trick.youtube_query || ""
    });
  }

  async function handleSave(trick: Trick) {
    const res = await updateTrick(trick.id, editData);
    if (res.success) {
      setTricks(tricks.map(t => t.id === trick.id ? { ...t, ...editData } : t));
      setEditingId(null);
    }
  }

  function handleDeleteClick(id: string) {
    setDeleteConfirmId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    const res = await deleteTrick(deleteConfirmId);
    if (res.success) {
      setTricks(tricks.filter(t => t.id !== deleteConfirmId));
    }
    setIsDeleting(false);
    setDeleteConfirmId(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    setIsAdding(true);
    setAddError(null);
    
    const res = await addTrick(addForm);
    if (res.success && res.data) {
      setTricks([res.data as Trick, ...tricks]);
      setShowAddForm(false);
      setAddForm({ name: "", category: "flatground", difficulty: 1, youtube_query: "" });
    } else {
      setAddError(res.error || "Failed to add trick");
    }
    setIsAdding(false);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
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

      {/* Add Trick Form */}
      {showAddForm && (
        <div className="cyber-card p-10 rounded-2xl border-[var(--board-accent)]/40 bg-[var(--board-accent)]/5 animate-in fade-in slide-in-from-top-4 duration-300">
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
                  {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Threat Level</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(lvl => (
                  <button 
                    key={lvl}
                    type="button"
                    onClick={() => setAddForm({...addForm, difficulty: lvl})}
                    className={`w-12 h-12 rounded-lg font-black transition-all border ${addForm.difficulty === lvl ? "bg-[var(--board-accent)] text-black border-[var(--board-accent)] shadow-lg scale-110" : "bg-black text-slate-500 border-[var(--border)] hover:border-[var(--board-accent)]/35"}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            {addError && <p className="text-red-500 text-sm font-black uppercase">{addError}</p>}
            <button 
              type="submit"
              disabled={isAdding}
              className="px-12 py-4 bg-[var(--board-accent)] text-black text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 shadow-lg disabled:opacity-50"
            >
              {isAdding ? "Deploying..." : "Authorize Entry"}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="cyber-card p-8 rounded-2xl border border-[var(--border)] space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase whitespace-nowrap text-white">Master Database</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{filteredTricks.length} UNITS DETECTED</span>
            </div>
          </div>
          <input 
            type="text" 
            placeholder="QUICK SEARCH..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full lg:w-64 bg-black border border-[var(--border)] rounded-xl px-6 py-3.5 text-xs font-black uppercase tracking-widest focus:border-[var(--board-accent)] outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-3 pt-4 border-t border-white/5">
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

        {/* Level Filter */}
        <div className="space-y-3 pt-4 border-t border-white/5">
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

      {/* Trick List with DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredTricks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filteredTricks.map((trick) => (
              <SortableTrickRow
                key={trick.id}
                trick={trick}
                onEdit={() => handleEdit(trick)}
                onSave={() => handleSave(trick)}
                onCancel={() => setEditingId(null)}
                isEditing={editingId === trick.id}
                editData={editData}
                setEditData={setEditData}
                onDeleteClick={() => handleDeleteClick(trick.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Delete Confirmation Modal - Rendered via Portal */}
      {deleteConfirmId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="cyber-card p-8 rounded-2xl max-w-md w-full border border-red-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic text-red-500">Confirm Deletion</h3>
                <p className="text-[var(--text-muted)] text-sm">
                  Are you sure you want to delete "<span className="text-white font-black">{tricks.find(t => t.id === deleteConfirmId)?.name}</span>"?
                </p>
                <p className="text-red-500 text-xs font-black uppercase tracking-widest">This cannot be undone.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-elevated)] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 rounded-lg bg-red-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

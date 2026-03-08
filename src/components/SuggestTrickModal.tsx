"use client";

import { useState } from "react";
import { submitUserTrick } from "@/lib/trick-actions";

interface SuggestTrickModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedTrickName?: string;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "flatground", label: "Flatground" },
  { value: "street", label: "Street" },
  { value: "ledge/rail", label: "Ledge/Rail" },
  { value: "transition", label: "Transition" },
  { value: "gaps", label: "Gaps" },
  { value: "freestyle", label: "Freestyle" },
  { value: "downhill", label: "Downhill" },
];

export default function SuggestTrickModal({ isOpen, onClose, suggestedTrickName }: SuggestTrickModalProps) {
  const [name, setName] = useState(suggestedTrickName || "");
  const [category, setCategory] = useState("flatground");
  const [difficulty, setDifficulty] = useState(1);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const res = await submitUserTrick({
      name: name.trim(),
      category,
      difficulty,
      description: description.trim() || undefined
    });
    
    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setCategory("flatground");
        setDifficulty(1);
        setDescription("");
        onClose();
      }, 2000);
    } else {
      setError(res.error || "Failed to submit trick");
    }
    setIsSubmitting(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="cyber-card p-8 rounded-2xl max-w-lg w-full border border-[var(--board-accent)]/30" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500">
                <path d="M20 6L9 17L4 12"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black uppercase italic text-white">Trick Submitted!</h3>
            <p className="text-sm text-[var(--text-muted)] font-black">
              Thanks for contributing! Your trick will be reviewed and added to the database.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-black uppercase italic text-white">Suggest a Trick</h2>
              <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest">
                {suggestedTrickName ? `Suggest "${suggestedTrickName}"` : "Can't find the trick you're looking for?"}
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-yellow-500 shrink-0 mt-0.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4"/><path d="M12 16h.01"/>
                </svg>
                <div className="space-y-2">
                  <p className="text-xs text-yellow-500 font-black uppercase tracking-widest">
                    Community-Wide Impact
                  </p>
                  <p className="text-[10px] text-yellow-500/80 font-medium leading-relaxed">
                    The difficulty level you set will apply to <span className="font-black text-yellow-500">ALL users</span> of SkateBag. Please be mindful and choose a level that reflects the trick's actual difficulty for the average skater.
                  </p>
                  <p className="text-[10px] text-yellow-500/80 font-medium leading-relaxed">
                    Your submission will be <span className="font-black text-green-500">live immediately</span> but may be removed or edited after admin review.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trick Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. KICKFLIP"
                  required
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm font-black uppercase text-white focus:border-[var(--board-accent)] outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm font-black uppercase text-white focus:border-[var(--board-accent)] outline-none transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Difficulty Level</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 h-12 rounded-lg font-black transition-all border ${
                        difficulty === lvl
                          ? "bg-[var(--board-accent)] text-black border-[var(--board-accent)] shadow-lg"
                          : "bg-black text-slate-500 border-[var(--border)] hover:border-[var(--board-accent)]/35"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional details about this trick..."
                  rows={3}
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-[var(--board-accent)] outline-none transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-black uppercase">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-elevated)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1 px-6 py-3 rounded-lg bg-[var(--board-accent)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Trick'}
                </button>
              </div>

              <p className="text-[9px] text-slate-600 font-black text-center">
                Your submission will be reviewed before being permanently added to the database.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

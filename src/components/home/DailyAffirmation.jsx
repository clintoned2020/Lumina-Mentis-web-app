import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Bookmark, BookmarkCheck, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 30 built-in affirmations — one is deterministically picked per calendar day
const DEFAULT_AFFIRMATIONS = [
  "You are worthy of love, rest, and healing — exactly as you are today.",
  "Every small step forward is still progress. You are doing enough.",
  "Your feelings are valid. You don't have to justify them to anyone.",
  "Healing is not linear, and that's okay. Be gentle with yourself.",
  "You have survived every difficult day so far. Today is no different.",
  "You are allowed to take up space, set boundaries, and say no.",
  "Growth happens in the quiet moments when no one is watching.",
  "You deserve the same compassion you freely give to others.",
  "Your mind is learning and adapting. Trust the process.",
  "Rest is productive. Slowing down is not giving up.",
  "You are more resilient than you realize.",
  "It's okay to not have everything figured out right now.",
  "Your story is still being written. The best chapters may be ahead.",
  "You are not your worst day, your worst thought, or your worst mistake.",
  "Asking for help is a sign of strength, not weakness.",
  "You bring something unique and irreplaceable into the world.",
  "Peace is available to you, even in the middle of the storm.",
  "Small joys are still joys. Notice them today.",
  "You are capable of handling what comes your way.",
  "Being kind to yourself is the foundation of everything else.",
  "Today, you don't have to be perfect — just present.",
  "Your sensitivity is a superpower, not a flaw.",
  "You are allowed to feel hopeful, even when things are hard.",
  "Every breath is a new moment to begin again.",
  "You matter deeply to people whose names you may not even know.",
  "Courage doesn't mean fearless — it means moving forward anyway.",
  "You are enough — not someday, not when things are better. Now.",
  "Your mental health is worth every effort you put into it.",
  "The fact that you keep going is extraordinary.",
  "Today is a chance to be a little kinder to yourself than yesterday.",
];

function getTodayAffirmation(pool) {
  if (!pool.length) {
    return { text: 'You are worthy of care and compassion today.', date: new Date().toISOString().slice(0, 10) };
  }
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  // Simple deterministic index: sum of date digits mod array length
  const seed = today.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c), 0);
  return { text: pool[seed % pool.length], date: today };
}

export default function DailyAffirmation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(null); // null = not saved, object = saved record
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customAffirmations, setCustomAffirmations] = useState([]);

  const affirmationPool = useMemo(() => {
    const all = [...DEFAULT_AFFIRMATIONS, ...customAffirmations];
    return Array.from(new Set(all.map((v) => String(v || '').trim()).filter(Boolean)));
  }, [customAffirmations]);

  const { text, date } = getTodayAffirmation(affirmationPool);

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        try {
          const customPool = await base44.entities.DailyAffirmation.filter({ is_active: true }, '-created_date', 300);
          setCustomAffirmations(customPool.map((item) => item.text));
        } catch {
          // If table is not yet migrated, quietly fall back to built-in affirmations.
          setCustomAffirmations([]);
        }
        if (u) {
          // Check if today's affirmation is already saved
          const results = await base44.entities.SavedAffirmation.filter({
            user_email: u.email,
            date,
          });
          setSaved(results[0] || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date]);

  const handleToggleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      if (saved) {
        await base44.entities.SavedAffirmation.delete(saved.id);
        setSaved(null);
      } else {
        const created = await base44.entities.SavedAffirmation.create({
          user_email: user.email,
          text,
          date,
        });
        setSaved(created);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 flex items-center justify-center min-h-[140px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSaved = !!saved;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Daily Affirmation</span>
        </div>
        <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>

      {/* Affirmation text */}
      <blockquote className="font-heading text-xl lg:text-2xl leading-snug text-foreground mb-5">
        "{text}"
      </blockquote>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {user ? (
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isSaved ? 'Saved' : 'Save affirmation'}
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => navigate('/affirmations')}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View gallery <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
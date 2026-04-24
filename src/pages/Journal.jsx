import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Lock, TrendingUp, Smile, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import JournalEntryForm from '@/components/journal/JournalEntryForm';
import MoodTrendChart from '@/components/journal/MoodTrendChart';
import { MOODS } from '@/components/journal/MoodPicker';

const today = () => new Date().toISOString().split('T')[0];

export default function Journal() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries', user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ user_email: user.email }, '-date', 60),
    enabled: !!user,
  });

  const todayEntry = entries.find(e => e.date === today());
  const avgMood = entries.length
    ? (entries.reduce((s, e) => s + (e.mood || 0), 0) / entries.length).toFixed(1)
    : null;
  const avgEnergy = entries.length
    ? (entries.reduce((s, e) => s + (e.energy || 0), 0) / entries.length).toFixed(1)
    : null;
  const currentMood = MOODS.find(m => m.score === todayEntry?.mood);

  const handleSubmit = async (form) => {
    setSaving(true);
    const data = { ...form, user_email: user.email };
    if (editingEntry) {
      await base44.entities.JournalEntry.update(editingEntry.id, data);
    } else {
      await base44.entities.JournalEntry.create(data);
    }
    setSaving(false);
    setShowForm(false);
    setEditingEntry(null);
    queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (entry) => {
    await base44.entities.JournalEntry.delete(entry.id);
    queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Journal</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 border border-border/50">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Private</span>
                </div>
              </div>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-4">
              Daily Reflections
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              A private, safe space to track your mood, reflect on your day, and witness your personal growth over time. Only you can see your entries.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-16 space-y-8">

          {/* Stats row */}
          {entries.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border/60 rounded-2xl p-5 text-center">
                <BookOpen className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Entries</p>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl p-5 text-center">
                <Smile className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {avgMood ? `${avgMood}/5` : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Mood</p>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl p-5 text-center">
                <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {avgEnergy ? `${avgEnergy}/5` : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Energy</p>
              </div>
            </div>
          )}

          {/* Mood trend chart */}
          {entries.length >= 2 && (
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Mood & Energy Trend (last 30 days)</h3>
                <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-1 bg-primary rounded inline-block" /> Mood</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 bg-accent rounded inline-block" /> Energy</span>
                </div>
              </div>
              <MoodTrendChart entries={entries} />
            </div>
          )}

          {/* Today's status */}
          {!showForm && (
            <div className={`flex items-center justify-between p-5 rounded-2xl border ${
              todayEntry
                ? 'bg-secondary/20 border-secondary/40'
                : 'bg-primary/5 border-primary/20'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{todayEntry ? (currentMood?.emoji || '📓') : '📓'}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {todayEntry ? "Today's entry logged" : "No entry yet today"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {todayEntry
                      ? `Feeling ${todayEntry.mood_label} · Energy ${todayEntry.energy}/5`
                      : 'Take a moment to check in with yourself'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={todayEntry ? 'outline' : 'default'}
                onClick={() => {
                  if (todayEntry) handleEdit(todayEntry);
                  else { setEditingEntry(null); setShowForm(true); }
                }}
              >
                {todayEntry ? 'Edit' : 'Write Now'}
              </Button>
            </div>
          )}

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <JournalEntryForm
                entry={editingEntry}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingEntry(null); }}
                loading={saving}
              />
            )}
          </AnimatePresence>

          {/* Add new (past entry) */}
          {!showForm && entries.length > 0 && (
            <Button
              variant="outline"
              className="w-full rounded-2xl h-11 border-dashed text-sm"
              onClick={() => { setEditingEntry(null); setShowForm(true); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a Past Entry
            </Button>
          )}

          {/* Entries list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />)}
            </div>
          ) : entries.length === 0 && !showForm ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4 text-3xl">📓</div>
              <h3 className="font-heading text-2xl mb-2">Your journal awaits</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Begin your first entry. Reflect on today — your mood, what happened, and what you're grateful for.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Write First Entry
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Privacy note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your journal entries are private and stored securely. They are never shared with other users or visible on the community forum. Only you can access your reflections.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
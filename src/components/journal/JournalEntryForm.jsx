import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import MoodPicker from './MoodPicker';

const ENERGY_LABELS = ['', 'Very Low', 'Low', 'Moderate', 'High', 'Very High'];

export default function JournalEntryForm({ entry, onSubmit, onCancel, loading }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(entry || {
    date: today, mood: null, mood_label: '', energy: 3,
    reflection: '', gratitude: '', intentions: '', tags: [], is_private: true
  });
  const [tagInput, setTagInput] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border/60 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-xl">{entry ? 'Edit Entry' : "Today's Journal"}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your entries are private and visible only to you 🔒</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Date */}
        {entry && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
            <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="max-w-xs" />
          </div>
        )}

        {/* Mood */}
        <MoodPicker
          value={form.mood}
          onChange={(score, label) => { set('mood', score); set('mood_label', label); }}
        />

        {/* Energy */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Energy Level: <span className="text-foreground">{ENERGY_LABELS[form.energy]}</span></p>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => set('energy', n)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.energy === n
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/50 bg-background text-muted-foreground hover:border-border'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Reflection ✍️</label>
          <Textarea
            placeholder="How was your day? What's on your mind?"
            value={form.reflection}
            onChange={e => set('reflection', e.target.value)}
            className="h-28 resize-none text-sm"
          />
        </div>

        {/* Gratitude */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gratitude 🙏 <span className="italic">(optional)</span></label>
          <Textarea
            placeholder="What are you grateful for today?"
            value={form.gratitude}
            onChange={e => set('gratitude', e.target.value)}
            className="h-20 resize-none text-sm"
          />
        </div>

        {/* Intentions */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Intentions for tomorrow 🌱 <span className="italic">(optional)</span></label>
          <Textarea
            placeholder="What do you want to carry forward?"
            value={form.intentions}
            onChange={e => set('intentions', e.target.value)}
            className="h-20 resize-none text-sm"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tags</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag (e.g. anxiety, sleep)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="text-sm"
            />
            <Button variant="outline" size="icon" onClick={addTag}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
           <Button variant="outline" onClick={onCancel}>Cancel</Button>
           <Button 
             disabled={!form.mood || loading} 
             onClick={() => {
               if (navigator.vibrate) navigator.vibrate(10);
               onSubmit(form);
             }}
           >
             {loading ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
           </Button>
         </div>
      </div>
    </motion.div>
  );
}
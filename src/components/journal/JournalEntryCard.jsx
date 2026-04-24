import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Pencil, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOODS } from './MoodPicker';
import { format } from 'date-fns';

export default function JournalEntryCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const mood = MOODS.find(m => m.score === entry.mood);
  const energy = entry.energy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/20 transition-all"
    >
      <div
        className="flex items-center gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Mood emoji */}
        <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center flex-shrink-0 text-2xl">
          {mood?.emoji || '📓'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-foreground">
              {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
            </span>
            <Lock className="w-3 h-3 text-muted-foreground/50" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {mood && (
              <Badge variant="outline" className="text-xs capitalize">{mood.emoji} {mood.label}</Badge>
            )}
            {energy && (
              <Badge variant="secondary" className="text-xs">⚡ Energy {energy}/5</Badge>
            )}
            {entry.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">#{tag}</Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={e => { e.stopPropagation(); onEdit(entry); }}>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={e => { e.stopPropagation(); onDelete(entry); }}>
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-5 pb-5 border-t border-border/40 pt-4 space-y-4"
        >
          {entry.reflection && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reflection</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.reflection}</p>
            </div>
          )}
          {entry.gratitude && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gratitude 🙏</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.gratitude}</p>
            </div>
          )}
          {entry.intentions && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intentions 🌱</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.intentions}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
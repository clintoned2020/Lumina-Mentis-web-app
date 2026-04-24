import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REASONS = ['harmful', 'misinformation', 'spam', 'harassment', 'other'];

export default function FlagButton({ currentUser, contentType, contentId, contentPreview }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('other');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!currentUser || done) return done ? (
    <span className="text-xs text-muted-foreground">Flagged</span>
  ) : null;

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.ContentFlag.create({
      reporter_email: currentUser.email,
      content_type: contentType,
      content_id: contentId,
      content_preview: contentPreview?.slice(0, 200) || '',
      reason,
      details,
      status: 'pending',
    });
    setDone(true);
    setOpen(false);
    setSubmitting(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        title="Flag content"
      >
        <Flag className="w-3 h-3" />
        Flag
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-30 w-64 p-4 rounded-2xl border border-border/60 bg-card shadow-xl">
          <p className="text-sm font-semibold mb-3">Report Content</p>
          <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {REASONS.map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className={`text-xs px-2.5 py-1 rounded-full capitalize transition-all ${
                    reason === r ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="Additional context (optional)"
              rows={2}
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="destructive" disabled={submitting} className="text-xs">
                {submitting ? 'Sending...' : 'Submit Report'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)} className="text-xs">Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
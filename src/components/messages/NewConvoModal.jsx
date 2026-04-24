import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Search } from 'lucide-react';

export default function NewConvoModal({ open, onClose, onStart, currentUserEmail }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    // Filter UserProfile by display_name or user_email containing query
    const profiles = await base44.entities.UserProfile.list('-created_date', 50);
    const q = query.toLowerCase();
    setResults(
      profiles.filter(p =>
        p.user_email !== currentUserEmail &&
        (p.display_name?.toLowerCase().includes(q) || p.user_email?.toLowerCase().includes(q))
      )
    );
    setSearching(false);
  }

  function handleSelect(profile) {
    onStart(profile.user_email, profile.display_name, profile.avatar_color);
    onClose();
    setQuery('');
    setResults([]);
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button type="submit" size="sm" disabled={searching}>
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="space-y-1 max-h-60 overflow-y-auto mt-1">
          {results.length === 0 && query && !searching && (
            <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
          )}
          {results.map(p => (
            <button
              key={p.user_email}
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary-foreground"
                style={{ backgroundColor: p.avatar_color || '#a78bfa' }}>
                {(p.display_name || p.user_email)[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{p.display_name || p.user_email.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{p.user_email}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Direct email fallback */}
        <div className="pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground mb-2">Or message by exact email:</p>
          <form onSubmit={e => {
            e.preventDefault();
            const email = e.target.email.value.trim();
            if (email && email !== currentUserEmail) {
              onStart(email, null, null);
              onClose();
            }
          }} className="flex gap-2">
            <input
              name="email"
              placeholder="user@email.com"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button type="submit" size="sm" variant="outline">Go</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
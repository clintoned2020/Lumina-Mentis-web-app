import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

const AVATAR_COLORS = [
  '#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fb923c', '#facc15', '#38bdf8', '#c084fc'
];

export default function UsernameSetupModal({ user, onComplete }) {
  const [username, setUsername] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const clean = username.trim().replace(/\s+/g, '_').toLowerCase();
    if (!clean || clean.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(clean)) {
      setError('Only letters, numbers, and underscores are allowed.');
      return;
    }
    setSaving(true);
    // Check if profile already exists
    const existing = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (existing.length > 0) {
      await base44.entities.UserProfile.update(existing[0].id, { username: clean, avatar_color: avatarColor });
    } else {
      await base44.entities.UserProfile.create({
        user_email: user.email,
        username: clean,
        display_name: user.full_name || '',
        avatar_color: avatarColor,
      });
    }
    setSaving(false);
    onComplete(clean);
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-md rounded-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="font-heading text-xl">Welcome to Lumina Mentis!</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose a username to get started. This is how others will see you in the community.
          </p>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Username */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Username</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">@</span>
              <Input
                placeholder="calmseeker"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="rounded-xl"
                maxLength={24}
              />
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            <p className="text-xs text-muted-foreground mt-1">Letters, numbers, and underscores only.</p>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="text-sm font-medium mb-2 block">Pick an avatar color</label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${avatarColor === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {(username || user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.full_name || 'Your Name'}</p>
              <p className="text-xs text-muted-foreground">@{username || 'username'}</p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl">
            {saving ? 'Saving...' : 'Get Started'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
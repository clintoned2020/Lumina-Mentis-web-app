import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Check, Trash2 } from 'lucide-react';
import AvatarEditor from '@/components/profile/AvatarEditor';

const AVATAR_COLORS = [
  '#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fb923c', '#facc15', '#38bdf8', '#c084fc'
];

export default function ProfileSettingsModal({ user, onClose, onSaved }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    joined_label: '',
    avatar_color: '#a78bfa',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const userEmail = user?.email;

  useEffect(() => {
    if (!userEmail) return;
    base44.entities.UserProfile.filter({ user_email: userEmail }).then(profiles => {
      const p = profiles[0];
      setProfile(p || null);
      if (p) {
        setForm({
          username: p.username || '',
          display_name: p.display_name || user.full_name || '',
          bio: p.bio || '',
          location: p.location || '',
          website: p.website || '',
          joined_label: p.joined_label || '',
          avatar_color: p.avatar_color || '#a78bfa',
          avatar_url: p.avatar_url || '',
        });
        setInterests(Array.isArray(p.interests) ? p.interests : []);
      } else {
        setForm(f => ({ ...f, display_name: user.full_name || '' }));
      }
    }).catch(() => {});
  }, [userEmail]); // Stable: avoid wiping edits when AuthContext refreshes the user object reference

  const handleSave = async () => {
    const cleanUsername = form.username.trim().replace(/\s+/g, '_').toLowerCase();
    if (cleanUsername && cleanUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    if (cleanUsername && !/^[a-z0-9_]+$/.test(cleanUsername)) {
      setUsernameError('Only letters, numbers, and underscores are allowed.');
      return;
    }
    setUsernameError('');
    setSaveError('');
    setSaving(true);
    try {
      const normalizedUsername = cleanUsername || null;
      const patch = {
        username: normalizedUsername,
        display_name: (form.display_name || '').trim() || null,
        bio: (form.bio || '').trim() || null,
        location: (form.location || '').trim() || null,
        website: (form.website || '').trim() || null,
        joined_label: (form.joined_label || '').trim() || null,
        avatar_color: form.avatar_color || '#a78bfa',
        avatar_url: (form.avatar_url || '').trim() || null,
        interests: Array.isArray(interests) ? interests : [],
      };
      let row;
      if (profile) {
        row = await base44.entities.UserProfile.update(profile.id, patch);
      } else {
        row = await base44.entities.UserProfile.create({
          ...patch,
          user_email: user.email,
        });
      }
      setProfile(row || null);
      if (row) {
        setForm({
          username: row.username || '',
          display_name: row.display_name || user.full_name || '',
          bio: row.bio || '',
          location: row.location || '',
          website: row.website || '',
          joined_label: row.joined_label || '',
          avatar_color: row.avatar_color || '#a78bfa',
          avatar_url: row.avatar_url || '',
        });
        setInterests(Array.isArray(row.interests) ? row.interests : []);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved(row);
    } catch (e) {
      console.error('Profile save failed:', e);
      setSaveError(e?.message || 'Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  function addInterest(e) {
    e.preventDefault();
    const val = interestInput.trim();
    if (val && !interests.includes(val)) {
      setInterests(prev => [...prev, val]);
    }
    setInterestInput('');
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="font-heading text-xl">Profile Settings</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">Update your public profile information.</p>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Avatar */}
          <AvatarEditor form={form} setForm={setForm} displayName={form.display_name || user?.full_name || 'U'} />

          {/* Avatar Color */}
          <div>
            <label className="text-sm font-medium mb-2 block">Avatar Color</label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, avatar_color: color }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.avatar_color === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Username</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">@</span>
              <Input
                placeholder="calmseeker"
                value={form.username}
                onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setUsernameError(''); }}
                className="rounded-xl"
                maxLength={24}
              />
            </div>
            {usernameError && <p className="text-xs text-destructive mt-1">{usernameError}</p>}
          </div>

          {/* Display Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Display Name</label>
            <Input
              placeholder="Your name"
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="rounded-xl"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tagline</label>
            <Input
              placeholder="e.g. Here to learn and grow"
              value={form.joined_label}
              onChange={e => setForm(f => ({ ...f, joined_label: e.target.value }))}
              className="rounded-xl"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <textarea
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Short bio shown on your profile..."
              rows={3}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            />
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location</label>
              <Input
                placeholder="📍 City, Country"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Website</label>
              <Input
                placeholder="🔗 https://..."
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Interests</label>
            <form onSubmit={addInterest} className="flex gap-2 mb-2">
              <Input
                placeholder="Add a topic & press Enter"
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                className="rounded-xl"
              />
              <Button type="submit" size="sm" variant="outline">Add</Button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {interests.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                  #{tag}
                  <button type="button" onClick={() => setInterests(prev => prev.filter(i => i !== tag))} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Account Info (read-only) */}
          <div className="p-3 bg-muted/40 rounded-xl text-sm">
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Account</p>
            <p className="text-foreground">{user?.full_name}</p>
            <p className="text-muted-foreground text-xs">{user?.email}</p>
          </div>

          {saveError && (
            <p className="text-xs text-destructive">{saveError}</p>
          )}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl">
              {saved ? <><Check className="w-4 h-4 mr-1" />Saved!</> : saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          </div>

          {/* Delete Account */}
          <div className="border-t border-border/50 pt-5 mt-2">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete my account
              </button>
            ) : (
              <div className="space-y-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                <p className="text-sm font-semibold text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  This will permanently delete your profile and all your data. Type <strong className="text-foreground">DELETE</strong> to confirm.
                </p>
                <Input
                  placeholder="Type DELETE to confirm"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  className="rounded-xl border-destructive/40 text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteInput !== 'DELETE' || deleting}
                    className="rounded-xl"
                    onClick={async () => {
                      setDeleting(true);
                      if (profile) await base44.entities.UserProfile.delete(profile.id);
                      base44.auth.logout('/');
                    }}
                  >
                    {deleting ? 'Deleting...' : 'Permanently Delete'}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
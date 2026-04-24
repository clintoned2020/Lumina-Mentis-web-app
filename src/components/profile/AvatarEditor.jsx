import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AVATAR_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#f87171', '#fbbf24', '#f472b6', '#818cf8', '#fb923c', '#2dd4bf'];

const AVATAR_LIBRARY = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina5',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina6',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina7',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lumina8',
];

export default function AvatarEditor({ form, setForm, displayName }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('color'); // 'color' | 'library' | 'upload'

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, avatar_url: file_url }));
    setUploading(false);
  }

  const avatarColor = form.avatar_color || '#a78bfa';
  const avatarUrl = form.avatar_url;

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: avatarUrl ? 'transparent' : avatarColor }}
        >
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : displayName[0]?.toUpperCase()
          }
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Avatar</p>
          <p className="text-xs text-muted-foreground">Upload a photo, pick from library, or choose a color</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {[['color', 'Color'], ['library', 'Library'], ['upload', 'Upload']].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${tab === key ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'color' && (
        <div className="flex gap-2 flex-wrap">
          {AVATAR_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setForm(f => ({ ...f, avatar_color: c, avatar_url: '' }))}
              className={`w-11 h-11 rounded-xl transition-transform ${form.avatar_color === c && !form.avatar_url ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      )}

      {tab === 'library' && (
        <div className="grid grid-cols-4 gap-2">
          {AVATAR_LIBRARY.map(url => (
            <button
              key={url}
              type="button"
              onClick={() => setForm(f => ({ ...f, avatar_url: url }))}
              className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${form.avatar_url === url ? 'border-primary scale-105' : 'border-transparent hover:border-border'}`}
            >
              <img src={url} alt="avatar option" className="w-full h-full object-cover bg-muted" />
            </button>
          ))}
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 transition-colors text-sm text-muted-foreground hover:text-foreground w-full justify-center"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Choose a photo'}
          </button>
          {form.avatar_url && !AVATAR_LIBRARY.includes(form.avatar_url) && (
            <p className="text-xs text-primary mt-1.5">Custom photo selected ✓</p>
          )}
        </div>
      )}
    </div>
  );
}
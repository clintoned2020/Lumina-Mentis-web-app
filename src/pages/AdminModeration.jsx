import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Flag, Users, Eye, EyeOff, Ban, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const TABS = ['flags', 'threads', 'users'];

export default function AdminModeration() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState('flags');
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: flags = [] } = useQuery({
    queryKey: ['content-flags'],
    queryFn: () => base44.entities.ContentFlag.list('-created_date', 100),
    enabled: currentUser?.role === 'admin',
  });

  const { data: threads = [] } = useQuery({
    queryKey: ['forum-threads-admin'],
    queryFn: () => base44.entities.ForumThread.list('-created_date', 100),
    enabled: currentUser?.role === 'admin',
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles-admin'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: currentUser?.role === 'admin',
  });

  if (!currentUser) return null;
  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">Admin access required.</p>
          <Link to="/forum" className="text-primary text-sm hover:underline mt-2 block">← Back to Forum</Link>
        </div>
      </div>
    );
  }

  const pendingFlags = flags.filter(f => f.status === 'pending');

  async function resolveFlag(flag, status) {
    await base44.entities.ContentFlag.update(flag.id, { status, resolved_by: currentUser.email });
    qc.invalidateQueries({ queryKey: ['content-flags'] });
  }

  async function toggleThreadVisibility(thread) {
    await base44.entities.ForumThread.update(thread.id, { is_hidden: !thread.is_hidden });
    qc.invalidateQueries({ queryKey: ['forum-threads-admin'] });
  }

  async function toggleBanUser(profile) {
    await base44.entities.UserProfile.update(profile.id, { is_banned: !profile.is_banned });
    qc.invalidateQueries({ queryKey: ['user-profiles-admin'] });
  }

  return (
    <div className="min-h-screen">
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Admin Panel</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-2">Moderation</h1>
            <p className="text-muted-foreground">Manage community content, flags and user accounts.</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending Flags', value: pendingFlags.length, color: 'text-destructive', icon: Flag },
              { label: 'Total Threads', value: threads.length, color: 'text-primary', icon: ExternalLink },
              { label: 'User Profiles', value: profiles.length, color: 'text-accent', icon: Users },
            ].map(({ label, value, color, icon: IconComp }) => (
              <div key={label} className="p-5 rounded-2xl border border-border/60 bg-card text-center">
                <IconComp className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
                {t === 'flags' && pendingFlags.length > 0 && (
                  <span className="ml-1.5 bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5 py-0.5">{pendingFlags.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Flags Tab */}
          {tab === 'flags' && (
            <div className="space-y-3">
              {flags.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No flags yet.</p>}
              {flags.map(flag => (
                <div key={flag.id} className={`p-5 rounded-2xl border bg-card ${flag.status === 'pending' ? 'border-destructive/30' : 'border-border/60 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={flag.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs capitalize">{flag.status}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{flag.content_type}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{flag.reason}</Badge>
                      </div>
                      <p className="text-sm text-foreground mb-1 line-clamp-2">{flag.content_preview}</p>
                      <p className="text-xs text-muted-foreground">
                        Reported by <span className="font-medium">{flag.reporter_email}</span>
                        {flag.created_date && <> · {formatDistanceToNow(new Date(flag.created_date), { addSuffix: true })}</>}
                      </p>
                      {flag.details && <p className="text-xs text-muted-foreground mt-1 italic">"{flag.details}"</p>}
                    </div>
                    {flag.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => resolveFlag(flag, 'resolved')}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />Resolve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => resolveFlag(flag, 'dismissed')}>
                          <XCircle className="w-3.5 h-3.5 mr-1" />Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Threads Tab */}
          {tab === 'threads' && (
            <div className="space-y-2">
              {threads.map(t => (
                <div key={t.id} className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border bg-card transition-all ${t.is_hidden ? 'opacity-50 border-border/40' : 'border-border/60'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.author_name || t.author_email} · <span className="capitalize">{t.topic_tag}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.is_hidden && <Badge variant="destructive" className="text-[10px]">Hidden</Badge>}
                    <Link to={`/forum/${t.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 px-2"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => toggleThreadVisibility(t)}>
                      {t.is_hidden ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-destructive" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-2">
              {profiles.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No user profiles yet.</p>}
              {profiles.map(p => (
                <div key={p.id} className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border bg-card ${p.is_banned ? 'border-destructive/30 opacity-70' : 'border-border/60'}`}>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: p.avatar_color || '#a78bfa' }}
                  >
                    {(p.display_name || p.user_email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.display_name || p.user_email}</p>
                    <p className="text-xs text-muted-foreground">{p.user_email}</p>
                    {p.bio && <p className="text-xs text-muted-foreground truncate">{p.bio}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {p.is_banned && <Badge variant="destructive" className="text-[10px]">Banned</Badge>}
                    <Link to={`/profile/${encodeURIComponent(p.user_email)}`}>
                      <Button size="sm" variant="ghost" className="h-8 px-2"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => toggleBanUser(p)}>
                      <Ban className={`w-3.5 h-3.5 ${p.is_banned ? 'text-primary' : 'text-destructive'}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
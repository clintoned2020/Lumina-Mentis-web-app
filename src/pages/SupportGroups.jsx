import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Lock, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MobileSelect } from '@/components/ui/mobile-select';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';

const TOPICS = ['all', 'anxiety', 'depression', 'schizophrenia', 'adhd', 'bipolar', 'ptsd', 'ocd', 'grief', 'addiction', 'relationships', 'coping', 'general'];

const TOPIC_COLORS = {
  anxiety: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  depression: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  schizophrenia: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  adhd: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  bipolar: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  ptsd: 'bg-red-500/10 text-red-600 border-red-500/20',
  ocd: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  grief: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  addiction: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  relationships: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  coping: 'bg-green-500/10 text-green-600 border-green-500/20',
  general: 'bg-muted text-muted-foreground border-border',
};

export default function SupportGroups() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTopic, setActiveTopic] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: groups = [], isLoading, refetch } = useQuery({
    queryKey: ['support-groups'],
    queryFn: () => base44.entities.SupportGroup.list('-created_date', 100),
  });

  const ptr = usePullToRefresh(refetch);

  const filtered = groups
    .filter(g => activeTopic === 'all' || g.topic === activeTopic)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen">
      <PullToRefreshIndicator {...ptr} />
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">Live Community</p>
                <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-3">Support Groups</h1>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  Join real-time group conversations focused on specific mental health topics. Connect, share, and grow together with scheduled facilitated sessions.
                </p>
              </div>
              {currentUser && (
                <Button onClick={() => setShowCreate(s => !s)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-5 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Topic Filter */}
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTopic(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    activeTopic === t
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Create Form */}
          <AnimatePresence>
            {showCreate && (
              <CreateGroupForm
                currentUser={currentUser}
                onClose={() => setShowCreate(false)}
                onCreated={() => { qc.invalidateQueries({ queryKey: ['support-groups'] }); setShowCreate(false); }}
              />
            )}
          </AnimatePresence>

          {/* Groups Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted/30 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No groups found. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((group, i) => (
                <GroupCard key={group.id} group={group} index={i} currentUser={currentUser} onJoined={() => qc.invalidateQueries({ queryKey: ['support-groups'] })} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function GroupCard({ group, index, currentUser, onJoined }) {
  const isMember = (group.member_emails || []).includes(currentUser?.email);

  async function joinGroup() {
    if (!currentUser || isMember) return;
    const updated = [...(group.member_emails || []), currentUser.email];
    await base44.entities.SupportGroup.update(group.id, { member_emails: updated });
    onJoined();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: group.avatar_color || '#a78bfa' }}>
            {group.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground leading-tight">{group.name}</h3>
              {group.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
            <Badge variant="outline" className={`text-[10px] mt-0.5 capitalize ${TOPIC_COLORS[group.topic] || TOPIC_COLORS.general}`}>
              {group.topic}
            </Badge>
          </div>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Users className="w-3.5 h-3.5" />
          {(group.member_emails || []).length}
        </span>
      </div>

      {group.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center gap-2">
        {isMember ? (
          <Link to={`/groups/${group.id}`} className="flex-1">
            <Button size="sm" className="w-full flex items-center gap-1.5">
              Enter Group <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={joinGroup} className="flex-1">
              Join
            </Button>
            <Link to={`/groups/${group.id}`}>
              <Button size="sm" variant="ghost" className="text-xs">Preview</Button>
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}

const GROUP_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#f87171', '#fbbf24', '#f472b6', '#818cf8', '#2dd4bf'];
const TOPIC_OPTIONS = ['anxiety', 'depression', 'schizophrenia', 'adhd', 'bipolar', 'ptsd', 'ocd', 'grief', 'addiction', 'relationships', 'coping', 'general'];

function CreateGroupForm({ currentUser, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', topic: 'general', is_private: false, avatar_color: '#a78bfa' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await base44.entities.SupportGroup.create({
      ...form,
      created_by: currentUser.email,
      facilitator_email: currentUser.email,
      member_emails: [currentUser.email],
    });
    setSaving(false);
    onCreated();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mb-8 p-6 rounded-2xl border border-primary/20 bg-card shadow-lg"
    >
      <h3 className="font-heading text-xl mb-5">Create a Support Group</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Group name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <textarea
          placeholder="What is this group about? (optional)"
          rows={2}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
            <MobileSelect
              value={form.topic}
              onValueChange={v => setForm(f => ({ ...f, topic: v }))}
              label="Select Topic"
              placeholder="Select topic"
              className="w-full rounded-xl"
              options={TOPIC_OPTIONS.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Color</label>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {GROUP_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, avatar_color: c }))}
                  className={`w-7 h-7 rounded-lg transition-transform ${form.avatar_color === c ? 'scale-125 ring-2 ring-offset-1 ring-primary' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.is_private} onChange={e => setForm(f => ({ ...f, is_private: e.target.checked }))} className="rounded" />
          <span className="text-muted-foreground">Private group (invite only)</span>
        </label>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Group'}</Button>
        </div>
      </form>
    </motion.div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Users, Calendar, Plus, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import GroupSessionCard from '../components/groups/GroupSessionCard';
import ScheduleSessionForm from '../components/groups/ScheduleSessionForm';
import SubPageHeader from '../components/layout/SubPageHeader';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';

export default function GroupChat() {
  const { groupId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSchedule, setShowSchedule] = useState(false);
  const bottomRef = useRef(null);
  const qc = useQueryClient();
  const ptr = usePullToRefresh(() => {
    qc.invalidateQueries({ queryKey: ['group-messages', groupId] });
    qc.invalidateQueries({ queryKey: ['group-sessions', groupId] });
  });

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: groups = [] } = useQuery({
    queryKey: ['support-group', groupId],
    queryFn: () => base44.entities.SupportGroup.filter({ id: groupId }),
  });
  const group = groups[0];

  const { data: messages = [] } = useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: () => base44.entities.GroupMessage.filter({ group_id: groupId }, 'created_date', 100),
    refetchInterval: 3000,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['group-sessions', groupId],
    queryFn: () => base44.entities.GroupSession.filter({ group_id: groupId }, 'scheduled_at'),
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.GroupMessage.subscribe((event) => {
      if (event.data?.group_id === groupId) {
        qc.invalidateQueries({ queryKey: ['group-messages', groupId] });
      }
    });
    return unsub;
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isMember = (group?.member_emails || []).includes(currentUser?.email);
  const isFacilitator = currentUser?.email === group?.facilitator_email || currentUser?.role === 'admin';

  async function joinGroup() {
    if (!currentUser || !group) return;
    const updated = [...(group.member_emails || []), currentUser.email];
    await base44.entities.SupportGroup.update(groupId, { member_emails: updated });
    await base44.entities.GroupMessage.create({
      group_id: groupId,
      sender_email: 'system',
      sender_name: 'System',
      body: `${currentUser.full_name || currentUser.email} joined the group.`,
      is_system: true,
    });
    qc.invalidateQueries({ queryKey: ['support-group', groupId] });
    qc.invalidateQueries({ queryKey: ['group-messages', groupId] });
  }

  async function sendMessage(e) {
    e?.preventDefault();
    if (!message.trim() || !currentUser || !isMember) return;
    setSending(true);
    await base44.entities.GroupMessage.create({
      group_id: groupId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email,
      body: message.trim(),
      is_system: false,
    });
    setMessage('');
    setSending(false);
    qc.invalidateQueries({ queryKey: ['group-messages', groupId] });
  }

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-3">Group not found.</p>
        <Link to="/groups" className="text-primary text-sm hover:underline">← Back to Groups</Link>
      </div>
    </div>
  );

  const upcomingSessions = sessions.filter(s => s.status !== 'ended');
  const liveSessions = sessions.filter(s => s.status === 'live');

  return (
    <div className="min-h-screen">
      <PullToRefreshIndicator {...ptr} />
      <SubPageHeader title={group?.name} backPath="/groups" />
      <section className="py-10 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">

          <Link to="/groups" className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Groups
          </Link>

          {/* Group Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ backgroundColor: group.avatar_color || '#a78bfa' }}>
                {group.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-heading text-2xl lg:text-3xl tracking-tight">{group.name}</h1>
                  {group.is_private && <Lock className="w-4 h-4 text-muted-foreground" />}
                  {liveSessions.length > 0 && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      LIVE SESSION
                    </span>
                  )}
                </div>
                <Badge variant="outline" className="text-xs capitalize mb-2">{group.topic}</Badge>
                {group.description && <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{(group.member_emails || []).length} members</span>
                  {group.facilitator_email && (
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent" />Facilitated by <Link to={`/profile/${encodeURIComponent(group.facilitator_email)}`} className="font-medium hover:text-primary transition-colors">{group.facilitator_email.split('@')[0]}</Link></span>
                  )}
                </div>
              </div>
              {!isMember && currentUser && (
                <Button onClick={joinGroup}>Join Group</Button>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border/40 pb-3">
            {['chat', 'sessions'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  activeTab === t ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'chat' ? <Send className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                {t}
                {t === 'sessions' && upcomingSessions.length > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{upcomingSessions.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden" style={{ height: '55vh' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No messages yet. Say hello!
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} currentUser={currentUser} />
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {isMember ? (
                <form onSubmit={sendMessage} className="p-3 border-t border-border/40 flex gap-2">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Message the group..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Button type="submit" size="icon" disabled={sending || !message.trim()} className="rounded-xl h-10 w-10 flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="p-4 border-t border-border/40 text-center">
                  <p className="text-sm text-muted-foreground">
                    {currentUser ? (
                      <button onClick={joinGroup} className="text-primary hover:underline">Join this group</button>
                    ) : 'Sign in and join to chat'}
                    {' '}to participate in the conversation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {isFacilitator && (
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => setShowSchedule(s => !s)}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Schedule Session
                  </Button>
                </div>
              )}
              <AnimatePresence>
                {showSchedule && (
                  <ScheduleSessionForm
                    groupId={groupId}
                    currentUser={currentUser}
                    onClose={() => setShowSchedule(false)}
                    onCreated={() => { qc.invalidateQueries({ queryKey: ['group-sessions', groupId] }); setShowSchedule(false); }}
                  />
                )}
              </AnimatePresence>

              {sessions.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No sessions scheduled yet.</p>
                  {isFacilitator && <p className="text-xs mt-1">As a facilitator, you can schedule live sessions above.</p>}
                </div>
              ) : (
                sessions.map(session => (
                  <GroupSessionCard
                    key={session.id}
                    session={session}
                    currentUser={currentUser}
                    isFacilitator={isFacilitator}
                    onUpdate={() => qc.invalidateQueries({ queryKey: ['group-sessions', groupId] })}
                  />
                ))
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

function MessageBubble({ msg, currentUser }) {
  const isMine = msg.sender_email === currentUser?.email;
  const isSystem = msg.is_system;

  if (isSystem) return (
    <div className="text-center">
      <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{msg.body}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0 mt-0.5">
        {(msg.sender_name || msg.sender_email || '?')[0].toUpperCase()}
      </div>
      <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMine && (
          <Link to={`/profile/${encodeURIComponent(msg.sender_email)}`} className="text-[11px] font-medium text-muted-foreground mb-1 hover:text-primary transition-colors">
            {msg.sender_name || msg.sender_email}
          </Link>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMine ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
        }`}>
          {msg.body}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {msg.created_date && formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
}
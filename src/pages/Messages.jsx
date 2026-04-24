import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ConversationList from '@/components/messages/ConversationList';
import ChatPanel from '@/components/messages/ChatPanel';
import NewConvoModal from '@/components/messages/NewConvoModal';
import { notifyNewDM } from '@/lib/notifications';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';

function makeConversationKey(a, b) {
  return [a, b].sort().join('|');
}

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConvo, setSelectedConvo] = useState(null); // { email, displayName, avatarColor }
  const [allMessages, setAllMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [showNewConvo, setShowNewConvo] = useState(false);
  // Track profiles for display names
  const [profiles, setProfiles] = useState({});
  const qc = useQueryClient();
  const ptr = usePullToRefresh(() => {
    qc.invalidateQueries({ queryKey: ['messages'] });
  });

  // Load current user + handle ?with= param
  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      const params = new URLSearchParams(window.location.search);
      const withEmail = params.get('with');
      if (withEmail) {
        const decoded = decodeURIComponent(withEmail);
        setSelectedConvo({ email: decoded, displayName: null, avatarColor: null });
      }
    }).catch(() => {});
  }, []);

  // Load all messages via real-time subscription
  useEffect(() => {
    if (!currentUser) return;

    // Initial load
    Promise.all([
      base44.entities.DirectMessage.filter({ sender_email: currentUser.email }),
      base44.entities.DirectMessage.filter({ recipient_email: currentUser.email }),
    ]).then(([sent, recv]) => {
      setAllMessages(dedupeMessages([...sent, ...recv]));
    });

    // Real-time updates
    const unsub = base44.entities.DirectMessage.subscribe((event) => {
      const msg = event.data;
      // Only process if relevant to current user
      if (msg.sender_email !== currentUser.email && msg.recipient_email !== currentUser.email) return;
      if (event.type === 'create') {
        setAllMessages(prev => dedupeMessages([...prev, msg]));
        // Mark as read immediately if conversation is open
        setSelectedConvo(sel => {
          if (sel && msg.recipient_email === currentUser.email && msg.sender_email === sel.email && !msg.is_read) {
            base44.entities.DirectMessage.update(msg.id, { is_read: true });
          }
          return sel;
        });
      } else if (event.type === 'update') {
        setAllMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      } else if (event.type === 'delete') {
        setAllMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });

    return unsub;
  }, [currentUser]);

  function dedupeMessages(msgs) {
    const seen = new Set();
    return msgs.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }

  // Fetch profiles for display names
  useEffect(() => {
    if (!currentUser || allMessages.length === 0) return;
    const emails = new Set();
    allMessages.forEach(m => {
      if (m.sender_email !== currentUser.email) emails.add(m.sender_email);
      if (m.recipient_email !== currentUser.email) emails.add(m.recipient_email);
    });
    emails.forEach(email => {
      if (profiles[email]) return;
      base44.entities.UserProfile.filter({ user_email: email }).then(res => {
        if (res[0]) setProfiles(p => ({ ...p, [email]: res[0] }));
      });
    });
  }, [allMessages.length, currentUser]);

  // Build conversation list
  const convos = useMemo(() => {
    if (!currentUser) return [];
    const map = {};
    allMessages.forEach(m => {
      const other = m.sender_email === currentUser.email ? m.recipient_email : m.sender_email;
      if (!map[other]) {
        const prof = profiles[other];
        map[other] = {
          email: other,
          displayName: prof?.display_name || null,
          avatarColor: prof?.avatar_color || null,
          messages: [],
          unread: 0,
        };
      }
      map[other].messages.push(m);
      if (m.recipient_email === currentUser.email && !m.is_read) map[other].unread++;
    });
    return Object.values(map).sort((a, b) => {
      const la = Math.max(...a.messages.map(m => new Date(m.created_date)));
      const lb = Math.max(...b.messages.map(m => new Date(m.created_date)));
      return lb - la;
    });
  }, [allMessages, currentUser, profiles]);

  // Active conversation messages
  const convoMessages = useMemo(() => {
    if (!selectedConvo || !currentUser) return [];
    const key = makeConversationKey(currentUser.email, selectedConvo.email);
    return allMessages
      .filter(m => m.conversation_key === key)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [allMessages, selectedConvo, currentUser]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (!selectedConvo || !currentUser) return;
    convoMessages
      .filter(m => m.recipient_email === currentUser.email && !m.is_read)
      .forEach(m => base44.entities.DirectMessage.update(m.id, { is_read: true }));
  }, [selectedConvo?.email, convoMessages.length]);

  async function sendMessage(text) {
    if (!selectedConvo || !text || !currentUser) return;
    setSending(true);
    const isFirstMessage = !convoMessages.length;
    await base44.entities.DirectMessage.create({
      sender_email: currentUser.email,
      recipient_email: selectedConvo.email,
      body: text,
      is_read: false,
      conversation_key: makeConversationKey(currentUser.email, selectedConvo.email),
    });
    // Notify recipient on first message or every time (debounce not needed for this context)
    notifyNewDM({ senderUser: currentUser, recipientEmail: selectedConvo.email }).catch(() => {});
    setSending(false);
  }

  function handleSelectConvo(email) {
    const prof = profiles[email];
    setSelectedConvo({ email, displayName: prof?.display_name || null, avatarColor: prof?.avatar_color || null });
  }

  function handleStartConvo(email, displayName, avatarColor) {
    setSelectedConvo({ email, displayName, avatarColor });
  }

  // Enrich selectedConvo with latest profile data
  const enrichedConvo = useMemo(() => {
    if (!selectedConvo) return null;
    const prof = profiles[selectedConvo.email];
    return {
      ...selectedConvo,
      displayName: prof?.display_name || selectedConvo.displayName,
      avatarColor: prof?.avatar_color || selectedConvo.avatarColor,
    };
  }, [selectedConvo, profiles]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Please sign in to use messages.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PullToRefreshIndicator {...ptr} />
      <section className="py-12 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Private</p>
            <h1 className="font-heading text-3xl lg:text-4xl tracking-tight">Messages</h1>
          </motion.div>

          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border/60 rounded-2xl overflow-hidden bg-card`}
            style={{ height: 'calc(100vh - 240px)', minHeight: '480px' }}>

            {/* Conversation list — hide on mobile when a convo is open */}
            <div className={`lg:col-span-1 border-r border-border/40 ${selectedConvo ? 'hidden lg:flex' : 'flex'} flex-col`}>
              <ConversationList
                convos={convos}
                selectedConvo={selectedConvo?.email}
                onSelect={handleSelectConvo}
                onNewConvo={() => setShowNewConvo(true)}
                currentUserEmail={currentUser.email}
              />
            </div>

            {/* Chat panel — hide on mobile when no convo */}
            <div className={`lg:col-span-2 ${!selectedConvo ? 'hidden lg:flex' : 'flex'} flex-col`}>
              <ChatPanel
                messages={convoMessages}
                convo={enrichedConvo}
                currentUser={currentUser}
                onSend={sendMessage}
                onBack={() => setSelectedConvo(null)}
                sending={sending}
              />
            </div>
          </div>
        </div>
      </section>

      <NewConvoModal
        open={showNewConvo}
        onClose={() => setShowNewConvo(false)}
        onStart={handleStartConvo}
        currentUserEmail={currentUser.email}
      />
    </div>
  );
}
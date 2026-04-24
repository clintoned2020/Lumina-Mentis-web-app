import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPanel({ messages, convo, currentUser, onSend, onBack, sending }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (convo) inputRef.current?.focus();
  }, [convo?.email]);

  function handleSubmit(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (!convo) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <MessageSquare className="w-7 h-7 opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Select a conversation</p>
          <p className="text-xs mt-1">or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border/40 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary-foreground"
          style={{ backgroundColor: convo.avatarColor || '#a78bfa' }}>
          {(convo.displayName || convo.email)[0]?.toUpperCase()}
        </div>
        <Link
          to={`/profile/${encodeURIComponent(convo.email)}`}
          className="flex-1 min-w-0 hover:text-primary transition-colors"
        >
          <p className="text-sm font-semibold text-foreground truncate">
            {convo.displayName || convo.email.split('@')[0]}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">{convo.email}</p>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isMine = m.sender_email === currentUser.email;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  <p className="break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(new Date(m.created_date), { addSuffix: true })}
                    {isMine && m.is_read && <span className="ml-1">· Read</span>}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border/40 flex gap-2 flex-shrink-0">
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none max-h-28 overflow-y-auto"
        />
        <Button
          type="submit"
          disabled={sending || !text.trim()}
          size="icon"
          className="rounded-xl h-10 w-10 flex-shrink-0 self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
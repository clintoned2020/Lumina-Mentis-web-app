import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationList({ convos, selectedConvo, onSelect, onNewConvo, currentUserEmail }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/40 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-semibold text-foreground">Messages</span>
        <Button size="icon" variant="ghost" onClick={onNewConvo} className="h-8 w-8 rounded-lg" title="New conversation">
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {convos.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <p>No conversations yet.</p>
            <p className="mt-1">Start one with the pencil icon above.</p>
          </div>
        ) : convos.map(c => {
          const lastMsg = c.messages[c.messages.length - 1];
          const isSelected = selectedConvo === c.email;
          return (
            <button
              key={c.email}
              onClick={() => onSelect(c.email)}
              className={`w-full text-left px-4 py-3.5 border-b border-border/20 transition-colors flex items-start gap-3 ${
                isSelected ? 'bg-primary/8' : 'hover:bg-muted/40'
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-primary-foreground"
                style={{ backgroundColor: c.avatarColor || '#a78bfa' }}>
                {(c.displayName || c.email)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {c.displayName || c.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {lastMsg ? formatDistanceToNow(new Date(lastMsg.created_date), { addSuffix: false }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-[11px] text-muted-foreground truncate">
                    {lastMsg?.sender_email === currentUserEmail ? 'You: ' : ''}{lastMsg?.body}
                  </p>
                  {c.unread > 0 && (
                    <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-semibold flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
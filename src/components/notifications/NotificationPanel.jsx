import React from 'react';
import { Bell, Check, Trash2, MessageSquare, UserPlus, Rss, Hash, AtSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';

const TYPE_ICON = {
  new_reply:          { icon: MessageSquare, color: 'text-primary bg-primary/10' },
  mention:            { icon: AtSign,        color: 'text-yellow-600 bg-yellow-500/10' },
  new_follower:       { icon: UserPlus,      color: 'text-green-600 bg-green-500/10' },
  followed_user_post: { icon: Rss,           color: 'text-purple-600 bg-purple-500/10' },
  topic_update:       { icon: Hash,          color: 'text-blue-600 bg-blue-500/10' },
};

export default function NotificationPanel({ currentUser, open, onToggle, onClose }) {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications(currentUser);

  function handleClick(n) {
    if (!n.is_read) markRead(n.id);
    onClose();
  }

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={onToggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-accent/10 transition-colors text-muted-foreground hover:text-foreground"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 max-h-[480px] bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={markAllRead}>
                    <Check className="w-3 h-3" /> Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={clearAll}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Bell className="w-8 h-8 opacity-30" />
                  <p className="text-sm">All caught up!</p>
                </div>
              ) : (
                notifications.map(n => {
                  const cfg = TYPE_ICON[n.type] || TYPE_ICON.new_reply;
                  const Icon = cfg.icon;
                  return (
                    <Link
                      key={n.id}
                      to={n.link || '#'}
                      onClick={() => handleClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug ${n.is_read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                          {n.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
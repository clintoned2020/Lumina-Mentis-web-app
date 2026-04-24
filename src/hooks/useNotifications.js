import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'forum_subscribed_topics';

function getSubscribedTopics() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export default function useNotifications(currentUser) {
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (!currentUser?.email) return;
    base44.entities.Notification.filter({ recipient_email: currentUser.email }, '-created_date', 50)
      .then(data => {
        setNotifications(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [currentUser?.email]);

  // Real-time subscription
  useEffect(() => {
    if (!currentUser?.email) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.recipient_email !== currentUser.email) return;
      if (event.type === 'create') {
        setNotifications(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      } else if (event.type === 'delete') {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });
    return unsub;
  }, [currentUser?.email]);

  // Real-time: watch for new forum threads from followed users or subscribed topics
  useEffect(() => {
    if (!currentUser?.email) return;

    const unsub = base44.entities.ForumThread.subscribe(async (event) => {
      if (event.type !== 'create') return;
      const thread = event.data;
      if (thread.author_email === currentUser.email) return;

      // Check if current user follows the author
      try {
        const follows = await base44.entities.UserFollow.filter({ follower_email: currentUser.email });
        const followedEmails = follows.map(f => f.following_email);

        if (followedEmails.includes(thread.author_email)) {
          await base44.entities.Notification.create({
            recipient_email: currentUser.email,
            type: 'followed_user_post',
            title: 'New post from someone you follow',
            body: `${thread.author_name || thread.author_email} posted "${thread.title}"`,
            link: `/forum/${thread.id}`,
            actor_email: thread.author_email,
            actor_name: thread.author_name || thread.author_email,
            entity_id: thread.id,
          });
          return; // avoid double notify
        }

        // Check subscribed topics
        const subscribedTopics = getSubscribedTopics();
        if (subscribedTopics.includes(thread.topic_tag)) {
          await base44.entities.Notification.create({
            recipient_email: currentUser.email,
            type: 'topic_update',
            title: `New post in #${thread.topic_tag}`,
            body: `"${thread.title}" was posted in a topic you follow`,
            link: `/forum/${thread.id}`,
            actor_email: thread.author_email,
            actor_name: thread.author_name || thread.author_email,
            entity_id: thread.id,
          });
        }
      } catch {}
    });

    return unsub;
  }, [currentUser?.email]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await base44.entities.Notification.update(id, { is_read: true });
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.is_read);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    const all = [...notifications];
    setNotifications([]);
    await Promise.all(all.map(n => base44.entities.Notification.delete(n.id)));
  }, [notifications]);

  return { notifications, unreadCount, loaded, markRead, markAllRead, clearAll };
}
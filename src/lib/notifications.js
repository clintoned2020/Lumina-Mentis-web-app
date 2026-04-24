/**
 * Notification creation helpers.
 * Uses a backend function with service role to bypass RLS on Notification entity.
 */
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'forum_subscribed_topics';

export function getSubscribedTopics() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function mentionedEmails(text = '') {
  const matches = text.match(/@([\w.+-]+@[\w.-]+\.[a-z]{2,})/gi) || [];
  return matches.map(m => m.slice(1).toLowerCase());
}

async function sendNotifications(notifications) {
  if (!notifications.length) return;
  await base44.functions.invoke('createNotification', { notifications });
}

export async function notifyNewReply({ thread, reply, currentUser }) {
  const notifications = [];

  if (thread.author_email && thread.author_email !== currentUser.email) {
    notifications.push({
      recipient_email: thread.author_email,
      type: 'new_reply',
      title: 'New reply to your thread',
      body: `${currentUser.full_name || currentUser.email} replied to "${thread.title}"`,
      link: `/forum/${thread.id}`,
      actor_email: currentUser.email,
      actor_name: currentUser.full_name || currentUser.email,
      entity_id: reply.id,
    });
  }

  for (const email of mentionedEmails(reply.body)) {
    if (email !== currentUser.email) {
      notifications.push({
        recipient_email: email,
        type: 'mention',
        title: 'You were mentioned',
        body: `${currentUser.full_name || currentUser.email} mentioned you in "${thread.title}"`,
        link: `/forum/${thread.id}`,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name || currentUser.email,
        entity_id: reply.id,
      });
    }
  }

  await sendNotifications(notifications);
}

export async function notifyNewFollower({ followerUser, followingEmail }) {
  await sendNotifications([{
    recipient_email: followingEmail,
    type: 'new_follower',
    title: 'New follower',
    body: `${followerUser.full_name || followerUser.email} started following you`,
    link: `/profile/${encodeURIComponent(followerUser.email)}`,
    actor_email: followerUser.email,
    actor_name: followerUser.full_name || followerUser.email,
  }]);
}

export async function notifyFollowedUserPost({ thread, authorUser, followerEmails }) {
  const notifications = followerEmails
    .filter(e => e !== authorUser.email)
    .map(email => ({
      recipient_email: email,
      type: 'followed_user_post',
      title: 'New post from someone you follow',
      body: `${authorUser.full_name || authorUser.email} posted "${thread.title}"`,
      link: `/forum/${thread.id}`,
      actor_email: authorUser.email,
      actor_name: authorUser.full_name || authorUser.email,
      entity_id: thread.id,
    }));
  await sendNotifications(notifications);
}

export async function notifyNewDM({ senderUser, recipientEmail }) {
  await sendNotifications([{
    recipient_email: recipientEmail,
    type: 'new_reply',
    title: 'New message',
    body: `${senderUser.full_name || senderUser.email} sent you a message`,
    link: `/messages?with=${encodeURIComponent(senderUser.email)}`,
    actor_email: senderUser.email,
    actor_name: senderUser.full_name || senderUser.email,
  }]);
}

export async function notifyTopicSubscribers({ thread, authorEmail }) {
  // Handled client-side via real-time subscriptions in useNotifications hook.
}
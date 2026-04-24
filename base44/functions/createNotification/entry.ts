import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// In-memory rate limiter: track notifications per actor-recipient pair
const notificationLog = new Map();
const RATE_LIMIT_MS = 5000; // 5 seconds between notifications to same recipient per actor
const MAX_PER_HOUR = 100; // Max 100 notifications per actor-recipient pair per hour

function getRateLimitKey(actorEmail, recipientEmail) {
  return `${actorEmail}|${recipientEmail}`;
}

function checkRateLimit(actorEmail, recipientEmail) {
  const key = getRateLimitKey(actorEmail, recipientEmail);
  const now = Date.now();
  
  if (!notificationLog.has(key)) {
    notificationLog.set(key, []);
  }
  
  const history = notificationLog.get(key);
  // Remove old entries (older than 1 hour)
  const recentHistory = history.filter(ts => now - ts < 3600000);
  
  // Check rate limit
  if (recentHistory.length > 0 && now - recentHistory[recentHistory.length - 1] < RATE_LIMIT_MS) {
    return { allowed: false, reason: 'Too frequent notifications to this recipient' };
  }
  
  if (recentHistory.length >= MAX_PER_HOUR) {
    return { allowed: false, reason: 'Too many notifications to this recipient in the last hour' };
  }
  
  // Record this notification
  recentHistory.push(now);
  notificationLog.set(key, recentHistory);
  
  return { allowed: true };
}

// Helper function to validate notification relationships
async function validateNotificationRelationship(base44, actorEmail, recipientEmail, notificationType, entityId) {
  // Admins can always send notifications
  const actor = await base44.auth.me();
  if (actor?.role === 'admin') return true;

  // For each notification type, verify a legitimate relationship exists
  switch (notificationType) {
    case 'new_reply': {
      // Actor must be author of a reply in the thread
      if (!entityId) return false;
      const replies = await base44.asServiceRole.entities.ForumReply.filter({
        thread_id: entityId,
        author_email: actorEmail,
      });
      return replies.length > 0;
    }
    case 'mention': {
      // Actor must be the author of the thread or reply containing the mention
      if (!entityId) return false;
      
      // Check if actor is author of a reply with this entity_id
      const replies = await base44.asServiceRole.entities.ForumReply.filter({
        id: entityId,
        author_email: actorEmail,
      });
      if (replies.length > 0) return true;
      
      // Check if actor is author of a thread with this entity_id
      const threads = await base44.asServiceRole.entities.ForumThread.filter({
        id: entityId,
        author_email: actorEmail,
      });
      return threads.length > 0;
    }
    case 'new_follower': {
      // Actor is the follower, recipient is the followed user
      const follows = await base44.asServiceRole.entities.UserFollow.filter({
        follower_email: actorEmail,
        following_email: recipientEmail,
      });
      return follows.length > 0;
    }
    case 'followed_user_post': {
      // Actor is the poster, recipient is a follower
      const follows = await base44.asServiceRole.entities.UserFollow.filter({
        follower_email: recipientEmail,
        following_email: actorEmail,
      });
      return follows.length > 0;
    }
    case 'topic_update': {
      // Admin-only notifications
      return false;
    }
    default:
      return false;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notifications } = await req.json();
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return Response.json({ ok: true, skipped: 'no notifications' });
    }

    // Prevent notification spam: cap batch size
    if (notifications.length > 50) {
      return Response.json({ error: 'Too many notifications in one request' }, { status: 429 });
    }

    // Enforce: actor_email must be present and must match the authenticated user
    // Also validate relationships: user can only notify if they have a legitimate relationship
    for (const n of notifications) {
      if (!n.actor_email || n.actor_email !== user.email) {
        return Response.json({ error: 'Forbidden: actor_email must match your account' }, { status: 403 });
      }
      if (!n.recipient_email || !n.type) {
        return Response.json({ error: 'Missing required fields: recipient_email, type' }, { status: 400 });
      }

      // Check rate limiting per actor-recipient pair
      const rateLimitCheck = checkRateLimit(user.email, n.recipient_email);
      if (!rateLimitCheck.allowed) {
        return Response.json({ error: `Rate limited: ${rateLimitCheck.reason}` }, { status: 429 });
      }

      // Validate notification trigger: check if user has legitimate relationship with recipient
      const hasRelationship = await validateNotificationRelationship(base44, user.email, n.recipient_email, n.type, n.entity_id);
      if (!hasRelationship) {
        return Response.json({ error: 'Forbidden: no valid relationship for this notification' }, { status: 403 });
      }
    }

    const results = await Promise.all(
      notifications.map(n => base44.asServiceRole.entities.Notification.create(n))
    );

    return Response.json({ ok: true, created: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Simple in-memory rate limiter: track last notification time per follower
const lastNotificationTime = new Map();
const RATE_LIMIT_MS = 60000; // 60 seconds between notifications per follower

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const follow = body.data;
    if (!follow || !follow.following_email) {
      return Response.json({ ok: true, skipped: 'no follow data' });
    }

    // Use authenticated user's email directly, not from request body (prevent spoofing)
    const followerEmail = user.email;
    const followingEmail = follow.following_email;

    // Rate limiting: check if this follower has sent a notification recently
    const now = Date.now();
    const lastTime = lastNotificationTime.get(followerEmail);
    if (lastTime && now - lastTime < RATE_LIMIT_MS) {
      return Response.json({ ok: true, skipped: 'rate limited' });
    }

    // Verify the follow relationship actually exists in the database
    const existing = await base44.asServiceRole.entities.UserFollow.filter({
      follower_email: followerEmail,
      following_email: followingEmail,
    });
    if (!existing || existing.length === 0) {
      return Response.json({ ok: true, skipped: 'follow relationship not found' });
    }

    // Use the authenticated user's real name, not caller-supplied data
    const followerName = user.full_name || user.email;

    // Email the person who was followed
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: followingEmail,
      subject: `${followerName} started following you on Lumina Mentis`,
      body: `Hi,\n\n${followerName} just started following you on Lumina Mentis.\n\nYou can view their profile and follow them back.\n\nWarm regards,\nLumina Mentis`,
    });

    // Update rate limit timestamp
    lastNotificationTime.set(followerEmail, now);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
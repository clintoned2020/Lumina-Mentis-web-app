import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const reply = body.data;
    if (!reply || !reply.thread_id || !reply.id) {
      return Response.json({ ok: true, skipped: 'no reply data' });
    }

    // Verify the reply actually exists in the database and belongs to the caller
    const replies = await base44.asServiceRole.entities.ForumReply.filter({ id: reply.id });
    const dbReply = replies[0];
    if (!dbReply) return Response.json({ ok: true, skipped: 'reply not found' });
    if (dbReply.author_email !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the parent thread
    const threads = await base44.asServiceRole.entities.ForumThread.filter({ id: reply.thread_id });
    const thread = threads[0];
    if (!thread) return Response.json({ ok: true, skipped: 'thread not found' });

    // Use DB values exclusively — never trust caller-supplied names
    const actorEmail = user.email;
    const actorName = user.full_name || user.email;
    const promises = [];

    // 1. Email + in-app notification to thread author (if not themselves)
    if (thread.author_email && thread.author_email !== actorEmail) {
      promises.push(
        base44.asServiceRole.integrations.Core.SendEmail({
          to: thread.author_email,
          subject: `New reply to your thread: "${thread.title}"`,
          body: `Hi,\n\n${actorName} replied to your thread "${thread.title}" on Lumina Mentis.\n\nVisit the thread to read their reply and continue the conversation.\n\nWarm regards,\nLumina Mentis`,
        })
      );
    }

    // 2. Email any @mentioned users (use DB reply body, not caller-supplied)
    const mentionMatches = (dbReply.body || '').match(/@([\w.+-]+@[\w.-]+\.[a-z]{2,})/gi) || [];
    const mentionedEmails = [...new Set(mentionMatches.map(m => m.slice(1).toLowerCase()))];

    for (const email of mentionedEmails) {
      if (email !== actorEmail && email !== thread.author_email) {
        promises.push(
          base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `You were mentioned in "${thread.title}"`,
            body: `Hi,\n\n${actorName} mentioned you in a reply on Lumina Mentis in the thread "${thread.title}".\n\nVisit the thread to see what they said.\n\nWarm regards,\nLumina Mentis`,
          })
        );
      }
    }

    await Promise.all(promises);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
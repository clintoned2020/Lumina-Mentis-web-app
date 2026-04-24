import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Fetch all users and activity data securely server-side
    const allUsers = await base44.asServiceRole.entities.User.list();
    const threads = await base44.asServiceRole.entities.ForumThread.list() || [];
    const replies = await base44.asServiceRole.entities.ForumReply.list() || [];
    const journals = await base44.asServiceRole.entities.JournalEntry.list() || [];
    const circlePosts = await base44.asServiceRole.entities.CirclePost.list() || [];
    const groupMessages = await base44.asServiceRole.entities.GroupMessage.list() || [];

    // Build activity map
    const activityMap = {};
    allUsers.forEach(u => {
      const email = u.email;
      const userThreads = threads.filter(t => t.author_email === email);
      const userReplies = replies.filter(r => r.author_email === email);
      const userJournals = journals.filter(j => j.user_email === email);
      const userPosts = circlePosts.filter(p => p.author_email === email);
      const userMessages = groupMessages.filter(m => m.sender_email === email);

      const lastActivity = [
        ...userThreads.map(t => new Date(t.updated_date || t.created_date)),
        ...userReplies.map(r => new Date(r.updated_date || r.created_date)),
        ...userJournals.map(j => new Date(j.updated_date || j.created_date)),
        ...userPosts.map(p => new Date(p.updated_date || p.created_date)),
        ...userMessages.map(m => new Date(m.updated_date || m.created_date)),
      ].sort((a, b) => b - a)[0];

      activityMap[email] = {
        threads: userThreads.length,
        replies: userReplies.length,
        journals: userJournals.length,
        posts: userPosts.length,
        messages: userMessages.length,
        totalActivity: userThreads.length + userReplies.length + userJournals.length + userPosts.length + userMessages.length,
        lastActivity: lastActivity ? lastActivity.toLocaleDateString() : 'Never',
        lastActivityDate: lastActivity,
      };
    });

    return Response.json({
      allUsers,
      activityMap,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
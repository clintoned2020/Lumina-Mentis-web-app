import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const uploadBucket = import.meta.env.VITE_SUPABASE_UPLOAD_BUCKET || 'uploads';

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep this loud because all data/auth depends on it.
  console.error('Missing Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const ENTITY_TABLES = {
  Disorder: 'disorder',
  UserProfile: 'user_profile',
  DirectMessage: 'direct_message',
  SupportGroup: 'support_group',
  GroupMessage: 'group_message',
  GroupSession: 'group_session',
  SavedAffirmation: 'saved_affirmation',
  DailyAffirmation: 'daily_affirmation',
  ContentFlag: 'content_flag',
  ForumThread: 'forum_thread',
  SavedResource: 'saved_resource',
  JournalEntry: 'journal_entry',
  WellnessGoal: 'wellness_goal',
  FavoriteTool: 'favorite_tool',
  CrisisPlan: 'crisis_plan',
  WellnessCircle: 'wellness_circle',
  ForumReply: 'forum_reply',
  UserFollow: 'user_follow',
  UserPoints: 'user_points',
  Professional: 'professional',
  Notification: 'notification',
  ProfessionalProfile: 'professional_profile',
  CirclePost: 'circle_post',
  ConsultationRequest: 'consultation_request',
  UserAchievement: 'user_achievement',
  RewardLog: 'reward_log'
};

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    role: user.app_metadata?.role || 'user'
  };
}

function applyFilters(query, filters = {}) {
  let next = query;
  Object.entries(filters).forEach(([key, value]) => {
    if (value && typeof value === 'object' && Array.isArray(value.$in)) {
      next = next.in(key, value.$in);
      return;
    }
    next = next.eq(key, value);
  });
  return next;
}

function applySort(query, sort) {
  if (!sort) return query;
  const descending = String(sort).startsWith('-');
  const column = descending ? String(sort).slice(1) : String(sort);
  return query.order(column, { ascending: !descending });
}

function mapRealtimeEvent(payload) {
  const typeMap = { INSERT: 'create', UPDATE: 'update', DELETE: 'delete' };
  return {
    type: typeMap[payload.eventType] || payload.eventType?.toLowerCase(),
    id: payload.new?.id || payload.old?.id,
    data: payload.new || payload.old
  };
}

function throwIfError(error) {
  if (error) throw error;
}

function createEntityApi(entityName) {
  const table = ENTITY_TABLES[entityName];
  if (!table) {
    throw new Error(`Unknown entity: ${entityName}`);
  }

  return {
    async list(sort, limit = 100) {
      let query = supabase.from(table).select('*');
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error);
      return data || [];
    },
    async filter(filters = {}, sort, limit = 100) {
      let query = supabase.from(table).select('*');
      query = applyFilters(query, filters);
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error);
      return data || [];
    },
    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      throwIfError(error);
      return data;
    },
    async update(id, patch) {
      const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single();
      throwIfError(error);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      throwIfError(error);
      return { id };
    },
    subscribe(handler) {
      const channel = supabase
        .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          handler(mapRealtimeEvent(payload));
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  };
}

async function invokeCreateNotification({ notifications = [] }) {
  if (!Array.isArray(notifications) || !notifications.length) {
    return { data: { success: true, inserted: 0 } };
  }
  const { data, error } = await supabase.from('notification').insert(notifications).select();
  throwIfError(error);
  return { data: { success: true, inserted: data?.length || 0 } };
}

async function invokeGetLeaderboardData() {
  const user = await base44.auth.me();
  if (!user) throw new Error('Unauthorized');
  const [pointsRes, achievementsRes] = await Promise.all([
    supabase.from('user_points').select('*').order('total_points', { ascending: false }).limit(200),
    supabase.from('user_achievement').select('*').eq('user_email', user.email)
  ]);
  throwIfError(pointsRes.error);
  throwIfError(achievementsRes.error);
  return {
    data: {
      allUserPoints: pointsRes.data || [],
      myAchievements: achievementsRes.data || [],
      userEmail: user.email
    }
  };
}

async function invokeGetAdminConsoleData() {
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') throw new Error('Unauthorized');

  const [profilesRes, threadsRes, repliesRes, journalsRes, postsRes, groupMessagesRes] = await Promise.all([
    supabase.from('user_profile').select('*'),
    supabase.from('forum_thread').select('*'),
    supabase.from('forum_reply').select('*'),
    supabase.from('journal_entry').select('*'),
    supabase.from('circle_post').select('*'),
    supabase.from('group_message').select('*')
  ]);

  [profilesRes, threadsRes, repliesRes, journalsRes, postsRes, groupMessagesRes].forEach((r) => throwIfError(r.error));

  const allUsers = (profilesRes.data || []).map((p) => ({
    id: p.id,
    email: p.user_email,
    full_name: p.display_name || p.username || p.user_email,
    role: p.is_admin ? 'admin' : 'user',
    created_date: p.created_date
  }));

  const activityMap = {};
  allUsers.forEach((u) => {
    const email = u.email;
    const userThreads = (threadsRes.data || []).filter((x) => x.author_email === email);
    const userReplies = (repliesRes.data || []).filter((x) => x.author_email === email);
    const userJournals = (journalsRes.data || []).filter((x) => x.user_email === email);
    const userPosts = (postsRes.data || []).filter((x) => x.author_email === email);
    const userMessages = (groupMessagesRes.data || []).filter((x) => x.sender_email === email);
    const lastActivity = [
      ...userThreads.map((x) => x.updated_date || x.created_date),
      ...userReplies.map((x) => x.updated_date || x.created_date),
      ...userJournals.map((x) => x.updated_date || x.created_date),
      ...userPosts.map((x) => x.updated_date || x.created_date),
      ...userMessages.map((x) => x.updated_date || x.created_date)
    ]
      .filter(Boolean)
      .sort()
      .pop();

    activityMap[email] = {
      threads: userThreads.length,
      replies: userReplies.length,
      journals: userJournals.length,
      posts: userPosts.length,
      messages: userMessages.length,
      totalActivity: userThreads.length + userReplies.length + userJournals.length + userPosts.length + userMessages.length,
      lastActivity: lastActivity ? new Date(lastActivity).toLocaleDateString() : 'Never',
      lastActivityDate: lastActivity ? new Date(lastActivity).getTime() : 0
    };
  });

  return { data: { allUsers, activityMap } };
}

async function invokeAwardPoints({ user_email, action_type, action_id }) {
  const user = await base44.auth.me();
  if (!user) throw new Error('Unauthorized');
  if (user_email !== user.email && user.role !== 'admin') throw new Error('Forbidden');

  const allowed = {
    goal_completion: 25,
    badge_earned: 50,
    circle_post: 10
  };
  if (!allowed[action_type]) throw new Error(`Invalid action type: ${action_type}`);

  const { data: existingReward, error: rewardErr } = await supabase
    .from('reward_log')
    .select('*')
    .eq('user_email', user_email)
    .eq('action_type', action_type)
    .eq('action_id', action_id)
    .limit(1);
  throwIfError(rewardErr);
  if (existingReward?.length) {
    return { data: { success: false, error: 'Reward already claimed for this action' } };
  }

  const { data: pointsRows, error: pointsErr } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_email', user_email)
    .limit(1);
  throwIfError(pointsErr);

  let userPoints = pointsRows?.[0];
  if (!userPoints) {
    const created = await createEntityApi('UserPoints').create({
      user_email,
      total_points: 0,
      current_level: 1,
      points_to_next_level: 100
    });
    userPoints = created;
  }

  const pointsToAward = allowed[action_type];
  const newTotal = (userPoints.total_points || 0) + pointsToAward;
  const threshold = userPoints.points_to_next_level || 100;
  const leveledUp = newTotal >= threshold;
  const newLevel = leveledUp ? (userPoints.current_level || 1) + 1 : (userPoints.current_level || 1);
  const newPointsToNext = leveledUp ? Math.max(100 * newLevel - (newTotal - threshold), 0) : threshold;

  await createEntityApi('UserPoints').update(userPoints.id, {
    total_points: newTotal,
    current_level: newLevel,
    points_to_next_level: newPointsToNext
  });
  await createEntityApi('RewardLog').create({ user_email, action_type, action_id });

  return {
    data: {
      success: true,
      total_points: newTotal,
      level: newLevel,
      leveledUp,
      action_type
    }
  };
}

export const base44 = {
  auth: {
    async me() {
      const { data, error } = await supabase.auth.getUser();
      throwIfError(error);
      return normalizeUser(data?.user);
    },
    async logout(redirectTo) {
      const { error } = await supabase.auth.signOut();
      throwIfError(error);
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    },
    async redirectToLogin(redirectTo = window.location.href) {
      const email = window.prompt('Enter your email to sign in:');
      if (!email) return;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo }
      });
      throwIfError(error);
      window.alert('Check your email for a magic sign-in link.');
    },
    async signInWithGoogle(redirectTo = window.location.href) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      throwIfError(error);
    },
    _onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(async () => {
        const current = await base44.auth.me();
        callback(current);
      });
    }
  },
  entities: new Proxy(
    {},
    {
      get(_target, prop) {
        return createEntityApi(String(prop));
      }
    }
  ),
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const extension = file.name?.split('.').pop() || 'bin';
        const filePath = `public/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const { error: uploadErr } = await supabase.storage.from(uploadBucket).upload(filePath, file);
        throwIfError(uploadErr);
        const { data } = supabase.storage.from(uploadBucket).getPublicUrl(filePath);
        return { file_url: data.publicUrl };
      }
    }
  },
  functions: {
    async invoke(name, payload = {}) {
      if (name === 'createNotification') return invokeCreateNotification(payload);
      if (name === 'getLeaderboardData') return invokeGetLeaderboardData(payload);
      if (name === 'getAdminConsoleData') return invokeGetAdminConsoleData(payload);
      if (name === 'awardPoints') return invokeAwardPoints(payload);
      throw new Error(`Unsupported function: ${name}`);
    }
  }
};

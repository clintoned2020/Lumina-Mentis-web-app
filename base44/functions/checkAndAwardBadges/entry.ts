import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BADGE_DEFINITIONS = {
  'first_goal': {
    title: 'Goal Setter',
    description: 'Complete your first wellness goal',
    icon: '🎯',
    category: 'milestone',
    tier: 'bronze',
    check: (stats) => stats.goal_completions >= 1,
  },
  'seven_day_streak': {
    title: '7-Day Warrior',
    description: 'Achieve a 7-day streak',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    check: (stats) => stats.longest_streak >= 7,
  },
  'thirty_day_streak': {
    title: 'Consistency King',
    description: 'Achieve a 30-day streak',
    icon: '👑',
    category: 'streak',
    tier: 'silver',
    check: (stats) => stats.longest_streak >= 30,
  },
  'hundred_day_streak': {
    title: 'Century Champion',
    description: 'Achieve a 100-day streak',
    icon: '💯',
    category: 'streak',
    tier: 'gold',
    check: (stats) => stats.longest_streak >= 100,
  },
  'circle_contributor': {
    title: 'Community Helper',
    description: 'Make 10 contributions to circles',
    icon: '🤝',
    category: 'community',
    tier: 'bronze',
    check: (stats) => stats.circle_contributions >= 10,
  },
  'circle_supporter': {
    title: 'Supportive Soul',
    description: 'Give 25 support reactions',
    icon: '❤️',
    category: 'community',
    tier: 'silver',
    check: (stats) => stats.total_reactions_given >= 25,
  },
  'level_five': {
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'level',
    tier: 'silver',
    check: (stats, level) => level >= 5,
  },
  'level_ten': {
    title: 'Wellness Master',
    description: 'Reach level 10',
    icon: '🏆',
    category: 'level',
    tier: 'gold',
    check: (stats, level) => level >= 10,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();

    if (user_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user points
    const userPoints = await base44.asServiceRole.entities.UserPoints.filter({
      user_email,
    }).then(results => results[0]);

    if (!userPoints) {
      return Response.json({ newBadges: [] });
    }

    // Get existing achievements
    const existingAchievements = await base44.asServiceRole.entities.UserAchievement.filter({
      user_email,
    });
    const earnedBadgeIds = new Set(existingAchievements.map(a => a.badge_id));

    const newBadges = [];

    // Check each badge definition
    for (const [badgeId, definition] of Object.entries(BADGE_DEFINITIONS)) {
      if (!earnedBadgeIds.has(badgeId)) {
        const earned = definition.check(userPoints, userPoints.current_level);
        if (earned) {
          // Award badge
          await base44.asServiceRole.entities.UserAchievement.create({
            user_email,
            badge_id: badgeId,
            badge_title: definition.title,
            badge_icon: definition.icon,
            earned_at: new Date().toISOString(),
          });

          // Award points for badge
          const currentPoints = await base44.asServiceRole.entities.UserPoints.filter({
            user_email,
          }).then(results => results[0]);

          const pointsReward = definition.tier === 'bronze' ? 50 : definition.tier === 'silver' ? 100 : 200;
          const newTotal = currentPoints.total_points + pointsReward;
          const levelUp = newTotal >= currentPoints.points_to_next_level;

          await base44.asServiceRole.entities.UserPoints.update(currentPoints.id, {
            total_points: newTotal,
            current_level: levelUp ? currentPoints.current_level + 1 : currentPoints.current_level,
            points_to_next_level: levelUp ? 100 * (currentPoints.current_level + 2) : currentPoints.points_to_next_level,
          });

          newBadges.push({
            badge_id: badgeId,
            title: definition.title,
            icon: definition.icon,
            tier: definition.tier,
            points: pointsReward,
          });
        }
      }
    }

    return Response.json({ newBadges });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
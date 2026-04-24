import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Server-side point caps per action type (whitelist only)
const ALLOWED_ACTIONS = {
  'goal_completion': { points: 25, requiresId: true },
  'badge_earned': { points: 50, requiresId: true },
  'circle_post': { points: 10, requiresId: true },
};

function validateAction(action_type) {
  if (!ALLOWED_ACTIONS[action_type]) {
    return { valid: false, error: `Invalid action type: ${action_type}` };
  }
  return { valid: true, points: ALLOWED_ACTIONS[action_type].points, requiresId: ALLOWED_ACTIONS[action_type].requiresId };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, action_type, action_id } = await req.json();

    // Users can only award points to themselves for now (backend triggers actual awards)
    if (user_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate action type is allowed
    const validation = validateAction(action_type);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const pointsToAward = validation.points;

    // Verify action_id is provided if required
    if (validation.requiresId && !action_id) {
      return Response.json({ error: `Missing action ID for ${action_type}` }, { status: 400 });
    }

    // Check idempotency: prevent duplicate rewards for the same action
    const rewardLog = await base44.asServiceRole.entities.RewardLog.filter({
      user_email,
      action_type,
      action_id,
    }).then(results => results[0]);

    if (rewardLog) {
      return Response.json({ 
        error: 'Reward already claimed for this action',
        success: false,
      }, { status: 400 });
    }

    // Verify the actual action occurred (prevent arbitrary reward triggering)
    if (action_type === 'goal_completion') {
      const goal = await base44.asServiceRole.entities.WellnessGoal.filter({ id: action_id });
      if (!goal[0] || goal[0].user_email !== user_email) {
        return Response.json({ error: 'Goal not found or unauthorized' }, { status: 403 });
      }
      const today = new Date().toISOString().split('T')[0];
      if (goal[0].last_completed_date !== today) {
        return Response.json({ error: 'Goal not completed today' }, { status: 400 });
      }
    } else if (action_type === 'badge_earned') {
      const achievement = await base44.asServiceRole.entities.UserAchievement.filter({ id: action_id });
      if (!achievement[0] || achievement[0].user_email !== user_email) {
        return Response.json({ error: 'Achievement not found or unauthorized' }, { status: 403 });
      }
    } else if (action_type === 'circle_post') {
      const post = await base44.asServiceRole.entities.CirclePost.filter({ id: action_id });
      if (!post[0] || post[0].author_email !== user_email) {
        return Response.json({ error: 'Post not found or unauthorized' }, { status: 403 });
      }
    }

    // Get or create user points record
    let userPoints = await base44.asServiceRole.entities.UserPoints.filter({
      user_email,
    }).then(results => results[0]);

    if (!userPoints) {
      userPoints = await base44.asServiceRole.entities.UserPoints.create({
        user_email,
        total_points: 0,
        current_level: 1,
        points_to_next_level: 100,
      });
    }

    const newTotal = userPoints.total_points + pointsToAward;
    let leveledUp = false;
    let newLevel = userPoints.current_level;
    let newPointsToNext = userPoints.points_to_next_level;

    // Check for level ups
    if (newTotal >= userPoints.points_to_next_level) {
      leveledUp = true;
      const pointsOverThreshold = newTotal - userPoints.points_to_next_level;
      newLevel = userPoints.current_level + 1;
      const basePointsPerLevel = 100 * newLevel;
      newPointsToNext = basePointsPerLevel - pointsOverThreshold;
    }

    await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
      total_points: newTotal,
      current_level: newLevel,
      points_to_next_level: newPointsToNext,
    });

    // Log this reward to prevent double-claiming
    await base44.asServiceRole.entities.RewardLog.create({
      user_email,
      action_type,
      action_id,
    });

    return Response.json({
      success: true,
      total_points: newTotal,
      level: newLevel,
      leveledUp,
      action_type: action_type,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
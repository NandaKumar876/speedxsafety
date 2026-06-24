// ============================================
// SpeedxSafety - Badges Routes
// ============================================

const express = require('express');
const router = express.Router();

const defaultBadges = [
  { title: '7-Day Streak', description: 'Drive safely for 7 consecutive days', icon: '🔥', requirement: '7 consecutive safe days' },
  { title: 'Speed Demon Tamed', description: 'Complete 10 trips without exceeding the speed limit', icon: '🏎️', requirement: '10 trips under limit' },
  { title: 'Night Owl', description: 'Complete 5 nighttime trips within curfew rules', icon: '🦉', requirement: '5 safe nighttime trips' },
  { title: 'No Phone Hero', description: 'Complete a week without using phone while driving', icon: '📵', requirement: '7 days phone-free driving' },
  { title: 'Road Warrior', description: 'Drive over 500 km total distance', icon: '🛣️', requirement: '500 km total distance' },
  { title: 'Smooth Operator', description: 'No harsh braking events for 14 days', icon: '🧈', requirement: '14 days smooth driving' },
  { title: 'Early Bird', description: 'Complete 10 morning commute trips safely', icon: '🌅', requirement: '10 safe morning trips' },
  { title: 'Geofence Guardian', description: 'Stay within designated zones for 30 consecutive days', icon: '🛡️', requirement: '30 days inside zones' }
];

/**
 * GET /api/badges
 * List all default catalog badges.
 */
router.get('/', (_req, res) => {
  res.json({
    count: defaultBadges.length,
    badges: defaultBadges,
  });
});

/**
 * GET /api/badges/teen/:teenId
 * Get badge progress for a specific teen.
 * Returns each badge merged with teen-specific progress.
 * If no badges exist for this teen, it seeds the default badges catalog.
 */
router.get('/teen/:teenId', async (req, res) => {
  const { teenId } = req.params;
  try {
    const { data: dbBadges, error } = await req.supabase
      .from('badges')
      .select('*')
      .eq('teen_id', teenId);

    if (error) throw error;

    if (!dbBadges || dbBadges.length === 0) {
      // Auto seed default badges for this teen in the DB
      const insertData = defaultBadges.map(b => ({
        ...b,
        teen_id: teenId,
        progress: 0,
        earned: false,
        earned_date: null
      }));

      const { data: seeded, error: seedError } = await req.supabase
        .from('badges')
        .insert(insertData)
        .select();

      if (seedError) throw seedError;

      return res.json({
        teen_id: teenId,
        count: seeded.length,
        earned_count: 0,
        completion_rate: 0,
        badges: seeded,
      });
    }

    const earnedCount = dbBadges.filter(b => b.earned).length;

    res.json({
      teen_id: teenId,
      count: dbBadges.length,
      earned_count: earnedCount,
      completion_rate: Math.round((earnedCount / dbBadges.length) * 100),
      badges: dbBadges,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching badges',
    });
  }
});

/**
 * GET /api/badges/:id
 * Get a single badge by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { data: badge, error } = await req.supabase
      .from('badges')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !badge) {
      return res.status(404).json({ error: 'Not Found', message: 'Badge not found' });
    }

    res.json({ badge });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching badge details',
    });
  }
});

module.exports = router;

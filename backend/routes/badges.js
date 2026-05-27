// ============================================
// SpeedxSafety - Badges Routes
// ============================================

const express = require('express');
const router = express.Router();
const { badges, teenBadges } = require('../data/seedData');

/**
 * GET /api/badges
 * List all available badges (the "catalog").
 */
router.get('/', (_req, res) => {
  res.json({
    count: badges.length,
    badges,
  });
});

/**
 * GET /api/badges/teen/:teenId
 * Get badge progress for a specific teen.
 * Returns each badge merged with teen-specific progress.
 */
router.get('/teen/:teenId', (req, res) => {
  const { teenId } = req.params;
  const teenProgress = teenBadges[teenId];

  if (!teenProgress) {
    // If no teen-specific data, return all badges with 0 progress
    const defaultBadges = badges.map(b => ({
      ...b,
      earned: false,
      earnedDate: null,
      progress: 0,
    }));
    return res.json({
      teen_id: teenId,
      count: defaultBadges.length,
      earned_count: 0,
      badges: defaultBadges,
    });
  }

  // Merge catalog badges with teen-specific progress
  const merged = badges.map(badge => {
    const progress = teenProgress.find(p => p.badgeId === badge.id);
    if (progress) {
      return {
        ...badge,
        earned: progress.earned,
        earnedDate: progress.earnedDate,
        progress: progress.progress,
      };
    }
    return { ...badge, earned: false, earnedDate: null, progress: 0 };
  });

  const earnedCount = merged.filter(b => b.earned).length;

  res.json({
    teen_id: teenId,
    count: merged.length,
    earned_count: earnedCount,
    completion_rate: Math.round((earnedCount / merged.length) * 100),
    badges: merged,
  });
});

/**
 * GET /api/badges/:id
 * Get a single badge by ID.
 */
router.get('/:id', (req, res) => {
  const badge = badges.find(b => b.id === req.params.id);
  if (!badge) {
    return res.status(404).json({ error: 'Not Found', message: 'Badge not found' });
  }
  res.json({ badge });
});

module.exports = router;

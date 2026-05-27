// ============================================
// SpeedxSafety - Teens Routes
// ============================================

const express = require('express');
const router = express.Router();
const { teens } = require('../data/seedData');

/**
 * GET /api/teens
 * List all teens. Optional filter: ?parent_uid=xxx
 */
router.get('/', (req, res) => {
  const { parent_uid } = req.query;
  let result = teens;

  if (parent_uid) {
    result = teens.filter(t => t.parent_uid === parent_uid);
  }

  res.json({ count: result.length, teens: result });
});

/**
 * GET /api/teens/:id
 * Get a single teen by ID.
 */
router.get('/:id', (req, res) => {
  const teen = teens.find(t => t.teen_id === req.params.id);
  if (!teen) {
    return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
  }
  res.json({ teen });
});

/**
 * PUT /api/teens/:id
 * Update teen settings (speed_limit, curfew_start, curfew_end, name).
 */
router.put('/:id', (req, res) => {
  const index = teens.findIndex(t => t.teen_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
  }

  const allowedFields = ['name', 'speed_limit', 'curfew_start', 'curfew_end', 'avatar'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `No valid fields to update. Allowed: ${allowedFields.join(', ')}`,
    });
  }

  teens[index] = { ...teens[index], ...updates };

  res.json({
    message: 'Teen updated successfully',
    teen: teens[index],
  });
});

/**
 * GET /api/teens/:id/location
 * Get live location and driving status for a teen.
 */
router.get('/:id/location', (req, res) => {
  const teen = teens.find(t => t.teen_id === req.params.id);
  if (!teen) {
    return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
  }

  res.json({
    teen_id: teen.teen_id,
    name: teen.name,
    is_driving: teen.is_driving,
    current_speed: teen.current_speed || 0,
    current_lat: teen.current_lat,
    current_lng: teen.current_lng,
    speed_limit: teen.speed_limit,
    is_over_limit: (teen.current_speed || 0) > teen.speed_limit,
    last_updated: Date.now(),
  });
});

/**
 * POST /api/teens/:id/location
 * Update live location from device telemetry.
 * Body: { lat, lng, speed }
 */
router.post('/:id/location', (req, res) => {
  const index = teens.findIndex(t => t.teen_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
  }

  const { lat, lng, speed } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'lat and lng are required',
    });
  }

  teens[index].current_lat = lat;
  teens[index].current_lng = lng;
  teens[index].current_speed = speed || 0;
  teens[index].is_driving = (speed || 0) > 0;

  res.json({
    message: 'Location updated',
    location: {
      teen_id: teens[index].teen_id,
      lat,
      lng,
      speed: speed || 0,
      is_driving: teens[index].is_driving,
      timestamp: Date.now(),
    },
  });
});

module.exports = router;

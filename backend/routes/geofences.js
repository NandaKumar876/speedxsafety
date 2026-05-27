// ============================================
// SpeedxSafety - Geofences Routes
// ============================================

const express = require('express');
const router = express.Router();
const { geofences } = require('../data/seedData');
const { isInsideGeofence } = require('../utils/safety');

/**
 * GET /api/geofences
 * List all geofences. Optional filter: ?parent_uid=xxx, ?active=true
 */
router.get('/', (req, res) => {
  let result = [...geofences];

  if (req.query.parent_uid) {
    result = result.filter(g => g.parent_uid === req.query.parent_uid);
  }
  if (req.query.active === 'true') {
    result = result.filter(g => g.is_active);
  }
  if (req.query.active === 'false') {
    result = result.filter(g => !g.is_active);
  }

  res.json({ count: result.length, geofences: result });
});

/**
 * GET /api/geofences/:id
 * Get a single geofence by ID.
 */
router.get('/:id', (req, res) => {
  const geo = geofences.find(g => g.zone_id === req.params.id);
  if (!geo) {
    return res.status(404).json({ error: 'Not Found', message: 'Geofence not found' });
  }
  res.json({ geofence: geo });
});

/**
 * POST /api/geofences
 * Create a new geofence.
 * Body: { parent_uid, label, center_lat, center_lng, radius_m, color?, is_active? }
 */
router.post('/', (req, res) => {
  const { parent_uid, label, center_lat, center_lng, radius_m, color, is_active } = req.body;

  if (!parent_uid || !label || center_lat === undefined || center_lng === undefined || !radius_m) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Required fields: parent_uid, label, center_lat, center_lng, radius_m',
    });
  }

  const newGeofence = {
    zone_id: `geo-${Date.now()}`,
    parent_uid,
    label,
    center_lat,
    center_lng,
    radius_m,
    is_active: is_active !== undefined ? is_active : true,
    color: color || '#007AFF',
  };

  geofences.push(newGeofence);

  res.status(201).json({
    message: 'Geofence created',
    geofence: newGeofence,
  });
});

/**
 * PUT /api/geofences/:id
 * Update a geofence.
 */
router.put('/:id', (req, res) => {
  const index = geofences.findIndex(g => g.zone_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Geofence not found' });
  }

  const allowedFields = ['label', 'center_lat', 'center_lng', 'radius_m', 'is_active', 'color'];
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

  geofences[index] = { ...geofences[index], ...updates };

  res.json({
    message: 'Geofence updated',
    geofence: geofences[index],
  });
});

/**
 * DELETE /api/geofences/:id
 * Delete a geofence.
 */
router.delete('/:id', (req, res) => {
  const index = geofences.findIndex(g => g.zone_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Geofence not found' });
  }

  const deleted = geofences.splice(index, 1)[0];

  res.json({ message: 'Geofence deleted', geofence: deleted });
});

/**
 * POST /api/geofences/check
 * Check if a coordinate is inside any active geofence.
 * Body: { lat, lng, parent_uid? }
 */
router.post('/check', (req, res) => {
  const { lat, lng, parent_uid } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'lat and lng are required',
    });
  }

  let activeGeos = geofences.filter(g => g.is_active);
  if (parent_uid) {
    activeGeos = activeGeos.filter(g => g.parent_uid === parent_uid);
  }

  const results = activeGeos.map(g => ({
    zone_id: g.zone_id,
    label: g.label,
    is_inside: isInsideGeofence(lat, lng, g.center_lat, g.center_lng, g.radius_m),
  }));

  const insideAny = results.some(r => r.is_inside);

  res.json({
    lat,
    lng,
    inside_any: insideAny,
    zones_checked: results.length,
    results,
  });
});

module.exports = router;

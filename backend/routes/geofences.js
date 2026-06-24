// ============================================
// SpeedxSafety - Geofences Routes
// ============================================

const express = require('express');
const router = express.Router();
const { isInsideGeofence } = require('../utils/safety');

/**
 * GET /api/geofences
 * List all geofences. Optional filter: ?parent_uid=xxx, ?active=true
 */
router.get('/', async (req, res) => {
  try {
    let query = req.supabase.from('geofences').select('*');

    if (req.query.parent_uid) {
      query = query.eq('parent_uid', req.query.parent_uid);
    }
    if (req.query.active === 'true') {
      query = query.eq('is_active', true);
    }
    if (req.query.active === 'false') {
      query = query.eq('is_active', false);
    }

    const { data: results, error } = await query;
    if (error) throw error;

    res.json({ count: results.length, geofences: results });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching geofences',
    });
  }
});

/**
 * GET /api/geofences/:id
 * Get a single geofence by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { data: geo, error } = await req.supabase
      .from('geofences')
      .select('*')
      .eq('zone_id', req.params.id)
      .single();

    if (error || !geo) {
      return res.status(404).json({ error: 'Not Found', message: 'Geofence not found' });
    }

    res.json({ geofence: geo });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching geofence details',
    });
  }
});

/**
 * POST /api/geofences
 * Create a new geofence.
 * Body: { parent_uid, label, center_lat, center_lng, radius_m, color?, is_active? }
 */
router.post('/', async (req, res) => {
  const { parent_uid, label, center_lat, center_lng, radius_m, color, is_active } = req.body;

  if (!parent_uid || !label || center_lat === undefined || center_lng === undefined || !radius_m) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Required fields: parent_uid, label, center_lat, center_lng, radius_m',
    });
  }

  try {
    const { data: newGeofence, error } = await req.supabase
      .from('geofences')
      .insert({
        parent_uid,
        label,
        center_lat,
        center_lng,
        radius_m,
        is_active: is_active !== undefined ? is_active : true,
        color: color || '#007AFF',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Geofence created',
      geofence: newGeofence,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Insert Failed',
      message: error.message || 'An error occurred creating the geofence',
    });
  }
});

/**
 * PUT /api/geofences/:id
 * Update a geofence.
 */
router.put('/:id', async (req, res) => {
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

  try {
    const { data: updatedGeofence, error } = await req.supabase
      .from('geofences')
      .update(updates)
      .eq('zone_id', req.params.id)
      .select()
      .single();

    if (error || !updatedGeofence) {
      return res.status(404).json({ error: 'Not Found', message: 'Geofence not found' });
    }

    res.json({
      message: 'Geofence updated',
      geofence: updatedGeofence,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Update Failed',
      message: error.message || 'An error occurred updating the geofence',
    });
  }
});

/**
 * DELETE /api/geofences/:id
 * Delete a geofence.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { data: deletedGeofence, error } = await req.supabase
      .from('geofences')
      .delete()
      .eq('zone_id', req.params.id)
      .select()
      .single();

    if (error || !deletedGeofence) {
      return res.status(404).json({ error: 'Not Found', message: 'Geofence not found' });
    }

    res.json({ message: 'Geofence deleted', geofence: deletedGeofence });
  } catch (error) {
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message || 'An error occurred deleting the geofence',
    });
  }
});

/**
 * POST /api/geofences/check
 * Check if a coordinate is inside any active geofence.
 * Body: { lat, lng, parent_uid? }
 */
router.post('/check', async (req, res) => {
  const { lat, lng, parent_uid } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'lat and lng are required',
    });
  }

  try {
    let query = req.supabase.from('geofences').select('*').eq('is_active', true);
    if (parent_uid) {
      query = query.eq('parent_uid', parent_uid);
    }

    const { data: activeGeos, error } = await query;
    if (error) throw error;

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
  } catch (error) {
    res.status(500).json({
      error: 'Check Failed',
      message: error.message || 'An error occurred checking geofence coordinates',
    });
  }
});

module.exports = router;

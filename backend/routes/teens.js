// ============================================
// SpeedxSafety - Teens Routes
// ============================================

const express = require('express');
const router = express.Router();

/**
 * GET /api/teens
 * List all teens. Optional filter: ?parent_uid=xxx
 */
router.get('/', async (req, res) => {
  const { parent_uid } = req.query;
  try {
    let query = req.supabase.from('teens').select('*');
    if (parent_uid) {
      query = query.eq('parent_uid', parent_uid);
    }

    const { data: results, error } = await query.order('name');
    if (error) throw error;

    res.json({ count: results.length, teens: results });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching teens',
    });
  }
});

/**
 * GET /api/teens/:id
 * Get a single teen by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { data: teen, error } = await req.supabase
      .from('teens')
      .select('*')
      .eq('teen_id', req.params.id)
      .single();

    if (error || !teen) {
      return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
    }

    res.json({ teen });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching teen details',
    });
  }
});

/**
 * PUT /api/teens/:id
 * Update teen settings (speed_limit, curfew_start, curfew_end, name).
 */
router.put('/:id', async (req, res) => {
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

  try {
    const { data: updatedTeen, error } = await req.supabase
      .from('teens')
      .update(updates)
      .eq('teen_id', req.params.id)
      .select()
      .single();

    if (error || !updatedTeen) {
      return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
    }

    res.json({
      message: 'Teen updated successfully',
      teen: updatedTeen,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Update Failed',
      message: error.message || 'An error occurred updating the teen profile',
    });
  }
});

/**
 * GET /api/teens/:id/location
 * Get live location and driving status for a teen.
 */
router.get('/:id/location', async (req, res) => {
  try {
    const { data: teen, error } = await req.supabase
      .from('teens')
      .select('*')
      .eq('teen_id', req.params.id)
      .single();

    if (error || !teen) {
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
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching location data',
    });
  }
});

/**
 * POST /api/teens/:id/location
 * Update live location from device telemetry.
 * Body: { lat, lng, speed, heading }
 */
router.post('/:id/location', async (req, res) => {
  const { lat, lng, speed, heading } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'lat and lng are required',
    });
  }

  try {
    // Update current location in teens table
    const { data: teen, error: updateError } = await req.supabase
      .from('teens')
      .update({
        current_lat: lat,
        current_lng: lng,
        current_speed: speed || 0,
        is_driving: (speed || 0) > 0,
      })
      .eq('teen_id', req.params.id)
      .select()
      .single();

    if (updateError || !teen) {
      return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
    }

    // Insert historical trail entry in teen_locations
    const { error: insertLocError } = await req.supabase
      .from('teen_locations')
      .insert({
        teen_id: req.params.id,
        lat,
        lng,
        speed: speed || 0,
        heading: heading || 0,
        timestamp: Date.now(),
      });

    if (insertLocError) {
      console.warn('Telemetry insert warning:', insertLocError);
    }

    res.json({
      message: 'Location updated',
      location: {
        teen_id: req.params.id,
        lat,
        lng,
        speed: speed || 0,
        is_driving: teen.is_driving,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Update Failed',
      message: error.message || 'An error occurred updating location telemetry',
    });
  }
});

module.exports = router;

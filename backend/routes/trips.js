// ============================================
// SpeedxSafety - Trips Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getGrade, calculateSafetyScore } = require('../utils/safety');

/**
 * GET /api/trips
 * List all trips. Optional filters: ?teen_id=xxx, ?grade=A
 */
router.get('/', async (req, res) => {
  try {
    let query = req.supabase.from('trips').select('*');

    if (req.query.teen_id) {
      query = query.eq('teen_id', req.query.teen_id);
    }
    if (req.query.grade) {
      query = query.eq('safety_grade', req.query.grade.toUpperCase());
    }

    const { data: results, error } = await query.order('start_time', { ascending: false });
    if (error) throw error;

    res.json({ count: results.length, trips: results });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching trips',
    });
  }
});

/**
 * GET /api/trips/teen/:teenId
 * Get all trips for a specific teen, sorted by most recent.
 */
router.get('/teen/:teenId', async (req, res) => {
  const { teenId } = req.params;
  try {
    const { data: teenTrips, error } = await req.supabase
      .from('trips')
      .select('*')
      .eq('teen_id', teenId)
      .order('start_time', { ascending: false });

    if (error) throw error;

    if (!teenTrips || teenTrips.length === 0) {
      return res.json({ count: 0, trips: [], message: 'No trips found for this teen' });
    }

    // Calculate summary stats
    const totalDistance = teenTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0);
    const totalDuration = teenTrips.reduce((sum, t) => sum + ((t.end_time || t.start_time) - t.start_time), 0);
    const avgSpeed = teenTrips.reduce((sum, t) => sum + (t.avg_speed || 0), 0) / teenTrips.length;
    const maxSpeed = Math.max(...teenTrips.map(t => t.max_speed || 0));
    const totalViolations = teenTrips.reduce((sum, t) => sum + (t.violations || 0), 0);

    res.json({
      count: teenTrips.length,
      trips: teenTrips,
      summary: {
        total_distance_km: Math.round(totalDistance * 10) / 10,
        total_duration_ms: totalDuration,
        avg_speed: Math.round(avgSpeed),
        max_speed: maxSpeed,
        total_violations: totalViolations,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching teen trips',
    });
  }
});

/**
 * GET /api/trips/:id
 * Get a single trip by ID (includes route data compiled from location trail).
 */
router.get('/:id', async (req, res) => {
  try {
    const { data: trip, error } = await req.supabase
      .from('trips')
      .select('*')
      .eq('trip_id', req.params.id)
      .single();

    if (error || !trip) {
      return res.status(404).json({ error: 'Not Found', message: 'Trip not found' });
    }

    // Find the teen for context
    const { data: teen } = await req.supabase
      .from('teens')
      .select('name, speed_limit')
      .eq('teen_id', trip.teen_id)
      .single();

    // Compile route points from teen_locations
    const { data: routePoints } = await req.supabase
      .from('teen_locations')
      .select('lat, lng, speed, timestamp')
      .eq('teen_id', trip.teen_id)
      .gte('timestamp', trip.start_time)
      .lte('timestamp', trip.end_time || Date.now())
      .order('timestamp', { ascending: true });

    res.json({
      trip: {
        ...trip,
        route: routePoints || [],
      },
      teen_name: teen ? teen.name : 'Unknown',
      speed_limit: teen ? teen.speed_limit : null,
      was_over_limit: teen ? trip.max_speed > teen.speed_limit : false,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching trip details',
    });
  }
});

/**
 * POST /api/trips
 * Create a new trip record with automatic safety grading.
 */
router.post('/', async (req, res) => {
  const {
    teen_id, start_time, end_time, max_speed, avg_speed,
    distance_km, start_lat, start_lng, end_lat, end_lng,
    violations = 0,
  } = req.body;

  if (!teen_id || !start_time || max_speed === undefined || avg_speed === undefined) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Required fields: teen_id, start_time, max_speed, avg_speed',
    });
  }

  try {
    const { data: teen } = await req.supabase
      .from('teens')
      .select('*')
      .eq('teen_id', teen_id)
      .single();

    if (!teen) {
      return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
    }

    // Retrieve previous trips and alerts to calculate safety score
    const { data: teenTrips } = await req.supabase
      .from('trips')
      .select('violations')
      .eq('teen_id', teen_id);

    const { data: teenAlerts } = await req.supabase
      .from('alerts')
      .select('*')
      .eq('teen_id', teen_id);

    const score = calculateSafetyScore([...(teenTrips || []), { violations }], teenAlerts || [], teen.streak_days);
    const safety_grade = getGrade(score);

    const { data: newTrip, error: insertError } = await req.supabase
      .from('trips')
      .insert({
        teen_id,
        start_time,
        end_time: end_time || null,
        max_speed,
        avg_speed,
        distance_km: distance_km || 0,
        start_lat: start_lat || 0,
        start_lng: start_lng || 0,
        end_lat: end_lat || null,
        end_lng: end_lng || null,
        safety_grade,
        violations,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update teen's last trip date and safety score
    await req.supabase
      .from('teens')
      .update({
        last_trip_date: start_time,
        safety_score: score,
      })
      .eq('teen_id', teen_id);

    res.status(201).json({
      message: 'Trip recorded successfully',
      trip: newTrip,
      updated_safety_score: score,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Insert Failed',
      message: error.message || 'An error occurred recording the trip',
    });
  }
});

module.exports = router;

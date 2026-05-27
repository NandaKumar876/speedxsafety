// ============================================
// SpeedxSafety - Trips Routes
// ============================================

const express = require('express');
const router = express.Router();
const { trips, teens, alerts } = require('../data/seedData');
const { getGrade, calculateSafetyScore } = require('../utils/safety');

/**
 * GET /api/trips
 * List all trips. Optional filters: ?teen_id=xxx, ?grade=A
 */
router.get('/', (req, res) => {
  let result = [...trips];

  if (req.query.teen_id) {
    result = result.filter(t => t.teen_id === req.query.teen_id);
  }
  if (req.query.grade) {
    result = result.filter(t => t.safety_grade === req.query.grade.toUpperCase());
  }

  // Sort by start_time descending (most recent first)
  result.sort((a, b) => b.start_time - a.start_time);

  res.json({ count: result.length, trips: result });
});

/**
 * GET /api/trips/teen/:teenId
 * Get all trips for a specific teen, sorted by most recent.
 */
router.get('/teen/:teenId', (req, res) => {
  const teenTrips = trips
    .filter(t => t.teen_id === req.params.teenId)
    .sort((a, b) => b.start_time - a.start_time);

  if (teenTrips.length === 0) {
    return res.json({ count: 0, trips: [], message: 'No trips found for this teen' });
  }

  // Calculate summary stats
  const totalDistance = teenTrips.reduce((sum, t) => sum + t.distance_km, 0);
  const totalDuration = teenTrips.reduce((sum, t) => sum + ((t.end_time || t.start_time) - t.start_time), 0);
  const avgSpeed = teenTrips.reduce((sum, t) => sum + t.avg_speed, 0) / teenTrips.length;
  const maxSpeed = Math.max(...teenTrips.map(t => t.max_speed));
  const totalViolations = teenTrips.reduce((sum, t) => sum + t.violations, 0);

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
});

/**
 * GET /api/trips/:id
 * Get a single trip by ID (includes route data).
 */
router.get('/:id', (req, res) => {
  const trip = trips.find(t => t.trip_id === req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Not Found', message: 'Trip not found' });
  }

  // Find the teen for context
  const teen = teens.find(t => t.teen_id === trip.teen_id);

  res.json({
    trip,
    teen_name: teen ? teen.name : 'Unknown',
    speed_limit: teen ? teen.speed_limit : null,
    was_over_limit: teen ? trip.max_speed > teen.speed_limit : false,
  });
});

/**
 * POST /api/trips
 * Create a new trip record with automatic safety grading.
 * Body: { teen_id, start_time, end_time, max_speed, avg_speed, distance_km,
 *         start_lat, start_lng, end_lat, end_lng, violations, route? }
 */
router.post('/', (req, res) => {
  const {
    teen_id, start_time, end_time, max_speed, avg_speed,
    distance_km, start_lat, start_lng, end_lat, end_lng,
    violations = 0, route = [],
  } = req.body;

  if (!teen_id || !start_time || max_speed === undefined || avg_speed === undefined) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Required fields: teen_id, start_time, max_speed, avg_speed',
    });
  }

  const teen = teens.find(t => t.teen_id === teen_id);
  if (!teen) {
    return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
  }

  // Calculate safety grade based on teen's trips + this new one
  const teenTrips = trips.filter(t => t.teen_id === teen_id);
  const teenAlerts = alerts.filter(a => a.teen_id === teen_id);
  const score = calculateSafetyScore([...teenTrips, { violations }], teenAlerts, teen.streak_days);
  const safety_grade = getGrade(score);

  const newTrip = {
    trip_id: `trip-${Date.now()}`,
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
    route,
  };

  trips.push(newTrip);

  // Update teen's last trip date and safety score
  const teenIndex = teens.findIndex(t => t.teen_id === teen_id);
  if (teenIndex !== -1) {
    teens[teenIndex].last_trip_date = start_time;
    teens[teenIndex].safety_score = score;
  }

  res.status(201).json({
    message: 'Trip recorded successfully',
    trip: newTrip,
    updated_safety_score: score,
  });
});

module.exports = router;

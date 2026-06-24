// ============================================
// SpeedxSafety - Reports Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getGrade, calculateSafetyScore } = require('../utils/safety');

/**
 * GET /api/reports/weekly/:teenId
 * Get weekly driving report for a teen.
 */
router.get('/weekly/:teenId', async (req, res) => {
  const { teenId } = req.params;
  try {
    const { data: report, error } = await req.supabase
      .from('weekly_reports')
      .select('*')
      .eq('teen_id', teenId)
      .order('week_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const { data: teen } = await req.supabase
      .from('teens')
      .select('name')
      .eq('teen_id', teenId)
      .single();

    res.json({
      teen_id: teenId,
      teen_name: teen ? teen.name : 'Unknown',
      report: report || {
        teen_id: teenId,
        week_start: Date.now() - 7 * 24 * 60 * 60 * 1000,
        week_end: Date.now(),
        total_trips: 0,
        total_distance: 0,
        total_duration: 0,
        avg_speed: 0,
        max_speed: 0,
        violations: 0,
        safety_grade: 'A',
        daily_trips: [0, 0, 0, 0, 0, 0, 0],
        score_trend: [100, 100, 100, 100, 100, 100, 100]
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching the weekly report',
    });
  }
});

/**
 * GET /api/reports/summary/:teenId
 * Get all-time driving summary for a teen.
 * Calculated dynamically from trip and alert data.
 */
router.get('/summary/:teenId', async (req, res) => {
  const { teenId } = req.params;

  try {
    const { data: teen, error: teenError } = await req.supabase
      .from('teens')
      .select('*')
      .eq('teen_id', teenId)
      .single();

    if (teenError || !teen) {
      return res.status(404).json({ error: 'Not Found', message: 'Teen not found' });
    }

    const { data: teenTrips, error: tripsError } = await req.supabase
      .from('trips')
      .select('*')
      .eq('teen_id', teenId);

    if (tripsError) throw tripsError;

    const { data: teenAlerts, error: alertsError } = await req.supabase
      .from('alerts')
      .select('*')
      .eq('teen_id', teenId);

    if (alertsError) throw alertsError;

    if (!teenTrips || teenTrips.length === 0) {
      return res.json({
        teen_id: teenId,
        teen_name: teen.name,
        message: 'No trip data available yet',
        summary: {
          total_trips: 0,
          total_distance_km: 0,
          total_duration_ms: 0,
          avg_speed: 0,
          max_speed: 0,
          total_violations: 0,
          safety_score: 100,
          safety_grade: 'A',
          grade_distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        },
      });
    }

    // Calculate all-time stats
    const totalDistance = teenTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0);
    const totalDuration = teenTrips.reduce((sum, t) => sum + ((t.end_time || t.start_time) - t.start_time), 0);
    const avgSpeed = teenTrips.reduce((sum, t) => sum + (t.avg_speed || 0), 0) / teenTrips.length;
    const maxSpeed = Math.max(...teenTrips.map(t => t.max_speed || 0));
    const totalViolations = teenTrips.reduce((sum, t) => sum + (t.violations || 0), 0);
    const safetyScore = calculateSafetyScore(teenTrips, teenAlerts || [], teen.streak_days);

    // Grade distribution
    const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    teenTrips.forEach(t => {
      if (gradeDistribution[t.safety_grade] !== undefined) {
        gradeDistribution[t.safety_grade]++;
      }
    });

    // Alerts by type
    const alertsByType = {};
    (teenAlerts || []).forEach(a => {
      alertsByType[a.type] = (alertsByType[a.type] || 0) + 1;
    });

    // Time-of-day breakdown (morning/afternoon/evening/night)
    const timeBreakdown = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    teenTrips.forEach(t => {
      const hour = new Date(t.start_time).getHours();
      if (hour >= 5 && hour < 12) timeBreakdown.morning++;
      else if (hour >= 12 && hour < 17) timeBreakdown.afternoon++;
      else if (hour >= 17 && hour < 21) timeBreakdown.evening++;
      else timeBreakdown.night++;
    });

    // Longest trip
    const longestTrip = teenTrips.reduce((max, t) => (t.distance_km || 0) > (max.distance_km || 0) ? t : max, teenTrips[0]);

    // Average trip distance
    const avgDistance = totalDistance / teenTrips.length;

    res.json({
      teen_id: teenId,
      teen_name: teen.name,
      summary: {
        total_trips: teenTrips.length,
        total_distance_km: Math.round(totalDistance * 10) / 10,
        total_duration_ms: totalDuration,
        total_duration_hours: Math.round((totalDuration / (60 * 60 * 1000)) * 10) / 10,
        avg_speed: Math.round(avgSpeed),
        max_speed: maxSpeed,
        avg_distance_km: Math.round(avgDistance * 10) / 10,
        total_violations: totalViolations,
        safety_score: safetyScore,
        safety_grade: getGrade(safetyScore),
        streak_days: teen.streak_days,
        grade_distribution: gradeDistribution,
        alerts_by_type: alertsByType,
        time_breakdown: timeBreakdown,
        longest_trip: {
          trip_id: longestTrip.trip_id,
          distance_km: longestTrip.distance_km,
          date: longestTrip.start_time,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching summary reports',
    });
  }
});

module.exports = router;

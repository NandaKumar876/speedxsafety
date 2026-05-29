// ============================================
// SpeedxSafety - Safety Utilities (Server-Side)
// ============================================
// Port of frontend safety logic for server-side calculations.

/**
 * Calculate safety grade letter from a 0-100 score.
 * @param {number} score
 * @returns {'A'|'B'|'C'|'D'|'F'}
 */
const getGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

/**
 * Calculate a weighted safety score from trip data, alerts, and streak.
 *
 * Components (max 100):
 *  - Trip compliance (max 40): % of trips with 0 violations
 *  - Speed compliance (max 30): penalized by avg violations per trip
 *  - Streak bonus   (max 20): +2 per consecutive safe day (capped)
 *  - Base bonus          (10): starting credit
 *  - Alert penalty  (max -15): -3 per recent alert (last 7 days)
 *
 * @param {Array} trips
 * @param {Array} alerts
 * @param {number} streakDays
 * @returns {number} 0–100
 */
const calculateSafetyScore = (trips, alerts, streakDays) => {
  if (!trips || trips.length === 0) return 100;

  const safeTrips = trips.filter(t => t.violations === 0).length;
  const tripScore = (safeTrips / trips.length) * 40;

  const avgViolations = trips.reduce((sum, t) => sum + t.violations, 0) / trips.length;
  const speedScore = Math.max(0, 30 - avgViolations * 10);

  const streakScore = Math.min((streakDays || 0) * 2, 20);

  const now = Date.now();
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const recentAlerts = (alerts || []).filter(a => now - a.timestamp < WEEK).length;
  const alertPenalty = Math.min(recentAlerts * 3, 15);

  const raw = tripScore + speedScore + streakScore + 10 - alertPenalty;
  return Math.round(Math.max(0, Math.min(100, raw)));
};

/**
 * Haversine distance between two lat/lng points.
 * @returns {number} distance in meters
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Check if a point is inside a circular geofence.
 */
const isInsideGeofence = (lat, lng, centerLat, centerLng, radiusM) => {
  return haversineDistance(lat, lng, centerLat, centerLng) <= radiusM;
};

/**
 * Check if current time falls within a curfew window.
 * Handles midnight crossing (e.g. 22:00 → 06:00).
 * @param {string} curfewStart "HH:MM"
 * @param {string} curfewEnd   "HH:MM"
 * @returns {boolean}
 */
const isInCurfew = (curfewStart, curfewEnd) => {
  if (!curfewStart || !curfewEnd || !/^\d{1,2}:\d{2}$/.test(curfewStart) || !/^\d{1,2}:\d{2}$/.test(curfewEnd)) {
    return false;
  }

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = curfewStart.split(':').map(Number);
  const [eh, em] = curfewEnd.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  if (start > end) {
    // Crosses midnight
    return current >= start || current < end;
  }
  return current >= start && current < end;
};

// Harsh braking / crash detection thresholds (m/s²)
const HARSH_BRAKE_THRESHOLD = -8;
const CRASH_THRESHOLD = -20;

const detectHarshBraking = (acceleration) => acceleration < HARSH_BRAKE_THRESHOLD;
const detectCrash = (acceleration) => acceleration < CRASH_THRESHOLD;

/**
 * Calculate speed between two location points (km/h).
 */
const calculateSpeed = (p1, p2) => {
  const dist = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
  const timeSec = (p2.timestamp - p1.timestamp) / 1000;
  return timeSec > 0 ? (dist / timeSec) * 3.6 : 0;
};

module.exports = {
  getGrade,
  calculateSafetyScore,
  haversineDistance,
  isInsideGeofence,
  isInCurfew,
  detectHarshBraking,
  detectCrash,
  calculateSpeed,
  HARSH_BRAKE_THRESHOLD,
  CRASH_THRESHOLD,
};

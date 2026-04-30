// SpeedxSafety - Safety Score & Crash Detection
import { Trip, Alert, SafetyGrade } from '../types';

// Calculate safety grade from score (0-100)
export const getGrade = (score: number): SafetyGrade => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

// Calculate safety score from recent trip data
export const calculateSafetyScore = (
  trips: Trip[],
  alerts: Alert[],
  streakDays: number
): number => {
  if (trips.length === 0) return 100;

  // Base score (A-grade trips %)
  const safeTrips = trips.filter(t => t.violations === 0).length;
  const tripScore = (safeTrips / trips.length) * 40; // max 40

  // Speed compliance
  const avgViolations = trips.reduce((s, t) => s + t.violations, 0) / trips.length;
  const speedScore = Math.max(0, 30 - avgViolations * 10); // max 30

  // Streak bonus
  const streakScore = Math.min(streakDays * 2, 20); // max 20

  // Alert penalty
  const recentAlerts = alerts.filter(
    a => Date.now() - a.timestamp < 7 * 24 * 60 * 60 * 1000
  ).length;
  const alertPenalty = Math.min(recentAlerts * 3, 15);

  return Math.round(Math.max(0, Math.min(100, tripScore + speedScore + streakScore + 10 - alertPenalty)));
};

// Harsh braking detection thresholds (m/s²)
export const HARSH_BRAKE_THRESHOLD = -8; // m/s²
export const CRASH_THRESHOLD = -20; // m/s²

export const detectHarshBraking = (acceleration: number): boolean => {
  return acceleration < HARSH_BRAKE_THRESHOLD;
};

export const detectCrash = (acceleration: number): boolean => {
  return acceleration < CRASH_THRESHOLD;
};

// Geofence check (Haversine)
export const isInsideGeofence = (
  lat: number, lng: number,
  centerLat: number, centerLng: number,
  radiusM: number
): boolean => {
  const R = 6371e3;
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (centerLat * Math.PI) / 180;
  const Δφ = ((centerLat - lat) * Math.PI) / 180;
  const Δλ = ((centerLng - lng) * Math.PI) / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return d <= radiusM;
};

// Night curfew check
export const isInCurfew = (curfewStart: string, curfewEnd: string): boolean => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const current = h * 60 + m;
  
  const [sh, sm] = curfewStart.split(':').map(Number);
  const [eh, em] = curfewEnd.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  if (start > end) {
    // Crosses midnight (e.g., 22:00 to 06:00)
    return current >= start || current < end;
  }
  return current >= start && current < end;
};

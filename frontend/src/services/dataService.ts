// ============================================
// SpeedxSafety - Data Service (Supabase CRUD & Test Mode)
// ============================================

import { supabase, TEST_MODE } from './supabase';
import { Teen, Trip, Alert, Geofence, Badge, WeeklyReport } from '../types';
import { mockTeens, mockTrips, mockAlerts, mockGeofences, mockBadges, mockWeeklyReport } from '../data/mockData';

// Local in-memory databases for interactive testing
let testTeens: Teen[] = [...mockTeens];
let testTrips: Trip[] = [...mockTrips];
let testAlerts: Alert[] = [...mockAlerts];
let testGeofences: Geofence[] = [...mockGeofences];
let testBadges: Badge[] = [...mockBadges];
let testWeeklyReport: WeeklyReport = { ...mockWeeklyReport };

// ── Teens ────────────────────────────────────

export const getTeens = async (parentId: string): Promise<Teen[]> => {
  if (TEST_MODE) {
    return testTeens;
  }

  const { data, error } = await supabase
    .from('teens')
    .select('*')
    .eq('parent_uid', parentId)
    .order('name');
  if (error) throw error;
  return data || [];
};

export const getTeen = async (teenId: string): Promise<Teen | null> => {
  if (TEST_MODE) {
    return testTeens.find(t => t.teen_id === teenId) || null;
  }

  const { data, error } = await supabase
    .from('teens')
    .select('*')
    .eq('teen_id', teenId)
    .single();
  if (error) throw error;
  return data;
};

export const updateTeenLocation = async (teenId: string, lat: number, lng: number, speed: number, heading: number = 0) => {
  if (TEST_MODE) {
    testTeens = testTeens.map(t =>
      t.teen_id === teenId
        ? { ...t, current_lat: lat, current_lng: lng, current_speed: speed, is_driving: speed > 0 }
        : t
    );
    // Add real-time simulated alerts if speed limit is exceeded in test mode
    const teen = testTeens.find(t => t.teen_id === teenId);
    if (teen && speed > teen.speed_limit) {
      await createAlert({
        teen_id: teenId,
        teen_name: teen.name,
        type: 'speed',
        message: `${teen.name} is speeding: ${Math.round(speed)} km/h in a ${teen.speed_limit} km/h zone`,
        lat,
        lng,
        speed_recorded: speed,
        speed_limit: teen.speed_limit,
      });
    }
    return;
  }

  // Update teen's current location
  const { error: teenError } = await supabase
    .from('teens')
    .update({ current_lat: lat, current_lng: lng, current_speed: speed, is_driving: speed > 0 })
    .eq('teen_id', teenId);

  // Insert location record for trail
  const { error: locError } = await supabase
    .from('teen_locations')
    .insert({ teen_id: teenId, lat, lng, speed, heading, timestamp: Date.now() });

  if (teenError) throw teenError;
  if (locError) throw locError;
};

// ── Trips ────────────────────────────────────

export const getTrips = async (teenId: string): Promise<Trip[]> => {
  if (TEST_MODE) {
    return testTrips.filter(t => t.teen_id === teenId);
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('teen_id', teenId)
    .order('start_time', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createTrip = async (trip: Partial<Trip>) => {
  if (TEST_MODE) {
    const newTrip: Trip = {
      trip_id: 'trip-' + Math.random().toString(36).substr(2, 9),
      teen_id: trip.teen_id || 'teen-001',
      start_time: trip.start_time || Date.now(),
      max_speed: trip.max_speed || 0,
      avg_speed: trip.avg_speed || 0,
      distance_km: trip.distance_km || 0,
      safety_grade: trip.safety_grade || 'A',
      violations: trip.violations || 0,
      ...trip,
    };
    testTrips = [newTrip, ...testTrips];
    return newTrip;
  }

  const { data, error } = await supabase
    .from('trips')
    .insert(trip)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const endTrip = async (tripId: string, endData: Partial<Trip>) => {
  if (TEST_MODE) {
    let updated: Trip | null = null;
    testTrips = testTrips.map(t => {
      if (t.trip_id === tripId) {
        updated = { ...t, ...endData };
        return updated;
      }
      return t;
    });
    return updated || endData;
  }

  const { data, error } = await supabase
    .from('trips')
    .update(endData)
    .eq('trip_id', tripId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── Alerts ───────────────────────────────────

export const getAlerts = async (parentId: string): Promise<Alert[]> => {
  if (TEST_MODE) {
    return testAlerts;
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createAlert = async (alert: Partial<Alert>) => {
  if (TEST_MODE) {
    const newAlert: Alert = {
      alert_id: 'alert-' + Math.random().toString(36).substr(2, 9),
      teen_id: alert.teen_id || 'teen-001',
      teen_name: alert.teen_name || 'Alex Johnson',
      type: alert.type || 'speed',
      message: alert.message || 'Speed limit exceeded',
      lat: alert.lat || 37.7749,
      lng: alert.lng || -122.4194,
      timestamp: alert.timestamp || Date.now(),
      read: false,
      ...alert,
    };
    testAlerts = [newAlert, ...testAlerts];
    return newAlert;
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert(alert)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const markAlertRead = async (alertId: string) => {
  if (TEST_MODE) {
    testAlerts = testAlerts.map(a =>
      a.alert_id === alertId ? { ...a, read: true } : a
    );
    return;
  }

  const { error } = await supabase
    .from('alerts')
    .update({ read: true })
    .eq('alert_id', alertId);
  if (error) throw error;
};

export const markAllAlertsRead = async (parentId: string) => {
  if (TEST_MODE) {
    testAlerts = testAlerts.map(a => ({ ...a, read: true }));
    return;
  }

  const { error } = await supabase
    .from('alerts')
    .update({ read: true })
    .eq('read', false);
  if (error) throw error;
};

// ── Geofences ────────────────────────────────

export const getGeofences = async (parentId: string): Promise<Geofence[]> => {
  if (TEST_MODE) {
    return testGeofences;
  }

  const { data, error } = await supabase
    .from('geofences')
    .select('*')
    .eq('parent_uid', parentId)
    .order('label');
  if (error) throw error;
  return data || [];
};

export const createGeofence = async (geofence: Partial<Geofence>) => {
  if (TEST_MODE) {
    const newGeo: Geofence = {
      zone_id: 'geo-' + Math.random().toString(36).substr(2, 9),
      parent_uid: geofence.parent_uid || 'parent-001',
      label: geofence.label || 'New Safe Zone',
      center_lat: geofence.center_lat || 37.7749,
      center_lng: geofence.center_lng || -122.4194,
      radius_m: geofence.radius_m || 100,
      is_active: geofence.is_active !== undefined ? geofence.is_active : true,
      color: geofence.color || '#22C55E',
    };
    testGeofences = [...testGeofences, newGeo];
    return newGeo;
  }

  const { data, error } = await supabase
    .from('geofences')
    .insert(geofence)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGeofence = async (zoneId: string, updates: Partial<Geofence>) => {
  if (TEST_MODE) {
    let updated: Geofence | null = null;
    testGeofences = testGeofences.map(g => {
      if (g.zone_id === zoneId) {
        updated = { ...g, ...updates };
        return updated;
      }
      return g;
    });
    return updated;
  }

  const { data, error } = await supabase
    .from('geofences')
    .update(updates)
    .eq('zone_id', zoneId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteGeofence = async (zoneId: string) => {
  if (TEST_MODE) {
    testGeofences = testGeofences.filter(g => g.zone_id !== zoneId);
    return;
  }

  const { error } = await supabase
    .from('geofences')
    .delete()
    .eq('zone_id', zoneId);
  if (error) throw error;
};

// ── Badges ───────────────────────────────────

export const getBadges = async (teenId: string): Promise<Badge[]> => {
  if (TEST_MODE) {
    return testBadges;
  }

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('teen_id', teenId)
    .order('title');
  if (error) throw error;
  return data || [];
};

export const updateBadgeProgress = async (badgeId: string, progress: number, earned: boolean) => {
  if (TEST_MODE) {
    testBadges = testBadges.map(b =>
      b.id === badgeId
        ? { ...b, progress, earned, earnedDate: earned ? Date.now() : undefined }
        : b
    );
    return;
  }

  const updates: any = { progress };
  if (earned) {
    updates.earned = true;
    updates.earnedDate = Date.now();
  }
  const { error } = await supabase
    .from('badges')
    .update(updates)
    .eq('id', badgeId);
  if (error) throw error;
};

// ── Reports ──────────────────────────────────

export const getWeeklyReport = async (teenId: string): Promise<WeeklyReport | null> => {
  if (TEST_MODE) {
    return testWeeklyReport;
  }

  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('teen_id', teenId)
    .order('week_end', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
};

// ── Admin ────────────────────────────────────

export const getAllUsers = async () => {
  if (TEST_MODE) {
    return [
      { id: 'parent-001', email: 'sarah@example.com', name: 'Sarah Johnson', role: 'parent', is_active: true },
      { id: 'teen-001', email: 'alex@example.com', name: 'Alex Johnson', role: 'teen', is_active: true },
      { id: 'teen-002', email: 'emma@example.com', name: 'Emma Johnson', role: 'teen', is_active: true },
    ];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  if (TEST_MODE) return;

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
  if (error) throw error;
};

export const getAdminStats = async () => {
  if (TEST_MODE) {
    return {
      total_users: 3,
      total_parents: 1,
      total_teens: 2,
      active_trips: 1,
      total_alerts: testAlerts.length,
      avg_safety_score: 91,
    };
  }

  const { data: profiles } = await supabase.from('profiles').select('role');
  const { data: trips } = await supabase.from('trips').select('trip_id').is('end_time', null);
  const { data: alerts } = await supabase.from('alerts').select('alert_id');
  const { data: teens } = await supabase.from('teens').select('safety_score');

  return {
    total_users: profiles?.length || 0,
    total_parents: profiles?.filter(p => p.role === 'parent').length || 0,
    total_teens: profiles?.filter(p => p.role === 'teen').length || 0,
    active_trips: trips?.length || 0,
    total_alerts: alerts?.length || 0,
    avg_safety_score: teens?.length
      ? Math.round(teens.reduce((sum, t) => sum + (t.safety_score || 0), 0) / teens.length)
      : 0,
  };
};

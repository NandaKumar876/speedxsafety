// ============================================
// SpeedxSafety - Data Service (Supabase CRUD)
// ============================================

import { supabase } from './supabase';
import { Teen, Trip, Alert, Geofence, Badge, WeeklyReport } from '../types';

// ── Teens ────────────────────────────────────

export const getTeens = async (parentId: string): Promise<Teen[]> => {
  const { data, error } = await supabase
    .from('teens')
    .select('*')
    .eq('parent_uid', parentId)
    .order('name');
  if (error) throw error;
  return data || [];
};

export const getTeen = async (teenId: string): Promise<Teen | null> => {
  const { data, error } = await supabase
    .from('teens')
    .select('*')
    .eq('teen_id', teenId)
    .single();
  if (error) throw error;
  return data;
};

export const updateTeenLocation = async (teenId: string, lat: number, lng: number, speed: number, heading: number = 0) => {
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
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('teen_id', teenId)
    .order('start_time', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createTrip = async (trip: Partial<Trip>) => {
  const { data, error } = await supabase
    .from('trips')
    .insert(trip)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const endTrip = async (tripId: string, endData: Partial<Trip>) => {
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
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createAlert = async (alert: Partial<Alert>) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert(alert)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const markAlertRead = async (alertId: string) => {
  const { error } = await supabase
    .from('alerts')
    .update({ read: true })
    .eq('alert_id', alertId);
  if (error) throw error;
};

export const markAllAlertsRead = async (parentId: string) => {
  const { error } = await supabase
    .from('alerts')
    .update({ read: true })
    .eq('read', false);
  if (error) throw error;
};

// ── Geofences ────────────────────────────────

export const getGeofences = async (parentId: string): Promise<Geofence[]> => {
  const { data, error } = await supabase
    .from('geofences')
    .select('*')
    .eq('parent_uid', parentId)
    .order('label');
  if (error) throw error;
  return data || [];
};

export const createGeofence = async (geofence: Partial<Geofence>) => {
  const { data, error } = await supabase
    .from('geofences')
    .insert(geofence)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGeofence = async (zoneId: string, updates: Partial<Geofence>) => {
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
  const { error } = await supabase
    .from('geofences')
    .delete()
    .eq('zone_id', zoneId);
  if (error) throw error;
};

// ── Badges ───────────────────────────────────

export const getBadges = async (teenId: string): Promise<Badge[]> => {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('teen_id', teenId)
    .order('title');
  if (error) throw error;
  return data || [];
};

export const updateBadgeProgress = async (badgeId: string, progress: number, earned: boolean) => {
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
  if (error) throw error;
};

export const getAdminStats = async () => {
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

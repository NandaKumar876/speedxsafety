// ============================================
// SpeedxSafety - Type Definitions
// ============================================

export type UserRole = 'parent' | 'teen' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  fcm_token?: string;
  avatar?: string;
  createdAt: number;
  is_active?: boolean;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teen {
  teen_id: string;
  parent_uid: string;
  name: string;
  avatar?: string;
  speed_limit: number; // km/h
  curfew_start: string; // "22:00"
  curfew_end: string; // "06:00"
  safety_score: number; // 0–100
  is_driving: boolean;
  current_speed?: number;
  current_lat?: number;
  current_lng?: number;
  streak_days: number;
  last_trip_date?: number;
}

export interface TeenLocation {
  id: string;
  teen_id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: number;
}

export interface Trip {
  trip_id: string;
  teen_id: string;
  start_time: number;
  end_time?: number;
  max_speed: number;
  avg_speed: number;
  distance_km: number;
  start_lat: number;
  start_lng: number;
  end_lat?: number;
  end_lng?: number;
  safety_grade: SafetyGrade;
  violations: number;
  route?: LocationPoint[];
}

export interface Alert {
  alert_id: string;
  teen_id: string;
  teen_name: string;
  type: 'speed' | 'geo' | 'crash' | 'curfew' | 'sos';
  speed_recorded?: number;
  speed_limit?: number;
  lat: number;
  lng: number;
  timestamp: number;
  message: string;
  read: boolean;
}

export interface Geofence {
  zone_id: string;
  parent_uid: string;
  label: string;
  center_lat: number;
  center_lng: number;
  radius_m: number;
  is_active: boolean;
  color: string;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: number;
  heading?: number;
}

export type SafetyGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: number;
  progress: number; // 0–1
  requirement: string;
}

export interface WeeklyReport {
  week_start: number;
  week_end: number;
  total_trips: number;
  total_distance: number;
  total_duration: number;
  avg_speed: number;
  max_speed: number;
  violations: number;
  safety_grade: SafetyGrade;
  daily_trips: number[];
  score_trend: number[];
}

// Admin-specific types
export interface AdminStats {
  total_users: number;
  total_parents: number;
  total_teens: number;
  active_trips: number;
  total_alerts: number;
  avg_safety_score: number;
}

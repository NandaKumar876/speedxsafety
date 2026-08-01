-- ============================================
-- SpeedxSafety - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ── Profiles (extends auth.users) ────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'teen', 'admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Teens ────────────────────────────────────
CREATE TABLE IF NOT EXISTS teens (
  teen_id TEXT PRIMARY KEY DEFAULT 'teen-' || gen_random_uuid()::text,
  parent_uid UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_uid UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  speed_limit INTEGER DEFAULT 80,
  curfew_start TEXT DEFAULT '22:00',
  curfew_end TEXT DEFAULT '06:00',
  safety_score INTEGER DEFAULT 100,
  is_driving BOOLEAN DEFAULT false,
  current_speed REAL DEFAULT 0,
  current_lat REAL,
  current_lng REAL,
  streak_days INTEGER DEFAULT 0,
  last_trip_date BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Teen Locations (real-time GPS trail) ─────
CREATE TABLE IF NOT EXISTS teen_locations (
  id BIGSERIAL PRIMARY KEY,
  teen_id TEXT REFERENCES teens(teen_id) ON DELETE CASCADE,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  speed REAL DEFAULT 0,
  heading REAL DEFAULT 0,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Trips ────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY DEFAULT 'trip-' || gen_random_uuid()::text,
  teen_id TEXT REFERENCES teens(teen_id) ON DELETE CASCADE,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  max_speed REAL DEFAULT 0,
  avg_speed REAL DEFAULT 0,
  distance_km REAL DEFAULT 0,
  start_lat REAL,
  start_lng REAL,
  end_lat REAL,
  end_lng REAL,
  safety_grade TEXT DEFAULT 'A' CHECK (safety_grade IN ('A', 'B', 'C', 'D', 'F')),
  violations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Alerts ───────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  alert_id TEXT PRIMARY KEY DEFAULT 'alert-' || gen_random_uuid()::text,
  teen_id TEXT REFERENCES teens(teen_id) ON DELETE CASCADE,
  teen_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('speed', 'geo', 'crash', 'curfew', 'sos')),
  speed_recorded REAL,
  speed_limit REAL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  timestamp BIGINT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Geofences ────────────────────────────────
CREATE TABLE IF NOT EXISTS geofences (
  zone_id TEXT PRIMARY KEY DEFAULT 'geo-' || gen_random_uuid()::text,
  parent_uid UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  center_lat REAL NOT NULL,
  center_lng REAL NOT NULL,
  radius_m INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#22C55E',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Badges ───────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY DEFAULT 'badge-' || gen_random_uuid()::text,
  teen_id TEXT REFERENCES teens(teen_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  earned BOOLEAN DEFAULT false,
  earned_date BIGINT,
  progress REAL DEFAULT 0,
  requirement TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Weekly Reports ───────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reports (
  id BIGSERIAL PRIMARY KEY,
  teen_id TEXT REFERENCES teens(teen_id) ON DELETE CASCADE,
  week_start BIGINT NOT NULL,
  week_end BIGINT NOT NULL,
  total_trips INTEGER DEFAULT 0,
  total_distance REAL DEFAULT 0,
  total_duration BIGINT DEFAULT 0,
  avg_speed REAL DEFAULT 0,
  max_speed REAL DEFAULT 0,
  violations INTEGER DEFAULT 0,
  safety_grade TEXT DEFAULT 'A',
  daily_trips INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0],
  score_trend INTEGER[] DEFAULT ARRAY[100,100,100,100,100,100,100],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_teens_parent ON teens(parent_uid);
CREATE INDEX IF NOT EXISTS idx_teen_locations_teen ON teen_locations(teen_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trips_teen ON trips(teen_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_teen ON alerts(teen_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);
CREATE INDEX IF NOT EXISTS idx_geofences_parent ON geofences(parent_uid);
CREATE INDEX IF NOT EXISTS idx_badges_teen ON badges(teen_id);

-- ── Row-Level Security (RLS) ─────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teens ENABLE ROW LEVEL SECURITY;
ALTER TABLE teen_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Teens: parents can manage their linked teens
CREATE POLICY "Parents can view their teens" ON teens
  FOR SELECT USING (parent_uid = auth.uid() OR user_uid = auth.uid());
CREATE POLICY "Parents can update their teens" ON teens
  FOR UPDATE USING (parent_uid = auth.uid());
CREATE POLICY "Parents can insert teens" ON teens
  FOR INSERT WITH CHECK (parent_uid = auth.uid());

-- Teen locations: parents and teens can access
CREATE POLICY "Parents can view teen locations" ON teen_locations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = teen_locations.teen_id AND parent_uid = auth.uid())
  );
CREATE POLICY "Teens can insert own location" ON teen_locations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = teen_locations.teen_id AND user_uid = auth.uid())
  );

-- Trips: parents and teens can access their own
CREATE POLICY "Users can view their trips" ON trips
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = trips.teen_id AND (parent_uid = auth.uid() OR user_uid = auth.uid()))
  );
CREATE POLICY "Teens can insert trips" ON trips
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = trips.teen_id AND user_uid = auth.uid())
  );

-- Alerts: parents and teens can read, system can create
CREATE POLICY "Users can view their alerts" ON alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = alerts.teen_id AND (parent_uid = auth.uid() OR user_uid = auth.uid()))
  );
CREATE POLICY "Users can update alert read status" ON alerts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = alerts.teen_id AND parent_uid = auth.uid())
  );

-- Geofences: parents own their geofences
CREATE POLICY "Parents manage geofences" ON geofences
  FOR ALL USING (parent_uid = auth.uid());

-- Badges: teens can view their badges
CREATE POLICY "Users can view badges" ON badges
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = badges.teen_id AND (parent_uid = auth.uid() OR user_uid = auth.uid()))
  );

-- Reports: parents and teens can view
CREATE POLICY "Users can view reports" ON weekly_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teens WHERE teen_id = weekly_reports.teen_id AND (parent_uid = auth.uid() OR user_uid = auth.uid()))
  );

-- ── Auto-create profile on signup ────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Enable Realtime ──────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE teen_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE teens;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE trips;

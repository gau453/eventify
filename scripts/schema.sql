-- ==============================================================
-- EVENTIFY — COMPLETE SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Run this script inside the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'organiser')),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  college TEXT,
  organisation TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  token_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  dates TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  venue TEXT NOT NULL,
  address TEXT,
  type TEXT DEFAULT 'In-Person',
  capacity INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Registration Open',
  thumbnail TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  eligibility TEXT,
  agenda TEXT,
  organiser TEXT NOT NULL,
  organiser_email TEXT NOT NULL,
  organiser_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  college TEXT,
  date TEXT,
  time TEXT,
  venue TEXT,
  seat_tier TEXT DEFAULT 'General Pass',
  status TEXT DEFAULT 'Confirmed',
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_events_organiser_email ON events (LOWER(organiser_email));
CREATE INDEX IF NOT EXISTS idx_registrations_token ON registrations (token);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_email ON registrations (LOWER(student_email));
CREATE INDEX IF NOT EXISTS idx_reset_token_hash ON password_reset_tokens (token_hash);

-- 6. RPC FUNCTION: ATOMIC EVENT ATTENDANCE INCREMENT
CREATE OR REPLACE FUNCTION increment_event_attended(p_event_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET attended_count = COALESCE(attended_count, 0) + 1
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active events
CREATE POLICY "Public events are viewable by everyone" 
  ON events FOR SELECT 
  USING (status IN ('Published', 'Registration Open', 'Completed'));

-- 8. STORAGE BUCKET CONFIGURATION (Run in Supabase Dashboard -> Storage)
-- Create a public bucket named "event-banners" with public file read access.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

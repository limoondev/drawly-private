-- DRAWLY FULL DATABASE SETUP
-- Run this script to set up all tables and enable realtime

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS game_logs CASCADE;
DROP TABLE IF EXISTS banned_users CASCADE;
DROP TABLE IF EXISTS game_events CASCADE;
DROP TABLE IF EXISTS canvas_strokes CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table for user accounts
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(8) UNIQUE NOT NULL,
  host_id VARCHAR(50) NOT NULL,
  phase VARCHAR(20) DEFAULT 'waiting' CHECK (phase IN ('waiting', 'drawing', 'roundEnd', 'gameEnd')),
  current_drawer VARCHAR(50),
  current_word VARCHAR(100) DEFAULT '',
  masked_word VARCHAR(100) DEFAULT '',
  round INTEGER DEFAULT 0,
  max_rounds INTEGER DEFAULT 3,
  draw_time INTEGER DEFAULT 80,
  time_left INTEGER DEFAULT 80,
  max_players INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id VARCHAR(50) NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  avatar VARCHAR(20) DEFAULT '#3b82f6',
  is_drawing BOOLEAN DEFAULT false,
  has_guessed BOOLEAN DEFAULT false,
  is_host BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  strikes INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, room_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(50) NOT NULL,
  player_name VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  is_close BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canvas strokes table
CREATE TABLE canvas_strokes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  stroke_data JSONB NOT NULL,
  stroke_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game events table
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banned users table
CREATE TABLE banned_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id VARCHAR(50) NOT NULL,
  room_code VARCHAR(8) NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game logs table
CREATE TABLE game_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(8),
  log_type VARCHAR(20) NOT NULL,
  player_id VARCHAR(50),
  player_name VARCHAR(50),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room ON players(room_id);
CREATE INDEX idx_players_player_id ON players(player_id);
CREATE INDEX idx_messages_room ON messages(room_id);
CREATE INDEX idx_canvas_room ON canvas_strokes(room_id);
CREATE INDEX idx_events_room ON game_events(room_id);
CREATE INDEX idx_banned_player ON banned_users(player_id);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for rooms
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substr(NEW.id::text, 1, 8)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "rooms_all" ON rooms FOR ALL USING (true);
CREATE POLICY "players_all" ON players FOR ALL USING (true);
CREATE POLICY "messages_all" ON messages FOR ALL USING (true);
CREATE POLICY "canvas_all" ON canvas_strokes FOR ALL USING (true);
CREATE POLICY "events_all" ON game_events FOR ALL USING (true);
CREATE POLICY "banned_all" ON banned_users FOR ALL USING (true);
CREATE POLICY "logs_all" ON game_logs FOR ALL USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_strokes;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

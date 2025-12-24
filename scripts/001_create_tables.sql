-- Drawly Game Database Schema
-- This script creates all necessary tables for the game

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table: stores game rooms
CREATE TABLE IF NOT EXISTS rooms (
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
  theme VARCHAR(50) DEFAULT 'galaxy',
  is_private BOOLEAN DEFAULT false,
  max_players INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table: stores players in rooms
CREATE TABLE IF NOT EXISTS players (
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
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, room_id)
);

-- Messages table: stores chat messages
CREATE TABLE IF NOT EXISTS messages (
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

-- Canvas strokes table: stores drawing data
CREATE TABLE IF NOT EXISTS canvas_strokes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  stroke_data JSONB NOT NULL,
  stroke_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game events table: for real-time sync
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banned users table
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id VARCHAR(50) NOT NULL,
  room_code VARCHAR(8) NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game logs table for admin
CREATE TABLE IF NOT EXISTS game_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(8),
  log_type VARCHAR(20) NOT NULL,
  player_id VARCHAR(50),
  player_name VARCHAR(50),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_canvas_room ON canvas_strokes(room_id);
CREATE INDEX IF NOT EXISTS idx_events_room ON game_events(room_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON game_events(created_at);
CREATE INDEX IF NOT EXISTS idx_banned_player ON banned_users(player_id);
CREATE INDEX IF NOT EXISTS idx_logs_room ON game_logs(room_code);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for rooms updated_at
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup old events (keep last 100 per room)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM game_events
    WHERE room_id = NEW.room_id
    AND id NOT IN (
        SELECT id FROM game_events
        WHERE room_id = NEW.room_id
        ORDER BY created_at DESC
        LIMIT 100
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to cleanup old events
DROP TRIGGER IF EXISTS cleanup_events_trigger ON game_events;
CREATE TRIGGER cleanup_events_trigger
    AFTER INSERT ON game_events
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_old_events();

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (public game)
-- Rooms policies
CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (true);
CREATE POLICY "rooms_delete" ON rooms FOR DELETE USING (true);

-- Players policies
CREATE POLICY "players_select" ON players FOR SELECT USING (true);
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update" ON players FOR UPDATE USING (true);
CREATE POLICY "players_delete" ON players FOR DELETE USING (true);

-- Messages policies
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);

-- Canvas strokes policies
CREATE POLICY "canvas_select" ON canvas_strokes FOR SELECT USING (true);
CREATE POLICY "canvas_insert" ON canvas_strokes FOR INSERT WITH CHECK (true);
CREATE POLICY "canvas_delete" ON canvas_strokes FOR DELETE USING (true);

-- Game events policies
CREATE POLICY "events_select" ON game_events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON game_events FOR INSERT WITH CHECK (true);

-- Banned users policies
CREATE POLICY "banned_select" ON banned_users FOR SELECT USING (true);
CREATE POLICY "banned_insert" ON banned_users FOR INSERT WITH CHECK (true);

-- Game logs policies
CREATE POLICY "logs_select" ON game_logs FOR SELECT USING (true);
CREATE POLICY "logs_insert" ON game_logs FOR INSERT WITH CHECK (true);

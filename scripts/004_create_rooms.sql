-- Create rooms table for persistent room tracking
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT FALSE,
  custom_code TEXT,
  theme TEXT DEFAULT 'galaxy',
  max_players INTEGER DEFAULT 8,
  max_rounds INTEGER DEFAULT 3,
  draw_time INTEGER DEFAULT 80,
  current_round INTEGER DEFAULT 0,
  phase TEXT DEFAULT 'waiting',
  word_list JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Anyone can view rooms
CREATE POLICY "rooms_select_all" ON public.rooms 
  FOR SELECT USING (true);

-- Authenticated users can create rooms
CREATE POLICY "rooms_insert_auth" ON public.rooms 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Host can update their room
CREATE POLICY "rooms_update_host" ON public.rooms 
  FOR UPDATE USING (auth.uid() = host_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS rooms_code_idx ON public.rooms(code);
CREATE INDEX IF NOT EXISTS rooms_host_idx ON public.rooms(host_id);
CREATE INDEX IF NOT EXISTS rooms_phase_idx ON public.rooms(phase);

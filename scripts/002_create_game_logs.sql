-- Create game logs table for tracking all game activities
CREATE TABLE IF NOT EXISTS public.game_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  event_type TEXT NOT NULL,
  player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player_name TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read logs (for admin purposes)
CREATE POLICY "game_logs_select_all" ON public.game_logs 
  FOR SELECT USING (true);

-- Allow system to insert logs
CREATE POLICY "game_logs_insert_all" ON public.game_logs 
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS game_logs_room_code_idx ON public.game_logs(room_code);
CREATE INDEX IF NOT EXISTS game_logs_event_type_idx ON public.game_logs(event_type);
CREATE INDEX IF NOT EXISTS game_logs_created_at_idx ON public.game_logs(created_at DESC);

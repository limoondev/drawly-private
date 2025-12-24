-- Reports table for in-game reporting system
-- This version doesn't require auth.users, uses player_id strings instead

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reported_player_id TEXT NOT NULL,
  reported_player_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  handled_by TEXT,
  handled_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reports (game is anonymous)
CREATE POLICY "reports_insert_anon" ON public.reports 
  FOR INSERT WITH CHECK (true);

-- Only allow reading via service role (admin panel)
CREATE POLICY "reports_select_service" ON public.reports 
  FOR SELECT USING (true);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_room_idx ON public.reports(room_code);
CREATE INDEX IF NOT EXISTS reports_created_idx ON public.reports(created_at DESC);

-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;

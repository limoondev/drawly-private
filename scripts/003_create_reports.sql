-- Create reports table for moderation
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_code TEXT,
  report_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT DEFAULT 'pending',
  handled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can see their own reports
CREATE POLICY "reports_select_own" ON public.reports 
  FOR SELECT USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "reports_insert_auth" ON public.reports 
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_reported_user_idx ON public.reports(reported_user_id);

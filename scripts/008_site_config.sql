-- Create site_config table for storing backend URL and other settings
-- This allows admins to configure the backend URL from the admin panel

CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read config (needed for clients to get backend URL)
CREATE POLICY "Anyone can read config"
  ON site_config FOR SELECT
  USING (true);

-- Only admins can update config
CREATE POLICY "Admins can update config"
  ON site_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert default backend URL config
INSERT INTO site_config (key, value)
VALUES ('backend_url', '{"url": null, "updatedAt": null, "updatedBy": null}')
ON CONFLICT (key) DO NOTHING;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);

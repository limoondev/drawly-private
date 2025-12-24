-- Table pour stocker la configuration globale du serveur (URL backend)
-- Cette table est partagee entre toutes les instances du site

CREATE TABLE IF NOT EXISTS server_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  backend_url TEXT,
  is_maintenance BOOLEAN DEFAULT false,
  maintenance_reason TEXT,
  maintenance_severity TEXT DEFAULT 'info',
  maintenance_ends_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Insert default row if not exists
INSERT INTO server_config (id, backend_url, is_maintenance)
VALUES ('main', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE server_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read the config
CREATE POLICY "Anyone can read server config"
ON server_config FOR SELECT
USING (true);

-- Only admins can update (we'll handle this in the app)
CREATE POLICY "Admins can update server config"
ON server_config FOR UPDATE
USING (true);

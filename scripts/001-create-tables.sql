-- ============================================
-- DRAWLY - Script de création des tables
-- Version: 1.0.0
-- ============================================

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_level_idx ON profiles(level DESC);
CREATE INDEX IF NOT EXISTS profiles_total_score_idx ON profiles(total_score DESC);

-- Table des bans (pour la modération)
CREATE TABLE IF NOT EXISTS bans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  ip_address TEXT,
  reason TEXT NOT NULL,
  banned_by TEXT,
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bans_user_id_idx ON bans(user_id);
CREATE INDEX IF NOT EXISTS bans_ip_address_idx ON bans(ip_address);
CREATE INDEX IF NOT EXISTS bans_expires_at_idx ON bans(expires_at);

-- Table des signalements
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users,
  reported_user_id UUID REFERENCES auth.users,
  room_id TEXT,
  reason TEXT NOT NULL,
  evidence TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  handled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  handled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- Table statistiques globales
CREATE TABLE IF NOT EXISTS global_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_games INTEGER DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  total_drawings INTEGER DEFAULT 0,
  peak_concurrent_players INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de configuration du site
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Table des logs d'administration
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_logs_action_idx ON admin_logs(action);

-- Initialiser les stats globales
INSERT INTO global_stats (id, total_games, total_players, total_drawings)
VALUES ('main', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Initialiser la configuration par défaut
INSERT INTO site_config (key, value) VALUES
  ('maintenance', '{"enabled": false, "message": "", "allowedIPs": []}'::jsonb),
  ('backend', '{"url": "http://localhost:3001", "publicUrl": ""}'::jsonb),
  ('features', '{"chat": true, "drawing": true, "voice": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

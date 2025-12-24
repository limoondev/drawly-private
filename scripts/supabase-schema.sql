-- ============================================================
-- DRAWLY - Schéma Supabase
-- Exécuter ce script dans le SQL Editor de Supabase
-- ============================================================

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_level_idx ON profiles(level DESC);

-- Table des bans (pour la modération)
CREATE TABLE IF NOT EXISTS bans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  ip_address TEXT,
  reason TEXT NOT NULL,
  banned_by TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bans_user_id_idx ON bans(user_id);
CREATE INDEX IF NOT EXISTS bans_ip_address_idx ON bans(ip_address);

-- Table des signalements
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users,
  reported_user_id UUID REFERENCES auth.users,
  room_id TEXT,
  reason TEXT NOT NULL,
  evidence TEXT,
  status TEXT DEFAULT 'pending',
  handled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  handled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);

-- Table statistiques globales
CREATE TABLE IF NOT EXISTS global_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_games INTEGER DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  total_drawings INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialiser les stats globales
INSERT INTO global_stats (id) VALUES ('main') ON CONFLICT DO NOTHING;

-- Table de configuration maintenance
CREATE TABLE IF NOT EXISTS maintenance_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  enabled BOOLEAN DEFAULT false,
  reason TEXT,
  severity TEXT DEFAULT 'info',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO maintenance_config (id) VALUES ('main') ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_config ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies pour bans (lecture seule pour vérifier si banni)
CREATE POLICY "Bans are viewable by everyone" ON bans
  FOR SELECT USING (true);

-- Policies pour reports
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Policies pour global_stats (lecture seule)
CREATE POLICY "Stats are viewable by everyone" ON global_stats
  FOR SELECT USING (true);

-- Policies pour maintenance_config (lecture seule)
CREATE POLICY "Maintenance config is viewable by everyone" ON maintenance_config
  FOR SELECT USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger pour créer un profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Nouveau Joueur')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FIN DU SCHÉMA
-- ============================================================

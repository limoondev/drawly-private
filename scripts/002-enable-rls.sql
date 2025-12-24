-- ============================================
-- DRAWLY - Activation du Row Level Security
-- Version: 1.0.0
-- ============================================

-- Enable RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES pour profiles
-- ============================================

-- Tout le monde peut voir les profils publics
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- POLICIES pour bans
-- ============================================

-- Tout le monde peut voir les bans (pour vérifier si banni)
CREATE POLICY "bans_select_all" ON bans
  FOR SELECT USING (true);

-- Seul le service role peut créer/modifier/supprimer les bans
-- (géré côté backend avec service_role key)

-- ============================================
-- POLICIES pour reports
-- ============================================

-- Les utilisateurs peuvent créer des signalements
CREATE POLICY "reports_insert_authenticated" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Les utilisateurs peuvent voir leurs propres signalements
CREATE POLICY "reports_select_own" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- ============================================
-- POLICIES pour global_stats
-- ============================================

-- Tout le monde peut voir les stats
CREATE POLICY "global_stats_select_all" ON global_stats
  FOR SELECT USING (true);

-- ============================================
-- POLICIES pour site_config
-- ============================================

-- Tout le monde peut voir la config (pour maintenance mode, etc.)
CREATE POLICY "site_config_select_all" ON site_config
  FOR SELECT USING (true);

-- ============================================
-- POLICIES pour admin_logs
-- ============================================

-- Les logs sont accessibles en lecture pour debug
CREATE POLICY "admin_logs_select_all" ON admin_logs
  FOR SELECT USING (true);

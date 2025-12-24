-- ============================================
-- DRAWLY - Triggers et Fonctions
-- Version: 1.0.0
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour site_config
DROP TRIGGER IF EXISTS site_config_updated_at ON site_config;
CREATE TRIGGER site_config_updated_at
  BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Fonction pour créer un profil automatiquement
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Nouveau Joueur')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Incrémenter le compteur de joueurs
  UPDATE global_stats SET total_players = total_players + 1 WHERE id = 'main';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Fonction pour vérifier si un utilisateur est banni
-- ============================================

CREATE OR REPLACE FUNCTION is_user_banned(check_user_id UUID, check_ip TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  ban_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM bans
    WHERE (user_id = check_user_id OR ip_address = check_ip)
    AND (expires_at IS NULL OR expires_at > NOW() OR is_permanent = true)
  ) INTO ban_exists;
  
  RETURN ban_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Fonction pour logger les actions admin
-- ============================================

CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id TEXT,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details, p_ip_address)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

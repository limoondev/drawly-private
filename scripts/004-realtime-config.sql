-- ============================================
-- DRAWLY - Configuration Realtime
-- Version: 1.0.0
-- ============================================

-- Activer Realtime sur les tables nécessaires
-- Note: Ceci doit être fait via le dashboard Supabase
-- ou via les settings du projet

-- Les tables qui bénéficient du realtime:
-- - global_stats (pour afficher les stats en temps réel)
-- - site_config (pour le mode maintenance)
-- - profiles (pour les mises à jour de profil)

-- Pour activer manuellement:
-- 1. Aller dans Database > Replication
-- 2. Activer "Realtime" pour les tables souhaitées

-- Ou utiliser cette commande (si supporté):
-- ALTER PUBLICATION supabase_realtime ADD TABLE global_stats;
-- ALTER PUBLICATION supabase_realtime ADD TABLE site_config;

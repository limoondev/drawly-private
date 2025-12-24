# Guide de Configuration Drawly

## Configuration du Backend

### 1. Demarrer le serveur backend

Le fichier backend se trouve dans `server/backend.js`. Pour le demarrer:

```bash
# Installation des dependances
npm install express socket.io cors better-sqlite3 bcryptjs uuid

# Demarrer le serveur
node server/backend.js
```

Le serveur demarre sur le port 3001 par defaut (ou la variable d'environnement PORT).

### 2. Configurer l'URL du backend dans l'admin

1. Allez sur `/admin` 
2. Dans la section "Configuration Serveur", entrez l'URL du backend (ex: `http://localhost:3001` ou `https://votre-backend.com`)
3. Cliquez sur "Tester" pour verifier la connexion
4. Si le test reussit, cliquez sur "Sauvegarder"

L'URL est sauvegardee dans Supabase et partagee entre toutes les instances du site.

### 3. Variables d'environnement requises

Dans Vercel ou votre fichier `.env.local`:

```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # Important pour sauvegarder la config!
```

### 4. Table Supabase requise

La table `server_config` doit exister avec les colonnes:
- `id` (text, primary key, default 'main')
- `backend_url` (text, nullable)
- `backend_online` (boolean, default false)
- `maintenance_mode` (boolean, default false)  
- `maintenance_message` (text, nullable)
- `maintenance_severity` (text, default 'info')
- `updated_at` (timestamptz)
- `updated_by` (text, nullable)

Les policies RLS doivent permettre SELECT, INSERT, UPDATE, DELETE pour `public`.

## Troubleshooting

### L'URL ne se sauvegarde pas

1. Verifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configure dans les variables d'environnement Vercel
2. Verifiez les logs dans la console du navigateur (F12)
3. Verifiez que les policies RLS sont correctement configurees

### Le backend ne repond pas

1. Verifiez que le serveur backend est demarre
2. Verifiez que l'URL est accessible depuis le navigateur
3. Verifiez les logs du serveur backend

### Les parties ne demarrent pas

1. Verifiez la connexion WebSocket dans les outils developpeur (onglet Network > WS)
2. Verifiez les logs du serveur backend
3. Assurez-vous qu'il y a au moins 2 joueurs dans la room

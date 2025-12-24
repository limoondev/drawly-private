# Drawly - Guide de Deploiement VPS

## Configuration pour limoonfn.cloud

Ce guide explique comment deployer le backend sur un VPS avec le domaine `https://limoonfn.cloud/drawly/api/`.

---

## 1. Prerequis VPS

- Ubuntu 20.04+ ou Debian 11+
- Node.js 18+ (`curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`)
- Nginx ou Caddy (reverse proxy)
- Certbot pour SSL (Let's Encrypt)

---

## 2. Installation Backend

```bash
# Cloner le projet
git clone https://github.com/votre-repo/drawly.git
cd drawly

# Installer les dependances
npm install

# Creer le dossier data
mkdir -p data
```

---

## 3. Configuration Nginx

Creer `/etc/nginx/sites-available/limoonfn.cloud`:

```nginx
server {
    listen 80;
    server_name limoonfn.cloud;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name limoonfn.cloud;

    ssl_certificate /etc/letsencrypt/live/limoonfn.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/limoonfn.cloud/privkey.pem;

    # Backend API & WebSocket
    location /drawly/api/ {
        proxy_pass http://127.0.0.1:3001/drawly/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Socket.IO specifique
    location /drawly/api/socket.io/ {
        proxy_pass http://127.0.0.1:3001/drawly/api/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Frontend (si sur le meme serveur)
    location / {
        # Proxy vers Vercel ou servir les fichiers statiques
        proxy_pass https://your-vercel-app.vercel.app;
        proxy_set_header Host $host;
    }
}
```

Activer le site:
```bash
sudo ln -s /etc/nginx/sites-available/limoonfn.cloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. SSL avec Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d limoonfn.cloud
```

---

## 5. Demarrer le Backend

### Option A: PM2 (Recommande)

```bash
npm install -g pm2

# Demarrer
pm2 start server/backend.js --name drawly

# Demarrage automatique
pm2 startup
pm2 save

# Voir les logs
pm2 logs drawly
```

### Option B: Systemd

Creer `/etc/systemd/system/drawly.service`:

```ini
[Unit]
Description=Drawly Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/drawly
ExecStart=/usr/bin/node server/backend.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=3001
Environment=PUBLIC_URL=https://limoonfn.cloud/drawly/api
Environment=ALLOWED_ORIGINS=https://limoonfn.cloud,https://drawly.app

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable drawly
sudo systemctl start drawly
```

---

## 6. Variables d'Environnement

Le backend s'auto-configure, mais vous pouvez personnaliser:

| Variable | Defaut | Description |
|----------|--------|-------------|
| `PORT` | `3001` | Port d'ecoute |
| `HOST` | `127.0.0.1` | Interface (localhost pour reverse proxy) |
| `PUBLIC_URL` | `https://limoonfn.cloud/drawly/api` | URL publique |
| `ALLOWED_ORIGINS` | `https://limoonfn.cloud,...` | Origines CORS autorisees |
| `DB_PATH` | `./data/drawly.db` | Chemin base SQLite |

---

## 7. Configuration Frontend

Dans le frontend (Vercel ou autre), configurer:

```env
NEXT_PUBLIC_BACKEND_URL=https://limoonfn.cloud/drawly/api
```

Ou dans Supabase `global_config`:
- `backend_url`: `https://limoonfn.cloud/drawly/api`

---

## 8. Verification

```bash
# Tester l'API
curl https://limoonfn.cloud/drawly/api/status

# Doit retourner:
# {"status":"ok","version":"5.2.0",...}
```

---

## 9. Maintenance

### Voir les logs
```bash
pm2 logs drawly
# ou
journalctl -u drawly -f
```

### Redemarrer
```bash
pm2 restart drawly
# ou
sudo systemctl restart drawly
```

### Mettre a jour
```bash
cd /var/www/drawly
git pull
npm install
pm2 restart drawly
```

---

## 10. Securite

Le backend gere automatiquement:
- Rate limiting (15 conn/min, 50 msg/sec)
- Validation des origines
- Protection contre les bans
- Timeout des connexions inactives

Assurez-vous que:
- Le firewall bloque le port 3001 de l'exterieur (seul Nginx y accede)
- Les certificats SSL sont renouveles automatiquement (certbot)

---

## Support

En cas de probleme:
1. Verifier les logs: `pm2 logs drawly`
2. Tester l'API: `curl http://127.0.0.1:3001/drawly/api/status`
3. Verifier Nginx: `sudo nginx -t && sudo systemctl status nginx`

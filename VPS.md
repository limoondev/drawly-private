# Deploiement sur VPS avec Coolify

Guide complet pour deployer Drawly sur un VPS Hostinger Ubuntu avec Coolify Panel.

---

## Pre-requis

- VPS Hostinger avec Ubuntu 22.04+
- Coolify Panel installe
- Nom de domaine configure (ex: `limoonfn.cloud`)
- Acces SSH au serveur

---

## Methode 1: Deploiement avec Coolify (Recommande)

### Etape 1: Preparer le repository

Assurez-vous que votre repository GitHub contient ces fichiers:

**1. `Dockerfile` a la racine:**

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**2. Verifiez `next.config.mjs`:**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

export default nextConfig
```

### Etape 2: Configurer Coolify

1. **Connectez-vous a Coolify** (https://votre-ip:8000)

2. **Creer un nouveau projet:**
   - Cliquez sur "New Project"
   - Nommez-le "Drawly"

3. **Ajouter une ressource:**
   - Cliquez sur "Add Resource"
   - Selectionnez "Private Repository (GitHub)"
   - Connectez votre compte GitHub si pas deja fait
   - Selectionnez le repository `drawly-private`

4. **Configurer le build:**
   - **Build Pack:** `Dockerfile`
   - **Dockerfile Location:** `/Dockerfile`
   - **Ports Exposes:** `3000`

5. **Variables d'environnement:**
   ```
   NEXT_PUBLIC_BACKEND_URL=https://limoonfn.cloud/drawly/api
   NEXT_PUBLIC_SITE_URL=https://limoonfn.cloud
   NODE_ENV=production
   ```

6. **Configurer le domaine:**
   - Dans l'onglet "Domains"
   - Ajoutez: `limoonfn.cloud`
   - Coolify generera automatiquement un certificat SSL Let's Encrypt

7. **Deployer:**
   - Cliquez sur "Deploy"
   - Surveillez les logs dans l'onglet "Deployments"

---

## Methode 2: Deploiement avec Nixpacks (Alternative)

Si vous preferez ne pas utiliser Docker:

1. **Build Pack:** `Nixpacks`
2. **Start Command:** `npm run start`
3. **Build Command:** `npm run build`
4. **Ports:** `3000`

---

## Configuration du Backend (Node.js)

Le backend doit etre deploye separement.

### Etape 1: Creer une nouvelle ressource dans Coolify

1. Dans le meme projet "Drawly", ajoutez une nouvelle ressource
2. Selectionnez "Docker Compose" ou "Dockerfile"

### Etape 2: Dockerfile pour le backend

Creez `server/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

CMD ["node", "backend.js"]
```

### Etape 3: Variables d'environnement du backend

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
CORS_ORIGINS=https://limoonfn.cloud
PUBLIC_URL=https://limoonfn.cloud/drawly/api
TRUST_PROXY=true
```

### Etape 4: Configurer le reverse proxy

Dans Coolify, configurez le domaine avec un path prefix:
- **Domain:** `limoonfn.cloud`
- **Path:** `/drawly/api`

Ou utilisez un sous-domaine:
- **Domain:** `api.limoonfn.cloud`

---

## Configuration DNS (Hostinger)

Dans le panneau DNS de votre domaine:

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | [IP_VPS] | 3600 |
| A | api | [IP_VPS] | 3600 |
| CNAME | www | limoonfn.cloud | 3600 |

Remplacez `[IP_VPS]` par l'adresse IP de votre VPS.

---

## Troubleshooting

### Erreur 404 sur toutes les pages

**Cause:** Le standalone output n'est pas configure correctement.

**Solution:**
1. Verifiez que `output: 'standalone'` est dans `next.config.mjs`
2. Verifiez que le Dockerfile copie bien `.next/standalone`
3. Redployez l'application

### Erreur de connexion au backend

**Cause:** CORS ou mauvaise URL.

**Solution:**
1. Verifiez `NEXT_PUBLIC_BACKEND_URL` dans les variables d'environnement
2. Verifiez que le backend autorise l'origine du frontend
3. Verifiez que le path `/drawly/api` est correctement proxy

### Certificat SSL invalide

**Cause:** DNS pas encore propage ou limite Let's Encrypt.

**Solution:**
1. Attendez 5-10 minutes apres configuration DNS
2. Verifiez la propagation: https://dnschecker.org
3. Dans Coolify, regenerez le certificat

### Build qui echoue

**Cause:** Dependances ou memoire insuffisante.

**Solution:**
1. Verifiez les logs de build dans Coolify
2. Si memoire insuffisante, ajoutez du swap:
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

### WebSocket ne fonctionne pas

**Cause:** Coolify/Traefik ne proxy pas correctement les WebSockets.

**Solution:**
Ajoutez ces labels dans la configuration Traefik (Advanced settings):
```yaml
traefik.http.middlewares.websocket.headers.customrequestheaders.Connection: Upgrade
traefik.http.middlewares.websocket.headers.customrequestheaders.Upgrade: websocket
```

---

## Mise a jour de l'application

### Mise a jour automatique

Coolify peut detecter les changements sur votre branche Git:
1. Allez dans "Settings" de votre ressource
2. Activez "Auto Deploy"
3. Chaque push sur `main` declenchera un nouveau deploiement

### Mise a jour manuelle

1. Allez sur votre ressource dans Coolify
2. Cliquez sur "Redeploy"

---

## Monitoring

### Logs en temps reel

Dans Coolify:
- Onglet "Logs" pour voir les logs de l'application
- Onglet "Deployments" pour voir l'historique

### Health Check

Configurez un health check dans Coolify:
- **Path:** `/api/health`
- **Interval:** 30 secondes
- **Timeout:** 10 secondes

Creez le endpoint dans votre app Next.js:

```ts
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: Date.now() })
}
```

---

## Ressources

- [Documentation Coolify](https://coolify.io/docs)
- [Next.js Self-Hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Docker avec Next.js](https://github.com/vercel/next.js/tree/canary/examples/with-docker)

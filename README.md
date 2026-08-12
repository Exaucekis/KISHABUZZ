# KISHA BUZZ

Plateforme média professionnelle — chroniques, publications, portfolio et **Arena Culture**.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma + **PostgreSQL** (obligatoire pour Vercel)
- Auth.js (NextAuth v5) pour le back-office
- Zod pour la validation

## Démarrage local

### 1. Variables d’environnement

```bash
cp .env.example .env
```

### 2. PostgreSQL local (Docker)

```bash
docker compose up -d
```

Dans `.env` :

```env
DATABASE_URL="postgresql://kishabuzz:kishabuzz@localhost:5432/kishabuzz?schema=public"
DIRECT_URL="postgresql://kishabuzz:kishabuzz@localhost:5432/kishabuzz?schema=public"
AUTH_SECRET="un-secret-local"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Installer, migrer, seed

```bash
npm install
npx prisma migrate deploy
npm run db:seed
# optionnel : albums / vidéo
npx tsx prisma/seed-terminusboy.ts
npx tsx prisma/seed-arena-albums.ts
npx tsx prisma/seed-kishabuzz-video.ts
npx tsx prisma/seed-gaz-mawete-album.ts
npx tsx prisma/seed-innoss-b-album.ts
npm run dev
```

- Site : http://localhost:3000  
- Admin : http://localhost:3000/admin  

Identifiants seed : `ADMIN_EMAIL` / `ADMIN_PASSWORD` (voir `.env.example`).  
**Changez le mot de passe en production.**

---

## Déploiement Vercel (complet)

### Prérequis

1. Compte [Vercel](https://vercel.com) relié à GitHub `Exaucekis/KISHABUZZ`
2. Une base **PostgreSQL** (recommandé : [Neon](https://neon.tech), Vercel Postgres, Supabase ou Prisma Postgres)

### Étape A — Base PostgreSQL (Neon)

1. Créez un projet Neon
2. Copiez :
   - **Pooled connection string** → `DATABASE_URL` (ajoutez `&connection_limit=1` si besoin)
   - **Direct connection string** → `DIRECT_URL`

Exemple :

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Étape B — Projet Vercel

1. **Add New Project** → importer `Exaucekis/KISHABUZZ`
2. Framework : **Next.js** (auto)
3. Root Directory : `.`
4. Build Command : `npm run build` (déjà configuré : `prisma generate` + `migrate deploy` + `next build`)
5. Node.js : **20.x**

### Étape C — Variables d’environnement Vercel

Dans **Settings → Environment Variables** (Production + Preview) :

| Variable | Exemple / note |
|----------|----------------|
| `DATABASE_URL` | URL pooled Neon |
| `DIRECT_URL` | URL direct Neon |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://votre-projet.vercel.app` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-projet.vercel.app` |
| `ADMIN_EMAIL` | email admin (pour seed) |
| `ADMIN_PASSWORD` | mot de passe fort |

### Étape D — Deploy + seed

1. Cliquez **Deploy**
2. Après le premier déploiement réussi, peupler la base :

```bash
# depuis votre machine, avec les URL prod dans .env.production.local
npx dotenv -e .env.production.local -- npm run db:seed
```

Ou via Vercel CLI :

```bash
npx vercel env pull .env.production.local
npx dotenv -e .env.production.local -- npm run db:seed
npx dotenv -e .env.production.local -- npx tsx prisma/seed-terminusboy.ts
npx dotenv -e .env.production.local -- npx tsx prisma/seed-arena-albums.ts
npx dotenv -e .env.production.local -- npx tsx prisma/seed-kishabuzz-video.ts
npx dotenv -e .env.production.local -- npx tsx prisma/seed-gaz-mawete-album.ts
npx dotenv -e .env.production.local -- npx tsx prisma/seed-innoss-b-album.ts
```

Les médias dans `/public` (affiches, albums, vidéo Kishabuzz) sont déployés avec le site.

### Étape E — Domaine custom (optionnel)

1. Vercel → Domains → ajoutez `kishabuzz.com` (ou autre)
2. Mettez à jour `AUTH_URL` et `NEXT_PUBLIC_SITE_URL` vers ce domaine
3. Redeploy

---

## Contenu & admin

Aucun invité / partenaire inventé côté métier : gérez depuis `/admin` :

- Articles & chroniques
- Arena Culture (émissions, invités, albums photos, vidéos)
- Portfolio, partenaires, contact, paramètres

WhatsApp n’apparaît que si `whatsappEnabled` est activé.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev local |
| `npm run build` | Build Vercel / prod (migrate + Next) |
| `npm run start` | Serveur prod |
| `npm run db:setup` | Migrate + seed |
| `npm run db:seed` | Seed admin / contenus de base |
| `npm run db:studio` | Prisma Studio |

## Fichiers utiles

- `vercel.json` — config déploiement
- `docker-compose.yml` — Postgres local
- `prisma/migrations/` — schéma PostgreSQL
- `.env.example` — modèle des variables

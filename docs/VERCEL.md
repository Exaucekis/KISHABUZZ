# Guide déploiement Vercel — KISHA BUZZ

Checklist rapide pour mettre le site en ligne.

## 1. PostgreSQL

SQLite ne fonctionne pas sur Vercel. Utilisez Neon / Vercel Postgres / Supabase.

Renseignez `DATABASE_URL` (pooled) et `DIRECT_URL` (direct).

## 2. Variables Vercel

```
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
AUTH_URL=https://<projet>.vercel.app
AUTH_TRUST_HOST=true
NEXT_PUBLIC_SITE_URL=https://<projet>.vercel.app
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## 3. Deploy

Connectez le repo GitHub → Deploy.  
Le build exécute : `prisma generate` → `prisma migrate deploy` → `next build`.

## 4. Seed (une fois)

```bash
npx vercel env pull .env.production.local
npx dotenv -e .env.production.local -- npm run db:seed
```

Puis les seeds Arena si besoin (`seed-terminusboy`, albums, vidéo).

## 5. Vérifications

- [ ] Accueil charge
- [ ] `/arena-culture` OK
- [ ] `/admin/login` avec le compte seed
- [ ] Images `/public/arena/...` visibles
- [ ] Vidéo DISHA lisible

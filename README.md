# KISHA BUZZ

Plateforme média professionnelle — chroniques, publications, portfolio et **Arena Culture**.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma + SQLite (dev) — basculable vers PostgreSQL en production
- Auth.js (NextAuth v5) pour le back-office
- Zod pour la validation

## Démarrage rapide

```bash
npm install
# Copier .env.example vers .env si besoin
npm run db:setup
npm run dev
```

Site : [http://localhost:3000](http://localhost:3000)  
Admin : [http://localhost:3000/admin](http://localhost:3000/admin)

### Identifiants admin (seed)

- Email : `admin@kishabuzz.local` (ou `ADMIN_EMAIL` dans `.env`)
- Mot de passe : `KishaBuzz2026!` (ou `ADMIN_PASSWORD` dans `.env`)

**Changez le mot de passe en production.**

## Contenu

Aucun invité, partenaire ou événement inventé. Les contenus se gèrent depuis `/admin` :

- Articles & chroniques
- Arena Culture (saisons, émissions, invités)
- Galerie médias
- Portfolio
- Partenaires
- Demandes de contact
- Paramètres du site (téléphone, SEO, réseaux sociaux)

Le lien WhatsApp n’apparaît que si `whatsappEnabled` est activé dans les paramètres.

## Production PostgreSQL

1. Dans `prisma/schema.prisma`, remplacer `provider = "sqlite"` par `provider = "postgresql"`
2. Définir `DATABASE_URL` PostgreSQL
3. `npx prisma migrate dev` ou `npx prisma db push`
4. `npm run db:seed`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run db:setup` | Push schéma + seed |
| `npm run db:seed` | Seed seul |

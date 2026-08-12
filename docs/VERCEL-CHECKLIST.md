# Déploiement Vercel — à cocher

## Avant Deploy
- [ ] Repo GitHub à jour (`main`)
- [ ] Base PostgreSQL créée (Neon recommandé)
- [ ] `DATABASE_URL` + `DIRECT_URL` prêts

## Sur Vercel
- [ ] Projet importé depuis GitHub
- [ ] Variables d'env renseignées (voir `docs/VERCEL.md`)
- [ ] Node 20.x
- [ ] Premier Deploy réussi (migrate + build)

## Après Deploy
- [ ] Seed admin (`npm run db:seed` avec env prod)
- [ ] Seeds Arena optionnels (TerminusBoy, albums, Kishabuzz)
- [ ] Test `/` `/arena-culture` `/admin/login`
- [ ] Mettre à jour `AUTH_URL` + `NEXT_PUBLIC_SITE_URL` si domaine custom

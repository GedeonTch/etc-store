# ETCH Store — Documentation projet

**Établissement Tchibanvunya** — boutique en ligne d'appareils d'occasion importés d'Europe (Bukavu).

Repo : [github.com/GedeonTch/etc-store](https://github.com/GedeonTch/etc-store)  
Production : [etch-store.vercel.app](https://etch-store.vercel.app)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | API Routes Next.js (App Router) |
| Base de données | MySQL via **Railway** |
| ORM | Prisma |
| Auth | NextAuth.js (JWT, rôles) |
| Images | **Vercel Blob** (prod), base64 léger (dev) |
| Emails | Resend (optionnel) |
| Animations | Framer Motion, Three.js |

---

## Hébergement

```
GitHub  →  Vercel (app Next.js)
Railway →  MySQL (données)
Vercel Blob →  images catégories, équipe, produits
```

1. Code poussé sur GitHub (`main`)
2. Vercel déploie automatiquement à chaque push
3. Variables d'environnement dans Vercel (Settings → Environment Variables)

**Variables essentielles :**

- `DATABASE_URL` — MySQL Railway
- `NEXTAUTH_URL` — URL du site (ex. `https://etch-store.vercel.app`)
- `NEXTAUTH_SECRET` — clé secrète sessions
- `BLOB_READ_WRITE_TOKEN` — Storage Blob **Public**, connecté au projet
- `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL` — emails (optionnel)

---

## Rôles utilisateurs

| Rôle | Accès |
|------|--------|
| **CLIENT** | Catalogue, contact/négociations, inscription |
| **MEMBRE** | Admin : lecture produits/messages |
| **ADJOINT** | Admin : produits, messages (réponse) |
| **SUPER_ADMIN** | Tout + paramètres, utilisateurs, logs |

---

## Fonctionnalités principales

- Catalogue produits (filtres, recherche, fiche produit)
- Panneau admin (produits, messages, utilisateurs, paramètres)
- Messages clients ↔ admin (réponse par email si Resend configuré)
- Catégories et page À propos éditables depuis **Admin → Paramètres**
- Mode sombre par défaut, FR / EN / SW

---

## Développement local

```bash
git clone https://github.com/GedeonTch/etc-store.git
cd etch-store
npm install
cp .env.example .env.local
# Remplir DATABASE_URL, NEXTAUTH_*, etc.
npm run db:generate && npm run db:push && npm run db:seed
npm run dev
```

Commandes utiles : `npm run build`, `npm run db:studio`, `npm run create-super-admin`

---

## Corrections majeures (déploiement 2026)

- Build Vercel : Resend et routes API restaurées (inscription, messages)
- Catégories : sauvegarde auto + Blob + cache pages dynamiques
- Sécurité À propos : plus d'emails admin exposés publiquement
- Footer/header : infos établissement depuis la base
- Inscription : sans photo, redirection accueil
- Menu : **Contact & Négociations**

---

## Structure des dossiers (résumé)

```
app/           → pages site + admin + API
components/    → UI réutilisable
lib/           → auth, emails, prisma, utils
prisma/        → schéma MySQL + seed
public/        → assets statiques
```

---

*Dernière mise à jour : mai 2026*

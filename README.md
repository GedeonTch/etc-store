# ETCH Store — Guide d'installation et déploiement

**ÉTABLISSEMENT TCHIBANVUNYA** — *L'Europe à votre portée*

---

## Stack

Next.js 14 · Tailwind CSS · Three.js · Framer Motion · MySQL (Railway) · Prisma · NextAuth.js · Cloudinary · Resend · next-themes · Vercel

---

## Installation locale

### 1. Installer les dépendances

```bash
cd etch-store
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
# Remplir chaque variable dans .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL MySQL Railway (`mysql://user:pass@host:port/db`) |
| `NEXTAUTH_URL` | URL de l'app (`http://localhost:3000` en dev) |
| `NEXTAUTH_SECRET` | Clé secrète — `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |
| `RESEND_API_KEY` | Clé API Resend (`re_...`) |
| `ADMIN_EMAIL` | Email destination notifications |
| `FROM_EMAIL` | Email expéditeur (vérifié dans Resend) |

### 3. Railway (MySQL)

1. [railway.app](https://railway.app) → New Project → MySQL
2. Copier la `DATABASE_URL` depuis l'onglet Connect

### 4. Cloudinary

1. [cloudinary.com](https://cloudinary.com) → Dashboard → copier les clés
2. Settings → Upload → Add upload preset → nom : `etch_products` → mode **Unsigned**

### 5. Resend

1. [resend.com](https://resend.com) → API Keys → Create API Key
2. Domains → ajouter et vérifier votre domaine

### 6. Initialiser la base de données

```bash
npm run db:generate   # Générer le client Prisma
npm run db:push       # Pousser le schéma vers Railway
npm run db:seed       # Créer le compte admin initial
```

Connexion admin après seed :
- Email : `etsTchibanvunya@gmail.com`
- Mot de passe : `ADMIN123`
- ⚠️ **Changez ce mot de passe immédiatement** depuis `/admin/parametres`

### 7. Lancer

```bash
npm run dev
# → http://localhost:3000
```

---

## Déploiement Vercel

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin <votre-repo>
git push -u origin main
```

1. [vercel.com](https://vercel.com) → New Project → importer le repo
2. Ajouter toutes les variables d'environnement
3. Deploy

Après déploiement, mettre à jour `NEXTAUTH_URL` avec l'URL Vercel.

---

## Commandes

```bash
npm run dev          # Développement
npm run build        # Build production
npm run db:generate  # Générer client Prisma
npm run db:push      # Pousser schéma
npm run db:seed      # Données initiales
npm run db:studio    # Interface Prisma Studio
```

---

## Créateur

**Tchibanvunya Gedeon** — IT · Développement & Cybersécurité  
📧 tchibanvunyagedeon@gmail.com · 💬 +257 79 640 420

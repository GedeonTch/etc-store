# 🛍️ ETCH Store — E-commerce Moderne

**ÉTABLISSEMENT TCHIBANVUNYA** — *L'Europe à votre portée*

Une plateforme e-commerce robuste et scalable pour la vente d'appareils d'occasion avec gestion admin complète.

---

## 🏗️ Architecture

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Base de données** | MySQL (Railway) |
| **ORM** | Prisma |
| **Authentification** | NextAuth.js v4 |
| **Stockage images** | Vercel Blob (Production), Base64 (Dev) |
| **Animations** | Framer Motion, Three.js |
| **Hébergement** | Vercel |
| **Email** | Resend |
| **CDN Images** | Cloudinary (optionnel) |

---

## 🚀 Déploiement rapide (Production)

### Option 1: Déployer sur Vercel (Recommandé)

1. **Créer un compte Vercel**
   - Va sur [vercel.com](https://vercel.com)
   - Connecte-toi avec GitHub

2. **Importer le projet**
   - Clique "New Project"
   - Sélectionne ce repo
   - Clique "Import"

3. **Ajouter les variables d'environnement**
   - Dans Settings → Environment Variables, ajoute:
   ```
   DATABASE_URL=mysql://...
   NEXTAUTH_URL=https://ton-app.vercel.app
   NEXTAUTH_SECRET=<clé-secrète>
   BLOB_READ_WRITE_TOKEN=<token-vercel>
   ADMIN_EMAIL=...
   FROM_EMAIL=...
   ```

4. **Deploy**
   - Clique "Deploy"
   - Attends 3-5 minutes ✨

---

## 💻 Installation locale (Développement)

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Railway (MySQL)

### Étapes

1. **Cloner et installer**
   ```bash
   git clone https://github.com/GedeonTch/etch-store.git
   cd etch-store
   npm install
   ```

2. **Configuration des variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   
   Remplis les variables essentielles:
   - `DATABASE_URL`: URL de ta base MySQL
   - `NEXTAUTH_URL`: `http://localhost:3000`
   - `NEXTAUTH_SECRET`: `openssl rand -base64 32`

3. **Initialiser la base de données**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Lancer le serveur**
   ```bash
   npm run dev
   ```
   
   Accès: [http://localhost:3000](http://localhost:3000)

---

## 📋 Variables d'environnement essentielles

| Variable | Obligatoire | Description |
|----------|:-----------:|-------------|
| `DATABASE_URL` | ✅ | MySQL Railway |
| `NEXTAUTH_URL` | ✅ | URL de l'app |
| `NEXTAUTH_SECRET` | ✅ | Clé session (32 chars base64) |
| `BLOB_READ_WRITE_TOKEN` | ✅ (Prod) | Vercel Blob token |
| `ADMIN_EMAIL` | ❌ | Email notifications |
| `FROM_EMAIL` | ❌ | Email expéditeur (Resend) |
| `RESEND_API_KEY` | ❌ | Resend API |
| `CLOUDINARY_*` | ❌ | Cloudinary (optionnel) |

---

## 🛠️ Commandes utiles

```bash
npm run dev              # Démarrer en développement
npm run build            # Build production
npm start                # Démarrer la version produite
npm run lint             # Linter le code
npm run db:generate      # Générer client Prisma
npm run db:push          # Synchroniser schéma BD
npm run db:seed          # Charger données initiales
npm run db:studio        # Ouvrir Prisma Studio
npm run create-super-admin   # Créer un super-admin
npm run update-categories    # Mettre à jour catégories
```

---

## 📚 Documentation

- **QUICK_START.md** — Démarrage rapide avec exemples
- **IMPROVEMENTS.md** — Fonctionnalités avancées
- **DEPLOYMENT.md** — Guide détaillé de déploiement

---

## 📱 Fonctionnalités principales

✅ **Authentification** — Admin, Adjoint, Client avec sessions sécurisées  
✅ **Gestion produits** — Catalogue, catégories, images  
✅ **Panier dynamique** — Sélection et achat produits  
✅ **Système messages** — Contact admin  
✅ **Gestion utilisateurs** — Recherche, filtrage, export CSV/JSON  
✅ **Panel admin** — Dashboard, statistiques, paramètres  
✅ **Upload sécurisé** — Images base64 ou Vercel Blob  
✅ **Responsive design** — Mobile, tablet, desktop  

---

## 🔒 Sécurité

- Authentification NextAuth.js avec sessions JWT
- Mots de passe hashés (bcrypt, salt: 12)
- Protection brute-force (5 tentatives/30min)
- Validation côté serveur obligatoire
- Routes protégées par rôle
- CSRF protection

---

## 📞 Support & Contact

**Développeur:** Tchibanvunya Gedeon  
📧 [tchibanvunyagedeon@gmail.com](mailto:tchibanvunyagedeon@gmail.com)  
💬 +257 79 640 420

---

## 📄 Licence

Propriétaire — ÉTABLISSEMENT TCHIBANVUNYA

---

**Dernière mise à jour:** Mai 2026 | **Version:** 1.1

# ⚡ Quick Start - ETCH Store v1.1

## 🎯 Quoi de Neuf?

✅ **Show/Hide Password** - Voir votre mot de passe en tapant  
✅ **Photo pour Admins/Clients** - Upload obligatoire pour admins  
✅ **Validation Robuste** - Emails, mots de passe, fichiers  
✅ **Recherche & Filtrage** - Trouvez vos utilisateurs rapidement  
✅ **Export CSV/JSON** - Téléchargez vos données  
✅ **Routes de Debug** - Testez l'authentification facilement  

---

## 🚀 Démarrer Rapidement

### 1. Appliquer la Migration BD
```bash
cd /home/anonymous/ETS_TCHIBANVUNYA/etch-store
npx prisma db push
```

### 2. Réinitialiser les Mots de Passe de Test
Allez sur: **http://localhost:3000/admin/debug**

Cliquez "Réinitialiser les Utilisateurs"

### 3. Se Connecter
- **Admin**: `admin@etch.com` / `ADMIN123`
- **Adjoint**: `adjoint@etch.com` / `ADJOINT123`
- **Client**: `client@etch.com` / `CLIENT123`

---

## 🎨 Tester les Nouvelles Fonctionnalités

### Show/Hide Password
- Allez sur `/connexion` ou `/inscription`
- Cliquez l'icône 👁️ au-dessus du champ mot de passe

### Upload Photo
**Pour Admins (obligatoire):**
- `/admin` → Utilisateurs → "+ Ajouter"
- Remplissez le formulaire
- Choisissez un rôle admin/adjoint
- **Photo obligatoire** ⭐
- Sélectionnez une image pour voir l'aperçu

**Pour Clients (optionnel):**
- `/inscription`
- Photo est complètement optionnelle

### Recherche & Filtrage
- `/admin` → Utilisateurs
- Entrez un nom/email dans la barre de recherche
- Utilisez le dropdown pour filtrer par rôle

### Export
- `/admin` → Utilisateurs
- Cliquez "📥 CSV" ou "📄 JSON"
- Le fichier se télécharge automatiquement

---

## 🔧 Routes Utiles

### Pages
- Admin Login: `/admin/login`
- Connexion Client: `/connexion`
- Inscription: `/inscription`
- Gestion Utilisateurs: `/admin` → Utilisateurs
- Debug: `/admin/debug`

### API (Debug)
- Tester mot de passe: `POST /api/debug/test-password`
- Réinitialiser utilisateurs: `POST /api/debug/reset-test-users`
- Exporter utilisateurs: `GET /api/admin/utilisateurs/export?format=csv|json`

---

## ⚠️ Points Clés à Retenir

1. **Photos**: Stockées en Base64 - Considérez AWS S3 pour production
2. **Routes Debug**: Seulement en développement
3. **Validation**: Côté client pour l'UX, côté serveur pour la sécurité
4. **Mots de Passe**: Hash bcrypt (salt: 12) - Très sécurisé ✅
5. **Brute-Force Protection**: 5 tentatives par IP, puis 30min de blocage

---

## 📚 Documentation Complète

- **IMPROVEMENTS.md** - Guide détaillé de toutes les améliorations
- **DEPLOYMENT.md** - Instructions de déploiement en production
- **QUICK_START.md** - Ce fichier!

---

## 🆘 Ça ne fonctionne pas?

### Problème: "Email ou mot de passe incorrect"
```
Solution: 
1. Allez sur /admin/debug
2. Cliquez "Réinitialiser les Utilisateurs"
3. Essayez les identifiants fournis
```

### Problème: Photo n'apparaît pas
```
Vérifiez:
- Format: JPEG, PNG, GIF, WebP
- Taille: Max 5MB
- BD migration appliquée: npx prisma db push
```

### Problème: Impossible de créer un admin
```
Assurez-vous:
- Vous êtes SUPER_ADMIN
- Photo sélectionnée (obligatoire)
- Format valide
```

---

**Vous êtes prêt! Bon codage! 🎉**

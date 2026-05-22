# 🎯 Améliorations ETCH Store - Guide Complet

## ✅ Changements Implémentés

### 1️⃣ Toggle Show/Hide Password
Vous pouvez maintenant afficher/masquer votre mot de passe lors de la saisie:
- **Pages affectées**: 
  - `/admin/login` (Admin)
  - `/connexion` (Clients)
  - `/inscription` (Création de compte client)

**Comment ça fonctionne**: Cliquez sur l'icône oeil (👁️) à droite du champ mot de passe

---

### 2️⃣ Gestion des Photos

#### Pour les ADMINS/ADJOINTS:
- Photo **OBLIGATOIRE** lors de la création
- Photo **OPTIONNELLE** lors de la modification
- Format: JPEG, PNG, GIF, WebP
- Stockage: Base64 en base de données
- Prévisualisation: Aperçu de la photo avant de sauvegarder

#### Pour les CLIENTS:
- Photo **OPTIONNELLE** lors de l'inscription
- Peut être ajoutée ultérieurement

---

## 🔧 Tester l'Authentification

### Routes de Débogage (Développement Uniquement)

#### 1. Réinitialiser les mots de passe de test
```bash
curl -X POST http://localhost:3000/api/debug/reset-test-users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer debug-secret-123"
```

**Crée/Réinitialise les comptes de test:**
- `admin@etch.com` / `ADMIN123` (SUPER_ADMIN)
- `adjoint@etch.com` / `ADJOINT123` (ADJOINT)
- `client@etch.com` / `CLIENT123` (CLIENT)

#### 2. Tester un mot de passe
```bash
curl -X POST http://localhost:3000/api/debug/test-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@etch.com", "password": "ADMIN123"}'
```

**Réponse attendue:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "nom": "Admin ETCH",
    "email": "admin@etch.com",
    "role": "SUPER_ADMIN"
  },
  "debug": {
    "passwordProvided": "ADMIN123",
    "storedHashStart": "$2a$12$...",
    "isValidMatch": true
  }
}
```

---

## 📋 Problèmes d'Authentification - Solutions

Si vos identifiants ne fonctionnent pas:

### ✅ Solution 1: Réinitialiser les mots de passe
1. Appelez `/api/debug/reset-test-users` avec le token
2. Utilisez les nouveaux identifiants de test

### ✅ Solution 2: Vérifier le hashing
1. Utilisez `/api/debug/test-password` pour tester un mot de passe
2. Vérifiez que `isValidMatch: true`

### ✅ Solution 3: Vérifier la base de données
```sql
SELECT id, email, role, DATE(creeLe) as createdDate 
FROM User 
ORDER BY creeLe DESC 
LIMIT 10;
```

---

## 🗄️ Migration Base de Données

Le champ `photo` a été ajouté au modèle `User`:

```prisma
model User {
  id          String  @id @default(cuid())
  nom         String
  email       String  @unique
  telephone   String?
  motDePasse  String
  photo       String? @db.Text  // ← NOUVEAU
  role        Role    @default(MEMBRE)
  // ... autres champs
}
```

**Status**: ✅ Migration appliquée avec `prisma db push`

---

## 🚀 API Endpoints

### Inscription Client (Avec Photo Optionnelle)
```
POST /api/auth/inscription
Content-Type: multipart/form-data

Form Data:
- nom: string
- email: string
- telephone: string (optionnel)
- motDePasse: string (min 6 chars)
- photo: file (optionnel)
```

### Créer Admin/Adjoint (Avec Photo Obligatoire)
```
POST /api/admin/utilisateurs
Content-Type: multipart/form-data

Form Data:
- nom: string
- email: string
- motDePasse: string
- role: "SUPER_ADMIN" | "ADJOINT" | "MEMBRE"
- photo: file (OBLIGATOIRE pour admin/adjoint)
```

### Modifier Admin/Adjoint
```
PUT /api/admin/utilisateurs/{id}
Content-Type: multipart/form-data

Form Data:
- nom: string (optionnel)
- email: string (optionnel)
- motDePasse: string (optionnel)
- role: string (optionnel)
- photo: file (optionnel)
```

---

## ⚠️ Notes Importantes

1. **Photos stockées en Base64**: Les photos sont converties en base64 et stockées directement en BD (données:image/...)
2. **Routes de Debug**: À supprimer en production!
3. **Validation**: Les mots de passe doivent faire minimum 6 caractères
4. **Sécurité Brute-Force**: Protection en place avec limitation de tentatives par IP

---

## 📚 Fichiers Modifiés

### Frontend
- `app/admin/login/page.tsx` - Toggle password + UI améliorée
- `app/(site)/connexion/ConnexionClient.tsx` - Toggle password
- `app/(site)/inscription/InscriptionClient.tsx` - Toggle password + Upload photo
- `app/admin/(dashboard)/utilisateurs/UtilisateursClient.tsx` - Gestion photos pour admins

### Backend
- `lib/auth.ts` - Configuration NextAuth (inchangé, fonctionne correctement)
- `app/api/auth/inscription/route.ts` - Upload photo optionnel
- `app/api/admin/utilisateurs/route.ts` - Upload photo obligatoire (admin/adjoint)
- `app/api/admin/utilisateurs/[id]/route.ts` - Modification avec photo
- `app/api/debug/test-password/route.ts` - Route de test
- `app/api/debug/reset-test-users/route.ts` - Route de réinitialisation
- `prisma/schema.prisma` - Ajout du champ photo

---

## 🎨 UI/UX Améliorations

✅ Toggle show/hide password (emoji 👁️)  
✅ Prévisualisation des photos  
✅ Meilleurs messages d'erreur  
✅ Animations Framer Motion  
✅ Dark mode support  

---

## 📞 Support

En cas de problème:
1. Vérifiez les routes de debug
2. Consultez les logs de la console du serveur
3. Vérifiez la base de données
4. Assurez-vous que les migrations ont été appliquées

**Dernière mise à jour**: Mai 2026

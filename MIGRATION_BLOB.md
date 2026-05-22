# Migration des images vers Vercel Blob

## Avant de commencer

1. **Créer un token Vercel Blob** :
   - Va sur https://vercel.com/account/tokens
   - Crée un nouveau token pour "Blob"
   - Copie le token

2. **Ajouter la variable d'environnement** :
   ```bash
   echo "VERCEL_BLOB_READ_WRITE_TOKEN=ton_token_ici" >> .env.local
   ```

## Lancer la migration

```bash
npx tsx scripts/migrate-images-to-blob.ts
```

## Ce que le script fait

✅ Lit toutes les images de `/public/categories/`
✅ Les upload vers Vercel Blob Cloud
✅ Met à jour la base de données avec les nouvelles URLs
✅ Affiche un rapport détaillé

## Après la migration

- Les anciennes images en `/public/categories/` peuvent être supprimées
- Les nouvelles images sont dans le cloud Vercel
- Elles persisteront après redéploiement ✨

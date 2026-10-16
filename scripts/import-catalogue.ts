// Script CLI — Import en masse du catalogue produits
// ─────────────────────────────────────────────────────────────
// Usage :
//   npm run import-catalogue -- --dry-run   → analyse seule, rien n'est écrit (ni DB, ni Blob)
//   npm run import-catalogue                → import réel (Vercel Blob + base de données)
//   npm run import-catalogue -- --prep      → prépare les photos en vrac (voir plus bas)
//
// Options :
//   --dir=chemin     dossier d'import (défaut : ./import-catalogue)
//   --limit=N        ne traite que les N premiers produits (test à petite échelle)
//
// Mode --prep (organisation automatique) :
//   Si vous avez déposé des photos directement à la racine d'un dossier
//   catégorie (ex. import-catalogue/chaises-fauteuils/*.jpg), --prep crée pour
//   chaque photo un sous-dossier "a-completer-<nom>/" contenant la photo et un
//   info.json squelette (volontairement incomplet : le --dry-run les signalera
//   tant que vous n'aurez pas rempli titre, description et prix). Les dossiers
//   déjà existants ne sont jamais écrasés : --prep peut être relancé après
//   chaque nouvel ajout de photos en vrac.
//
// Arborescence attendue dans le dossier d'import :
//
//   import-catalogue/
//     chaises-fauteuils/                 ← 1 dossier par catégorie (accents/majuscules tolérés)
//       fauteuil-cuir-marron-3-places/   ← 1 sous-dossier par produit, nom parlant
//         info.json                      ← métadonnées (voir ci-dessous)
//         1.jpg  2.jpg  3.webp           ← photos (ordre = tri alphabétique ; la 1re sert de couverture)
//     telephones/
//       samsung-a54-128go-noir/
//         info.json
//         face.jpg
//         dos.jpg
//
// Format de info.json :
//   {
//     "titre": "Fauteuil cuir marron 3 places",       (obligatoire)
//     "description": "Fauteuil importé d'Europe…",    (obligatoire)
//     "prixUSD": 120,                                  (obligatoire, nombre > 0)
//     "etat": "Très bon",                              (obligatoire : Excellent | Très bon | Bon | Correct)
//     "quantite": 1,                                   (optionnel, défaut 1)
//     "vedette": false                                 (optionnel, défaut false)
//   }
//
// Ce que fait le script pour chaque produit :
//   1. valide info.json + présence d'au moins une photo
//   2. compresse et redimensionne chaque photo (≤ 1600 px, WebP qualité 82, rotation EXIF auto)
//   3. uploade vers Vercel Blob : produits/<categorie>/<produit>-<n>.webp
//   4. crée la ligne Produit en DB (photos = tableau JSON d'URLs — format natif du site)
//
// Un produit déjà en DB (même titre + même catégorie) est ignoré et signalé : le
// script peut donc être relancé après une interruption ou pour ajouter des nouveautés.
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });
dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });

// ─── Catégories reconnues (slug de dossier → nom exact en DB) ─
// Les noms de droite doivent correspondre EXACTEMENT à ceux de
// scripts/update-categories.ts (ce sont les valeurs stockées en DB).
const CATEGORIES: Record<string, string> = {
  "chaises-fauteuils": "Chaises & Fauteuils",
  "ecrans-plats": "Écrans plats",
  "radios-modernes": "Radios modernes",
  "telephones": "Téléphones",
  "ecouteurs-modernes": "Écouteurs modernes",
  "chaussures-hommes": "Chaussures hommes",
  "tables-modernes": "Tables modernes",
  "salons-complets": "Salons complets",
  "valises": "Valises",
  "divers": "Divers",
};

const ETATS = ["Excellent", "Très bon", "Bon", "Correct"];
const EXTENSIONS_IMAGES = [".jpg", ".jpeg", ".png", ".webp"];
const TAILLE_MAX = 1600; // px, côté le plus long
const QUALITE_WEBP = 82;
const MAX_PHOTOS = 12; // par produit, sécurité

// ─── Petit outillage ──────────────────────────────────────────

/** Normalise un nom de dossier : minuscules, sans accents, espaces→tirets. */
export function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function arg(nom: string): string | null {
  const a = process.argv.find((x) => x.startsWith(`--${nom}=`));
  return a ? a.split("=").slice(1).join("=") : null;
}
const drapeau = (nom: string) => process.argv.includes(`--${nom}`);

function estImage(nomFichier: string): boolean {
  return EXTENSIONS_IMAGES.includes(path.extname(nomFichier).toLowerCase());
}

function trierPhotos(noms: string[]): string[] {
  return [...noms].filter(estImage).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
}

function versArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function formaterOctets(n: number): string {
  if (n > 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " Mo";
  return Math.round(n / 1024) + " Ko";
}

// ─── Structures ───────────────────────────────────────────────

interface InfoProduit {
  titre: string;
  description: string;
  prixUSD: number;
  etat: string;
  quantite: number;
  vedette: boolean;
}

interface ProduitPret {
  dossierProduit: string;    // chemin relatif pour l'affichage
  slugCategorie: string;     // slug du dossier catégorie (sert aussi pour Blob)
  nomCategorieDB: string;    // nom exact stocké en DB
  slugProduit: string;
  info: InfoProduit;
  photos: string[];          // chemins absolus des fichiers image
  octetsOriginaux: number;
}

interface ErreurScan {
  dossier: string;
  message: string;
}

/** Valide le contenu de info.json et renvoie des erreurs lisibles. */
function validerInfo(brut: unknown): InfoProduit | string[] {
  const erreurs: string[] = [];
  if (typeof brut !== "object" || brut === null) return ["info.json n'est pas un objet JSON"];
  const o = brut as Record<string, unknown>;

  if (typeof o.titre !== "string" || o.titre.trim().length < 3)
    erreurs.push('champ "titre" manquant ou trop court (< 3 caractères)');
  if (typeof o.description !== "string" || o.description.trim().length < 10)
    erreurs.push('champ "description" manquant ou trop court (< 10 caractères)');

  const prix = Number(o.prixUSD);
  if (!Number.isFinite(prix) || prix <= 0)
    erreurs.push('champ "prixUSD" manquant ou invalide (nombre > 0 attendu)');

  if (typeof o.etat !== "string" || !ETATS.includes(o.etat))
    erreurs.push(`champ "etat" invalide — valeurs autorisées : ${ETATS.join(" | ")}`);

  const quantite = o.quantite === undefined ? 1 : Number(o.quantite);
  if (!Number.isInteger(quantite) || quantite < 0)
    erreurs.push('champ "quantite" invalide (entier ≥ 0 attendu)');

  const vedette = o.vedette === undefined ? false : Boolean(o.vedette);

  if (erreurs.length) return erreurs;
  return {
    titre: (o.titre as string).trim(),
    description: (o.description as string).trim(),
    prixUSD: prix,
    etat: (o.etat as string).trim(),
    quantite,
    vedette,
  };
}

/** Parcourt toute l'arborescence et renvoie produits valides + erreurs. */
function scanner(dossierImport: string, limit: number | null): { prets: ProduitPret[]; erreurs: ErreurScan[] } {
  const prets: ProduitPret[] = [];
  const erreurs: ErreurScan[] = [];

  const dossiersCategories = fs
    .readdirSync(dossierImport, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (dossiersCategories.length === 0) {
    erreurs.push({ dossier: dossierImport, message: "Aucun sous-dossier de catégorie trouvé." });
    return { prets, erreurs };
  }

  for (const nomCat of dossiersCategories.sort()) {
    const slugCat = slugifier(nomCat);
    const nomCategorieDB = CATEGORIES[slugCat];
    const cheminCat = path.join(dossierImport, nomCat);

    if (!nomCategorieDB) {
      erreurs.push({
        dossier: nomCat,
        message: `Catégorie inconnue (« ${slugCat} »). Slugs acceptés : ${Object.keys(CATEGORIES).join(", ")}`,
      });
      continue;
    }

    const sousDossiers = fs.readdirSync(cheminCat, { withFileTypes: true }).filter((d) => d.isDirectory());
    if (sousDossiers.length === 0) {
      erreurs.push({ dossier: `${nomCat}/`, message: "Aucun sous-dossier produit (soit ignoré, soit mal organisé)." });
    }

    for (const sous of sousDossiers.map((d) => d.name).sort()) {
      const cheminProd = path.join(cheminCat, sous);
      const rel = `${nomCat}/${sous}`;

      // Photos présentes ?
      const nomsPhotos = trierPhotos(fs.readdirSync(cheminProd));
      if (nomsPhotos.length === 0) {
        erreurs.push({ dossier: rel, message: "Aucune photo (jpg/jpeg/png/webp)." });
        continue;
      }
      if (nomsPhotos.length > MAX_PHOTOS) {
        erreurs.push({ dossier: rel, message: `${nomsPhotos.length} photos — maximum ${MAX_PHOTOS} par produit.` });
        continue;
      }

      // info.json présent et valide ?
      const cheminInfo = path.join(cheminProd, "info.json");
      if (!fs.existsSync(cheminInfo)) {
        erreurs.push({ dossier: rel, message: "info.json manquant." });
        continue;
      }
      let brut: unknown;
      try {
        brut = JSON.parse(fs.readFileSync(cheminInfo, "utf8"));
      } catch (e) {
        erreurs.push({ dossier: rel, message: `info.json illisible (JSON cassé) : ${e instanceof Error ? e.message : e}` });
        continue;
      }
      const resultat = validerInfo(brut);
      if (Array.isArray(resultat)) {
        resultat.forEach((m) => erreurs.push({ dossier: rel, message: m }));
        continue;
      }

      const photos = nomsPhotos.map((n) => path.join(cheminProd, n));
      const octetsOriginaux = photos.reduce((s, p) => s + fs.statSync(p).size, 0);

      prets.push({
        dossierProduit: rel,
        slugCategorie: slugCat,
        nomCategorieDB,
        slugProduit: slugifier(sous),
        info: resultat,
        photos,
        octetsOriginaux,
      });

      if (limit !== null && prets.length >= limit) return { prets, erreurs };
    }
  }
  return { prets, erreurs };
}

// ─── Traitement d'un produit (compression + upload + DB) ──────

async function traiterProduit(
  p: ProduitPret,
  prisma: PrismaClient,
  uploader: (buf: Buffer, dossier: string, slug: string) => Promise<string>
): Promise<{ urls: string[]; octetsOptimises: number }> {
  // Idempotence : même titre + même catégorie déjà en DB → on ne touche rien
  // (vérifié ici, avant toute compression ou upload)
  const existant = await prisma.produit.findFirst({
    where: { titre: p.info.titre, categorie: p.nomCategorieDB },
    select: { id: true },
  });
  if (existant) {
    throw Object.assign(new Error("existe-deja"), { code: "EXISTANT" });
  }

  const urls: string[] = [];
  let octetsOptimises = 0;

  for (let i = 0; i < p.photos.length; i++) {
    const original = fs.readFileSync(p.photos[i]);
    const optimise = await optimiser(original);
    octetsOptimises += optimise.length;
    const url = await uploader(optimise, `produits/${p.slugCategorie}`, `${p.slugProduit}-${i + 1}`);
    urls.push(url);
  }

  await prisma.produit.create({
    data: {
      titre: p.info.titre,
      description: p.info.description,
      prixUSD: p.info.prixUSD,
      etat: p.info.etat,
      categorie: p.nomCategorieDB,
      photos: JSON.stringify(urls), // format natif du site (parserPhotos)
      quantite: p.info.quantite,
      vedette: p.info.vedette,
      disponible: true,
    },
  });

  return { urls, octetsOptimises };
}

/** Compression standard catalogue : rotation EXIF, ≤1600px, WebP q82. */
async function optimiser(buf: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp(buf)
    .rotate()
    .resize({ width: TAILLE_MAX, height: TAILLE_MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITE_WEBP })
    .toBuffer();
}

// ─── Mode --prep : ranger les photos en vrac dans des sous-dossiers ─────────

const SQUELETTE_INFO = {
  titre: "",          // ← À REMPLIR
  description: "",    // ← À REMPLIR (≥ 10 caractères)
  prixUSD: 0,         // ← À REMPLIR (> 0)
  etat: "Bon",        // Excellent | Très bon | Bon | Correct
  quantite: 1,
  vedette: false,
};

function preparer(dossierImport: string) {
  console.log("──────────────────────────────────────────────────");
  console.log("Préparation (--prep) : rangement des photos en vrac");
  console.log("──────────────────────────────────────────────────\n");

  let crees = 0;

  const dossiersCategories = fs
    .readdirSync(dossierImport, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const nomCat of dossiersCategories.sort()) {
    const slugCat = slugifier(nomCat);
    if (!CATEGORIES[slugCat]) {
      console.log(`⏭  ${nomCat} — catégorie inconnue, ignorée (renommez-la parmi : ${Object.keys(CATEGORIES).join(", ")})`);
      continue;
    }

    const cheminCat = path.join(dossierImport, nomCat);
    const entrees = fs.readdirSync(cheminCat, { withFileTypes: true });
    // On ne traite QUE les fichiers image posés directement à la racine de la catégorie
    const photosVrac = entrees.filter((e) => e.isFile() && estImage(e.name)).map((e) => e.name);
    const autresFichiers = entrees.filter((e) => e.isFile() && !estImage(e.name)).map((e) => e.name);

    for (const f of autresFichiers) {
      console.log(`ℹ️  ${nomCat}/${f} — fichier non image, laissé en place (le script l'ignore).`);
    }

    if (photosVrac.length === 0) {
      console.log(`✔ ${nomCat} — rien en vrac.`);
      continue;
    }

    for (const photo of photosVrac.sort()) {
      const base = slugifier(path.basename(photo, path.extname(photo)));
      let cible = path.join(cheminCat, `a-completer-${base || "photo"}`);
      let suffixe = 2;
      while (fs.existsSync(cible)) {
        cible = path.join(cheminCat, `a-completer-${base || "photo"}-${suffixe}`);
        if (suffixe > 99) break;
        suffixe++;
      }
      fs.mkdirSync(cible);
      fs.renameSync(path.join(cheminCat, photo), path.join(cible, photo));
      fs.writeFileSync(path.join(cible, "info.json"), JSON.stringify(SQUELETTE_INFO, null, 2) + "\n", "utf8");
      crees++;
    }
    console.log(`✔ ${nomCat} — ${photosVrac.length} photo(s) rangée(s) dans des sous-dossiers a-completer-*/`);
  }

  console.log(`\nTerminé : ${crees} sous-dossier(s) créé(s).`);
  if (crees > 0) {
    console.log("👉 Remplissez maintenant chaque info.json (titre, description, prixUSD — les champs vides)");
    console.log("   puis : npm run import-catalogue -- --dry-run");
  }
}

// ─── Programme principal ─────────────────────────────────────────────────────

async function main() {
  const dryRun = drapeau("dry-run");
  const dossierImport = path.resolve(arg("dir") || "import-catalogue");
  const limitArg = arg("limit");
  const limit = limitArg ? parseInt(limitArg, 10) : null;

  if (!fs.existsSync(dossierImport)) {
    console.error(`❌ Dossier introuvable : ${dossierImport}`);
    console.error("   Créez-le avec vos dossiers de catégories, ou utilisez --dir=chemin.");
    process.exit(1);
  }

  // Mode --prep : organisation pure sur le disque local, pas de DB ni de Blob.
  // (contrôlé avant toute bannière et toute vérification d'environnement)
  if (drapeau("prep")) {
    preparer(dossierImport);
    return;
  }

  console.log("──────────────────────────────────────────────────");
  console.log(`Import catalogue ETCH — ${dryRun ? "ANALYSE (--dry-run, rien n'est écrit)" : "IMPORT RÉEL"}`);
  console.log(`Dossier : ${dossierImport}`);
  if (limit) console.log(`Limite : ${limit} produit(s)`);
  console.log("──────────────────────────────────────────────────\n");

  // Vérifications d'environnement avant tout travail coûteux
  if (!dryRun) {
    if (!process.env.DATABASE_URL?.trim()) {
      console.error("❌ DATABASE_URL manquant. Renseignez-le dans .env (voir .env.example).");
      process.exit(1);
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() ?? "";
    if (token.length <= 10) {
      console.error("❌ BLOB_READ_WRITE_TOKEN manquant ou invalide.");
      console.error("   Vercel → Storage → Blob → Connect to Project, puis copiez le token dans .env");
      process.exit(1);
    }
  }

  const { prets, erreurs } = scanner(dossierImport, limit);

  // Bilan du scan
  const totalOctets = prets.reduce((s, p) => s + p.octetsOriginaux, 0);
  console.log(`✔ ${prets.length} produit(s) prêt(s), ${prets.reduce((s, p) => s + p.photos.length, 0)} photo(s), ${formaterOctets(totalOctets)} d'origine`);
  for (const p of prets) {
    console.log(`   • ${p.dossierProduit}  →  ${p.photos.length} photo(s), ${formaterOctets(p.octetsOriginaux)}`);
  }
  if (erreurs.length) {
    console.log(`\n⚠ ${erreurs.length} problème(s) à corriger :`);
    for (const e of erreurs) console.log(`   ✗ ${e.dossier} — ${e.message}`);
  }

  if (dryRun) {
    console.log("\n(Dry-run) Aucun upload, aucune écriture DB. Corrigez les ✗ éventuels puis relancez sans --dry-run.");
    console.log("Note : les doublons (titre + catégorie déjà en DB) seront re-vérifiés et ignorés à l'import réel.");
    process.exit(erreurs.length ? 1 : 0);
  }

  if (prets.length === 0) {
    console.error("\n❌ Rien à importer.");
    process.exit(1);
  }

  // Import réel
  const { uploadImage } = await import("../lib/upload-image");
  const prisma = new PrismaClient();

  const uploader = (buf: Buffer, dossier: string, slug: string) =>
    uploadImage(versArrayBuffer(buf), dossier, slug, "photo.webp", "image/webp").then((r) => r.url);

  let crees = 0;
  let ignores = 0;
  let echecs = 0;
  let octetsOptimises = 0;

  for (let i = 0; i < prets.length; i++) {
    const p = prets[i];
    try {
      const res = await traiterProduit(p, prisma, uploader);
      octetsOptimises += res.octetsOptimises;
      crees++;
      console.log(`✅ [${i + 1}/${prets.length}] ${p.info.titre} — ${res.urls.length} photo(s) (${formaterOctets(p.octetsOriginaux)} → ${formaterOctets(res.octetsOptimises)})`);
    } catch (err) {
      if ((err as { code?: string }).code === "EXISTANT") {
        ignores++;
        console.log(`⏭  [${i + 1}/${prets.length}] ${p.info.titre} — déjà en DB, ignoré`);
      } else {
        echecs++;
        console.error(`❌ [${i + 1}/${prets.length}] ${p.dossierProduit} — ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  await prisma.$disconnect();

  console.log("\n──────────────────────────────────────────────────");
  console.log(`Terminé : ${crees} créé(s), ${ignores} déjà présent(s), ${echecs} échec(s).`);
  if (crees > 0) {
    console.log(`Poids photos : ${formaterOctets(totalOctets)} → ~${formaterOctets(octetsOptimises)} (WebP).`);
    console.log("Déployez ou rechargez le site : les produits sont visibles immédiatement (la DB est lue en direct).");
  }
  process.exit(echecs ? 1 : 0);
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e instanceof Error ? e.message : e);
  process.exit(1);
});

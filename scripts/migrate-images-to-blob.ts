// Script CLI — Migrer les photos base64 (stockées en DB) vers Vercel Blob
// ─────────────────────────────────────────────────────────────
// Contexte : les produits historiques ont leurs images en base64 directement
// dans le champ Produit.photos (chaîne "data:image/jpeg;base64,…"). Résultat :
// chaque page produit et la page d'accueil téléchargent des Mo de texte.
//
// Ce script :
//   1. repère, pour chaque produit, les photos en base64 (les URLs http/https
//      déjà sur Blob ou ailleurs sont laissées telles quelles)
//   2. décode, compresse et redimensionne (≤ 1600 px, WebP q82, rotation EXIF)
//   3. uploade vers Vercel Blob : produits/migres/<id-produit>-<n>.webp
//   4. met à jour Produit.photos (toujours un tableau JSON d'URLs — format natif)
//
// Usage : npm run migrate-images-blob -- --dry-run   → rapport seul, rien d'écrit
//         npm run migrate-images-blob                → migration réelle
// Option : --limit=N (ne traite que N produits, pour tester)
//
// En cas d'échec sur une photo, celle-ci est conservée en base64 et signalée :
// la migration peut être relancée sans risque (les photos déjà en URL sont ignorées).
// ─────────────────────────────────────────────────────────────

import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });
dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });

const TAILLE_MAX = 1600;
const QUALITE_WEBP = 82;
const REGEX_DATA_URL = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;

function arg(nom: string): string | null {
  const a = process.argv.find((x) => x.startsWith(`--${nom}=`));
  return a ? a.split("=").slice(1).join("=") : null;
}
const drapeau = (nom: string) => process.argv.includes(`--${nom}`);

function versArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function formaterOctets(n: number): string {
  if (n > 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " Mo";
  return Math.round(n / 1024) + " Ko";
}

/** Extrait les URLs photos d'un produit (tolère JSON tableau OU chaîne brute). */
function extrairePhotos(champ: string): { urls: string[]; etaitJson: boolean } {
  try {
    const parsed = JSON.parse(champ);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return { urls: parsed, etaitJson: true };
    }
  } catch {
    /* pas du JSON : on traite comme une URL unique */
  }
  return { urls: champ ? [champ] : [], etaitJson: false };
}

async function main() {
  const dryRun = drapeau("dry-run");
  const limitArg = arg("limit");
  const limit = limitArg ? parseInt(limitArg, 10) : null;

  console.log("──────────────────────────────────────────────────");
  console.log(`Migration images base64 → Vercel Blob — ${dryRun ? "ANALYSE (--dry-run)" : "MIGRATION RÉELLE"}`);
  if (limit) console.log(`Limite : ${limit} produit(s)`);
  console.log("──────────────────────────────────────────────────\n");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("❌ DATABASE_URL manquant. Renseignez-le dans .env (voir .env.example).");
    process.exit(1);
  }
  if (!dryRun) {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() ?? "";
    if (token.length <= 10) {
      console.error("❌ BLOB_READ_WRITE_TOKEN manquant ou invalide.");
      console.error("   Vercel → Storage → Blob → Connect to Project, puis copiez le token dans .env");
      process.exit(1);
    }
  }

  const prisma = new PrismaClient();
  const produits = await prisma.produit.findMany({
    select: { id: true, titre: true, photos: true },
    orderBy: { creeLe: "asc" },
  });

  // Repérage
  const cibles: Array<{ id: string; titre: string; urls: string[]; indicesBase64: number[]; octetsChamp: number }> = [];
  for (const p of produits) {
    const { urls } = extrairePhotos(p.photos);
    const indices = urls.map((u, i) => (REGEX_DATA_URL.test(u) ? i : -1)).filter((i) => i >= 0);
    if (indices.length > 0) cibles.push({ id: p.id, titre: p.titre, urls, indicesBase64: indices, octetsChamp: p.photos.length });
    if (limit !== null && cibles.length >= limit) break;
  }

  const totalPhotos = cibles.reduce((s, c) => s + c.indicesBase64.length, 0);
  const totalOctets = cibles.reduce((s, c) => s + c.octetsChamp, 0);
  console.log(`✔ ${cibles.length} produit(s) avec photos base64, ${totalPhotos} photo(s), ~${formaterOctets(totalOctets)} de texte en DB`);

  if (cibles.length === 0) {
    console.log("Rien à migrer. ✅");
    await prisma.$disconnect();
    process.exit(0);
  }
  if (dryRun) {
    for (const c of cibles) console.log(`   • ${c.titre} — ${c.indicesBase64.length} photo(s) base64, champ ${formaterOctets(c.octetsChamp)}`);
    console.log("\n(Dry-run) Aucun upload, aucune écriture DB. Relancez sans --dry-run pour migrer.");
    await prisma.$disconnect();
    process.exit(0);
  }

  // Migration réelle
  const { uploadImage } = await import("../lib/upload-image");
  const sharp = (await import("sharp")).default;

  let produitsMigres = 0;
  let photosMigrees = 0;
  let echecs = 0;
  let octetsApres = 0;

  for (let i = 0; i < cibles.length; i++) {
    const c = cibles[i];
    const nouvelles = [...c.urls];
    let octetsProduit = 0;

    for (const idx of c.indicesBase64) {
      try {
        const base64 = c.urls[idx].replace(REGEX_DATA_URL, "");
        const original = Buffer.from(base64, "base64");
        const optimise = await sharp(original)
          .rotate()
          .resize({ width: TAILLE_MAX, height: TAILLE_MAX, fit: "inside", withoutEnlargement: true })
          .webp({ quality: QUALITE_WEBP })
          .toBuffer();
        octetsProduit += optimise.length;
        const { url } = await uploadImage(
          versArrayBuffer(optimise),
          "produits/migres",
          `${c.id}-${idx + 1}`,
          "photo.webp",
          "image/webp"
        );
        nouvelles[idx] = url;
        photosMigrees++;
      } catch (e) {
        echecs++;
        console.error(`   ❌ ${c.titre} photo #${idx + 1} — conservée en base64 : ${e instanceof Error ? e.message : e}`);
      }
    }
    octetsApres += octetsProduit;

    // Mise à jour DB : toujours un tableau JSON (parserPhotos gère les deux formes)
    const nouveauChamp = JSON.stringify(nouvelles);
    try {
      await prisma.produit.update({ where: { id: c.id }, data: { photos: nouveauChamp } });
      produitsMigres++;
      console.log(`✅ [${i + 1}/${cibles.length}] ${c.titre} — champ ${formaterOctets(c.octetsChamp)} → ${formaterOctets(nouveauChamp.length)}`);
    } catch (e) {
      echecs++;
      console.error(`   ❌ ${c.titre} — écriture DB échouée : ${e instanceof Error ? e.message : e}`);
    }
  }

  await prisma.$disconnect();

  console.log("\n──────────────────────────────────────────────────");
  console.log(`Terminé : ${produitsMigres}/${cibles.length} produit(s) migré(s), ${photosMigrees} photo(s) sur Blob, ${echecs} échec(s).`);
  console.log(`Photos optimisées au passage : ~${formaterOctets(octetsApres)} de WebP au lieu de ${formaterOctets(totalOctets)} de base64 texte.`);
  if (echecs > 0) console.log("Relancez le script : les photos déjà en URL sont ignorées, seuls les échecs seront repris.");
  process.exit(echecs ? 1 : 0);
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e instanceof Error ? e.message : e);
  process.exit(1);
});

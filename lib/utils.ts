// Utilitaires globaux — ETCH Store

// Fusion de classes Tailwind
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

// Formatage prix USD
export function formatUSD(prix: number): string {
  return `${prix.toLocaleString("fr-FR")} USD`;
}

// Formatage prix CDF
export function formatCDF(prixUSD: number, tauxCDF: number): string {
  const prixCDF = Math.round(prixUSD * tauxCDF);
  return `${prixCDF.toLocaleString("fr-FR")} CDF`;
}

// Formatage prix complet USD + CDF
export function formatPrix(prixUSD: number, tauxCDF: number): string {
  return `${formatUSD(prixUSD)} / ${formatCDF(prixUSD, tauxCDF)}`;
}

// Tronquer texte
export function tronquer(texte: string, longueur = 160): string {
  if (texte.length <= longueur) return texte;
  return texte.substring(0, longueur).trim() + "...";
}

// Parser photos JSON
export function parserPhotos(photosJson: string): string[] {
  try {
    const parsed = JSON.parse(photosJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return photosJson ? [photosJson] : [];
  }
}

// Obtenir l'IP depuis les headers Next.js
export function obtenirIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  return "unknown";
}

// Formater date en français
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============ NOUVELLES VALIDATIONS ============

// Valider email
export function validerEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

// Valider mot de passe (minimum 6 caractères)
export function validerMotDePasse(motDePasse: string): { valide: boolean; erreur?: string } {
  if (!motDePasse) return { valide: false, erreur: "Le mot de passe est requis" };
  if (motDePasse.length < 6) return { valide: false, erreur: "Minimum 6 caractères" };
  if (motDePasse.length > 128) return { valide: false, erreur: "Maximum 128 caractères" };
  return { valide: true };
}

// Valider force du mot de passe
export function evaluerForceMotDePasse(motDePasse: string): { force: "faible" | "moyen" | "fort"; score: number } {
  let score = 0;

  if (motDePasse.length >= 8) score += 1;
  if (motDePasse.length >= 12) score += 1;
  if (/[a-z]/.test(motDePasse)) score += 1;
  if (/[A-Z]/.test(motDePasse)) score += 1;
  if (/[0-9]/.test(motDePasse)) score += 1;
  if (/[^A-Za-z0-9]/.test(motDePasse)) score += 1;

  const force = score <= 2 ? "faible" : score <= 4 ? "moyen" : "fort";
  return { force, score };
}

// Valider téléphone
export function validerTelephone(telephone: string): boolean {
  if (!telephone) return true; // Optionnel
  // Accepte formats: +XXX XXXXXXXXX, XXXXXXXXXX, etc.
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(telephone.trim());
}

// Valider nom
export function validerNom(nom: string): { valide: boolean; erreur?: string } {
  if (!nom) return { valide: false, erreur: "Le nom est requis" };
  const trimmed = nom.trim();
  if (trimmed.length < 2) return { valide: false, erreur: "Minimum 2 caractères" };
  if (trimmed.length > 100) return { valide: false, erreur: "Maximum 100 caractères" };
  return { valide: true };
}

// Valider fichier image
export function validerFichierImage(file: File | null): { valide: boolean; erreur?: string } {
  if (!file) return { valide: true }; // Optionnel

  const mimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!mimeTypes.includes(file.type)) {
    return { valide: false, erreur: "Format non supporté (JPEG, PNG, GIF, WebP)" };
  }

  if (file.size > maxSize) {
    return { valide: false, erreur: "Fichier trop volumineux (max 5MB)" };
  }

  return { valide: true };
}

// Compresser une image via canvas (côté client)
export function compresserImage(file: File, maxWidth = 600, quality = 0.65): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

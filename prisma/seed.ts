// Seed Prisma — ETCH Store
// Crée le compte SUPER_ADMIN initial et les paramètres par défaut

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed...");

  // ─── Compte SUPER_ADMIN initial ───────────────────────────
  const hash = await bcrypt.hash("ADMIN123", 12);

  // upsert avec update — corrige le rôle et le hash si le compte existe déjà
  const admin = await prisma.user.upsert({
    where: { email: "etsTchibanvunya@gmail.com" },
    update: {
      motDePasse: hash,
      role: Role.SUPER_ADMIN,
      motDePasseChange: false,
    },
    create: {
      nom: "Administrateur ETCH",
      email: "etsTchibanvunya@gmail.com",
      motDePasse: hash,
      role: Role.SUPER_ADMIN,
      motDePasseChange: false,
    },
  });

  console.log(`✅ Admin créé/mis à jour : ${admin.email} (rôle: ${admin.role})`);

  // ─── Paramètres par défaut ────────────────────────────────
  const parametres = [
    { cle: "taux_usd_cdf", valeur: "2800" },
    { cle: "nom_etablissement", valeur: "ÉTABLISSEMENT TCHIBANVUNYA" },
    { cle: "marque", valeur: "ETCH" },
    { cle: "tagline", valeur: "L'Europe à votre portée" },
    {
      cle: "adresse",
      valeur: "Avenue Patrice Emery Lumumba, Quartier Labotte, Bukavu, Sud-Kivu — en diagonale de l'Ecobank",
    },
    { cle: "email_contact", valeur: "etsTchibanvunya@gmail.com" },
    { cle: "telephone_1", valeur: "+243 997 220 295" },
    { cle: "telephone_2", valeur: "+243 853 792 399" },
    { cle: "telephone_3", valeur: "+243 97 625 4832" },
    { cle: "whatsapp", valeur: "25766504165" },
    {
      cle: "categories",
      valeur: JSON.stringify([
        { nom: "Chaises & Fauteuils", image: "/categories/chaises-fauteuils.svg" },
        { nom: "Écrans plats", image: "/categories/ecrans-plats.svg" },
        { nom: "Radios modernes", image: "/categories/radios-modernes.svg" },
        { nom: "Téléphones", image: "/categories/telephones.svg" },
        { nom: "Écouteurs modernes", image: "/categories/ecouteurs-modernes.svg" },
        { nom: "Chaussures hommes", image: "/categories/chaussures-hommes.jpg" },
        { nom: "Tables modernes", image: "/categories/tables-modernes.svg" },
        { nom: "Salons complets", image: "/categories/salons-complets.svg" },
        { nom: "Valises", image: "/categories/valises.svg" },
        { nom: "Divers", image: "/categories/divers.svg" },
      ]),
    },
    { cle: "createur_nom", valeur: "Tchibanvunya Gedeon" },
    { cle: "createur_email", valeur: "tchibanvunyagedeon@gmail.com" },
    { cle: "createur_whatsapp", valeur: "25779640420" },
    { cle: "createur_domaine", valeur: "IT — Développement & Cybersécurité" },
  ];

  for (const p of parametres) {
    await prisma.parametre.upsert({
      where: { cle: p.cle },
      update: {},
      create: p,
    });
  }

  console.log(`✅ ${parametres.length} paramètres créés`);
  console.log("🎉 Seed terminé !");
  console.log("─────────────────────────────────────────");
  console.log("  Email    : etsTchibanvunya@gmail.com");
  console.log("  Mot de passe : ADMIN123");
  console.log("  ⚠ Changez ce mot de passe immédiatement !");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Script CLI — Créer ou réinitialiser le compte SUPER_ADMIN
// Usage : npm run create-super-admin
// Usage avec args : npm run create-super-admin -- --email=mon@email.com --password=MonMdp123
//
// Ce script peut tourner à froid (avant toute connexion).
// Il crée le compte s'il n'existe pas, ou le réinitialise s'il existe.

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Lire les arguments CLI ───────────────────────────────────
function getArg(name: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : null;
}

async function main() {
  const email = getArg("email") || "etsTchibanvunya@gmail.com";
  const password = getArg("password") || "ADMIN123";
  const nom = getArg("nom") || "Administrateur ETCH";

  console.log("");
  console.log("══════════════════════════════════════════");
  console.log("  CRÉATION / RÉINITIALISATION SUPER_ADMIN ");
  console.log("══════════════════════════════════════════");
  console.log("");
  console.log(`  Email    : ${email}`);
  console.log(`  Nom      : ${nom}`);
  console.log(`  Rôle     : SUPER_ADMIN`);
  console.log("");

  // Vérifier la connexion DB
  try {
    await prisma.$connect();
    console.log("✅ Connexion base de données OK");
  } catch (e) {
    console.error("❌ Impossible de se connecter à la base de données.");
    console.error("   Vérifiez DATABASE_URL dans .env.local");
    console.error(e);
    process.exit(1);
  }

  // Hasher le mot de passe
  const hash = await bcrypt.hash(password, 12);

  // Créer ou écraser le compte
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      nom,
      motDePasse: hash,
      role: Role.SUPER_ADMIN,
      motDePasseChange: false,
    },
    create: {
      nom,
      email,
      motDePasse: hash,
      role: Role.SUPER_ADMIN,
      motDePasseChange: false,
    },
  });

  console.log("");
  console.log("✅ Compte SUPER_ADMIN prêt !");
  console.log("");
  console.log("──────────────────────────────────────────");
  console.log(`  ID       : ${user.id}`);
  console.log(`  Email    : ${user.email}`);
  console.log(`  Rôle     : ${user.role}`);
  console.log(`  Mot de passe : ${password}`);
  console.log("──────────────────────────────────────────");
  console.log("");
  console.log("  Connectez-vous sur : /admin/login");
  console.log("  ⚠  Changez le mot de passe après connexion !");
  console.log("");

  // Lister tous les comptes admin existants
  const admins = await prisma.user.findMany({
    where: { role: { in: [Role.SUPER_ADMIN, Role.ADJOINT] } },
    select: { id: true, nom: true, email: true, role: true, motDePasseChange: true },
  });

  if (admins.length > 0) {
    console.log("  Comptes admin dans la base :");
    for (const a of admins) {
      const mdpOk = a.motDePasseChange ? "✅ mdp changé" : "⚠  mdp par défaut";
      console.log(`  → ${a.email} [${a.role}] ${mdpOk}`);
    }
    console.log("");
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

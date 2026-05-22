// Script — Mettre à jour les catégories en base de données
// Usage : npm run update-categories

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
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
  ];

  await prisma.parametre.upsert({
    where: { cle: "categories" },
    update: { valeur: JSON.stringify(categories) },
    create: { cle: "categories", valeur: JSON.stringify(categories) },
  });

  console.log("✅ Catégories mises à jour :");
  categories.forEach((c) => console.log(`   - ${c}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

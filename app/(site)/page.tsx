import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

// Pas de cache — toujours lire les données fraîches depuis la DB
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "ETCH — Appareils d'occasion d'Europe | Bukavu",
  description:
    "Achetez des appareils électroniques et meubles d'occasion importés d'Europe. Téléphones, écrans, générateurs, salons. Bukavu, Sud-Kivu.",
  openGraph: {
    title: "ETCH — Appareils d'occasion d'Europe | Bukavu",
    description: "Achetez des appareils électroniques et meubles d'occasion importés d'Europe.",
    images: [{ url: "/logo-etch.png" }],
  },
};

export default async function HomePage() {
  const produitsVedette = await prisma.produit.findMany({
    where: { vedette: true, disponible: true },
    orderBy: { creeLe: "desc" },
    take: 8,
  });

  const produitsRecents = await prisma.produit.findMany({
    where: { disponible: true },
    orderBy: { creeLe: "desc" },
    take: 8,
  });

  // Récupérer toutes les images des produits pour le carrousel hero
  const tousLesProduits = await prisma.produit.findMany({
    where: { disponible: true },
    select: { id: true, titre: true, photos: true, categorie: true },
    orderBy: { creeLe: "desc" },
    take: 20,
  });

  const tauxParam = await prisma.parametre.findUnique({ where: { cle: "taux_usd_cdf" } });
  const tauxCDF = parseFloat(tauxParam?.valeur || "2800");

  const categoriesParam = await prisma.parametre.findUnique({ where: { cle: "categories" } });
  const categories: Array<{ nom: string; image: string }> = categoriesParam ? JSON.parse(categoriesParam.valeur) : [];

  return (
    <HomeClient
      produitsVedette={JSON.parse(JSON.stringify(produitsVedette))}
      produitsRecents={JSON.parse(JSON.stringify(produitsRecents))}
      tousLesProduits={JSON.parse(JSON.stringify(tousLesProduits))}
      tauxCDF={tauxCDF}
      categories={categories}
    />
  );
}

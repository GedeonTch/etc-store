import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { tronquer, parserPhotos } from "@/lib/utils";
import ProduitClient from "./ProduitClient";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const produit = await prisma.produit.findUnique({ where: { id: params.id } });
  if (!produit) return { title: "Produit introuvable — ETCH" };
  const photos = parserPhotos(produit.photos);
  return {
    title: `${produit.titre} — ETCH`,
    description: tronquer(produit.description, 160),
    openGraph: {
      title: `${produit.titre} — ETCH`,
      description: tronquer(produit.description, 160),
      images: photos[0] ? [{ url: photos[0] }] : [{ url: "/logo-etch.png" }],
    },
  };
}

export default async function ProduitPage({ params }: Props) {
  const produit = await prisma.produit.findUnique({ where: { id: params.id } });
  if (!produit || !produit.disponible) notFound();

  // Incrémenter les vues
  await prisma.produit.update({ where: { id: params.id }, data: { vues: { increment: 1 } } });

  const tauxParam = await prisma.parametre.findUnique({ where: { cle: "taux_usd_cdf" } });
  const tauxCDF = parseFloat(tauxParam?.valeur || "2800");

  const similaires = await prisma.produit.findMany({
    where: { categorie: produit.categorie, disponible: true, id: { not: produit.id } },
    take: 4,
    orderBy: { creeLe: "desc" },
  });

  return (
    <ProduitClient
      produit={JSON.parse(JSON.stringify(produit))}
      tauxCDF={tauxCDF}
      similaires={JSON.parse(JSON.stringify(similaires))}
    />
  );
}

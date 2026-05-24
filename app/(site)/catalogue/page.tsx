import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CatalogueClient from "./CatalogueClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Catalogue — ETCH Tchibanvunya",
  description: "Parcourez notre catalogue d'appareils d'occasion importés d'Europe. Téléphones, écrans, générateurs, meubles. Bukavu, Sud-Kivu.",
};

export default async function CataloguePage() {
  const produits = await prisma.produit.findMany({
    where: { disponible: true },
    orderBy: { creeLe: "desc" },
  });

  const tauxParam = await prisma.parametre.findUnique({ where: { cle: "taux_usd_cdf" } });
  const tauxCDF = parseFloat(tauxParam?.valeur || "2800");

  const categoriesParam = await prisma.parametre.findUnique({ where: { cle: "categories" } });
  const categories: Array<{ nom: string; image: string }> = categoriesParam ? JSON.parse(categoriesParam.valeur) : [];

  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-[var(--text-muted)]">Chargement...</div>}>
      <CatalogueClient
        produits={JSON.parse(JSON.stringify(produits))}
        tauxCDF={tauxCDF}
        categories={categories}
      />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProduitsAdminClient from "./ProduitsAdminClient";

export default async function AdminProduits() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const produits = await prisma.produit.findMany({ orderBy: { creeLe: "desc" } });
  const tauxParam = await prisma.parametre.findUnique({ where: { cle: "taux_usd_cdf" } });
  const tauxCDF = parseFloat(tauxParam?.valeur || "2800");
  const categoriesParam = await prisma.parametre.findUnique({ where: { cle: "categories" } });
  const categories: Array<{nom: string; image: string}> = categoriesParam ? JSON.parse(categoriesParam.valeur) : [];

  return (
    <ProduitsAdminClient
      produits={JSON.parse(JSON.stringify(produits))}
      tauxCDF={tauxCDF}
      categories={categories}
      role={role}
    />
  );
}

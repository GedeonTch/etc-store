import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "https://etch-store.vercel.app";

  const statiques: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalogue`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/credits`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const produits = await prisma.produit.findMany({
    where: { disponible: true },
    select: { id: true, creeLe: true },
  });

  const dynamiques: MetadataRoute.Sitemap = produits.map((p) => ({
    url: `${base}/produit/${p.id}`,
    lastModified: p.creeLe,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...statiques, ...dynamiques];
}

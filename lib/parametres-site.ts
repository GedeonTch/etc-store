import { prisma } from "@/lib/prisma";
import { CLES_SITE, type ParametresSite } from "@/lib/parametres-public";

export type { ParametresSite };

export async function chargerParametresSite(): Promise<ParametresSite> {
  const rows = await prisma.parametre.findMany({
    where: { cle: { in: [...CLES_SITE] } },
  });
  const map: ParametresSite = {};
  for (const p of rows) map[p.cle] = p.valeur;
  return map;
}

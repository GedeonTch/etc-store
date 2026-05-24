import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AProposClient from "./AProposClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "À propos — ETCH Tchibanvunya",
  description:
    "Découvrez l'équipe de l'Établissement Tchibanvunya (ETCH) à Bukavu. Notre mission, nos valeurs et nos agents.",
};

export default async function AProposPage() {
  const agents = await prisma.user.findMany({
    where: {
      role: { in: ["SUPER_ADMIN", "ADJOINT", "MEMBRE"] },
    },
    select: {
      id: true,
      nom: true,
      email: true,
      role: true,
      photo: true,
    },
    orderBy: { creeLe: "asc" },
  });

  const parametres = await prisma.parametre.findMany({
    where: {
      cle: {
        in: [
          "nom_etablissement", "tagline", "adresse", "telephone_1", "telephone_2",
          "telephone_3", "email_contact", "whatsapp",
          "apropos_intro", "apropos_mission_p1", "apropos_mission_p2", "apropos_equipe",
        ],
      },
    },
  });

  const params: Record<string, string> = {};
  for (const p of parametres) params[p.cle] = p.valeur;

  let equipeCustom: Array<{ nom: string; poste: string; email: string; photo: string }> = [];
  try {
    const parsed = JSON.parse(params.apropos_equipe || "[]");
    if (Array.isArray(parsed)) equipeCustom = parsed;
  } catch { /* ignore */ }

  return (
    <AProposClient
      agents={JSON.parse(JSON.stringify(agents))}
      equipeCustom={JSON.parse(JSON.stringify(equipeCustom))}
      params={params}
    />
  );
}

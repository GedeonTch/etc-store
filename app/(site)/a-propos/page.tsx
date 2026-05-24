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

export type MembreEquipePublic = {
  nom: string;
  poste: string;
  photo: string;
  description?: string;
  whatsapp?: string;
};

export default async function AProposPage() {
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

  let equipe: MembreEquipePublic[] = [];
  try {
    const parsed = JSON.parse(params.apropos_equipe || "[]");
    if (Array.isArray(parsed)) {
      equipe = parsed.map((m: Record<string, string>) => ({
        nom: m.nom || "",
        poste: m.poste || "",
        photo: m.photo || "",
        description: m.description || "",
        whatsapp: m.whatsapp || "",
      })).filter((m) => m.nom.trim());
    }
  } catch { /* ignore */ }

  return (
    <AProposClient
      equipe={JSON.parse(JSON.stringify(equipe))}
      params={params}
    />
  );
}

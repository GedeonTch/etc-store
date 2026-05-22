import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AProposClient from "./AProposClient";

export const metadata: Metadata = {
  title: "À propos — ETCH Tchibanvunya",
  description:
    "Découvrez l'équipe de l'Établissement Tchibanvunya (ETCH) à Bukavu. Notre mission, nos valeurs et nos agents.",
};

export default async function AProposPage() {
  // Récupérer les agents (utilisateurs avec rôle non-CLIENT)
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
      cle: { in: ["nom_etablissement", "tagline", "adresse", "telephone_1", "telephone_2", "telephone_3", "email_contact", "whatsapp"] },
    },
  });

  const params: Record<string, string> = {};
  for (const p of parametres) params[p.cle] = p.valeur;

  return (
    <AProposClient
      agents={JSON.parse(JSON.stringify(agents))}
      params={params}
    />
  );
}


import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const [nbProduits, nbMessages, nbMessagesNonLus, nbAttentes, produitsEpuises] = await Promise.all([
    prisma.produit.count({ where: { disponible: true } }),
    prisma.message.count(),
    prisma.message.count({ where: { lu: false } }),
    prisma.listeAttente.count(),
    prisma.produit.count({ where: { quantite: 0, disponible: true } }),
  ]);

  return (
    <DashboardClient
      session={JSON.parse(JSON.stringify(session))}
      stats={{ nbProduits, nbMessages, nbMessagesNonLus, nbAttentes, produitsEpuises }}
    />
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ParametresClient from "./ParametresClient";

export default async function AdminParametres() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/admin");

  const parametres = await prisma.parametre.findMany();
  const map: Record<string, string> = {};
  for (const p of parametres) map[p.cle] = p.valeur;

  return <ParametresClient parametres={map} />;
}


import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UtilisateursClient from "./UtilisateursClient";

export default async function AdminUtilisateurs() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    select: { id: true, nom: true, email: true, role: true, creeLe: true, motDePasseChange: true },
    orderBy: { creeLe: "desc" },
  });

  return <UtilisateursClient users={JSON.parse(JSON.stringify(users))} />;
}

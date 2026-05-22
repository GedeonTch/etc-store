import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogsClient from "./LogsClient";

export default async function AdminLogs() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/admin");

  const logs = await prisma.logConnexion.findMany({
    include: { user: { select: { nom: true, email: true } } },
    orderBy: { creeLe: "desc" },
    take: 200,
  });

  const ipsBloquees = await prisma.tentativeConnexion.findMany({
    where: { bloqueJusqu: { gt: new Date() } },
    orderBy: { misAJour: "desc" },
  });

  return <LogsClient logs={JSON.parse(JSON.stringify(logs))} ipsBloquees={JSON.parse(JSON.stringify(ipsBloquees))} />;
}

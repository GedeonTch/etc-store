export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessagesAdminClient from "./MessagesAdminClient";

export default async function AdminMessages() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const messages = await prisma.message.findMany({
    include: { produit: { select: { titre: true } } },
    orderBy: { creeLe: "desc" },
  });

  return <MessagesAdminClient messages={JSON.parse(JSON.stringify(messages))} role={role} />;
}

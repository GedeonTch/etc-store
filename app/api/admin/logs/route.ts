import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const logs = await prisma.logConnexion.findMany({
    where: type ? { type } : undefined,
    include: { user: { select: { nom: true, email: true } } },
    orderBy: { creeLe: "desc" },
    take: 200,
  });

  const ipsBloquees = await prisma.tentativeConnexion.findMany({
    where: { bloqueJusqu: { gt: new Date() } },
    orderBy: { misAJour: "desc" },
  });

  return NextResponse.json({ logs, ipsBloquees });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { ip } = await req.json();
  if (!ip) return NextResponse.json({ error: "IP requise" }, { status: 400 });

  await prisma.tentativeConnexion.update({
    where: { ip },
    data: { tentatives: 0, bloqueJusqu: null },
  });

  return NextResponse.json({ success: true });
}

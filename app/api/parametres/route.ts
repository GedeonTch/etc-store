import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const parametres = await prisma.parametre.findMany();
  const map: Record<string, string> = {};
  for (const p of parametres) map[p.cle] = p.valeur;
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const updates = Array.isArray(body) ? body : [body];

  for (const { cle, valeur } of updates) {
    await prisma.parametre.upsert({
      where: { cle },
      update: { valeur },
      create: { cle, valeur },
    });
  }

  return NextResponse.json({ success: true });
}

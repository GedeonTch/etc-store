import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClient } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isClient(session)) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { produitId } = await req.json();
  const emailClient = session!.user!.email!;

  if (!produitId) {
    return NextResponse.json({ error: "Produit requis" }, { status: 400 });
  }

  const produit = await prisma.produit.findUnique({ where: { id: produitId } });
  if (!produit) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  if (produit.quantite > 0) return NextResponse.json({ error: "Produit disponible" }, { status: 400 });

  const attente = await prisma.listeAttente.upsert({
    where: { emailClient_produitId: { emailClient, produitId } },
    update: {},
    create: { emailClient, produitId },
  });

  return NextResponse.json(attente, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const produitId = searchParams.get("produitId");

  const attentes = await prisma.listeAttente.findMany({
    where: produitId ? { produitId } : undefined,
    include: { produit: { select: { titre: true } } },
    orderBy: { creeLe: "desc" },
  });

  return NextResponse.json(attentes);
}

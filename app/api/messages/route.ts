import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { envoyerEmailMessageClient } from "@/lib/emails";
import { isClient } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isClient(session)) {
    return NextResponse.json({ error: "Connexion requise. Créez un compte client." }, { status: 401 });
  }

  const body = await req.json();
  const { produitId, contenu, telephone } = body;
  const nomClient = session!.user!.name!;
  const emailClient = session!.user!.email!;

  if (!contenu?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  let produitTitre: string | undefined;
  if (produitId) {
    const p = await prisma.produit.findUnique({ where: { id: produitId } });
    produitTitre = p?.titre;
  }

  const client = await prisma.user.findUnique({ where: { id: session!.user!.id } });

  const message = await prisma.message.create({
    data: {
      clientId: session!.user!.id,
      nomClient,
      emailClient,
      telephone: telephone || client?.telephone || null,
      produitId: produitId || null,
      contenu: contenu.trim(),
    },
  });

  await envoyerEmailMessageClient({ nomClient, emailClient, telephone, produitTitre, contenu }).catch(console.error);

  return NextResponse.json(message, { status: 201 });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  // Si email fourni (client qui demande ses propres messages)
  if (email) {
    const messages = await prisma.message.findMany({
      where: { emailClient: email },
      select: { id: true, contenu: true, reponse: true, reponseLue: true, creeLe: true },
      orderBy: { creeLe: "desc" },
    });
    return NextResponse.json(messages);
  }

  // Admin qui demande tous les messages
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const messages = await prisma.message.findMany({
    include: { produit: { select: { titre: true } } },
    orderBy: { creeLe: "desc" },
  });

  return NextResponse.json(messages);
}

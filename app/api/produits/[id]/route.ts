import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { envoyerEmailRemiseEnStock } from "@/lib/emails";

// Nécessaire pour accepter les gros body (images base64) dans l'App Router
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const produit = await prisma.produit.findUnique({ where: { id: params.id } });
  if (!produit) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(produit);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["SUPER_ADMIN", "ADJOINT"].includes(role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const ancien = await prisma.produit.findUnique({ where: { id: params.id } });
  if (!ancien) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.titre !== undefined) data.titre = body.titre;
  if (body.description !== undefined) data.description = body.description;
  if (body.prixUSD !== undefined) data.prixUSD = parseFloat(body.prixUSD);
  if (body.etat !== undefined) data.etat = body.etat;
  if (body.categorie !== undefined) data.categorie = body.categorie;
  if (body.photos !== undefined) data.photos = JSON.stringify(body.photos);
  if (body.quantite !== undefined) data.quantite = parseInt(body.quantite);
  if (body.vedette !== undefined) data.vedette = body.vedette;
  if (body.disponible !== undefined) data.disponible = body.disponible;

  const produit = await prisma.produit.update({ where: { id: params.id }, data });

  // Notifier la liste d'attente si remise en stock
  if (ancien.quantite === 0 && produit.quantite > 0) {
    const attentes = await prisma.listeAttente.findMany({ where: { produitId: params.id } });
    for (const a of attentes) {
      await envoyerEmailRemiseEnStock(a.emailClient, produit.titre, produit.id).catch(console.error);
    }
    await prisma.listeAttente.deleteMany({ where: { produitId: params.id } });
  }

  return NextResponse.json(produit);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  await prisma.produit.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

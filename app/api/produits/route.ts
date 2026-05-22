import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = { disponible: true };

  const categorie = searchParams.get("categorie");
  const etat = searchParams.get("etat");
  const prixMin = searchParams.get("prixMin");
  const prixMax = searchParams.get("prixMax");
  const q = searchParams.get("q");
  const tri = searchParams.get("tri") || "recent";
  const vedette = searchParams.get("vedette");

  if (categorie) where.categorie = categorie;
  if (etat) where.etat = etat;
  if (prixMin || prixMax) {
    where.prixUSD = {
      ...(prixMin ? { gte: parseFloat(prixMin) } : {}),
      ...(prixMax ? { lte: parseFloat(prixMax) } : {}),
    };
  }
  if (q) {
    where.OR = [
      { titre: { contains: q } },
      { description: { contains: q } },
      { categorie: { contains: q } },
    ];
  }
  if (vedette === "true") where.vedette = true;

  const orderBy =
    tri === "prix_asc" ? { prixUSD: "asc" as const } :
    tri === "prix_desc" ? { prixUSD: "desc" as const } :
    tri === "populaire" ? { vues: "desc" as const } :
    { creeLe: "desc" as const };

  const produits = await prisma.produit.findMany({ where, orderBy });
  return NextResponse.json(produits);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["SUPER_ADMIN", "ADJOINT"].includes(role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { titre, description, prixUSD, etat, categorie, photos, quantite, vedette } = body;

  if (!titre || !description || !prixUSD || !etat || !categorie) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const produit = await prisma.produit.create({
    data: {
      titre, description,
      prixUSD: parseFloat(prixUSD),
      etat, categorie,
      photos: JSON.stringify(photos || []),
      quantite: parseInt(quantite) || 1,
      vedette: vedette || false,
    },
  });

  return NextResponse.json(produit, { status: 201 });
}

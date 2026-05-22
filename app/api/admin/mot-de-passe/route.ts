import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { ancienMotDePasse, nouveauMotDePasse } = await req.json();
  if (!ancienMotDePasse || !nouveauMotDePasse) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }
  if (nouveauMotDePasse.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const valide = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
  if (!valide) return NextResponse.json({ error: "Ancien mot de passe incorrect" }, { status: 400 });

  const hash = await bcrypt.hash(nouveauMotDePasse, 12);
  await prisma.user.update({ where: { id: userId }, data: { motDePasse: hash, motDePasseChange: true } });

  return NextResponse.json({ success: true });
}

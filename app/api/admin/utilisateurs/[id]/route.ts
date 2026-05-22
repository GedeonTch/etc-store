import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.nom) data.nom = body.nom;
    if (body.email) data.email = body.email;
    if (body.role) data.role = body.role;
    if (body.motDePasse) {
      data.motDePasse = await bcrypt.hash(body.motDePasse, 12);
      data.motDePasseChange = true;
    }
    // photo est maintenant une URL (Cloudinary ou data:) — pas de conversion base64 ici
    if (body.photo !== undefined) data.photo = body.photo;

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, nom: true, email: true, role: true, photo: true, motDePasseChange: true },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error("PUT utilisateur:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if ((session.user as { id?: string }).id === params.id) {
    return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

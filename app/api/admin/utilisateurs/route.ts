import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        creeLe: true,
        motDePasseChange: true,
        photo: true,
      },
      orderBy: { creeLe: "desc" },
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error("GET utilisateurs:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nom, email, motDePasse, role: roleValue, photo } = body;

    const role: Role = ["SUPER_ADMIN", "ADJOINT", "MEMBRE"].includes(roleValue)
      ? (roleValue as Role)
      : "MEMBRE";

    if (!nom?.trim()) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "L'email est requis" }, { status: 400 });
    if (!motDePasse || motDePasse.length < 6) {
      return NextResponse.json({ error: "Mot de passe minimum 6 caractères" }, { status: 400 });
    }

    const emailExists = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (emailExists) return NextResponse.json({ error: "Cet email existe déjà" }, { status: 409 });

    const hash = await bcrypt.hash(motDePasse, 12);

    const user = await prisma.user.create({
      data: {
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        motDePasse: hash,
        role,
        photo: photo || null,
        motDePasseChange: true,
      },
      select: { id: true, nom: true, email: true, role: true, creeLe: true, motDePasseChange: true, photo: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error("POST utilisateurs:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la création" }, { status: 500 });
  }
}


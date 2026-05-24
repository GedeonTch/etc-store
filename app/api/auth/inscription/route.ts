import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { validerNom, validerEmail, validerMotDePasse, validerTelephone, validerFichierImage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const nom = formData.get("nom") as string;
    const email = formData.get("email") as string;
    const telephone = formData.get("telephone") as string;
    const motDePasse = formData.get("motDePasse") as string;
    const photoFile = formData.get("photo") as File | null;

    const validateNom = validerNom(nom);
    if (!validateNom.valide) {
      return NextResponse.json({ error: validateNom.erreur }, { status: 400 });
    }

    if (!validerEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const validatePassword = validerMotDePasse(motDePasse);
    if (!validatePassword.valide) {
      return NextResponse.json({ error: validatePassword.erreur }, { status: 400 });
    }

    if (telephone && !validerTelephone(telephone)) {
      return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
    }

    const validatePhoto = validerFichierImage(photoFile);
    if (!validatePhoto.valide) {
      return NextResponse.json({ error: validatePhoto.erreur }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();
    const existant = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existant) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const hash = await bcrypt.hash(motDePasse, 12);

    let photoBase64: string | null = null;
    if (photoFile && photoFile.size > 0) {
      try {
        const buffer = await photoFile.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = photoFile.type || "image/jpeg";
        photoBase64 = `data:${mimeType};base64,${base64}`;
      } catch (err) {
        console.error("Erreur upload photo:", err);
      }
    }

    const client = await prisma.user.create({
      data: {
        nom: nom.trim(),
        email: emailNorm,
        telephone: telephone?.trim() || null,
        motDePasse: hash,
        photo: photoBase64,
        role: Role.CLIENT,
        motDePasseChange: true,
      },
      select: { id: true, nom: true, email: true },
    });

    return NextResponse.json({ success: true, client }, { status: 201 });
  } catch (err: unknown) {
    console.error("Erreur inscription:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Erreur serveur", details: message }, { status: 500 });
  }
}

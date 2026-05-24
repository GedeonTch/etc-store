import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/upload-image";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const nomCategorie = formData.get("nomCategorie") as string;
  const dossier = (formData.get("dossier") as string) || "categories";

  if (!file || !nomCategorie) {
    return NextResponse.json({ error: "Fichier et nom requis" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const { url } = await uploadImage(
      buffer,
      dossier,
      nomCategorie,
      file.name,
      file.type || "image/jpeg"
    );
    return NextResponse.json({ imagePath: url, publicId: null });
  } catch (err) {
    console.error("Upload catégorie:", err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Erreur upload",
    }, { status: 500 });
  }
}

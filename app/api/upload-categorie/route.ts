import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const nomCategorie = formData.get("nomCategorie") as string;

  if (!file || !nomCategorie) {
    return NextResponse.json({ error: "Fichier et nom de catégorie requis" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const isDev = process.env.NODE_ENV === "development";

    // En production sur Vercel: utiliser Vercel Blob
    if (!isDev && token) {
      try {
        const { put } = await import("@vercel/blob");
        
        const timestamp = Date.now();
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `categories/${nomCategorie.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.${ext}`;

        const blob = await put(filename, buffer, {
          access: "public",
          contentType: file.type || "image/jpeg",
          token: token,
        });

        return NextResponse.json({ imagePath: blob.url, publicId: blob.pathname });
      } catch (blobErr) {
        console.error("Vercel Blob error:", blobErr);
        // Fallback sur base64 si Blob échoue
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = file.type || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;
        return NextResponse.json({ imagePath: dataUrl, publicId: null });
      }
    }

    // En développement ou sans token: utiliser base64
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ imagePath: dataUrl, publicId: null });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ 
      error: "Erreur lors du traitement de l'image: " + (err instanceof Error ? err.message : "Erreur inconnue")
    }, { status: 500 });
  }
}

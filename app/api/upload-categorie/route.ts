import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const isProd = process.env.NODE_ENV === "production";

    if (token) {
      try {
        const { put } = await import("@vercel/blob");
        const timestamp = Date.now();
        const ext = file.name.split(".").pop() || "jpg";
        const slug = nomCategorie.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const filename = `${dossier}/${slug}-${timestamp}.${ext}`;

        const blob = await put(filename, buffer, {
          access: "public",
          contentType: file.type || "image/jpeg",
          token,
        });

        return NextResponse.json({ imagePath: blob.url, publicId: blob.pathname });
      } catch (blobErr) {
        console.error("Vercel Blob error:", blobErr);
        if (isProd) {
          return NextResponse.json({
            error: "Échec upload Vercel Blob. Vérifiez BLOB_READ_WRITE_TOKEN.",
          }, { status: 500 });
        }
      }
    }

    if (isProd) {
      return NextResponse.json({
        error: "BLOB_READ_WRITE_TOKEN requis en production pour stocker les images.",
      }, { status: 503 });
    }

    // Dev uniquement : base64 (léger après compression client)
    if (buffer.byteLength > 200 * 1024) {
      return NextResponse.json({ error: "Image trop grande (max 200KB en dev)" }, { status: 400 });
    }

    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    return NextResponse.json({ imagePath: `data:${mimeType};base64,${base64}`, publicId: null });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({
      error: "Erreur lors du traitement de l'image: " + (err instanceof Error ? err.message : "Erreur inconnue"),
    }, { status: 500 });
  }
}

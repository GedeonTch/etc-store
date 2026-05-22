import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Limite de body pour l'App Router Next.js 14
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["SUPER_ADMIN", "ADJOINT"].includes(role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  // ── Mode Cloudinary (si configuré) ───────────────────────
  if (cloudName && cloudName !== "votre_cloud_name" && cloudName.trim() !== "") {
    const cloudFormData = new FormData();
    cloudFormData.append("file", file);
    cloudFormData.append("upload_preset", "etch_products");
    cloudFormData.append("folder", "etch-store/produits");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: cloudFormData }
      );
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
      }
      const errData = await res.json().catch(() => ({}));
      console.error("Cloudinary error:", errData);
    } catch (e) {
      console.error("Cloudinary fetch error:", e);
    }
  }

  // ── Fallback : base64 compressé ───────────────────────────
  // La compression est faite côté client, on reçoit déjà un fichier léger
  // On vérifie quand même la taille (max 500KB après compression)
  if (file.size > 500 * 1024) {
    return NextResponse.json({
      error: `Image trop grande (${Math.round(file.size / 1024)}KB). Max 500KB. Configurez Cloudinary pour des images plus grandes.`
    }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = file.type || "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return NextResponse.json({ url: dataUrl, publicId: null });
}

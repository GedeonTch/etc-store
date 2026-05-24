// Upload images vers Vercel Blob (production) ou base64 léger (dev)

export type UploadResult = { url: string; publicId: string | null };

export function blobTokenConfigure(): boolean {
  const t = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return Boolean(t && t.length > 10);
}

export function blobConfigError(): string | null {
  const t = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!t) {
    return "BLOB_READ_WRITE_TOKEN manquant. Vercel → Storage → Blob → Connect to Project, puis redéployez.";
  }
  return null;
}

export async function uploadToBlob(
  data: ArrayBuffer | Buffer,
  pathname: string,
  contentType: string
): Promise<UploadResult> {
  const configErr = blobConfigError();
  if (configErr) throw new Error(configErr);

  const { put } = await import("@vercel/blob");
  const body =
    data instanceof Buffer
      ? data
      : Buffer.from(data instanceof ArrayBuffer ? new Uint8Array(data) : data);

  try {
    const blob = await put(pathname, body, {
      access: "public",
      addRandomSuffix: true,
      contentType: contentType || "image/jpeg",
    });
    return { url: blob.url, publicId: blob.pathname };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Vercel Blob put error:", msg);
    throw new Error(
      `Échec upload Vercel Blob: ${msg}. Vérifiez Storage → Blob lié au projet et redéployez après avoir ajouté BLOB_READ_WRITE_TOKEN.`
    );
  }
}

export async function uploadImage(
  buffer: ArrayBuffer,
  folder: string,
  slug: string,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  const ext = fileName.split(".").pop() || "jpg";
  const safeSlug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "image";
  const pathname = `${folder}/${safeSlug}.${ext}`;

  const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  if (isProd || blobTokenConfigure()) {
    return uploadToBlob(buffer, pathname, contentType);
  }

  if (buffer.byteLength > 200 * 1024) {
    throw new Error("Image trop grande (max 200KB en dev sans Blob).");
  }

  const base64 = Buffer.from(buffer).toString("base64");
  const mime = contentType || "image/jpeg";
  return { url: `data:${mime};base64,${base64}`, publicId: null };
}

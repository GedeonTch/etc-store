import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

let resend: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.lu !== undefined) data.lu = body.lu;
  if (body.reponse !== undefined) {
    data.reponse = body.reponse;
    data.lu = true;

    const msg = await prisma.message.findUnique({ where: { id: params.id } });
    if (msg) {
      const client = getResend();
      if (client) {
        await client.emails.send({
          from: process.env.FROM_EMAIL || "noreply@etch-store.com",
          to: msg.emailClient,
          subject: `Réponse à votre message — ETCH`,
          html: `<div style="font-family:Inter,Arial,sans-serif;background:#0A0A0A;color:#F5F0E8;padding:40px;max-width:600px;margin:0 auto">
          <div style="text-align:center;margin-bottom:30px"><span style="font-size:28px;font-weight:bold;color:#C9A84C;letter-spacing:4px">ETCH</span></div>
          <p>Bonjour <strong>${msg.nomClient}</strong>,</p>
          <p>Merci pour votre message. Voici notre réponse :</p>
          <div style="background:#111;border:1px solid #1E1E1E;border-radius:8px;padding:20px;margin:20px 0">
            ${body.reponse.replace(/\n/g, "<br>")}
          </div>
          <p style="color:#888;font-size:12px">ÉTABLISSEMENT TCHIBANVUNYA — Bukavu, Sud-Kivu</p>
        </div>`,
        }).catch(console.error);
      }
    }
  }

  const message = await prisma.message.update({ where: { id: params.id }, data });
  return NextResponse.json(message);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  await prisma.message.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

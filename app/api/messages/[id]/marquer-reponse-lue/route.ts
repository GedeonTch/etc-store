import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const message = await prisma.message.update({
      where: { id: params.id },
      data: { reponseLue: true },
    });
    return NextResponse.json(message);
  } catch (err) {
    console.error("Error marking reply as read:", err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

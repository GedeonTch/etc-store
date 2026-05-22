// Route de debug — vérifier l'état des comptes admin
// UNIQUEMENT disponible en développement
// GET /api/debug/admin-check

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Non disponible en production" }, { status: 403 });
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADJOINT", "MEMBRE"] } },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        motDePasseChange: true,
        creeLe: true,
        motDePasse: true,
      },
      orderBy: { creeLe: "asc" },
    });

    // Tester si ADMIN123 correspond au hash stocké
    const resultats = await Promise.all(
      admins.map(async (a) => {
        const admin123Ok = await bcrypt.compare("ADMIN123", a.motDePasse);
        return {
          id: a.id,
          nom: a.nom,
          email: a.email,
          role: a.role,
          motDePasseChange: a.motDePasseChange,
          creeLe: a.creeLe,
          hashPresent: a.motDePasse.length > 0,
          admin123Valide: admin123Ok,
        };
      })
    );

    // Vérifier les IPs bloquées
    const ipsBloquees = await prisma.tentativeConnexion.findMany({
      where: { bloqueJusqu: { gt: new Date() } },
      select: { ip: true, tentatives: true, bloqueJusqu: true },
    });

    // Derniers logs de connexion admin
    const dernierLogs = await prisma.logConnexion.findMany({
      orderBy: { creeLe: "desc" },
      take: 10,
      select: { type: true, ip: true, emailTente: true, creeLe: true },
    });

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      comptes_admin: resultats,
      ips_bloquees: ipsBloquees,
      derniers_logs: dernierLogs,
      conseil: resultats.length === 0
        ? "Aucun compte admin trouvé — lancez : npm run create-super-admin"
        : resultats.some((r) => !r.admin123Valide && !r.motDePasseChange)
        ? "Hash invalide détecté — relancez : npm run db:seed ou npm run create-super-admin"
        : "Comptes admin OK",
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: "Erreur base de données",
      detail: String(e),
      conseil: "Vérifiez DATABASE_URL dans .env.local et que prisma db push a été lancé",
    }, { status: 500 });
  }
}

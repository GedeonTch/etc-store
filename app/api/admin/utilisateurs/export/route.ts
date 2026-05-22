import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Exporte les données utilisateurs en CSV ou JSON
 * Usage: GET /api/admin/utilisateurs/export?format=csv
 */
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const format = new URL(req.url).searchParams.get("format") || "json";

    const users = await prisma.user.findMany({
        select: {
            id: true,
            nom: true,
            email: true,
            telephone: true,
            role: true,
            creeLe: true,
            motDePasseChange: true
        },
        orderBy: { creeLe: "desc" },
    });

    if (format === "csv") {
        // Créer CSV
        const headers = ["ID", "Nom", "Email", "Téléphone", "Rôle", "Créé le", "MDP Changé"];
        const rows = users.map((u) => [
            u.id,
            u.nom,
            u.email,
            u.telephone || "",
            u.role,
            new Date(u.creeLe).toLocaleString("fr-FR"),
            u.motDePasseChange ? "Oui" : "Non",
        ]);

        const csv = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="utilisateurs.csv"',
            },
        });
    }

    // JSON par défaut
    return NextResponse.json(users);
}

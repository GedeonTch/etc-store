import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Route de DÉBOGAGE UNIQUEMENT - À supprimer en production!
 * Teste si les mots de passe sont correctement hashés et comparés
 * 
 * Usage (POST): /api/debug/test-password
 * Body: { email: "admin@etch.com", password: "ADMIN123" }
 */
export async function POST(req: NextRequest) {
    // Sécurité: Ne fonctionner qu'en développement
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Non disponible en production" }, { status: 403 });
    }

    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email et password requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: { id: true, nom: true, email: true, role: true, motDePasse: true },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Utilisateur non trouvé",
                    email: email.trim().toLowerCase(),
                },
                { status: 404 }
            );
        }

        // Tester la comparaison
        const isValid = await bcrypt.compare(password, user.motDePasse);

        return NextResponse.json({
            success: isValid,
            user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
            debug: {
                passwordProvided: password,
                storedHashStart: user.motDePasse.substring(0, 20) + "...",
                isValidMatch: isValid,
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erreur serveur", details: err.message },
            { status: 500 }
        );
    }
}

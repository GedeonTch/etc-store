import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

/**
 * Route de DÉBOGAGE/INITIALISATION - À supprimer en production!
 * Réinitialise les mots de passe des utilisateurs de test
 * 
 * Usage (POST): /api/debug/reset-test-users
 */
export async function POST(req: NextRequest) {
    // Sécurité: Vérifier un token spécial ou limiter à localhost
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.DEBUG_TOKEN || "debug-secret-123";

    if (authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const testUsers = [
            { email: "admin@etch.com", password: "ADMIN123", role: Role.SUPER_ADMIN, nom: "Admin ETCH" },
            { email: "adjoint@etch.com", password: "ADJOINT123", role: Role.ADJOINT, nom: "Adjoint ETCH" },
            { email: "client@etch.com", password: "CLIENT123", role: Role.CLIENT, nom: "Client Test" },
        ];

        const results = [];

        for (const testUser of testUsers) {
            const hash = await bcrypt.hash(testUser.password, 12);

            try {
                let user = await prisma.user.findUnique({
                    where: { email: testUser.email },
                    select: { id: true, nom: true, email: true, role: true },
                });

                if (user) {
                    // Mettre à jour
                    user = await prisma.user.update({
                        where: { email: testUser.email },
                        data: { motDePasse: hash, motDePasseChange: false },
                        select: { id: true, nom: true, email: true, role: true },
                    });
                    results.push({
                        action: "updated",
                        email: testUser.email,
                        password: testUser.password,
                        user,
                    });
                } else {
                    // Créer
                    user = await prisma.user.create({
                        data: {
                            nom: testUser.nom,
                            email: testUser.email,
                            motDePasse: hash,
                            role: testUser.role,
                            motDePasseChange: false,
                        },
                        select: { id: true, nom: true, email: true, role: true },
                    });
                    results.push({
                        action: "created",
                        email: testUser.email,
                        password: testUser.password,
                        user,
                    });
                }
            } catch (err: any) {
                results.push({
                    action: "error",
                    email: testUser.email,
                    error: err.message,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Utilisateurs de test réinitialisés",
            results,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erreur serveur", details: err.message },
            { status: 500 }
        );
    }
}

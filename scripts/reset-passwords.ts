#!/usr/bin/env ts-node
// Script pour réinitialiser les mots de passe des utilisateurs de test
// Usage: npx ts-node scripts/reset-passwords.ts

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function resetPasswords() {
    console.log("🔄 Réinitialisation des mots de passe de test...\n");

    // Données de test
    const testUsers = [
        { email: "admin@etch.com", password: "ADMIN123", role: "SUPER_ADMIN", nom: "Admin ETCH" },
        { email: "adjoint@etch.com", password: "ADJOINT123", role: "ADJOINT", nom: "Adjoint ETCH" },
        { email: "client@etch.com", password: "CLIENT123", role: "CLIENT", nom: "Client Test" },
    ];

    for (const testUser of testUsers) {
        const hash = await bcrypt.hash(testUser.password, 12);

        try {
            // Chercher l'utilisateur existant
            let user = await prisma.user.findUnique({ where: { email: testUser.email } });

            if (user) {
                // Mettre à jour le mot de passe
                user = await prisma.user.update({
                    where: { email: testUser.email },
                    data: { motDePasse: hash, motDePasseChange: false },
                });
                console.log(`✅ Mot de passe réinitialisé pour: ${testUser.email} (Mot de passe: ${testUser.password})`);
            } else {
                // Créer l'utilisateur
                user = await prisma.user.create({
                    data: {
                        nom: testUser.nom,
                        email: testUser.email,
                        motDePasse: hash,
                        role: testUser.role as any,
                        motDePasseChange: false,
                    },
                });
                console.log(`✨ Utilisateur créé: ${testUser.email} (Mot de passe: ${testUser.password})`);
            }
        } catch (err: any) {
            console.error(`❌ Erreur pour ${testUser.email}:`, err.message);
        }
    }

    console.log("\n✅ Script complété!");
    await prisma.$disconnect();
}

resetPasswords().catch((err) => {
    console.error("❌ Erreur:", err);
    process.exit(1);
});

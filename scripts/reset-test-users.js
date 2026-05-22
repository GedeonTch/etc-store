const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const testUsers = [
        { email: 'admin@etch.com', password: 'ADMIN123', role: 'SUPER_ADMIN', nom: 'Admin ETCH' },
        { email: 'adjoint@etch.com', password: 'ADJOINT123', role: 'ADJOINT', nom: 'Adjoint ETCH' },
        { email: 'client@etch.com', password: 'CLIENT123', role: 'CLIENT', nom: 'Client Test' },
    ];

    for (const u of testUsers) {
        const hash = await bcrypt.hash(u.password, 12);
        try {
            const existing = await prisma.user.findUnique({ where: { email: u.email } });
            if (existing) {
                await prisma.user.update({ where: { email: u.email }, data: { motDePasse: hash, motDePasseChange: false, nom: u.nom, role: u.role } });
                console.log('Updated', u.email);
            } else {
                await prisma.user.create({ data: { email: u.email, nom: u.nom, motDePasse: hash, role: u.role } });
                console.log('Created', u.email);
            }
        } catch (err) {
            console.error('Error for', u.email, err && err.message ? err.message : err);
        }
    }
    await prisma.$disconnect();
}

main();

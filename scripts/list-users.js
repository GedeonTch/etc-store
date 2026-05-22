const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({ select: { id: true, email: true, nom: true, role: true, motDePasse: true, photo: true, creeLe: true } });
        console.log(JSON.stringify({ count: users.length, users }, null, 2));
    } catch (err) {
        console.error('ERROR', err && err.message ? err.message : err);
    } finally {
        await prisma.$disconnect();
    }
}

main();

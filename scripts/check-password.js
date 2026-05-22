const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];
    if (!email || !password) {
        console.error('Usage: node check-password.js email password');
        process.exit(1);
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User not found');
        await prisma.$disconnect();
        process.exit(0);
    }
    const ok = await bcrypt.compare(password, user.motDePasse);
    console.log({ email: user.email, matched: ok });
    await prisma.$disconnect();
}

main();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifierBruteforce(ip) {
    const tentative = await prisma.tentativeConnexion.findUnique({ where: { ip } });
    if (!tentative) return { bloque: false };
    if (tentative.bloqueJusqu && tentative.bloqueJusqu > new Date()) {
        const diff = Math.ceil((tentative.bloqueJusqu.getTime() - Date.now()) / 60000);
        return { bloque: true, minutesRestantes: diff };
    }
    if (tentative.bloqueJusqu && tentative.bloqueJusqu <= new Date()) {
        await prisma.tentativeConnexion.update({ where: { ip }, data: { tentatives: 0, bloqueJusqu: null } });
    }
    return { bloque: false };
}

async function simulate(email, password, loginType, ip) {
    const { bloque, minutesRestantes } = await verifierBruteforce(ip);
    if (bloque) return { error: `BLOQUE:${minutesRestantes}` };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: 'NO_USER' };
    const valide = await bcrypt.compare(password, user.motDePasse);
    if (!valide) return { error: 'BAD_PASS' };
    if (loginType === 'admin' && user.role === 'CLIENT') return { error: 'WRONG_ROLE' };
    if (loginType === 'client' && user.role !== 'CLIENT') return { error: 'WRONG_ROLE' };
    return { ok: true, user: { id: user.id, email: user.email, role: user.role } };
}

const email = process.argv[2];
const password = process.argv[3];
const loginType = process.argv[4] || 'admin';
const ip = process.argv[5] || '127.0.0.1';

if (!email || !password) {
    console.log('Usage: node simulate-authorize.js email password [loginType] [ip]');
    process.exit(1);
}

simulate(email.trim().toLowerCase(), password, loginType, ip).then(r => {
    console.log(r);
    prisma.$disconnect();
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const count = await prisma.user.count();
    console.log('count', count);
    const users = await prisma.user.findMany({ select: { email: true, role: true, motDePasse: true } });
    users.forEach((u) => console.log(u.email, u.role, u.motDePasse ? u.motDePasse.slice(0, 30) : '(no pass)'));
  } catch (e) {
    console.error('ERR', e);
  } finally {
    await prisma.$disconnect();
  }
})();

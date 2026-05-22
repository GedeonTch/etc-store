// Configuration NextAuth + protection bruteforce — ETCH Store

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  envoyerEmailConnexionReussie,
  envoyerEmailTentativeEchouee,
  envoyerEmailIPBloquee,
} from "@/lib/emails";

const DUREE_BLOCAGE_MIN = 30;
const MAX_TENTATIVES = 5;

async function verifierBruteforce(
  ip: string
): Promise<{ bloque: boolean; minutesRestantes?: number }> {
  const tentative = await prisma.tentativeConnexion.findUnique({ where: { ip } });
  if (!tentative) return { bloque: false };

  if (tentative.bloqueJusqu && tentative.bloqueJusqu > new Date()) {
    const diff = Math.ceil((tentative.bloqueJusqu.getTime() - Date.now()) / 60000);
    return { bloque: true, minutesRestantes: diff };
  }

  // Réinitialiser si le délai est passé
  if (tentative.bloqueJusqu && tentative.bloqueJusqu <= new Date()) {
    await prisma.tentativeConnexion.update({
      where: { ip },
      data: { tentatives: 0, bloqueJusqu: null },
    });
  }

  return { bloque: false };
}

async function enregistrerEchec(ip: string, email: string, userAgent: string) {
  const tentative = await prisma.tentativeConnexion.upsert({
    where: { ip },
    update: { tentatives: { increment: 1 }, misAJour: new Date() },
    create: { ip, tentatives: 1 },
  });

  const nb = tentative.tentatives + 1;

  await prisma.logConnexion.create({
    data: { type: "ECHEC", ip, userAgent, emailTente: email },
  });

  await envoyerEmailTentativeEchouee(email, ip, nb).catch(console.error);

  if (nb >= MAX_TENTATIVES) {
    const bloqueJusqu = new Date(Date.now() + DUREE_BLOCAGE_MIN * 60 * 1000);
    await prisma.tentativeConnexion.update({
      where: { ip },
      data: { bloqueJusqu, tentatives: nb },
    });
    await prisma.logConnexion.create({
      data: { type: "BLOQUE", ip, userAgent, emailTente: email },
    });
    await envoyerEmailIPBloquee(ip, email, nb).catch(console.error);
  }
}

async function reinitialiserTentatives(ip: string) {
  await prisma.tentativeConnexion.deleteMany({ where: { ip } });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        loginType: { label: "Type", type: "text" },
        ip: { label: "IP", type: "text" },
        userAgent: { label: "User Agent", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const creds = credentials as Record<string, string>;
        const ip = creds.ip || "unknown";
        const userAgent = creds.userAgent || "unknown";
        const loginType = creds.loginType === "client" ? "client" : "admin";

        // Vérification bruteforce
        const { bloque, minutesRestantes } = await verifierBruteforce(ip);
        if (bloque) throw new Error(`BLOQUE:${minutesRestantes}`);

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          await enregistrerEchec(ip, email, userAgent);
          throw new Error("INVALID_CREDENTIALS");
        }

        const valide = await bcrypt.compare(credentials.password, user.motDePasse);
        if (!valide) {
          await enregistrerEchec(ip, email, userAgent);
          throw new Error("INVALID_CREDENTIALS");
        }

        if (loginType === "admin" && user.role === "CLIENT") {
          await enregistrerEchec(ip, email, userAgent);
          throw new Error("ADMIN_ONLY");
        }
        if (loginType === "client" && user.role !== "CLIENT") {
          await enregistrerEchec(ip, email, userAgent);
          throw new Error("CLIENT_ONLY");
        }

        await reinitialiserTentatives(ip);
        await prisma.logConnexion.create({
          data: { type: "SUCCES", ip, userAgent, userId: user.id, emailTente: user.email },
        });
        if (user.role !== "CLIENT") {
          await envoyerEmailConnexionReussie(user.nom, user.role, ip, userAgent).catch(console.error);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nom,
          role: user.role,
          motDePasseChange: user.motDePasseChange,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.motDePasseChange = user.motDePasseChange;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.motDePasseChange = token.motDePasseChange;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

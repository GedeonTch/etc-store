"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  session: any;
  stats: { nbProduits: number; nbMessages: number; nbMessagesNonLus: number; nbAttentes: number; produitsEpuises: number };
}

export default function DashboardClient({ session, stats }: Props) {
  const role = session?.user?.role;
  const motDePasseChange = session?.user?.motDePasseChange;
  const [alerteFermee, setAlerteFermee] = useState(false);

  const cartes = [
    { label: "Produits actifs", valeur: stats.nbProduits, icon: "📦", href: "/admin/produits", couleur: "text-blue-400" },
    { label: "Produits épuisés", valeur: stats.produitsEpuises, icon: "⚠️", href: "/admin/produits", couleur: "text-orange-400" },
    { label: "Messages reçus", valeur: stats.nbMessages, icon: "💬", href: "/admin/messages", couleur: "text-purple-400" },
    { label: "Non lus", valeur: stats.nbMessagesNonLus, icon: "🔔", href: "/admin/messages", couleur: "text-red-400" },
    { label: "Listes d'attente", valeur: stats.nbAttentes, icon: "⏳", href: "/admin/produits", couleur: "text-yellow-400" },
  ];

  return (
    <div className="p-6 sm:p-8">
      {/* Alerte mot de passe par défaut */}
      {role === "SUPER_ADMIN" && !motDePasseChange && !alerteFermee && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-amber-950/40 border border-amber-600/50 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Sécurité — Action requise</p>
              <p className="text-amber-300/70 text-sm mt-0.5">Vous utilisez le mot de passe par défaut. Changez-le immédiatement.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/admin/parametres" className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg transition-colors">
              Changer
            </Link>
            <button onClick={() => setAlerteFermee(true)} className="text-amber-400/50 hover:text-amber-400 transition-colors">✕</button>
          </div>
        </motion.div>
      )}

      <div className="mb-8">
        <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-1">— Bienvenue</p>
        <h1 className="font-playfair text-3xl font-bold text-[var(--text)]">{session?.user?.name}</h1>
        <p className="text-[var(--text)]/40 text-sm mt-1">{role}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {cartes.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={c.href} className="block bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--gold)]/40 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--gold)]/5">
              <span className="text-2xl block mb-3">{c.icon}</span>
              <p className={`text-3xl font-bold ${c.couleur} mb-1`}>{c.valeur}</p>
              <p className="text-xs text-[var(--text)]/40">{c.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="font-playfair text-xl font-bold text-[var(--text)] mb-4">Accès rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/admin/produits", label: "Gérer les produits", desc: "Ajouter, modifier, ajuster le stock", icon: "📦" },
            { href: "/admin/messages", label: "Voir les messages", desc: `${stats.nbMessagesNonLus} message(s) non lu(s)`, icon: "💬" },
            ...(role === "SUPER_ADMIN" ? [
              { href: "/admin/utilisateurs", label: "Utilisateurs", desc: "Gérer les comptes admin", icon: "👥" },
              { href: "/admin/logs", label: "Logs de sécurité", desc: "Connexions et IPs bloquées", icon: "🔒" },
              { href: "/admin/parametres", label: "Paramètres", desc: "Taux de change, infos site", icon: "⚙️" },
            ] : []),
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-start gap-4 p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--gold)]/40 transition-all duration-200">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium text-[var(--text)] text-sm">{item.label}</p>
                <p className="text-xs text-[var(--text)]/40 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

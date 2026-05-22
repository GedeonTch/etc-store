"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CreditsClient() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        <div className="w-20 h-px bg-[var(--gold)] mx-auto mb-8" />
        <p className="text-[var(--gold)] text-xs font-medium uppercase tracking-widest mb-4">— Conception & Développement</p>
        <h1 className="font-playfair text-4xl font-bold text-[var(--text)] mb-2">Tchibanvunya Gedeon</h1>
        <p className="text-[var(--text)]/50 text-sm mb-8">IT — Développement & Cybersécurité</p>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-4 text-left mb-8">
          {[
            { icon: "📧", label: "Email", value: "tchibanvunyagedeon@gmail.com", href: "mailto:tchibanvunyagedeon@gmail.com" },
            { icon: "💬", label: "WhatsApp", value: "+257 79 640 420", href: "https://wa.me/25779640420" },
            { icon: "🛡️", label: "Domaine", value: "IT — Développement & Cybersécurité", href: null },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-xs text-[var(--text)]/40 uppercase tracking-wide">{item.label}</p>
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className="text-[var(--text)] hover:text-[var(--gold)] transition-colors text-sm">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-[var(--text)] text-sm">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="w-20 h-px bg-[var(--gold)] mx-auto mb-8" />
        <p className="text-[var(--text)]/30 text-xs mb-6">
          Site développé pour ÉTABLISSEMENT TCHIBANVUNYA (ETCH)<br />
          Bukavu, Sud-Kivu — République Démocratique du Congo
        </p>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--gold)] hover:opacity-70 transition-opacity">
          ← Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}

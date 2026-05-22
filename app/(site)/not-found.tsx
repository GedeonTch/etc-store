"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <div className="font-playfair text-[120px] sm:text-[160px] font-bold leading-none gold-gradient mb-4 select-none">
          404
        </div>
        <div className="w-16 h-px bg-[var(--gold)] mx-auto mb-6" />
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4">
          Page introuvable
        </h1>
        <p className="text-[var(--text)]/60 text-lg mb-10 italic font-playfair">
          "Cette page n'existe pas, mais nos produits, oui."
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/catalogue"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all duration-200"
          >
            Voir le catalogue
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-[var(--border)] text-[var(--text)] text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-200"
          >
            ← Accueil
          </Link>
        </div>
        <p className="mt-12 text-xs text-[var(--text)]/20 font-playfair italic">
          ETCH — L'Europe à votre portée
        </p>
      </motion.div>
    </div>
  );
}

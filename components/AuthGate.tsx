"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useLangue } from "@/contexts/LangueContext";
import { isClient } from "@/lib/session";

interface Props {
  children: React.ReactNode;
  titre?: string;
}

export default function AuthGate({ children, titre }: Props) {
  const { data: session, status } = useSession();
  const { t } = useLangue();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">{t("chargement")}</p>
      </div>
    );
  }

  if (!isClient(session)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center py-12 px-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] card-elevated"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--gold)]/10 flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </motion.div>
        <h3 className="font-playfair text-xl font-bold text-[var(--text)] mb-2">
          {titre || t("connexion_requise")}
        </h3>
        <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto mb-8 leading-relaxed">
          {t("connexion_requise_desc")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/connexion" className="px-6 py-3 rounded-full btn-gold font-semibold text-sm min-w-[160px]">
            {t("se_connecter")}
          </Link>
          <Link
            href="/inscription"
            className="px-6 py-3 rounded-full border border-[var(--gold)] text-[var(--gold)] font-semibold text-sm hover:bg-[var(--gold)]/10 min-w-[160px] transition-colors"
          >
            {t("creer_compte")}
          </Link>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}

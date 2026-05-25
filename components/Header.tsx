"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useLangue } from "@/contexts/LangueContext";
import { isClient } from "@/lib/session";
import type { Langue } from "@/lib/i18n";
import type { ParametresSite } from "@/lib/parametres-public";
import MessageNotificationBadge from "./MessageNotificationBadge";

const LANGUES: { code: Langue; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", flag: "🇨🇩" },
];

export default function Header({ siteParams = {} }: { siteParams?: ParametresSite }) {
  const { t, langue, setLangue } = useLangue();
  const marque = siteParams.marque || "ETCH";
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [langueOuverte, setLangueOuverte] = useState(false);
  const clientConnecte = isClient(session);

  const isActive = (href: string) =>
    pathname === href ? "text-[var(--gold)]" : "text-[var(--text)] hover:text-[var(--gold)]";

  const langueActuelle = LANGUES.find((l) => l.code === langue);
  const redirect = encodeURIComponent(pathname || "/");

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => {
    if (clientConnecte) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={mobile ? "mx-4 mt-3 space-y-2" : "hidden sm:flex items-center gap-2"}
        >
          <span className={`text-sm text-[var(--text-muted)] truncate max-w-[120px] ${mobile ? "block text-center" : ""}`}>
            {session?.user?.name?.split(" ")[0]}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`text-sm font-medium text-[var(--gold)] hover:opacity-80 ${mobile ? "w-full py-2.5 rounded-full border border-[var(--gold)]/40" : "px-3 py-1.5 rounded-full border border-[var(--border)]"}`}
          >
            {t("deconnexion")}
          </button>
        </motion.div>
      );
    }

    return (
      <div className={mobile ? "mx-4 mt-3 flex flex-col gap-2" : "hidden sm:flex items-center gap-2"}>
        <Link
          href={`/connexion?redirect=${redirect}`}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-[var(--gold)]/60 text-[var(--gold)] text-sm font-medium hover:bg-[var(--gold)]/10 transition-all ${mobile ? "w-full" : ""}`}
        >
          {t("se_connecter")}
        </Link>
        <Link
          href={`/inscription?redirect=${redirect}`}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-full btn-gold text-sm font-semibold ${mobile ? "w-full" : ""}`}
        >
          {t("creer_compte")}
        </Link>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-elevated)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ scale: 1.05 }} className="relative w-9 h-9">
              <Image src="/logo-etch.png" alt={marque} fill className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </motion.div>
            <span className="font-playfair text-2xl font-bold tracking-widest text-[var(--gold)] group-hover:opacity-80 transition-opacity">
              {marque}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/", label: t("accueil") },
              { href: "/catalogue", label: t("catalogue") },
              { href: "/a-propos", label: "À propos" },
              { href: "/contact", label: t("contact_negociations"), badge: true },
            ].map((item) => (
              <Link key={item.href} href={item.href} className={`text-sm font-medium transition-colors duration-200 relative ${isActive(item.href)}`}>
                {item.label}
                {item.badge && <MessageNotificationBadge />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setLangueOuverte(!langueOuverte)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm hover:border-[var(--gold)] transition-all"
              >
                <span>{langueActuelle?.flag}</span>
                <span className="hidden sm:inline text-xs font-medium">{langueActuelle?.code.toUpperCase()}</span>
              </button>
              <AnimatePresence>
                {langueOuverte && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangueOuverte(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      {LANGUES.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLangue(l.code); setLangueOuverte(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--gold)]/10 ${langue === l.code ? "text-[var(--gold)] font-medium" : ""}`}
                        >
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <AuthButtons />
            <ThemeToggle />

            <button className="md:hidden w-9 h-9 flex items-center justify-center" onClick={() => setMenuOuvert(!menuOuvert)} aria-label="Menu">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOuvert
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOuvert && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--border)] py-3 overflow-hidden"
            >
              {[
                { href: "/", label: t("accueil") },
                { href: "/catalogue", label: t("catalogue") },
                { href: "/a-propos", label: "À propos" },
                { href: "/contact", label: t("contact_negociations"), badge: true },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOuvert(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium relative ${pathname === item.href ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "hover:bg-[var(--card)]"}`}>
                  {item.label}
                  {item.badge && <MessageNotificationBadge />}
                </Link>
              ))}
              <AuthButtons mobile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useLangue } from "@/contexts/LangueContext";
import AuthGate from "@/components/AuthGate";
import ProductCard from "@/components/ProductCard";
import { parserPhotos, formatUSD, formatCDF } from "@/lib/utils";
import { isClient } from "@/lib/session";

interface Props { produit: any; tauxCDF: number; similaires: any[] }

export default function ProduitClient({ produit, tauxCDF, similaires }: Props) {
  const { t } = useLangue();
  const { data: session } = useSession();
  const photos = parserPhotos(produit.photos);
  const [photoActive, setPhotoActive] = useState(0);
  const epuise = produit.quantite === 0;

  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState(`Bonjour, je suis intéressé(e) par : ${produit.titre}`);
  const [envoi, setEnvoi] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [attenteEnvoi, setAttenteEnvoi] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const envoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi("loading");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone, produitId: produit.id, contenu: message }),
      });
      setEnvoi(res.ok ? "ok" : "error");
    } catch {
      setEnvoi("error");
    }
  };

  const sInscrire = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttenteEnvoi("loading");
    try {
      const res = await fetch("/api/attente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produitId: produit.id }),
      });
      setAttenteEnvoi(res.ok ? "ok" : "error");
    } catch {
      setAttenteEnvoi("error");
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)] transition-colors";

  return (
    <div className="min-h-screen bg-[var(--bg)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-2 text-sm text-[var(--text)]/50 mb-8">
          <Link href="/" className="hover:text-[var(--gold)] transition-colors">{t("accueil")}</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-[var(--gold)] transition-colors">{t("catalogue")}</Link>
          <span>/</span>
          <span className="text-[var(--text)] truncate max-w-[200px]">{produit.titre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Galerie */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] mb-4">
              {photos.length > 0 ? (
                <Image src={photos[photoActive]} alt={produit.titre} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              ) : (
                <div className="flex items-center justify-center h-full text-6xl opacity-20">📷</div>
              )}
              {epuise && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-600 text-white text-lg font-bold px-6 py-2 rounded-full">{t("epuise")}</span>
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {photos.map((url, i) => (
                  <button key={i} onClick={() => setPhotoActive(i)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === photoActive ? "border-[var(--gold)]" : "border-[var(--border)] hover:border-[var(--gold)]/50"}`}>
                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Infos */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex flex-col gap-6">
            <div>
              <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-2">{produit.categorie}</p>
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight">{produit.titre}</h1>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-3xl font-bold text-[var(--gold)] mb-1">{formatUSD(produit.prixUSD)}</p>
              <p className="text-[var(--text)]/50 text-sm">≈ {formatCDF(produit.prixUSD, tauxCDF)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-xs text-[var(--text)]/40 uppercase tracking-wide mb-1">{t("etat")}</p>
                <p className="font-medium text-[var(--text)]">{produit.etat}</p>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-xs text-[var(--text)]/40 uppercase tracking-wide mb-1">{t("quantite_restante")}</p>
                <p className={`font-medium ${epuise ? "text-red-400" : produit.quantite <= 3 ? "text-orange-400" : "text-green-400"}`}>
                  {epuise ? t("epuise") : `${produit.quantite} disponible${produit.quantite > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text)]/40 uppercase tracking-wide mb-3">Description</p>
              <p className="text-[var(--text)]/80 leading-relaxed whitespace-pre-line">{produit.description}</p>
            </div>

            <a
              href={`https://wa.me/25766504165?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par : ${produit.titre} (${formatUSD(produit.prixUSD)})`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-all duration-200 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("contacter_whatsapp")}
            </a>

            {epuise && (
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-5">
                <p className="text-red-400 font-medium mb-3">{t("m_avertir")}</p>
                {attenteEnvoi === "ok" ? (
                  <p className="text-green-400 text-sm">{t("inscription_attente_ok")}</p>
                ) : (
                  <AuthGate titre={t("m_avertir")}>
                    <form onSubmit={sInscrire}>
                      <button type="submit" disabled={attenteEnvoi === "loading"}
                        className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50">
                        {attenteEnvoi === "loading" ? t("chargement") : t("s_inscrire_attente")}
                      </button>
                    </form>
                  </AuthGate>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Formulaire contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8"
        >
                    <h2 className="font-playfair text-2xl font-bold text-[var(--text)] mb-6">{t("commander_produit")}</h2>
          <AuthGate titre={t("commander_produit")}>
            {isClient(session) && (
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {t("connecte_en_tant_que")} <strong className="text-[var(--gold)]">{session?.user?.name}</strong>
              </p>
            )}
            {envoi === "ok" ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-green-600 dark:text-green-400 font-medium">{t("message_envoye")}</p>
              </div>
            ) : (
              <form onSubmit={envoyerMessage} className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">{t("votre_telephone")}</label>
                  <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">{t("votre_message")} *</label>
                  <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} resize-none`} />
                </div>
                <motion.button type="submit" disabled={envoi === "loading"} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-xl btn-gold font-semibold text-sm disabled:opacity-50">
                  {envoi === "loading" ? t("chargement") : t("envoyer")}
                </motion.button>
                {envoi === "error" && <p className="text-red-600 dark:text-red-400 text-sm">{t("erreur_connexion")}</p>}
              </form>
            )}
          </AuthGate>
        </motion.div>

        {/* Similaires */}
        {similaires.length > 0 && (
          <div className="mt-16">
            <h2 className="font-playfair text-2xl font-bold text-[var(--text)] mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similaires.map((p, i) => <ProductCard key={p.id} {...p} tauxCDF={tauxCDF} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

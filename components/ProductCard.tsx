"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLangue } from "@/contexts/LangueContext";
import { parserPhotos, formatUSD, formatCDF } from "@/lib/utils";

interface Props {
  id: string;
  titre: string;
  description: string;
  prixUSD: number;
  etat: string;
  categorie: string;
  photos: string;
  quantite: number;
  vues: number;
  tauxCDF: number;
  index?: number;
}

// Composant image universel (data: ou URL)
function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

export default function ProductCard({
  id, titre, description, prixUSD, etat, categorie, photos, quantite, vues, tauxCDF, index = 0,
}: Props) {
  const { t } = useLangue();
  const photosList = parserPhotos(photos);
  const photoUrl = photosList[0] || "";
  const epuise = quantite === 0;
  const [modalOuvert, setModalOuvert] = useState(false);
  const [photoActive, setPhotoActive] = useState(0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group"
      >
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden transition-all duration-300 group-hover:border-[var(--gold)]/40 group-hover:shadow-[0_20px_40px_rgba(201,168,76,0.12)]">

          {/* Image */}
          <Link href={`/produit/${id}`} className="block">
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--border)]">
              {photoUrl ? (
                <Img src={photoUrl} alt={titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: "rgba(201,168,76,0.2)" }}>
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-xs font-medium" style={{ color: "rgba(201,168,76,0.3)", letterSpacing: "0.05em" }}>Aucune photo</span>
                </div>
              )}

              {epuise && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">{t("epuise")}</span>
                </div>
              )}

              <div className="absolute top-3 left-3">
                <span className="bg-[var(--bg)]/90 backdrop-blur-sm text-[var(--text)] text-xs font-medium px-2.5 py-1 rounded-full border border-[var(--border)]">
                  {etat}
                </span>
              </div>

              <div className="absolute bottom-3 right-3">
                <span className="bg-black/60 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {vues + 100}
                </span>
              </div>
            </div>
          </Link>

          {/* Infos */}
          <div className="p-4">
            <p className="text-xs text-[var(--gold)] font-medium mb-1 uppercase tracking-wide">{categorie}</p>
            <h3 className="font-playfair text-base font-semibold text-[var(--text)] leading-snug mb-2 line-clamp-2 group-hover:text-[var(--gold)] transition-colors duration-200">
              {titre}
            </h3>
            <div className="flex flex-col gap-0.5 mb-3">
              <span className="text-[var(--gold)] font-bold text-lg">{formatUSD(prixUSD)}</span>
              <span className="text-[var(--text)]/50 text-xs">{formatCDF(prixUSD, tauxCDF)}</span>
            </div>

            {!epuise && quantite <= 3 && (
              <p className="mb-3 text-xs text-orange-400 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Plus que {quantite} en stock
              </p>
            )}

            {/* Boutons */}
            <div className="flex gap-2">
              {/* Voir plus — aperçu rapide */}
              <button
                onClick={() => { setPhotoActive(0); setModalOuvert(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.12)"; }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Voir plus
              </button>

              {/* Voir la fiche complète */}
              <Link
                href={`/produit/${id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{ background: "linear-gradient(135deg,#C9A84C,#E8C060)", color: "#0A0A0A" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Détails
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Modal aperçu rapide ── */}
      <AnimatePresence>
        {modalOuvert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
            onClick={(e) => e.target === e.currentTarget && setModalOuvert(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{ background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2">

                {/* Galerie */}
                <div className="relative aspect-square sm:aspect-auto sm:min-h-[300px] bg-[#0a0a0a]">
                  {photosList.length > 0 ? (
                    <Img src={photosList[photoActive]} alt={titre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full" style={{ color: "rgba(201,168,76,0.2)" }}>
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </div>
                  )}

                  {/* Miniatures */}
                  {photosList.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-3">
                      {photosList.map((_, i) => (
                        <button key={i} onClick={() => setPhotoActive(i)}
                          className="w-2 h-2 rounded-full transition-all duration-200"
                          style={{ background: i === photoActive ? "#C9A84C" : "rgba(255,255,255,0.3)", transform: i === photoActive ? "scale(1.3)" : "scale(1)" }} />
                      ))}
                    </div>
                  )}

                  {/* Badge état */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.7)", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                      {etat}
                    </span>
                  </div>
                </div>

                {/* Infos */}
                <div className="p-6 flex flex-col">
                  {/* Fermer */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(201,168,76,0.7)" }}>{categorie}</p>
                      <h3 className="font-playfair text-xl font-bold" style={{ color: "#F5F0E8" }}>{titre}</h3>
                    </div>
                    <button onClick={() => setModalOuvert(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ml-3 transition-colors"
                      style={{ color: "rgba(245,240,232,0.4)", background: "rgba(255,255,255,0.05)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F5F0E8"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(245,240,232,0.4)"; }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Prix */}
                  <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                    <p className="text-2xl font-bold" style={{ color: "#C9A84C" }}>{formatUSD(prixUSD)}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.4)" }}>≈ {formatCDF(prixUSD, tauxCDF)}</p>
                  </div>

                  {/* Description courte */}
                  {description && (
                    <p className="text-sm leading-relaxed mb-4 flex-1 line-clamp-4" style={{ color: "rgba(245,240,232,0.6)" }}>
                      {description}
                    </p>
                  )}

                  {/* Stock */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className={`w-2 h-2 rounded-full ${epuise ? "bg-red-500" : quantite <= 3 ? "bg-orange-400" : "bg-green-400"}`} />
                    <span className="text-xs" style={{ color: "rgba(245,240,232,0.5)" }}>
                      {epuise ? "Épuisé" : quantite <= 3 ? `Plus que ${quantite} en stock` : `${quantite} disponibles`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link href={`/produit/${id}`} onClick={() => setModalOuvert(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{ background: "linear-gradient(135deg,#C9A84C,#E8C060,#C9A84C)", color: "#0A0A0A", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
                      Voir la fiche complète
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <a href={`https://wa.me/25766504165?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par : ${titre} (${formatUSD(prixUSD)})`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{ background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", color: "#4ade80" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(22,163,74,0.25)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(22,163,74,0.15)"; }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Contacter sur WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

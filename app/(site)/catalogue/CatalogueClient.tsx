"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useLangue } from "@/contexts/LangueContext";

const ETATS = ["Excellent", "Très bon", "Bon", "Correct"];

interface Props {
  produits: any[];
  tauxCDF: number;
  categories: Array<{ nom: string; image: string }>;
}

export default function CatalogueClient({ produits, tauxCDF, categories }: Props) {
  const { t } = useLangue();
  const searchParams = useSearchParams();

  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState(searchParams.get("categorie") || "");
  const [etat, setEtat] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [tri, setTri] = useState("recent");

  useEffect(() => {
    const cat = searchParams.get("categorie");
    if (cat) setCategorie(cat);
  }, [searchParams]);

  const produitsFiltres = useMemo(() => {
    let r = [...produits];
    if (recherche) {
      const q = recherche.toLowerCase();
      r = r.filter((p) => p.titre.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.categorie.toLowerCase().includes(q));
    }
    if (categorie) r = r.filter((p) => p.categorie === categorie);
    if (etat) r = r.filter((p) => p.etat === etat);
    if (prixMin) r = r.filter((p) => p.prixUSD >= parseFloat(prixMin));
    if (prixMax) r = r.filter((p) => p.prixUSD <= parseFloat(prixMax));
    r.sort((a, b) => {
      if (tri === "prix_asc") return a.prixUSD - b.prixUSD;
      if (tri === "prix_desc") return b.prixUSD - a.prixUSD;
      if (tri === "populaire") return b.vues - a.vues;
      return new Date(b.creeLe).getTime() - new Date(a.creeLe).getTime();
    });
    return r;
  }, [produits, recherche, categorie, etat, prixMin, prixMax, tri]);

  const reinitialiser = () => {
    setRecherche(""); setCategorie(""); setEtat(""); setPrixMin(""); setPrixMax(""); setTri("recent");
  };

  const nbFiltres = [categorie, etat, prixMin, prixMax].filter(Boolean).length;

  const inputCls = "w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)] transition-colors";

  return (
    <div className="min-h-screen bg-[var(--bg)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-1">
            — {produitsFiltres.length} produit{produitsFiltres.length !== 1 ? "s" : ""}
          </p>
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)]">{t("catalogue")}</h1>
        </div>

        {/* Barre recherche + tri */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t("rechercher")}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text)]/40 focus:outline-none focus:border-[var(--gold)] transition-colors text-sm"
            />
          </div>
          <select
            value={tri}
            onChange={(e) => setTri(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)]"
          >
            <option value="recent">{t("plus_recent")}</option>
            <option value="populaire">{t("plus_populaire")}</option>
            <option value="prix_asc">{t("prix_croissant")}</option>
            <option value="prix_desc">{t("prix_decroissant")}</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filtres */}
          <aside className="hidden sm:block w-52 flex-shrink-0">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 sticky top-24 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text)]">{t("filtrer")}</span>
                {nbFiltres > 0 && (
                  <button onClick={reinitialiser} className="text-xs text-[var(--gold)] hover:opacity-70">
                    Réinitialiser
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-2 block">{t("categorie")}</label>
                <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={inputCls}>
                  <option value="">{t("toutes_categories")}</option>
                  {categories.map((c) => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-2 block">{t("etat")}</label>
                <select value={etat} onChange={(e) => setEtat(e.target.value)} className={inputCls}>
                  <option value="">{t("tous_etats")}</option>
                  {ETATS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-2 block">{t("prix")} (USD)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={prixMin} onChange={(e) => setPrixMin(e.target.value)} className={inputCls} />
                  <input type="number" placeholder="Max" value={prixMax} onChange={(e) => setPrixMax(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </aside>

          {/* Grille produits */}
          <div className="flex-1">
            {produitsFiltres.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-playfair text-xl text-[var(--text)] mb-2">{t("aucun_produit")}</p>
                <p className="text-[var(--text)]/50 text-sm mb-6">{t("aucun_produit_desc")}</p>
                <button onClick={reinitialiser} className="px-6 py-2.5 rounded-full border border-[var(--gold)] text-[var(--gold)] text-sm hover:bg-[var(--gold)]/10 transition-colors">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {produitsFiltres.map((p, i) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -6, scale: 1.02, rotateY: 2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <ProductCard {...p} tauxCDF={tauxCDF} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

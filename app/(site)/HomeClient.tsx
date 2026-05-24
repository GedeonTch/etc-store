"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Hero3D from "@/components/Hero3D";
import ProductCard from "@/components/ProductCard";
import { useLangue } from "@/contexts/LangueContext";

interface Props {
  produitsVedette: any[];
  produitsRecents: any[];
  tousLesProduits: any[];
  tauxCDF: number;
  categories: Array<{ nom: string; image: string }>;
}

export default function HomeClient({ produitsVedette, produitsRecents, tousLesProduits, tauxCDF, categories }: Props) {
  const { t } = useLangue();

  return (
    <>
      <Hero3D imagesCarrousel={tousLesProduits} />

      {/* Derniers arrivages */}
      {produitsRecents.length > 0 && (
        <section className="py-20 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-2">— Nouveautés</p>
                <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)]">
                  Derniers arrivages
                </h2>
              </div>
              <Link href="/catalogue" className="hidden sm:flex items-center gap-2 text-sm text-[var(--gold)] hover:opacity-70 transition-opacity">
                {t("voir_catalogue")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produitsRecents.map((p, i) => (
                <ProductCard key={p.id} {...p} tauxCDF={tauxCDF} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Produits en vedette */}
      {produitsVedette.length > 0 && (
        <section className="py-20 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-2">— Sélection</p>
                <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)]">
                  {t("produits_vedette")}
                </h2>
              </div>
              <Link href="/catalogue" className="hidden sm:flex items-center gap-2 text-sm text-[var(--gold)] hover:opacity-70 transition-opacity">
                {t("voir_catalogue")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produitsVedette.map((p, i) => (
                <ProductCard key={p.id} {...p} tauxCDF={tauxCDF} index={i} />
              ))}
            </div>

            <div className="mt-10 text-center sm:hidden">
              <Link href="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--gold)] text-[var(--gold)] text-sm font-medium hover:bg-[var(--gold)]/10 transition-colors">
                {t("voir_catalogue")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Grille catégories */}
      {categories.length > 0 && (
        <section className="py-20 bg-[var(--card)] border-t border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-2">— Nos rayons</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)]">{t("catalogue")}</h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.nom}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className="flex flex-col rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--gold)]/50 hover:shadow-lg hover:shadow-[var(--gold)]/10 transition-all duration-300 group">
                    {/* Image catégorie */}
                    <Link href={`/catalogue?categorie=${encodeURIComponent(cat.nom)}`} className="block">
                      <div className="w-full h-28 overflow-hidden bg-[var(--bg)] flex items-center justify-center">
                        <img
                          src={cat.image}
                          alt={cat.nom}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </Link>

                    {/* Nom + bouton */}
                    <div className="p-3 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-center text-[var(--text)]/80 group-hover:text-[var(--gold)] transition-colors leading-tight">
                        {cat.nom}
                      </span>
                      <Link
                        href={`/catalogue?categorie=${encodeURIComponent(cat.nom)}`}
                        className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 bg-[var(--gold)]/10 border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 text-[var(--gold)]"
                      >
                        Voir plus
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bandeau WhatsApp */}
      <section className="py-16 bg-[var(--bg)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-playfair text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4">
              Une question ? Contactez-nous directement
            </p>
            <p className="text-[var(--text)]/60 mb-8">
              Avenue Patrice Emery Lumumba, Quartier Labotte, Bukavu — en diagonale de l'Ecobank
            </p>
            <a
              href="https://wa.me/25766504165"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-green-600 hover:bg-green-500 text-white font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-green-900/30"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("contacter_whatsapp")}
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}

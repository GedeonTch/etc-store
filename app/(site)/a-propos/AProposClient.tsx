"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLangue } from "@/contexts/LangueContext";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Directeur",
  ADJOINT: "Adjoint",
  MEMBRE: "Agent",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "rgba(201,168,76,0.9)",
  ADJOINT: "rgba(96,165,250,0.9)",
  MEMBRE: "rgba(245,240,232,0.6)",
};

interface Agent { id: string; nom: string; email: string; role: string; photo: string | null }
interface Props { agents: Agent[]; params: Record<string, string> }

export default function AProposClient({ agents, params }: Props) {
  const { t } = useLangue();

  const valeurs = [
    {
      titre: "Qualité garantie",
      desc: "Chaque appareil est soigneusement inspecté avant d'être mis en vente. Nous ne proposons que des produits en bon état de fonctionnement.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      titre: "Prix accessibles",
      desc: "Des appareils importés d'Europe à des prix adaptés au marché local de Bukavu. Qualité européenne, tarifs congolais.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      titre: "Service de confiance",
      desc: "Établis à Bukavu depuis plusieurs années, nous bâtissons notre réputation sur la confiance et la transparence avec nos clients.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* Hero */}
      <section className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg,#080808 0%,#0a0a0a 60%,#0d0b08 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,0.1) 0%,transparent 70%)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: "rgba(201,168,76,0.55)" }}>
            — Notre histoire
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#F5F0E8" }}>
            À propos de nous
          </motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto h-px w-24 origin-center mb-6" style={{ background: "linear-gradient(90deg,transparent,#C9A84C,transparent)" }} />
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(245,240,232,0.6)" }}>
            {params.nom_etablissement || "ÉTABLISSEMENT TCHIBANVUNYA"} — votre partenaire de confiance pour des appareils d'occasion importés d'Europe, au cœur de Bukavu.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-3">— Notre mission</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)] mb-6">
                L'Europe à votre portée
              </h2>
              <p className="text-[var(--text)]/70 leading-relaxed mb-4">
                Fondé à Bukavu, l'Établissement Tchibanvunya (ETCH) s'est donné pour mission de rendre accessibles des appareils électroniques et des meubles de qualité européenne à la population du Sud-Kivu.
              </p>
              <p className="text-[var(--text)]/70 leading-relaxed mb-6">
                Chaque produit que nous importons est soigneusement sélectionné en Europe pour sa qualité et son état. Nous croyons que chaque famille mérite d'accéder à des équipements fiables à des prix justes.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "map-pin", text: params.adresse || "Avenue Patrice Emery Lumumba, Quartier Labotte, Bukavu" },
                  { icon: "mail", text: params.email_contact || "etsTchibanvunya@gmail.com" },
                  { icon: "phone", text: params.telephone_1 || "+243 997 220 295" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      {item.icon === "map-pin" && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#C9A84C" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      )}
                      {item.icon === "mail" && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#C9A84C" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      )}
                      {item.icon === "phone" && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#C9A84C" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text)]/70 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 gap-4">
              {[
                { valeur: "100+", label: "Produits importés" },
                { valeur: "500+", label: "Clients satisfaits" },
                { valeur: "3", label: "Années d'expérience" },
                { valeur: "24h", label: "Réponse garantie" },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-6 text-center"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <p className="font-playfair text-3xl font-bold mb-1" style={{ color: "#C9A84C" }}>{stat.valeur}</p>
                  <p className="text-xs text-[var(--text)]/50 uppercase tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-2">— Ce qui nous guide</p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)]">Nos valeurs</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valeurs.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-7" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}>
                  {v.icon}
                </div>
                <h3 className="font-playfair text-lg font-bold text-[var(--text)] mb-3">{v.titre}</h3>
                <p className="text-sm text-[var(--text)]/60 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      {agents.length > 0 && (
        <section className="py-20 bg-[var(--bg)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <p className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest mb-2">— Les personnes derrière ETCH</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)]">Notre équipe</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent, i) => (
                <motion.div key={agent.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden group" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  {/* Photo */}
                  <div className="relative h-56 overflow-hidden" style={{ background: "linear-gradient(135deg,#0f0f0f,#1a1a0f)" }}>
                    {agent.photo ? (
                      agent.photo.startsWith("data:") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={agent.photo} alt={agent.nom} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={agent.photo} alt={agent.nom} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )
                    ) : (
                      // Avatar initiales
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold font-playfair"
                          style={{ background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}>
                          {agent.nom.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    {/* Badge rôle */}
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: "rgba(0,0,0,0.7)", color: ROLE_COLORS[agent.role] || "#F5F0E8", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {ROLE_LABELS[agent.role] || agent.role}
                      </span>
                    </div>
                  </div>
                  {/* Infos */}
                  <div className="p-5">
                    <h3 className="font-playfair text-lg font-bold text-[var(--text)] mb-1">{agent.nom}</h3>
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm transition-colors"
                      style={{ color: "rgba(245,240,232,0.45)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.45)")}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {agent.email}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4">
              Prêt à découvrir nos produits ?
            </h2>
            <p className="text-[var(--text)]/60 mb-8">Visitez notre catalogue ou contactez-nous directement.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/catalogue"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                style={{ background: "linear-gradient(135deg,#C9A84C,#E8C060,#C9A84C)", color: "#0A0A0A", boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                Voir le catalogue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

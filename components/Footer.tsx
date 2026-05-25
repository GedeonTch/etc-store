"use client";

import Link from "next/link";
import Image from "next/image";
import { useLangue } from "@/contexts/LangueContext";
import { ParametresSite, telHref, whatsappHref } from "@/lib/parametres-public";

interface Props {
  siteParams: ParametresSite;
}

export default function Footer({ siteParams }: Props) {
  const { t } = useLangue();
  const annee = new Date().getFullYear();

  const nom = siteParams.nom_etablissement || "ÉTABLISSEMENT TCHIBANVUNYA";
  const marque = siteParams.marque || "ETCH";
  const tagline = siteParams.tagline || "L'Europe à votre portée";
  const adresse = siteParams.adresse || "Avenue Patrice Emery Lumumba, Quartier Labotte, Bukavu, Sud-Kivu";
  const email = siteParams.email_contact || "etsTchibanvunya@gmail.com";
  const telephones = [siteParams.telephone_1, siteParams.telephone_2, siteParams.telephone_3].filter(Boolean) as string[];
  const whatsapp = siteParams.whatsapp || "25766504165";

  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9">
                <Image src="/logo-etch.png" alt={marque} fill className="object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <span className="font-playfair text-2xl font-bold tracking-widest text-[var(--gold)]">{marque}</span>
            </div>
            <p className="text-sm text-[var(--text)]/60 leading-relaxed mb-3">
              {nom}<br />
              <em className="text-[var(--gold)]/80">{tagline}</em>
            </p>
            <p className="text-xs text-[var(--text)]/40 leading-relaxed whitespace-pre-line">
              {adresse}
            </p>
          </div>

          <div>
            <h3 className="font-playfair text-lg font-semibold text-[var(--gold)] mb-4">{t("contact")}</h3>
            <ul className="space-y-2.5 text-sm text-[var(--text)]/70">
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-[var(--gold)] transition-colors group">
                  <svg className="w-4 h-4 flex-shrink-0 text-[var(--gold)]/50 group-hover:text-[var(--gold)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {email}
                </a>
              </li>
              {telephones.map((tel) => (
                <li key={tel}>
                  <a href={telHref(tel)} className="flex items-center gap-2.5 hover:text-[var(--gold)] transition-colors group">
                    <svg className="w-4 h-4 flex-shrink-0 text-[var(--gold)]/50 group-hover:text-[var(--gold)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {tel}
                  </a>
                </li>
              ))}
              <li className="mt-3">
                <a href={whatsappHref(whatsapp)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-playfair text-lg font-semibold text-[var(--gold)] mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: t("accueil") },
                { href: "/catalogue", label: t("catalogue") },
                { href: "/a-propos", label: "À propos" },
                { href: "/contact", label: t("contact_negociations") },
                { href: "/credits", label: "Crédits" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[var(--text)]/60 hover:text-[var(--gold)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text)]/40">
          <p>© {annee} {nom}. {t("droits_reserves")}.</p>
          <p>
            {t("cree_par")}{" "}
            <Link href="/credits" className="text-[var(--gold)]/60 hover:text-[var(--gold)] transition-colors">
              Tchibanvunya Gedeon
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

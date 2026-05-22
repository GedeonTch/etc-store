"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";

const ICONS = {
  dashboard: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>),
  produits: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>),
  messages: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>),
  utilisateurs: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>),
  logs: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>),
  parametres: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  deconnexion: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>),
};

export default function AdminSidebar({ session }: { session: any }) {
  const pathname = usePathname();
  const role = session?.user?.role;
  const [collapsed, setCollapsed] = useState(false);

  const liens = [
    { href: "/admin", label: "Dashboard", icon: ICONS.dashboard, roles: ["SUPER_ADMIN", "ADJOINT", "MEMBRE"] },
    { href: "/admin/produits", label: "Produits", icon: ICONS.produits, roles: ["SUPER_ADMIN", "ADJOINT", "MEMBRE"] },
    { href: "/admin/messages", label: "Messages", icon: ICONS.messages, roles: ["SUPER_ADMIN", "ADJOINT", "MEMBRE"] },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: ICONS.utilisateurs, roles: ["SUPER_ADMIN"] },
    { href: "/admin/logs", label: "Logs", icon: ICONS.logs, roles: ["SUPER_ADMIN"] },
    { href: "/admin/parametres", label: "Paramètres", icon: ICONS.parametres, roles: ["SUPER_ADMIN"] },
  ].filter((l) => l.roles.includes(role));

  return (
    <aside
      className={`${collapsed ? "w-[68px]" : "w-64"} flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden`}
      style={{
        // Occupe toute la hauteur du parent flex
        alignSelf: "stretch",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 55%, #0d0b08 100%)",
        borderRight: "1px solid rgba(201,168,76,0.14)",
        boxShadow: "4px 0 32px rgba(0,0,0,0.5), inset -1px 0 0 rgba(201,168,76,0.07)",
      }}
    >
      {/* Halo doré haut */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 70% at 50% -5%, rgba(201,168,76,0.2) 0%, transparent 70%)" }} />
      {/* Ligne dorée bord droit */}
      <div className="absolute top-0 bottom-0 right-0 w-px pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.35) 25%, rgba(201,168,76,0.12) 75%, transparent 100%)" }} />

      {/* ── Logo ── */}
      <div className="relative z-10 h-16 px-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image src="/logo-etch.png" alt="ETCH" fill className="object-contain"
            style={{ filter: "drop-shadow(0 0 8px rgba(201,168,76,0.5))" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-playfair text-base font-bold tracking-[0.15em] block leading-tight"
              style={{ background: "linear-gradient(135deg,#C9A84C,#F0D080,#C9A84C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ETCH
            </span>
            <span className="text-[9px] tracking-widest uppercase block" style={{ color: "rgba(201,168,76,0.45)" }}>
              Tchibanvunya
            </span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0"
          style={{ color: "rgba(201,168,76,0.45)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(201,168,76,0.45)")}
          aria-label={collapsed ? "Déplier" : "Replier"}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* ── Profil ── */}
      {!collapsed && (
        <div className="relative z-10 px-4 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base"
              style={{
                background: "linear-gradient(135deg,rgba(201,168,76,0.28),rgba(201,168,76,0.1))",
                border: "1px solid rgba(201,168,76,0.35)",
                color: "#C9A84C",
                boxShadow: "0 2px 10px rgba(201,168,76,0.18), inset 0 1px 0 rgba(201,168,76,0.25)",
              }}>
              {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate leading-tight" style={{ color: "#F5F0E8" }}>
                {session?.user?.name}
              </p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 inline-block"
                style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.22)" }}>
                {role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation — flex-1 pour pousser déconnexion en bas ── */}
      <nav className="relative z-10 flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {liens.map((lien, i) => {
          const actif = pathname === lien.href;
          return (
            <motion.div key={lien.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}>
              <Link href={lien.href} title={collapsed ? lien.label : undefined}
                className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 group relative"
                style={actif ? {
                  background: "linear-gradient(135deg,rgba(201,168,76,0.22),rgba(201,168,76,0.08))",
                  border: "1px solid rgba(201,168,76,0.28)",
                  color: "#C9A84C",
                  boxShadow: "0 2px 14px rgba(201,168,76,0.18), inset 0 1px 0 rgba(201,168,76,0.12)",
                } : {
                  background: "transparent",
                  border: "1px solid transparent",
                  color: "rgba(245,240,232,0.45)",
                }}
                onMouseEnter={(e) => { if (!actif) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(245,240,232,0.9)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; } }}
                onMouseLeave={(e) => { if (!actif) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(245,240,232,0.45)"; e.currentTarget.style.border = "1px solid transparent"; } }}>
                {/* Barre indicateur actif */}
                {actif && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                    style={{ background: "#C9A84C", boxShadow: "0 0 10px rgba(201,168,76,0.9)" }} />
                )}
                <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {lien.icon}
                </span>
                {!collapsed && <span className="truncate font-medium text-[13.5px]">{lien.label}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* ── Séparateur ── */}
      <div className="relative z-10 mx-4 flex-shrink-0"
        style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)" }} />

      {/* ── Déconnexion — toujours visible en bas ── */}
      <div className="relative z-10 flex-shrink-0 px-3 py-4">
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title={collapsed ? "Déconnexion" : undefined}
          className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 group"
          style={{ color: "rgba(248,113,113,0.65)", border: "1px solid transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "rgba(248,113,113,0.95)"; e.currentTarget.style.border = "1px solid rgba(239,68,68,0.18)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.65)"; e.currentTarget.style.border = "1px solid transparent"; }}>
          <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">{ICONS.deconnexion}</span>
          {!collapsed && <span className="font-medium text-[13.5px]">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}

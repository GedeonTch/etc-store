"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface Props { logs: any[]; ipsBloquees: any[] }

export default function LogsClient({ logs, ipsBloquees: initIPs }: Props) {
  const [ipsBloquees, setIpsBloquees] = useState(initIPs);
  const [filtre, setFiltre] = useState<"tous" | "SUCCES" | "ECHEC" | "BLOQUE">("tous");
  const [deblocage, setDeblocage] = useState<string | null>(null);

  const logsFiltres = logs.filter((l) => filtre === "tous" || l.type === filtre);

  const debloquer = async (ip: string) => {
    setDeblocage(ip);
    const res = await fetch("/api/admin/logs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ip }) });
    if (res.ok) setIpsBloquees((prev) => prev.filter((i) => i.ip !== ip));
    setDeblocage(null);
  };

  const badgeType = (type: string) => {
    const s: Record<string, string> = { SUCCES: "bg-green-950/40 text-green-400", ECHEC: "bg-amber-950/40 text-amber-400", BLOQUE: "bg-red-950/40 text-red-400" };
    return `text-xs px-2.5 py-1 rounded-full font-medium ${s[type] || ""}`;
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-playfair text-2xl font-bold text-[var(--text)] mb-6">Logs de sécurité</h1>

      {ipsBloquees.length > 0 && (
        <div className="mb-8 bg-red-950/20 border border-red-800/40 rounded-xl p-5">
          <h2 className="text-red-400 font-semibold mb-4">🚫 IPs actuellement bloquées ({ipsBloquees.length})</h2>
          <div className="space-y-3">
            {ipsBloquees.map((ip) => (
              <div key={ip.ip} className="flex items-center justify-between gap-4 bg-red-950/30 rounded-lg px-4 py-3">
                <div>
                  <p className="font-mono text-sm text-red-300">{ip.ip}</p>
                  <p className="text-xs text-red-400/60 mt-0.5">{ip.tentatives} tentatives — bloquée jusqu'au {formatDate(ip.bloqueJusqu)}</p>
                </div>
                <button onClick={() => debloquer(ip.ip)} disabled={deblocage === ip.ip}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors disabled:opacity-50">
                  {deblocage === ip.ip ? "..." : "Débloquer"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {["tous", "SUCCES", "ECHEC", "BLOQUE"].map((f) => (
          <button key={f} onClick={() => setFiltre(f as any)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${filtre === f ? "bg-[var(--gold)] text-[#0A0A0A] font-medium" : "bg-[var(--card)] border border-[var(--border)] text-[var(--text)]/60 hover:border-[var(--gold)]"}`}>
            {f === "tous" ? "Tous" : f}
          </button>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Type", "Email", "Utilisateur", "IP", "Navigateur", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[var(--text)]/40 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logsFiltres.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]/50 transition-colors">
                  <td className="px-4 py-3"><span className={badgeType(log.type)}>{log.type}</span></td>
                  <td className="px-4 py-3 text-[var(--text)]/60 text-xs">{log.emailTente || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text)]/60 text-xs">{log.user?.nom || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text)]/60">{log.ip}</td>
                  <td className="px-4 py-3 text-[var(--text)]/40 text-xs max-w-[200px] truncate">{log.userAgent}</td>
                  <td className="px-4 py-3 text-[var(--text)]/40 text-xs whitespace-nowrap">{formatDate(log.creeLe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logsFiltres.length === 0 && <div className="text-center py-12 text-[var(--text)]/30">Aucun log</div>}
        </div>
      </div>
    </div>
  );
}

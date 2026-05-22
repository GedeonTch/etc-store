"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface Props { messages: any[]; role: string }

export default function MessagesAdminClient({ messages: init, role }: Props) {
  const [messages, setMessages] = useState(init);
  const [selectionne, setSelectionne] = useState<any>(null);
  const [reponse, setReponse] = useState("");
  const [envoi, setEnvoi] = useState<"idle" | "loading" | "ok">("idle");
  const [filtre, setFiltre] = useState<"tous" | "non_lus">("tous");

  const peutRepondre = ["SUPER_ADMIN", "ADJOINT"].includes(role);
  const messagesFiltres = messages.filter((m) => filtre === "non_lus" ? !m.lu : true);

  const marquerLu = async (id: string) => {
    await fetch(`/api/messages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lu: true }) });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, lu: true } : m));
  };

  const ouvrirMessage = (msg: any) => {
    setSelectionne(msg);
    setReponse(msg.reponse || "");
    setEnvoi("idle");
    if (!msg.lu) marquerLu(msg.id);
  };

  const envoyerReponse = async () => {
    if (!reponse.trim() || !selectionne) return;
    setEnvoi("loading");
    const res = await fetch(`/api/messages/${selectionne.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reponse }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      setSelectionne(updated);
      setEnvoi("ok");
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[var(--text)]">Messages</h1>
          <p className="text-[var(--text)]/40 text-sm mt-0.5">{messages.filter((m) => !m.lu).length} non lu(s)</p>
        </div>
        <div className="flex gap-2">
          {["tous", "non_lus"].map((f) => (
            <button key={f} onClick={() => setFiltre(f as any)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${filtre === f ? "bg-[var(--gold)] text-[#0A0A0A] font-medium" : "bg-[var(--card)] border border-[var(--border)] text-[var(--text)]/60 hover:border-[var(--gold)]"}`}>
              {f === "tous" ? "Tous" : "Non lus"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {messagesFiltres.length === 0 && <div className="text-center py-12 text-[var(--text)]/30">Aucun message</div>}
          {messagesFiltres.map((msg) => (
            <button key={msg.id} onClick={() => ouvrirMessage(msg)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectionne?.id === msg.id ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--gold)]/40"}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={`font-medium text-sm ${!msg.lu ? "text-[var(--text)]" : "text-[var(--text)]/60"}`}>
                  {msg.nomClient}
                  {!msg.lu && <span className="ml-2 w-2 h-2 bg-[var(--gold)] rounded-full inline-block" />}
                </p>
                <span className="text-xs text-[var(--text)]/30 flex-shrink-0">{formatDate(msg.creeLe)}</span>
              </div>
              {msg.produit && <p className="text-xs text-[var(--gold)]/70 mb-1">📦 {msg.produit.titre}</p>}
              <p className="text-xs text-[var(--text)]/50 line-clamp-2">{msg.contenu}</p>
              {msg.reponse && <span className="mt-2 inline-block text-xs bg-green-950/40 text-green-400 px-2 py-0.5 rounded-full">Répondu</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectionne ? (
            <motion.div key={selectionne.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-5 h-fit sticky top-24">
              <div>
                <h3 className="font-playfair text-lg font-bold text-[var(--text)] mb-3">{selectionne.nomClient}</h3>
                <div className="space-y-1.5 text-sm">
                  <p className="text-[var(--text)]/60">📧 <a href={`mailto:${selectionne.emailClient}`} className="hover:text-[var(--gold)] transition-colors">{selectionne.emailClient}</a></p>
                  {selectionne.telephone && <p className="text-[var(--text)]/60">📞 {selectionne.telephone}</p>}
                  {selectionne.produit && <p className="text-[var(--gold)]/70">📦 {selectionne.produit.titre}</p>}
                  <p className="text-[var(--text)]/30 text-xs">{formatDate(selectionne.creeLe)}</p>
                </div>
              </div>

              <div className="bg-[var(--bg)] rounded-xl p-4">
                <p className="text-xs text-[var(--text)]/40 uppercase tracking-wide mb-2">Message</p>
                <p className="text-sm text-[var(--text)]/80 leading-relaxed whitespace-pre-line">{selectionne.contenu}</p>
              </div>

              {selectionne.reponse && (
                <div className="bg-green-950/20 border border-green-800/30 rounded-xl p-4">
                  <p className="text-xs text-green-400 uppercase tracking-wide mb-2">Réponse envoyée</p>
                  <p className="text-sm text-[var(--text)]/70 whitespace-pre-line">{selectionne.reponse}</p>
                </div>
              )}

              {peutRepondre && (
                <div>
                  <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">
                    {selectionne.reponse ? "Modifier la réponse" : "Répondre"}
                  </label>
                  <textarea rows={4} value={reponse} onChange={(e) => setReponse(e.target.value)} placeholder="Votre réponse..."
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)] resize-none" />
                  <button onClick={envoyerReponse} disabled={envoi === "loading" || !reponse.trim()}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 disabled:opacity-50">
                    {envoi === "loading" ? "Envoi..." : envoi === "ok" ? "✅ Envoyé !" : "Envoyer la réponse"}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="hidden lg:flex items-center justify-center text-[var(--text)]/20 text-sm">
              Sélectionnez un message
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

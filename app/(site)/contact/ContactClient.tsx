"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useLangue } from "@/contexts/LangueContext";
import AuthGate from "@/components/AuthGate";
import { isClient } from "@/lib/session";

interface MessageWithReponse {
  id: string;
  contenu: string;
  reponse: string | null;
  reponseLue: boolean;
  creeLe: string;
}

export default function ContactClient() {
  const { t } = useLangue();
  const { data: session } = useSession();
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [messagesAvecReponses, setMessagesAvecReponses] = useState<MessageWithReponse[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi("loading");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone, contenu: message }),
      });
      if (res.status === 401) setEnvoi("error");
      else {
        setEnvoi(res.ok ? "ok" : "error");
        if (res.ok) {
          setTelephone("");
          setMessage("");
          // Recharger les messages
          await chargerMessages();
          setTimeout(() => setEnvoi("idle"), 3000);
        }
      }
    } catch {
      setEnvoi("error");
    }
  };

  const chargerMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/messages?email=" + encodeURIComponent(session?.user?.email || ""));
      if (res.ok) {
        const data = await res.json();
        setMessagesAvecReponses(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      chargerMessages();
    }
  }, [session?.user?.email]);

  const marquerCommeLibre = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/marquer-reponse-lue`, {
        method: "PUT",
      });
      await chargerMessages();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/30 transition-all";

  return (
    <div className="min-h-screen bg-[var(--bg)] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ delay: 0.2 }}
            className="text-[var(--gold)] text-sm font-medium uppercase mb-2"
          >
            — Nous sommes là
          </motion.p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-[var(--text)]">{t("contact_titre")}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card-elevated rounded-2xl p-8"
          >
            <AuthGate titre={t("contact_titre")}>
              {isClient(session) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[var(--text-muted)] mb-5 pb-5 border-b border-[var(--border)]"
                >
                  {t("connecte_en_tant_que")}{" "}
                  <strong className="text-[var(--gold)]">{session?.user?.name}</strong>
                  <span className="block text-xs mt-1">{session?.user?.email}</span>
                </motion.p>
              )}

              {envoi === "ok" ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                  <p className="text-5xl mb-4">✅</p>
                  <p className="font-playfair text-xl mb-2">{t("message_envoye")}</p>
                  <button
                    type="button"
                    onClick={() => { setEnvoi("idle"); setMessage(""); }}
                    className="mt-6 px-6 py-2.5 rounded-full border border-[var(--gold)] text-[var(--gold)] text-sm hover:bg-[var(--gold)]/10"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={envoyer} className="space-y-5">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">
                      {t("votre_telephone")}
                    </label>
                    <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">
                      {t("votre_message")} *
                    </label>
                    <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} resize-none`} />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={envoi === "loading"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl btn-gold font-semibold disabled:opacity-50"
                  >
                    {envoi === "loading" ? t("chargement") : t("envoyer")}
                  </motion.button>
                  {envoi === "error" && <p className="text-red-600 dark:text-red-400 text-sm text-center">{t("erreur_connexion")}</p>}
                </form>
              )}
            </AuthGate>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <a
              href="https://wa.me/25766504165"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/40 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">{t("contacter_whatsapp")}</p>
                <p className="text-sm text-[var(--text-muted)]">+257 66 504 165</p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Section Mes Messages */}
      {session && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--text)]">Mes Messages</h2>
            <p className="text-[var(--text)]/60 mt-2">Consultez vos messages et les réponses de l'équipe</p>
          </motion.div>

          {loadingMessages ? (
            <div className="text-center py-12">
              <p className="text-[var(--text)]/60">Chargement...</p>
            </div>
          ) : messagesAvecReponses.length === 0 ? (
            <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
              <p className="text-[var(--text)]/60">Aucun message envoyé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messagesAvecReponses.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl border transition-all ${msg.reponse && !msg.reponseLue
                    ? "bg-[var(--gold)]/5 border-[var(--gold)]/50 shadow-lg shadow-[var(--gold)]/10"
                    : "bg-[var(--card)] border-[var(--border)]"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[var(--text)]/50">
                          {new Date(msg.creeLe).toLocaleDateString("fr-FR")}
                        </span>
                        {msg.reponse && !msg.reponseLue && (
                          <span className="px-2 py-1 bg-[var(--gold)] text-black text-xs font-bold rounded-full">
                            🔔 Nouvelle réponse
                          </span>
                        )}
                      </div>
                      <p className="text-[var(--text)] text-sm mb-4">{msg.contenu}</p>

                      {msg.reponse && (
                        <div className="mt-4 p-4 bg-[var(--bg)] rounded-lg border-l-4 border-[var(--gold)]">
                          <p className="text-xs text-[var(--gold)] font-semibold mb-2">Réponse de l'équipe :</p>
                          <p className="text-[var(--text)] text-sm">{msg.reponse}</p>
                          {!msg.reponseLue && (
                            <button
                              onClick={() => marquerCommeLibre(msg.id)}
                              className="mt-3 text-xs text-[var(--gold)] hover:underline"
                            >
                              ✓ Marquer comme lu
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

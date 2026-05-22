"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { parserPhotos, formatUSD } from "@/lib/utils";

const ETATS = ["Excellent", "Très bon", "Bon", "Correct"];
const FORM_VIDE = { titre: "", description: "", prixUSD: "", etat: "Excellent", categorie: "", quantite: "1", vedette: false };

interface Props { produits: any[]; tauxCDF: number; categories: Array<{nom: string; image: string}>; role: string }

export default function ProduitsAdminClient({ produits: init, tauxCDF, categories, role }: Props) {
  const [produits, setProduits] = useState(init);
  const [modal, setModal] = useState<"creer" | "modifier" | null>(null);
  const [produitEdite, setProduitEdite] = useState<any>(null);
  const [form, setForm] = useState<any>(FORM_VIDE);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recherche, setRecherche] = useState("");

  const peutModifier = ["SUPER_ADMIN", "ADJOINT"].includes(role);
  const produitsFiltres = produits.filter((p) => p.titre.toLowerCase().includes(recherche.toLowerCase()));

  const uploadPhoto = async (file: File) => {
    setUploading(true);

    try {
      // Compresser l'image côté client avant upload (max 600px, qualité 0.65)
      // Cible : < 200KB pour rester bien sous la limite
      const compresse = await compresserImage(file, 600, 0.65);

      const fd = new FormData();
      fd.append("file", compresse);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (data.url) {
        setPhotos((prev) => [...prev, data.url]);
      } else {
        alert(`Erreur upload: ${data.error || "Erreur inconnue"}`);
      }
    } catch (e) {
      alert("Erreur lors de l'upload de l'image");
      console.error(e);
    }

    setUploading(false);
  };

  // Compresser une image via canvas
  const compresserImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
      img.src = objectUrl;
    });
  };

  const ouvrirCreer = () => { setForm(FORM_VIDE); setPhotos([]); setProduitEdite(null); setModal("creer"); };

  const ouvrirModifier = (p: any) => {
    setForm({ titre: p.titre, description: p.description, prixUSD: p.prixUSD.toString(), etat: p.etat, categorie: p.categorie, quantite: p.quantite.toString(), vedette: p.vedette });
    setPhotos(parserPhotos(p.photos));
    setProduitEdite(p);
    setModal("modifier");
  };

  const sauvegarder = async () => {
    setSaving(true);

    try {
      // Étape 1 : sauvegarder le produit SANS les photos (body léger)
      const bodyBase = {
        ...form,
        photos: [], // on envoie vide d'abord
        prixUSD: parseFloat(form.prixUSD),
        quantite: parseInt(form.quantite),
      };

      const url = modal === "modifier" ? `/api/produits/${produitEdite.id}` : "/api/produits";
      const method = modal === "modifier" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyBase),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erreur lors de la sauvegarde");
        setSaving(false);
        return;
      }

      const produitSauve = await res.json();

      // Étape 2 : si des photos existent, les envoyer séparément
      if (photos.length > 0) {
        const resPhotos = await fetch(`/api/produits/${produitSauve.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos }),
        });

        if (resPhotos.ok) {
          const produitAvecPhotos = await resPhotos.json();
          setProduits((prev) =>
            modal === "modifier"
              ? prev.map((x) => x.id === produitAvecPhotos.id ? produitAvecPhotos : x)
              : prev.map((x) => x.id === produitSauve.id ? produitAvecPhotos : x)
          );
        } else {
          // Photos non sauvegardées mais produit OK
          setProduits((prev) =>
            modal === "modifier"
              ? prev.map((x) => x.id === produitSauve.id ? produitSauve : x)
              : [produitSauve, ...prev]
          );
          alert("Produit sauvegardé mais les photos n'ont pas pu être enregistrées (trop grandes). Configurez Cloudinary.");
        }
      } else {
        // Pas de photos
        setProduits((prev) =>
          modal === "modifier"
            ? prev.map((x) => x.id === produitSauve.id ? produitSauve : x)
            : [produitSauve, ...prev]
        );
      }

      setModal(null);
    } catch (e) {
      console.error("Erreur sauvegarde:", e);
      alert("Erreur réseau. Vérifiez votre connexion.");
    }

    setSaving(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/produits/${id}`, { method: "DELETE" });
    if (res.ok) setProduits((prev) => prev.filter((p) => p.id !== id));
  };

  const modifierQte = async (id: string, delta: number) => {
    const p = produits.find((x) => x.id === id);
    if (!p) return;
    const res = await fetch(`/api/produits/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantite: Math.max(0, p.quantite + delta) }) });
    if (res.ok) { const updated = await res.json(); setProduits((prev) => prev.map((x) => x.id === id ? updated : x)); }
  };

  const toggleVedette = async (id: string, vedette: boolean) => {
    const res = await fetch(`/api/produits/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vedette: !vedette }) });
    if (res.ok) { const updated = await res.json(); setProduits((prev) => prev.map((x) => x.id === id ? updated : x)); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)]";

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[var(--text)]">Produits</h1>
          <p className="text-[var(--text)]/40 text-sm mt-0.5">{produits.length} produit(s)</p>
        </div>
        {peutModifier && (
          <button onClick={ouvrirCreer} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 transition-opacity">
            + Ajouter
          </button>
        )}
      </div>

      <input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)}
        className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)] mb-6" />

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Photo", "Titre", "Prix", "État", "Stock", "Vedette", "Vues", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[var(--text)]/40 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {produitsFiltres.map((p) => {
                const ph = parserPhotos(p.photos);
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--border)]">
                        {ph[0] && (
                          ph[0].startsWith("data:") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ph[0]} alt={p.titre} className="w-full h-full object-cover" />
                          ) : (
                            <Image src={ph[0]} alt={p.titre} fill className="object-cover" />
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text)] max-w-[180px] truncate">{p.titre}</p>
                      <p className="text-xs text-[var(--text)]/40">{p.categorie}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--gold)] font-medium whitespace-nowrap">{formatUSD(p.prixUSD)}</td>
                    <td className="px-4 py-3 text-[var(--text)]/70">{p.etat}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {peutModifier && <button onClick={() => modifierQte(p.id, -1)} className="w-6 h-6 rounded bg-[var(--bg)] border border-[var(--border)] text-xs hover:border-[var(--gold)] transition-colors flex items-center justify-center">−</button>}
                        <span className={`font-medium text-sm ${p.quantite === 0 ? "text-red-400" : p.quantite <= 3 ? "text-orange-400" : "text-green-400"}`}>{p.quantite}</span>
                        {peutModifier && <button onClick={() => modifierQte(p.id, 1)} className="w-6 h-6 rounded bg-[var(--bg)] border border-[var(--border)] text-xs hover:border-[var(--gold)] transition-colors flex items-center justify-center">+</button>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => peutModifier && toggleVedette(p.id, p.vedette)} disabled={!peutModifier}
                        title={p.vedette ? "Retirer de la vedette" : "Mettre en vedette"}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110 ${p.vedette ? "text-[var(--gold)]" : "text-[var(--text)]/20 hover:text-[var(--text)]/50"}`}>
                        <svg className="w-4 h-4" fill={p.vedette ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]/50">{p.vues}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {peutModifier && <button onClick={() => ouvrirModifier(p)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--gold)] transition-colors">Modifier</button>}
                        {role === "SUPER_ADMIN" && <button onClick={() => supprimer(p.id)} className="px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-800/40 text-xs text-red-400 hover:bg-red-950/50 transition-colors">Supprimer</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {produitsFiltres.length === 0 && <div className="text-center py-12 text-[var(--text)]/30">Aucun produit</div>}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-playfair text-xl font-bold text-[var(--text)]">
                  {modal === "creer" ? "Ajouter un produit" : "Modifier le produit"}
                </h2>
                <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text)]/40 hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Titre *</label>
                  <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Description *</label>
                  <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Prix USD *</label>
                    <input type="number" min="0" step="0.01" value={form.prixUSD} onChange={(e) => setForm({ ...form, prixUSD: e.target.value })} className={inputCls} />
                    {form.prixUSD && <p className="text-xs text-[var(--text)]/40 mt-1">≈ {Math.round(parseFloat(form.prixUSD) * tauxCDF).toLocaleString("fr-FR")} CDF</p>}
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Quantité</label>
                    <input type="number" min="0" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">État *</label>
                    <select value={form.etat} onChange={(e) => setForm({ ...form, etat: e.target.value })} className={inputCls}>
                      {ETATS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Catégorie *</label>
                    <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className={inputCls}>
                      <option value="">Choisir...</option>
                      {categories.map((c) => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.vedette} onChange={(e) => setForm({ ...form, vedette: e.target.checked })} className="w-4 h-4 accent-[var(--gold)]" />
                  <span className="text-sm text-[var(--text)] flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--gold)]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    Mettre en vedette sur l'accueil
                  </span>
                </label>
                <div>
                  <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Photos</label>
                  <input type="file" accept="image/*" multiple
                    onChange={(e) => Array.from(e.target.files || []).forEach(uploadPhoto)}
                    className="w-full text-sm text-[var(--text)]/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--gold)] file:text-[#0A0A0A] file:font-medium file:cursor-pointer" />
                  {uploading && <p className="text-xs text-[var(--gold)] mt-1">Upload en cours...</p>}
                  {photos.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {photos.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                          {url.startsWith("data:") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Image src={url} alt="" fill className="object-cover" />
                          )}
                          <button onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-[var(--border)] flex gap-3 justify-end">
                <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] text-sm hover:border-[var(--gold)] transition-colors">Annuler</button>
                <button onClick={sauvegarder} disabled={saving || !form.titre || !form.prixUSD || !form.categorie}
                  className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 disabled:opacity-50">
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

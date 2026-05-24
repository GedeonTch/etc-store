"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { compresserImage } from "@/lib/utils";

interface Props { parametres: Record<string, string> }

type Categorie = { nom: string; image: string };
type MembreEquipe = { nom: string; poste: string; photo: string; description?: string; whatsapp?: string };

export default function ParametresClient({ parametres: init }: Props) {
  const router = useRouter();
  const [params, setParams] = useState(init);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [mdp, setMdp] = useState({ ancien: "", nouveau: "", confirmation: "" });
  const [mdpStatus, setMdpStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [mdpErreur, setMdpErreur] = useState("");

  // Catégories
  const [categories, setCategories] = useState(() => {
    try {
      const parsed = JSON.parse(init.categories || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }) as [Array<{ nom: string; image: string }>, (c: Array<{ nom: string; image: string }>) => void];
  const [nouvelleCategorie, setNouvelleCategorie] = useState("");
  const [nouvelleImageUrl, setNouvelleImageUrl] = useState("");
  const [savingCats, setSavingCats] = useState(false);
  const [savedCats, setSavedCats] = useState(false);
  
  // Édition catégorie
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [nouvelleImage, setNouvelleImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Page À propos
  const [equipe, setEquipe] = useState(() => {
    try {
      const parsed = JSON.parse(init.apropos_equipe || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map((m: Record<string, string>) => ({
        nom: m.nom || "",
        poste: m.poste || "",
        photo: m.photo || "",
        description: m.description || "",
        whatsapp: m.whatsapp || "",
      }));
    } catch {
      return [];
    }
  }) as [MembreEquipe[], (e: MembreEquipe[]) => void];
  const [nouveauMembre, setNouveauMembre] = useState({ nom: "", poste: "", description: "", whatsapp: "" });
  const [photoMembre, setPhotoMembre] = useState<File | null>(null);
  const [editingMembre, setEditingMembre] = useState<number | null>(null);
  const [editPhotoMembre, setEditPhotoMembre] = useState<File | null>(null);
  const [savingApropos, setSavingApropos] = useState(false);
  const [savedApropos, setSavedApropos] = useState(false);

  const uploadImage = async (file: File, nom: string, dossier: "categories" | "equipe") => {
    const compresse = await compresserImage(file, 600, 0.65);
    const formData = new FormData();
    formData.append("file", compresse);
    formData.append("nomCategorie", nom);
    formData.append("dossier", dossier);
    const res = await fetch("/api/upload-categorie", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload échoué");
    return data.imagePath as string;
  };

  const sauvegarderParam = async (cle: string) => {
    setSaving(cle);
    const res = await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cle, valeur: params[cle] || "" }),
    });
    setSaving(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Erreur lors de la sauvegarde");
      return;
    }
    setSaved(cle);
    router.refresh();
    setTimeout(() => setSaved(null), 2000);
  };

  const sauvegarderCategories = async (cats: Categorie[] = categories): Promise<boolean> => {
    setSavingCats(true);
    const json = JSON.stringify(cats);
    if (json.length > 60000) {
      alert("Données trop volumineuses. Les images doivent être hébergées via Vercel Blob (BLOB_READ_WRITE_TOKEN).");
      setSavingCats(false);
      return false;
    }
    const res = await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cle: "categories", valeur: json }),
    });
    setSavingCats(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Erreur lors de la sauvegarde des catégories");
      return false;
    }
    setSavedCats(true);
    router.refresh();
    setTimeout(() => setSavedCats(false), 3000);
    return true;
  };

  const sauvegarderApropos = async () => {
    setSavingApropos(true);
    const updates = [
      { cle: "apropos_intro", valeur: params.apropos_intro || "" },
      { cle: "apropos_mission_p1", valeur: params.apropos_mission_p1 || "" },
      { cle: "apropos_mission_p2", valeur: params.apropos_mission_p2 || "" },
      { cle: "apropos_equipe", valeur: JSON.stringify(equipe) },
    ];
    const jsonEquipe = JSON.stringify(equipe);
    if (jsonEquipe.length > 60000) {
      alert("Équipe trop volumineuse. Utilisez Vercel Blob pour les photos.");
      setSavingApropos(false);
      return;
    }
    const res = await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSavingApropos(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Erreur lors de la sauvegarde");
      return;
    }
    setSavedApropos(true);
    router.refresh();
    setTimeout(() => setSavedApropos(false), 3000);
  };

  const ajouterCategorie = async () => {
    const val = nouvelleCategorie.trim();
    if (!val || !nouvelleImage || categories.some(c => c.nom === val)) {
      alert("Remplis le nom et choisis une image");
      return;
    }

    setUploadingImage(true);
    try {
      const imagePath = await uploadImage(nouvelleImage, val, "categories");
      const newCats = [...categories, { nom: val, image: imagePath }];
      setCategories(newCats);
      setNouvelleCategorie("");
      setNouvelleImage(null);
      await sauvegarderCategories(newCats);
    } catch (err) {
      alert("❌ Erreur : " + (err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setUploadingImage(false);
    }
  };

  const supprimerCategorie = async (i: number) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const newCats = categories.filter((_, j) => j !== i);
    setCategories(newCats);
    await sauvegarderCategories(newCats);
  };

  const modifierImageCategorie = async (i: number) => {
    if (!editImage) {
      alert("Choisis une image");
      return;
    }

    setUploadingImage(true);
    try {
      const imagePath = await uploadImage(editImage, categories[i].nom, "categories");
      const newCats = [...categories];
      newCats[i] = { ...newCats[i], image: imagePath };
      setCategories(newCats);
      setEditingIndex(null);
      setEditImage(null);
      await sauvegarderCategories(newCats);
    } catch (err) {
      alert("❌ Erreur : " + (err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setUploadingImage(false);
    }
  };

  const monterCategorie = async (i: number) => {
    if (i === 0) return;
    const arr = [...categories];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setCategories(arr);
    await sauvegarderCategories(arr);
  };

  const descendreCategorie = async (i: number) => {
    if (i === categories.length - 1) return;
    const arr = [...categories];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    setCategories(arr);
    await sauvegarderCategories(arr);
  };

  const changerMdp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mdp.nouveau !== mdp.confirmation) { setMdpErreur("Les mots de passe ne correspondent pas."); return; }
    setMdpStatus("loading"); setMdpErreur("");
    const res = await fetch("/api/admin/mot-de-passe", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ancienMotDePasse: mdp.ancien, nouveauMotDePasse: mdp.nouveau }) });
    if (res.ok) { setMdpStatus("ok"); setMdp({ ancien: "", nouveau: "", confirmation: "" }); }
    else { const d = await res.json(); setMdpErreur(d.error || "Erreur"); setMdpStatus("error"); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)]";

  const Champ = ({ cle, label, type = "text" }: { cle: string; label: string; type?: string }) => (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">{label}</label>
        <input type={type} value={params[cle] || ""} onChange={(e) => setParams({ ...params, [cle]: e.target.value })} className={inputCls} />
      </div>
      <button onClick={() => sauvegarderParam(cle)} disabled={saving === cle}
        className="px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
        {saving === cle ? "..." : saved === cle ? "✅ Sauvegardé" : "Sauvegarder"}
      </button>
    </div>
  );

  const Section = ({ titre, children }: { titre: string; children: React.ReactNode }) => (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-6">
      <h2 className="font-playfair text-lg font-bold text-[var(--text)] mb-5">{titre}</h2>
      {children}
    </div>
  );

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="font-playfair text-2xl font-bold text-[var(--text)] mb-8">Paramètres</h1>

      {/* Taux de change */}
      <Section titre="Taux de change">
        <Champ cle="taux_usd_cdf" label="1 USD = ? CDF" type="number" />
        <p className="text-xs text-[var(--text)]/30 mt-2">Exemple : 2800 → 1 USD = 2 800 CDF</p>
      </Section>

      {/* Catégories */}
      <Section titre="Catégories de produits">
        <p className="text-xs text-[var(--text)]/40 mb-4">
          Ces catégories apparaissent sur l'accueil et dans le catalogue. Vous pouvez les ajouter, supprimer ou réordonner.
        </p>

        {/* Liste des catégories */}
        <div className="space-y-2 mb-4">
          {categories.map((cat, i) => (
            <div key={i}>
              {editingIndex === i ? (
                // Mode édition
                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--gold)]">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={cat.image} alt={cat.nom} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{cat.nom}</p>
                      <p className="text-xs text-[var(--text)]/40">Nouvelle image</p>
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm cursor-pointer file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[var(--gold)]/20 file:text-[var(--gold)]"
                    />
                    {editImage && <span className="text-xs text-[var(--gold)] mt-1 block">✓ {editImage.name}</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => modifierImageCategorie(i)}
                      disabled={!editImage || uploadingImage}
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--gold)] text-[#0A0A0A] text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                      {uploadingImage ? "Upload..." : "Confirmer"}
                    </button>
                    <button
                      onClick={() => { setEditingIndex(null); setEditImage(null); }}
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--border)] text-[var(--text)] text-sm font-semibold hover:opacity-80">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                // Mode affichage
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  {/* Image */}
                  <img src={cat.image} alt={cat.nom} className="w-10 h-10 rounded object-cover cursor-pointer hover:opacity-80" onClick={() => setEditingIndex(i)} />

                  {/* Réordonner */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => monterCategorie(i)} disabled={i === 0}
                      className="w-5 h-5 flex items-center justify-center rounded text-[var(--text)]/40 hover:text-[var(--gold)] disabled:opacity-20 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button onClick={() => descendreCategorie(i)} disabled={i === categories.length - 1}
                      className="w-5 h-5 flex items-center justify-center rounded text-[var(--text)]/40 hover:text-[var(--gold)] disabled:opacity-20 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Numéro + nom */}
                  <span className="text-xs text-[var(--text)]/30 w-5 text-center">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-[var(--text)]">{cat.nom}</span>

                  {/* Boutons */}
                  <button onClick={() => setEditingIndex(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--gold)]/60 hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Supprimer */}
                  <button onClick={() => supprimerCategorie(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-950/30 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-center py-4 text-[var(--text)]/30 text-sm">Aucune catégorie</p>
          )}
        </div>

        {/* Ajouter une catégorie */}
        <div className="space-y-3 mb-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]/50">
          <div>
            <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Nom de la catégorie *</label>
            <input
              type="text"
              placeholder="Ex: Téléphones, Ordinateurs..."
              value={nouvelleCategorie}
              onChange={(e) => setNouvelleCategorie(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Image de la catégorie * (obligatoire)</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNouvelleImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm cursor-pointer file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[var(--gold)]/20 file:text-[var(--gold)]"
              />
              {nouvelleImage && <span className="text-xs text-[var(--gold)] mt-1 block">✓ {nouvelleImage.name}</span>}
            </div>
          </div>

          <button
            onClick={ajouterCategorie}
            disabled={!nouvelleCategorie.trim() || !nouvelleImage || uploadingImage}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-colors">
            {uploadingImage ? "Upload..." : "+ Ajouter catégorie"}
          </button>
        </div>

        {/* Sauvegarder */}
        <button onClick={() => sauvegarderCategories()} disabled={savingCats}
          className="w-full py-3 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
          {savingCats ? "Sauvegarde..." : savedCats ? "✅ Catégories sauvegardées !" : "Re-sauvegarder les catégories"}
        </button>
        <p className="text-xs text-[var(--text)]/30 mt-2 text-center">Les modifications sont sauvegardées automatiquement.</p>
      </Section>

      {/* Page À propos */}
      <Section titre="Page À propos">
        <p className="text-xs text-[var(--text)]/40 mb-4">
          Les membres ajoutés ici apparaissent sur /a-propos. Les comptes admin ne sont plus affichés automatiquement (sécurité : pas d&apos;email de connexion public).
        </p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Introduction (sous-titre hero)</label>
            <textarea rows={2} value={params.apropos_intro || ""} onChange={(e) => setParams({ ...params, apropos_intro: e.target.value })} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Mission — paragraphe 1</label>
            <textarea rows={3} value={params.apropos_mission_p1 || ""} onChange={(e) => setParams({ ...params, apropos_mission_p1: e.target.value })} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Mission — paragraphe 2</label>
            <textarea rows={3} value={params.apropos_mission_p2 || ""} onChange={(e) => setParams({ ...params, apropos_mission_p2: e.target.value })} className={`${inputCls} resize-none`} />
          </div>
        </div>

        <p className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-3">Membres de l'équipe</p>
        <div className="space-y-2 mb-4">
          {equipe.map((m, i) => (
            <div key={i} className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              {editingMembre === i ? (
                <div className="space-y-2">
                  <input type="file" accept="image/*" onChange={(e) => setEditPhotoMembre(e.target.files?.[0] || null)} className="w-full text-sm text-[var(--text)]/60 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[var(--gold)]/20 file:text-[var(--gold)]" />
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      if (!editPhotoMembre) return;
                      setUploadingImage(true);
                      try {
                        const photo = await uploadImage(editPhotoMembre, m.nom, "equipe");
                        const arr = [...equipe]; arr[i] = { ...arr[i], photo };
                        setEquipe(arr); setEditingMembre(null); setEditPhotoMembre(null);
                      /* saved with apropos */ } catch (e) { alert(e instanceof Error ? e.message : "Erreur"); }
                      finally { setUploadingImage(false); }
                    }} disabled={!editPhotoMembre || uploadingImage} className="flex-1 px-3 py-2 rounded-lg bg-[var(--gold)] text-[#0A0A0A] text-sm font-semibold disabled:opacity-50">Confirmer photo</button>
                    <button onClick={() => { setEditingMembre(null); setEditPhotoMembre(null); }} className="px-3 py-2 rounded-lg bg-[var(--border)] text-sm">Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={m.photo || "/logo-etch.png"} alt={m.nom} className="w-12 h-12 rounded-full object-cover cursor-pointer" onClick={() => setEditingMembre(i)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)]">{m.nom}</p>
                    <p className="text-xs text-[var(--text)]/50">{m.poste}{m.whatsapp ? ` · WA: ${m.whatsapp}` : ""}</p>
                  </div>
                  <button onClick={() => setEditingMembre(i)} className="text-xs text-[var(--gold)]">Photo</button>
                  <button onClick={() => setEquipe(equipe.filter((_, j) => j !== i))} className="text-xs text-red-400">Suppr.</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]/50">
          <input type="text" placeholder="Nom *" value={nouveauMembre.nom} onChange={(e) => setNouveauMembre({ ...nouveauMembre, nom: e.target.value })} className={inputCls} />
          <input type="text" placeholder="Poste (ex: Directeur, Agent...)" value={nouveauMembre.poste} onChange={(e) => setNouveauMembre({ ...nouveauMembre, poste: e.target.value })} className={inputCls} />
          <textarea placeholder="Description courte (optionnel)" rows={2} value={nouveauMembre.description} onChange={(e) => setNouveauMembre({ ...nouveauMembre, description: e.target.value })} className={`${inputCls} resize-none`} />
          <input type="text" placeholder="WhatsApp (sans +, ex: 243997220295)" value={nouveauMembre.whatsapp} onChange={(e) => setNouveauMembre({ ...nouveauMembre, whatsapp: e.target.value })} className={inputCls} />
          <input type="file" accept="image/*" onChange={(e) => setPhotoMembre(e.target.files?.[0] || null)} className="w-full text-sm text-[var(--text)]/60 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[var(--gold)]/20 file:text-[var(--gold)]" />
          <button onClick={async () => {
            if (!nouveauMembre.nom.trim() || !photoMembre) { alert("Nom et photo requis"); return; }
            setUploadingImage(true);
            try {
              const photo = await uploadImage(photoMembre, nouveauMembre.nom, "equipe");
              setEquipe([...equipe, {
                nom: nouveauMembre.nom.trim(),
                poste: nouveauMembre.poste.trim(),
                description: nouveauMembre.description.trim(),
                whatsapp: nouveauMembre.whatsapp.trim(),
                photo,
              }]);
              setNouveauMembre({ nom: "", poste: "", description: "", whatsapp: "" }); setPhotoMembre(null);
            } catch (e) { alert(e instanceof Error ? e.message : "Erreur"); }
            finally { setUploadingImage(false); }
          }} disabled={uploadingImage} className="w-full px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] text-sm font-semibold disabled:opacity-50">
            {uploadingImage ? "Upload..." : "+ Ajouter un membre"}
          </button>
        </div>

        <button onClick={sauvegarderApropos} disabled={savingApropos}
          className="w-full py-3 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 disabled:opacity-50">
          {savingApropos ? "Sauvegarde..." : savedApropos ? "✅ Page À propos sauvegardée !" : "Sauvegarder la page À propos"}
        </button>
      </Section>

      {/* Informations établissement */}
      <Section titre="Informations de l'établissement">
        <div className="space-y-4">
          <Champ cle="nom_etablissement" label="Nom complet" />
          <Champ cle="marque" label="Marque" />
          <Champ cle="tagline" label="Tagline" />
          <Champ cle="adresse" label="Adresse" />
          <Champ cle="email_contact" label="Email de contact" type="email" />
          <Champ cle="telephone_1" label="Téléphone 1" />
          <Champ cle="telephone_2" label="Téléphone 2" />
          <Champ cle="telephone_3" label="Téléphone 3" />
          <Champ cle="whatsapp" label="Numéro WhatsApp (sans +)" />
        </div>
      </Section>

      {/* Informations créateur */}
      <Section titre="Informations créateur">
        <div className="space-y-4">
          <Champ cle="createur_nom" label="Nom du créateur" />
          <Champ cle="createur_email" label="Email créateur" type="email" />
          <Champ cle="createur_whatsapp" label="WhatsApp créateur (sans +)" />
          <Champ cle="createur_domaine" label="Domaine d'activité" />
        </div>
      </Section>

      {/* Changer mot de passe */}
      <Section titre="Changer le mot de passe">
        {mdpStatus === "ok" ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-medium">✅ Mot de passe changé avec succès !</p>
          </div>
        ) : (
          <form onSubmit={changerMdp} className="space-y-4">
            {[
              { label: "Ancien mot de passe", key: "ancien" },
              { label: "Nouveau mot de passe (min. 8 caractères)", key: "nouveau" },
              { label: "Confirmer le nouveau mot de passe", key: "confirmation" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">{label}</label>
                <input type="password" required value={(mdp as any)[key]} onChange={(e) => setMdp({ ...mdp, [key]: e.target.value })} className={inputCls} />
              </div>
            ))}
            {mdpErreur && <p className="text-red-400 text-sm">{mdpErreur}</p>}
            <button type="submit" disabled={mdpStatus === "loading"}
              className="px-6 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 disabled:opacity-50">
              {mdpStatus === "loading" ? "Changement..." : "Changer le mot de passe"}
            </button>
          </form>
        )}
      </Section>
    </div>
  );
}

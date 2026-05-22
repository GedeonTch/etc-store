"use client";

import { useState } from "react";

interface Props { parametres: Record<string, string> }

export default function ParametresClient({ parametres: init }: Props) {
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

  const sauvegarderParam = async (cle: string) => {
    setSaving(cle);
    await fetch("/api/parametres", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cle, valeur: params[cle] || "" }) });
    setSaving(null);
    setSaved(cle);
    setTimeout(() => setSaved(null), 2000);
  };

  const ajouterCategorie = async () => {
    const val = nouvelleCategorie.trim();
    if (!val || !nouvelleImage || categories.some(c => c.nom === val)) {
      alert("Remplis le nom et choisis une image");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", nouvelleImage);
      formData.append("nomCategorie", val);

      const res = await fetch("/api/upload-categorie", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload échoué");
      const { imagePath } = await res.json();

      setCategories([...categories, { nom: val, image: imagePath }]);
      setNouvelleCategorie("");
      setNouvelleImage(null);
      setSavedCats(false);
      alert("✅ Catégorie ajoutée ! N'oublie pas de sauvegarder.");
    } catch (err) {
      alert("❌ Erreur lors de l'upload: " + (err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setUploadingImage(false);
    }
  };

  const supprimerCategorie = (i: number) => {
    setCategories(categories.filter((_, j) => j !== i));
    setSavedCats(false);
  };

  const modifierImageCategorie = async (i: number) => {
    if (!editImage) {
      alert("Choisis une image");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", editImage);
      formData.append("nomCategorie", categories[i].nom);

      const res = await fetch("/api/upload-categorie", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload échoué");
      const { imagePath } = await res.json();

      const newCats = [...categories];
      newCats[i].image = imagePath;
      setCategories(newCats);
      setEditingIndex(null);
      setEditImage(null);
      setSavedCats(false);
      alert("✅ Image modifiée ! N'oublie pas de sauvegarder.");
    } catch (err) {
      alert("❌ Erreur lors de l'upload: " + (err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setUploadingImage(false);
    }
  };

  const monterCategorie = (i: number) => {
    if (i === 0) return;
    const arr = [...categories];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setCategories(arr);
    setSavedCats(false);
  };

  const descendreCategorie = (i: number) => {
    if (i === categories.length - 1) return;
    const arr = [...categories];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    setCategories(arr);
    setSavedCats(false);
  };

  const sauvegarderCategories = async () => {
    setSavingCats(true);
    await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cle: "categories", valeur: JSON.stringify(categories) }),
    });
    setSavingCats(false);
    setSavedCats(true);
    setTimeout(() => setSavedCats(false), 3000);
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
        <button onClick={sauvegarderCategories} disabled={savingCats}
          className="w-full py-3 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
          {savingCats ? "Sauvegarde..." : savedCats ? "✅ Catégories sauvegardées !" : "Sauvegarder les catégories"}
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

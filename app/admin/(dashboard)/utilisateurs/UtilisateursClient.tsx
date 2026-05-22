"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

const ROLES = ["SUPER_ADMIN", "ADJOINT", "MEMBRE"];
const FORM_VIDE = { nom: "", email: "", motDePasse: "", role: "MEMBRE", photo: null as File | null };

export default function UtilisateursClient({ users: init }: { users: any[] }) {
  const [users, setUsers] = useState(init);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [modal, setModal] = useState<"creer" | "modifier" | null>(null);
  const [userEdite, setUserEdite] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...FORM_VIDE });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");
  const [exporting, setExporting] = useState(false);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return users.filter((u) => {
      const matchSearch = u.nom.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      const matchRole = !roleFilter || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const ouvrirCreer = () => {
    setForm({ ...FORM_VIDE });
    setUserEdite(null);
    setPhotoPreview(null);
    setErreur("");
    setModal("creer");
  };

  const ouvrirModifier = (u: any) => {
    setForm({ nom: u.nom, email: u.email, motDePasse: "", role: u.role, photo: null });
    setUserEdite(u);
    setPhotoPreview(u.photo || null);
    setErreur("");
    setModal("modifier");
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file });
      // Aperçu immédiat
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Compresser une image via canvas (max 400px pour les avatars)
  const compresserImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        const maxW = 400;
        let { width, height } = img;
        if (width > maxW) { height = Math.round((height * maxW) / width); width = maxW; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg", 0.7
        );
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
      img.src = objectUrl;
    });
  };

  const sauvegarder = async () => {
    const isAdmin = form.role === "SUPER_ADMIN" || form.role === "ADJOINT";
    if (modal === "creer" && isAdmin && !form.photo) {
      setErreur("Photo obligatoire pour les admins/adjoints");
      return;
    }

    setSaving(true);
    setErreur("");

    try {
      // Étape 1 : uploader la photo si présente (via /api/upload)
      let photoUrl: string | null = userEdite?.photo || null;

      if (form.photo instanceof File) {
        const compresse = await compresserImage(form.photo);
        const fd = new FormData();
        fd.append("file", compresse);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          photoUrl = uploadData.url;
        } else {
          setErreur(uploadData.error || "Erreur lors de l'upload de la photo");
          setSaving(false);
          return;
        }
      }

      // Étape 2 : sauvegarder l'utilisateur avec l'URL de la photo (body JSON léger)
      const body: Record<string, unknown> = {
        nom: form.nom,
        email: form.email,
        role: form.role,
      };
      if (form.motDePasse) body.motDePasse = form.motDePasse;
      if (photoUrl) body.photo = photoUrl;

      const url = modal === "modifier"
        ? `/api/admin/utilisateurs/${userEdite?.id}`
        : "/api/admin/utilisateurs";

      const res = await fetch(url, {
        method: modal === "modifier" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const user = await res.json();
        // Inclure la photo dans le state local
        const userComplet = { ...user, photo: photoUrl };
        setUsers((prev) =>
          modal === "modifier"
            ? prev.map((u) => u.id === user.id ? { ...u, ...userComplet } : u)
            : [userComplet, ...prev]
        );
        setModal(null);
      } else {
        const data = await res.json();
        setErreur(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (e) {
      console.error(e);
      setErreur("Erreur réseau. Vérifiez votre connexion.");
    }

    setSaving(false);
  };

  const supprimer = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const res = await fetch(`/api/admin/utilisateurs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de la suppression");
    }
  };

  const exportUsers = (format: "csv" | "json") => {
    setExporting(true);
    try {
      const rows = filteredUsers.map((u) => ({
        Nom: u.nom,
        Email: u.email,
        Role: u.role,
        CreeLe: formatDate(u.creeLe),
        MotDePasseChange: u.motDePasseChange ? "Oui" : "Non",
      }));

      let blob: Blob;
      let filename = `utilisateurs-${new Date().toISOString().split("T")[0]}`;

      if (format === "csv") {
        const header = ["Nom", "Email", "Rôle", "Créé le", "Mdp changé"];
        const csv = [
          header.join(";"),
          ...rows.map((row) =>
            [row.Nom, row.Email, row.Role, row.CreeLe, row.MotDePasseChange]
              .map((value) => `"${String(value).replace(/"/g, '""')}"`)
              .join(";")
          ),
        ].join("\n");
        blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        filename += ".csv";
      } else {
        blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
        filename += ".json";
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const badgeRole = (role: string) => {
    const styles: Record<string, string> = {
      SUPER_ADMIN: "bg-[var(--gold)]/20 text-[var(--gold)]",
      ADJOINT: "bg-blue-950/40 text-blue-400",
      MEMBRE: "bg-[var(--bg)] text-[var(--text)]/50",
    };
    return `text-xs px-2.5 py-1 rounded-full font-medium ${styles[role] || ""}`;
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--gold)]";

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[var(--text)]">Utilisateurs</h1>
          <p className="text-[var(--text)]/40 text-sm mt-0.5">{filteredUsers.length} compte(s) affiché(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportUsers("csv")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold text-sm hover:border-[var(--gold)] transition-colors disabled:opacity-50"
          >
            📥 CSV
          </button>
          <button
            onClick={() => exportUsers("json")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold text-sm hover:border-[var(--gold)] transition-colors disabled:opacity-50"
          >
            📄 JSON
          </button>
          <button
            onClick={ouvrirCreer}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90"
          >
            + Ajouter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text)]/50 focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Nom', 'Email', 'Rôle', 'Créé le', 'Mdp changé', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-[var(--text)]/40 uppercase tracking-wide font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text)]/40">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{u.nom}</td>
                  <td className="px-4 py-3 text-[var(--text)]/60">{u.email}</td>
                  <td className="px-4 py-3"><span className={badgeRole(u.role)}>{u.role}</span></td>
                  <td className="px-4 py-3 text-[var(--text)]/40 text-xs">{formatDate(u.creeLe)}</td>
                  <td className="px-4 py-3">
                    {u.motDePasseChange ? (
                      <span className="text-green-400 text-xs">✅ Oui</span>
                    ) : (
                      <span className="text-amber-400 text-xs">⚠️ Non</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => ouvrirModifier(u)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--gold)] transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => supprimer(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-800/40 text-xs text-red-400 hover:bg-red-950/50 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-playfair text-xl font-bold text-[var(--text)]">
                  {modal === "creer" ? "Nouvel utilisateur" : "Modifier"}
                </h2>
                <button onClick={() => setModal(null)} className="text-[var(--text)]/40 hover:text-[var(--text)] text-xl">
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Nom", key: "nom", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  {
                    label: modal === "modifier" ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe",
                    key: "motDePasse",
                    type: "password",
                  },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">{label}</label>
                    <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                  </div>
                ))}

                <div>
                  <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Rôle</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">
                    Photo {(form.role === "SUPER_ADMIN" || form.role === "ADJOINT") && modal === "creer" ? "*" : "(optionnelle)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className={`${inputCls} cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--gold)]/20 file:text-[var(--gold)]`}
                  />
                  {photoPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-[var(--border)]" />
                      <span className="text-xs text-[var(--text)]/50">Aperçu photo</span>
                    </div>
                  )}
                </div>

                {erreur && <p className="text-red-400 text-sm">{erreur}</p>}
              </div>

              <div className="p-6 border-t border-[var(--border)] flex gap-3 justify-end">
                <button
                  onClick={() => setModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] text-sm hover:border-[var(--gold)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={sauvegarder}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                >
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

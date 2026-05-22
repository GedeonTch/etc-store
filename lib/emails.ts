// Service d'envoi d'emails via Resend — ETCH Store

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "etsTchibanvunya@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@etch-store.com";

// ─── Template HTML de base ────────────────────────────────────
function templateBase(titre: string, contenu: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body{font-family:Inter,Arial,sans-serif;background:#0A0A0A;color:#F5F0E8;margin:0;padding:0}
    .wrap{max-width:600px;margin:0 auto;padding:40px 20px}
    .hdr{text-align:center;border-bottom:1px solid #C9A84C;padding-bottom:20px;margin-bottom:30px}
    .logo{font-size:32px;font-weight:bold;color:#C9A84C;letter-spacing:4px}
    .tag{color:#888;font-size:12px;margin-top:4px}
    .title{font-size:22px;font-weight:bold;color:#C9A84C;margin-bottom:20px}
    .card{background:#111;border:1px solid #1E1E1E;border-radius:8px;padding:24px;margin-bottom:20px}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1E1E1E}
    .lbl{color:#888;font-size:13px}
    .val{color:#F5F0E8;font-size:13px;font-weight:500}
    .ftr{text-align:center;color:#555;font-size:11px;margin-top:30px}
    .badge-danger{background:#7f1d1d;color:#fca5a5;padding:4px 10px;border-radius:4px;font-size:12px}
    .badge-ok{background:#14532d;color:#86efac;padding:4px 10px;border-radius:4px;font-size:12px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="logo">ETCH</div>
      <div class="tag">L'Europe à votre portée</div>
    </div>
    <div class="title">${titre}</div>
    ${contenu}
    <div class="ftr">ÉTABLISSEMENT TCHIBANVUNYA — Bukavu, Sud-Kivu, RDC<br>Email généré automatiquement.</div>
  </div>
</body>
</html>`;
}

// ─── 1. Message client reçu ───────────────────────────────────
export async function envoyerEmailMessageClient(data: {
  nomClient: string;
  emailClient: string;
  telephone?: string;
  produitTitre?: string;
  contenu: string;
}) {
  const contenu = `
    <div class="card">
      <div class="row"><span class="lbl">Nom</span><span class="val">${data.nomClient}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${data.emailClient}</span></div>
      ${data.telephone ? `<div class="row"><span class="lbl">Téléphone</span><span class="val">${data.telephone}</span></div>` : ""}
      ${data.produitTitre ? `<div class="row"><span class="lbl">Produit</span><span class="val">${data.produitTitre}</span></div>` : ""}
    </div>
    <div class="card">
      <div class="lbl" style="margin-bottom:10px">Message :</div>
      <div style="line-height:1.6">${data.contenu.replace(/\n/g, "<br>")}</div>
    </div>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `📩 Nouveau message de ${data.nomClient} — ETCH`,
    html: templateBase("Nouveau message client", contenu),
  });
}

// ─── 2. Connexion admin réussie ───────────────────────────────
export async function envoyerEmailConnexionReussie(
  nom: string,
  role: string,
  ip: string,
  userAgent: string
) {
  const contenu = `
    <div class="card">
      <div class="row"><span class="lbl">Utilisateur</span><span class="val">${nom}</span></div>
      <div class="row"><span class="lbl">Rôle</span><span class="val">${role}</span></div>
      <div class="row"><span class="lbl">Heure</span><span class="val">${new Date().toLocaleString("fr-FR")}</span></div>
      <div class="row"><span class="lbl">IP</span><span class="val">${ip}</span></div>
      <div class="row"><span class="lbl">Navigateur</span><span class="val">${userAgent.substring(0, 80)}</span></div>
    </div>
    <p style="color:#86efac">✅ Connexion réussie au panneau d'administration.</p>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `✅ Connexion admin — ${nom}`,
    html: templateBase("Connexion admin réussie", contenu),
  });
}

// ─── 3. Tentative de connexion échouée ────────────────────────
export async function envoyerEmailTentativeEchouee(
  emailTente: string,
  ip: string,
  nbTentatives: number
) {
  const contenu = `
    <div class="card">
      <div class="row"><span class="lbl">Email tenté</span><span class="val">${emailTente}</span></div>
      <div class="row"><span class="lbl">IP</span><span class="val">${ip}</span></div>
      <div class="row"><span class="lbl">Heure</span><span class="val">${new Date().toLocaleString("fr-FR")}</span></div>
      <div class="row"><span class="lbl">Tentatives</span><span class="val"><span class="badge-danger">${nbTentatives} / 5</span></span></div>
    </div>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `⚠️ Tentative échouée (${nbTentatives}/5) — ETCH Admin`,
    html: templateBase("Tentative de connexion échouée", contenu),
  });
}

// ─── 4. IP bloquée ────────────────────────────────────────────
export async function envoyerEmailIPBloquee(
  ip: string,
  emailTente: string,
  nbTentatives: number
) {
  const contenu = `
    <div class="card">
      <div class="row"><span class="lbl">IP bloquée</span><span class="val"><span class="badge-danger">${ip}</span></span></div>
      <div class="row"><span class="lbl">Email tenté</span><span class="val">${emailTente}</span></div>
      <div class="row"><span class="lbl">Heure</span><span class="val">${new Date().toLocaleString("fr-FR")}</span></div>
      <div class="row"><span class="lbl">Tentatives</span><span class="val">${nbTentatives}</span></div>
      <div class="row"><span class="lbl">Durée blocage</span><span class="val">30 minutes</span></div>
    </div>
    <p style="color:#fca5a5">🚫 IP bloquée automatiquement pendant 30 minutes.</p>
    <p>Déblocage manuel possible depuis le panneau admin → Logs.</p>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🚫 IP bloquée : ${ip} — ETCH Admin`,
    html: templateBase("IP bloquée — Tentatives excessives", contenu),
  });
}

// ─── 5. Produit remis en stock ────────────────────────────────
export async function envoyerEmailRemiseEnStock(
  emailClient: string,
  produitTitre: string,
  produitId: string
) {
  const url = `${process.env.NEXTAUTH_URL}/produit/${produitId}`;
  const contenu = `
    <div class="card">
      <p>Bonne nouvelle ! Le produit que vous attendiez est de nouveau disponible :</p>
      <div style="text-align:center;margin:20px 0;font-size:20px;font-weight:bold;color:#C9A84C">${produitTitre}</div>
      <div style="text-align:center">
        <a href="${url}" style="background:#C9A84C;color:#0A0A0A;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
          Voir le produit →
        </a>
      </div>
    </div>
    <p style="color:#888;font-size:12px;text-align:center">
      Vous recevez cet email car vous avez demandé à être averti(e) de la disponibilité de ce produit.
    </p>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: emailClient,
    subject: `✅ "${produitTitre}" est disponible — ETCH`,
    html: templateBase("Produit disponible !", contenu),
  });
}

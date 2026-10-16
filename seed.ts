// Seed Prisma — ETCH Store
// Crée le compte SUPER_ADMIN initial, les paramètres par défaut
// et tous les produits du catalogue

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed...");

  // ─── Compte SUPER_ADMIN initial ───────────────────────────
  const hash = await bcrypt.hash("ADMIN123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "etstchibanvunya@gmail.com" },
    update: {
      motDePasse: hash,
      role: Role.SUPER_ADMIN,
      motDePasseChange: false,
    },
    create: {
      nom: "Administrateur ETCH",
      email: "etstchibanvunya@gmail.com",
      motDePasse: hash,
      role: Role.SUPER_ADMIN,
      motDePasseChange: false,
    },
  });

  console.log(`✅ Admin créé/mis à jour : ${admin.email} (rôle: ${admin.role})`);

  // ─── Paramètres par défaut ────────────────────────────────
  const parametres = [
    { cle: "taux_usd_cdf", valeur: "2800" },
    { cle: "nom_etablissement", valeur: "ÉTABLISSEMENT TCHIBANVUNYA" },
    { cle: "marque", valeur: "ETCH" },
    { cle: "tagline", valeur: "L'Europe à votre portée" },
    {
      cle: "adresse",
      valeur:
        "Avenue Patrice Emery Lumumba, Quartier Labotte, Bukavu, Sud-Kivu — en diagonale de l'Ecobank",
    },
    { cle: "email_contact", valeur: "etsTchibanvunya@gmail.com" },
    { cle: "telephone_1", valeur: "+243 997 220 295" },
    { cle: "telephone_2", valeur: "+243 853 792 399" },
    { cle: "telephone_3", valeur: "+243 97 625 4832" },
    { cle: "whatsapp", valeur: "25766504165" },
    {
      cle: "categories",
      valeur: JSON.stringify([
        { nom: "Chaises & Fauteuils", image: "/categories/chaises-fauteuils.svg" },
        { nom: "Écrans plats", image: "/categories/ecrans-plats.svg" },
        { nom: "Radios modernes", image: "/categories/radios-modernes.svg" },
        { nom: "Téléphones", image: "/categories/telephones.svg" },
        { nom: "Écouteurs modernes", image: "/categories/ecouteurs-modernes.svg" },
        { nom: "Chaussures hommes", image: "/categories/chaussures-hommes.jpg" },
        { nom: "Tables modernes", image: "/categories/tables-modernes.svg" },
        { nom: "Salons complets", image: "/categories/salons-complets.svg" },
        { nom: "Valises", image: "/categories/valises.svg" },
        { nom: "Divers", image: "/categories/divers.svg" },
      ]),
    },
    { cle: "createur_nom", valeur: "Tchibanvunya Gedeon" },
    { cle: "createur_email", valeur: "tchibanvunyagedeon@gmail.com" },
    { cle: "createur_whatsapp", valeur: "25779640420" },
    { cle: "createur_domaine", valeur: "IT — Développement & Cybersécurité" },
  ];

  for (const p of parametres) {
    await prisma.parametre.upsert({
      where: { cle: p.cle },
      update: {},
      create: p,
    });
  }

  console.log(`✅ ${parametres.length} paramètres créés`);

  // ─── Produits du catalogue ────────────────────────────────
  const produits = [
    // ── CHAUSSURES HOMMES ──
    {
      titre: "Bugatti Derby Cognac Texturé",
      description:
        "Chaussure de ville élégante en cuir cognac avec motif texturé discret. Lacets bleu marine, semelle classique. Importée d'Europe, état très bon. Idéale pour le bureau et les soirées formelles.",
      prixUSD: 18,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Skechers Court Sneaker Camel",
      description:
        "Sneaker casual premium en cuir synthétique camel avec semelle épaisse blanche. Détails marine au talon. Confort quotidien avec style moderne. Importée d'Europe.",
      prixUSD: 15,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "PUER Brogue Derby Marron",
      description:
        "Derby brogue artisanal en cuir marron foncé. Découpes décoratives wingtip traditionnelles. Style britannique classique. Bon état, importé d'Europe.",
      prixUSD: 12,
      etat: "Bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Clarks Derby Noir Lisse",
      description:
        "Derby sobre et épuré en cuir noir lisse. Bout pointu élégant, semelle confort Clarks. Polyvalent — bureau, cérémonie, soirée. Très bon état, importé d'Europe.",
      prixUSD: 20,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Bugatti Derby Noir Texturé",
      description:
        "Derby cuir noir avec micro-texture raffinée. Signature Bugatti discrète sur le côté. Allure professionnelle et distinguée. Très bon état, importé d'Europe.",
      prixUSD: 18,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Penny Loafer Noir Classique",
      description:
        "Mocassin penny loafer en cuir noir brillant. Sans lacets, facile à enfiler. Style américain intemporel, très tendance. Très bon état, importé d'Europe.",
      prixUSD: 16,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Penny Loafer Camel Premium",
      description:
        "Mocassin penny loafer en cuir camel chaud. Semelle noire contrastée. Élégance décontractée, parfait avec jean ou pantalon chino. Très bon état, importé d'Europe.",
      prixUSD: 16,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Mocassin Slip-On Cognac",
      description:
        "Mocassin sans lacets en cuir cognac lisse. Coupe épurée minimaliste. Confort maximal pour usage quotidien et professionnel. Bon état, importé d'Europe.",
      prixUSD: 13,
      etat: "Bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Bugatti Cap-Toe Derby Cognac",
      description:
        "Derby cap-toe en cuir cognac avec lacets bleu marine. Bout renforcé cousu, détail texturé sur l'empeigne. Finition Bugatti haut de gamme. Très bon état, importé d'Europe.",
      prixUSD: 19,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Clarks Cap-Toe Derby Marron",
      description:
        "Derby cap-toe Clarks en cuir marron chaud. Bout carré légèrement arrondi, semelle technologie confort. Robustesse et élégance réunies. Très bon état, importé d'Europe.",
      prixUSD: 20,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Bugatti Derby Noir Premium",
      description:
        "Derby cuir noir premium signature Bugatti. Micro-texture subtile sur toute la tige. Chaussure de cérémonie et business haut de gamme. Très bon état, importé d'Europe.",
      prixUSD: 19,
      etat: "Très bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Chelsea Boot Camel Vintage",
      description:
        "Boot Chelsea en cuir camel effet vieilli. Élastiques latéraux pour enfiler facile. Style urbain tendance, compatible tenue casual et semi-formelle. Bon état, importé d'Europe.",
      prixUSD: 17,
      etat: "Bon état",
      categorie: "Chaussures hommes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── ÉCRANS PLATS ──
    {
      titre: "Support Mural TV Fixe (37\"-85\")",
      description:
        "Support mural universel robuste, charge max 80kg. Compatible tous écrans plats. Installation facile, câbles intégrés.",
      prixUSD: 12,
      etat: "Très bon état",
      categorie: "Écrans plats",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Smart TV Android 40\"",
      description:
        "Écran Full HD 40 pouces, Android TV intégré. YouTube, Netflix, Google Play. WiFi inclus, télécommande vocale.",
      prixUSD: 85,
      etat: "Très bon état",
      categorie: "Écrans plats",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Samsung UHD 4K 50\"",
      description:
        "Télévision Samsung 50 pouces Ultra HD 4K. Couleurs vives, son puissant. Très bon état, importée d'Europe.",
      prixUSD: 130,
      etat: "Très bon état",
      categorie: "Écrans plats",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Samsung Smart TV 32\" HD",
      description:
        "Samsung 32 pouces HD Smart TV. Interface Rakuten TV, accès streaming direct. Compacte, idéale chambre ou bureau.",
      prixUSD: 65,
      etat: "Très bon état",
      categorie: "Écrans plats",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Samsung QLED 4K 55\" (2023)",
      description:
        "Samsung Q70C QLED 55 pouces, 4K Ultra HD. Technologie Quantum Dot, couleurs exceptionnelles. Modèle 2023 haut de gamme.",
      prixUSD: 280,
      etat: "Très bon état",
      categorie: "Écrans plats",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Support Mural TV Orientable Bras Articulé",
      description:
        "Support mural TV bras double articulé. Inclinable, pivotant 180°. Compatible 26\"-55\", charge 40kg. Très bon état.",
      prixUSD: 15,
      etat: "Très bon état",
      categorie: "Écrans plats",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── SALONS COMPLETS ──
    {
      titre: "Ensemble Salon Chêne Naturel",
      description:
        "Ensemble salon moderne bois chêne naturel. Meuble TV bas + buffet latéral assorti. Style scandinave élégant, très bon état.",
      prixUSD: 95,
      etat: "Très bon état",
      categorie: "Salons complets",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Salon Rotin Naturel 4 Pièces",
      description:
        "Canapé + 2 fauteuils + table basse en rotin naturel. Coussins blancs inclus. Style colonial chic. Très bon état.",
      prixUSD: 110,
      etat: "Très bon état",
      categorie: "Salons complets",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Salon Résine Tressée Noire 4 Pièces",
      description:
        "Canapé + 2 fauteuils + table verre en résine tressée noire. Coussins gris inclus. Intérieur/extérieur. Très bon état.",
      prixUSD: 90,
      etat: "Très bon état",
      categorie: "Salons complets",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Salon Rotin Clair 3 Pièces + Table",
      description:
        "Canapé d'angle + pouf + table verre en rotin naturel clair. Coussins blancs. Style bohème chic. Très bon état.",
      prixUSD: 95,
      etat: "Très bon état",
      categorie: "Salons complets",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Salon Bois Acacia + Corde 4 Pièces",
      description:
        "Canapé 3 places + fauteuil + 2 tables basses. Bois acacia massif, tressage corde. Coussins gris. Haut de gamme.",
      prixUSD: 180,
      etat: "Très bon état",
      categorie: "Salons complets",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Salon Résine Tressée Gris/Anthracite 4 Pièces",
      description:
        "Canapé 3 places + 2 fauteuils + table basse. Résine tressée anthracite, coussins gris. Très bon état.",
      prixUSD: 100,
      etat: "Très bon état",
      categorie: "Salons complets",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── CHAISES & FAUTEUILS ──
    {
      titre: "Housse Fauteuil Oreilles Gris",
      description:
        "Housse stretch élastique avec jupe. Protège et relooке votre fauteuil. Facile à poser, lavable. Très bon état.",
      prixUSD: 8,
      etat: "Très bon état",
      categorie: "Chaises & Fauteuils",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Fauteuil Chesterfield Cuir Camel",
      description:
        "Fauteuil capitonné cuir marron camel. Pieds bois noirs, style britannique. Confortable et élégant. Très bon état.",
      prixUSD: 65,
      etat: "Très bon état",
      categorie: "Chaises & Fauteuils",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Chaise Gaming Noir Repose-Pieds",
      description:
        "Siège gaming ergonomique noir. Repose-pieds rétractable, appuie-tête, lombaire. Idéal bureau ou gaming. Très bon état.",
      prixUSD: 55,
      etat: "Très bon état",
      categorie: "Chaises & Fauteuils",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Fauteuil Relax Beige Repose-Tête",
      description:
        "Fauteuil relax inclinable beige crème. Accoudoirs larges, repose-tête ajustable. Ultra confortable. Très bon état.",
      prixUSD: 75,
      etat: "Très bon état",
      categorie: "Chaises & Fauteuils",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Set Bistrot Pliant Blanc 3 Pièces",
      description:
        "Table ronde + 2 chaises pliantes métal blanc. Compact, idéal terrasse ou balcon. Facile à ranger. Très bon état.",
      prixUSD: 28,
      etat: "Très bon état",
      categorie: "Chaises & Fauteuils",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Set Bistrot Fonte Motif Roses 3 Pièces",
      description:
        "Table ronde + 2 chaises fonte bronze motifs floraux. Style vintage élégant, très décoratif. Très bon état.",
      prixUSD: 45,
      etat: "Très bon état",
      categorie: "Chaises & Fauteuils",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── TABLES MODERNES ──
    {
      titre: "Table à Manger Bois Noyer + Métal",
      description:
        "Table rectangulaire style industriel. Plateau bois noyer, pieds métal noir. 4-6 personnes. Très bon état.",
      prixUSD: 55,
      etat: "Très bon état",
      categorie: "Tables modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Ensemble Jardin Plastique Anthracite 9 Pièces",
      description:
        "Grande table + 8 chaises résine anthracite. Résistant intempéries, léger. Idéal extérieur. Très bon état.",
      prixUSD: 85,
      etat: "Très bon état",
      categorie: "Tables modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Table Basse LED Blanc Laqué",
      description:
        "Table basse moderne blanc laqué avec éclairage LED RGB. 2 tiroirs de rangement. Effet luxe garanti. Très bon état.",
      prixUSD: 60,
      etat: "Très bon état",
      categorie: "Tables modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Tables Basses Gigognes Dorées Verre",
      description:
        "Duo tables basses rondes emboîtables. Structure dorée, plateau verre transparent. Design luxe moderne. Très bon état.",
      prixUSD: 45,
      etat: "Très bon état",
      categorie: "Tables modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Ensemble Repas Modulable 5 Pièces",
      description:
        "Table + banquette angle + 2 poufs. Structure métal, plateau bois. Design industriel moderne. Très bon état.",
      prixUSD: 120,
      etat: "Très bon état",
      categorie: "Tables modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── VALISES ──
    {
      titre: "American Tourister Summerfunk 77cm Noir",
      description:
        "Grande valise souple 4 roues pivotantes. Légère, résistante, poignée télescopique. Importée d'Europe, très bon état.",
      prixUSD: 35,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "American Tourister Soundbox 67cm Noir",
      description:
        "Coque rigide ondulée ultra-résistante. 4 roues 360°, fermeture TSA. Style moderne premium. Très bon état.",
      prixUSD: 40,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Set 4 Valises Rigides Rose Fuchsia",
      description:
        "Ensemble complet : vanity + cabine + moyen + grand. Coque ABS rigide, 4 roues. Parfait pour toute la famille.",
      prixUSD: 75,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Hauptstadtkoffer Alex 75cm Bleu Marine",
      description:
        "Grande valise rigide allemande 75cm. Coque brillante robuste, 8 roues silencieuses. Très bon état, importée d'Europe.",
      prixUSD: 38,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Samsonite Intuo 77cm Jaune",
      description:
        "Grande valise Samsonite coque rigide jaune vif. 4 roues doubles silencieuses, serrure TSA intégrée. Haut de gamme.",
      prixUSD: 55,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Wenger Syber Cabine 55cm Noir",
      description:
        "Valise cabine rigide Wenger Swiss. 8 roues multidirectionnelles, design élégant nervuré. Compacte, avion compatible.",
      prixUSD: 45,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "AmazonBasics 68cm Bleu Navy",
      description:
        "Valise rigide milieu de gamme 68cm. 4 roues pivotantes, cadenas intégré. Rapport qualité/prix excellent.",
      prixUSD: 30,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Hauptstadtkoffer Alex 75cm Doré",
      description:
        "Grande valise rigide allemande coloris doré/champagne. 8 roues silencieuses, coque brillante. Élégante et robuste.",
      prixUSD: 38,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "AmazonBasics 68cm Orange",
      description:
        "Valise rigide coloris orange vif, facile à repérer sur le tapis. 4 roues 360°, très bon état, importée d'Europe.",
      prixUSD: 30,
      etat: "Très bon état",
      categorie: "Valises",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── TÉLÉPHONES ──
    {
      titre: "iPhone 11 Pro — 64/256GB",
      description:
        "Triple caméra 12MP, écran Super Retina XDR 5.8\". Disponible vert, argent, gris, or. Très bon état, importé d'Europe.",
      prixUSD: 120,
      etat: "Très bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Nokia 225 4G",
      description:
        "Téléphone classique robuste, 4G, autonomie exceptionnelle. Idéal appels et SMS. Léger, fiable, bon état.",
      prixUSD: 18,
      etat: "Bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Samsung Galaxy A57 5G + Chargeur",
      description:
        "Écran 6.5\" FHD+, triple caméra, 5G. Chargeur original inclus. Très bon état, importé d'Europe.",
      prixUSD: 95,
      etat: "Très bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Samsung Galaxy S26 Ultra + Chargeur",
      description:
        "Flagship Samsung dernier cri. S-Pen intégré, quadruple caméra, écran Dynamic AMOLED. Chargeur inclus. État neuf.",
      prixUSD: 320,
      etat: "Très bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Hammer Energy 2 — Téléphone Incassable",
      description:
        "Téléphone ultra-résistant militaire IP68. Anti-choc, anti-eau, anti-poussière. Torche intégrée, batterie longue durée.",
      prixUSD: 25,
      etat: "Bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "iPhone XS — Or",
      description:
        "Écran Super AMOLED 5.8\", double caméra 12MP, Face ID. Coloris or élégant. Très bon état, importé d'Europe.",
      prixUSD: 95,
      etat: "Très bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Blackview A96 — 16GB RAM / 64GB",
      description:
        "Smartphone Android 16, 16GB RAM, 64GB ROM. Triple caméra, écran 6.8\". Garantie 3 ans. Coloris orange. Bon état.",
      prixUSD: 45,
      etat: "Bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "iPhone 15 Pro — Titane Bleu",
      description:
        "Le meilleur iPhone disponible. Puce A17 Pro, titane aérospatial, caméra 48MP ProRAW. Très bon état, importé d'Europe.",
      prixUSD: 380,
      etat: "Très bon état",
      categorie: "Téléphones",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },

    // ── ÉCOUTEURS MODERNES ──
    {
      titre: "Bose QuietComfort 45 — Blanc",
      description:
        "Casque Bose premium réduction de bruit active. Bluetooth, 24h autonomie, son cristallin. Coloris blanc. Très bon état.",
      prixUSD: 75,
      etat: "Très bon état",
      categorie: "Écouteurs modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "Bose QuietComfort 45 — Noir",
      description:
        "Casque Bose ANC haut de gamme coloris noir. Confort exceptionnel, micro intégré, pliable. Très bon état.",
      prixUSD: 75,
      etat: "Très bon état",
      categorie: "Écouteurs modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Casque Bluetooth Rose ANC",
      description:
        "Casque sans fil rose avec réduction de bruit. Léger, confortable, 30h autonomie. Idéal musique et appels. Très bon état.",
      prixUSD: 25,
      etat: "Très bon état",
      categorie: "Écouteurs modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Philips TAT3217 True Wireless Noir",
      description:
        "Écouteurs intra-auriculaires Philips TWS. Boîtier de charge compact, Bluetooth 5.1. Son clair et précis. Très bon état.",
      prixUSD: 20,
      etat: "Très bon état",
      categorie: "Écouteurs modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Apple AirPods 2ème Génération",
      description:
        "AirPods Apple originaux avec boîtier de charge. Son Apple signature, connexion iPhone instantanée. Très bon état.",
      prixUSD: 45,
      etat: "Très bon état",
      categorie: "Écouteurs modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Huawei FreeBuds 6i Noir",
      description:
        "Écouteurs Huawei TWS ANC actif. Réduction de bruit intelligente, 35h autonomie avec boîtier. Très bon état.",
      prixUSD: 35,
      etat: "Très bon état",
      categorie: "Écouteurs modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "TOZO NC9 Pro — Affichage LED",
      description:
        "Écouteurs TWS avec boîtier affichage batterie LED. ANC, Bluetooth 5.3, 50h autonomie totale. Très bon état.",
      prixUSD: 22,
      etat: "Très bon état",
      categorie: "Écouteurs modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── RADIOS MODERNES ──
    {
      titre: "JBL PartyBox Club 120",
      description:
        "Enceinte portable JBL 120W. Lumières LED multicolores, Bluetooth, entrée micro. Son puissant pour soirées. Très bon état.",
      prixUSD: 85,
      etat: "Très bon état",
      categorie: "Radios modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: true,
      disponible: true,
    },
    {
      titre: "JBL Partybox Encore",
      description:
        "Enceinte JBL compacte avec éclairage LED anneau. Bluetooth, son 100W. Portable, idéale fêtes et sorties. Très bon état.",
      prixUSD: 65,
      etat: "Très bon état",
      categorie: "Radios modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Enceinte Party Bluetooth Double Haut-Parleur",
      description:
        "Enceinte sono portable double woofer avec LED. Bluetooth, USB, carte SD. Son basse puissant. Bon état.",
      prixUSD: 35,
      etat: "Bon état",
      categorie: "Radios modernes",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },

    // ── DIVERS ──
    {
      titre: "Smartwatch Sport AMOLED Noir/Bleu",
      description:
        "Montre connectée écran AMOLED. GPS, cardiofréquencemètre, météo, multi-sports. 2 bracelets inclus. Très bon état.",
      prixUSD: 30,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Ventilateur Rowenta Silence Force",
      description:
        "Ventilateur de table 40cm Rowenta silencieux. 5 vitesses, télécommande incluse, minuterie. Très bon état.",
      prixUSD: 35,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Plaque Induction Double Ciarra",
      description:
        "Table de cuisson induction double feu. Écran tactile, 2000W, chauffe rapide. Compact et pratique. Très bon état.",
      prixUSD: 40,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Lunettes Solaires Bluetooth",
      description:
        "Lunettes de soleil verres fumés avec enceinte Bluetooth intégrée. Écoute musique en mains libres. Design moderne. Très bon état.",
      prixUSD: 22,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Ours Rose Bear Rouge + Collier",
      description:
        "Ours en roses éternelles rouge 25cm. Collier cœur argenté inclus. Boîte cadeau. Cadeau Saint-Valentin parfait.",
      prixUSD: 20,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Bouquet Roses Artificielles + Vase Doré",
      description:
        "Arrangement floral artificiel roses champagne. Vase métal doré élégant inclus. Déco salon ou chambre. Très bon état.",
      prixUSD: 15,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Tapis Géométrique Bleu/Jaune/Gris",
      description:
        "Tapis contemporain motifs géométriques. Couleurs bleu, jaune, gris. Style scandinave moderne. Très bon état.",
      prixUSD: 20,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
    {
      titre: "Tapis Mandala Oriental Rouge/Or",
      description:
        "Tapis oriental mandala rouge, or et noir. Motifs floraux détaillés. Ambiance chaleureuse et luxueuse. Très bon état.",
      prixUSD: 30,
      etat: "Très bon état",
      categorie: "Divers",
      photos: JSON.stringify([]),
      quantite: 1,
      vedette: false,
      disponible: true,
    },
  ];

  // Insertion avec upsert sur le titre pour éviter les doublons
  let count = 0;
  for (const produit of produits) {
    await prisma.produit.upsert({
      where: { id: produit.titre }, // fallback — voir note ci-dessous
      update: {
        description: produit.description,
        prixUSD: produit.prixUSD,
        etat: produit.etat,
        quantite: produit.quantite,
        vedette: produit.vedette,
        disponible: produit.disponible,
      },
      create: produit,
    });
    count++;
    process.stdout.write(`\r⏳ Produits insérés : ${count}/${produits.length}`);
  }

  console.log(`\n✅ ${count} produits insérés dans le catalogue`);
  console.log("🎉 Seed terminé !");
  console.log("─────────────────────────────────────────");
  console.log("  Email    : etstchibanvunya@gmail.com");
  console.log("  Password : ADMIN123");
  console.log("  ⚠ Changez le mot de passe immédiatement !");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

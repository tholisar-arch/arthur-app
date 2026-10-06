// Lecture des histoires du dossier histoires/ (.json, ou simple .txt) — version web de histoires.py.
"use strict";

const VEHICULES = ["tractopelle", "benne", "toupie", "pompier", "bulldozer", "grue"];
const ACTIONS = ["rouler", "parler", "trou", "feu", "deblayer", "construire", "copains", "manger", "spectacle", "bulles", "calin", "piscine", "cueillir", "chateau", "route", "voler", "fenetres", "cadeau", "velo", "fete", "dormir", "pont", "arbre", "panne", "chercher"];
const estAmi = (k) => k in AMIS_DESSIN; // animaux + tous les personnages (y compris ceux du configurateur)
const INFOS_VEHICULE = {
  tractopelle: ["le tractopelle", "Tracto", "m"], benne: ["le camion benne", "Benny", "m"],
  toupie: ["le camion toupie", "Toupie", "m"], pompier: ["le camion de pompiers", "Pimpon", "m"],
  bulldozer: ["le bulldozer", "Bouldo", "m"], grue: ["la grue", "Grutty", "f"],
};
const COULEUR_FEMININ = { bleu: "bleue", vert: "verte", violet: "violette" };
const CLICS_DEFAUT = { piscine: 4, cueillir: 5, chateau: 3, route: 5, voler: 3, fenetres: 4, cadeau: 1, velo: 3,manger: 3, spectacle: 4, bulles: 4, calin: 3, trou: 4, feu: 4, deblayer: 4, construire: 4, fete: 5, dormir: 4, rouler: 3, parler: 3, pont: 4, arbre: 4, panne: 4, chercher: 3 };
const CONSIGNES = {
  trou: "Clique pour remplir le trou !", feu: "Clique pour arroser le feu !", deblayer: "Clique pour pousser le sable !",
  construire: "Clique pour construire la maison !", copains: "Clique pour appeler les copains !",
  manger: "Clique pour les faire manger !", spectacle: "Clique pour faire sauter les camions !",
  bulles: "Clique pour souffler des bulles !", calin: "Clique pour faire un gros câlin !",
  fete: "Clique pour lancer les feux d'artifice !", dormir: "Clique pour allumer les étoiles !",
  piscine: "Clique pour sauter dans la piscine !", cueillir: "Clique pour ramasser les mûres !",
  chateau: "Clique pour faire un château de sable !", route: "Clique pour poser les pierres !",
  voler: "Clique pour voler plus haut !", fenetres: "Clique pour poser les fenêtres !",
  cadeau: "Clique pour ouvrir le cadeau !", velo: "Clique pour pédaler plus haut !",
  rouler: "Clique pour klaxonner !", parler: "Clique pour klaxonner !",
  pont: "Clique pour poser les planches du pont !", arbre: "Clique pour pousser l'arbre !",
  panne: "Clique pour réparer le camion !", chercher: "Clique sur les buissons pour chercher !",
};
const ALIAS_VEHICULE = [
  ["camions? de pompiers?|pompiers?", "pompier"], ["camions?[- ]bennes?|bennes?", "benne"],
  ["camions?[- ]toupies?|toupies?|betonnieres?", "toupie"], ["bulldozers?|bouldo", "bulldozer"],
  ["grues?|grutty", "grue"], ["tractopelles?|pelleteuses?|tracto", "tractopelle"],
];
const ALIAS_ACTION = {
  deblayer: "deblayer", pousser: "deblayer", sable: "deblayer", remplir: "trou", trou: "trou", feu: "feu",
  incendie: "feu", arroser: "feu", construire: "construire", batir: "construire", copains: "copains", amis: "copains",
  manger: "manger", miam: "manger", repas: "manger", spectacle: "spectacle", show: "spectacle", bulles: "bulles",
  calin: "calin", bisous: "calin", piscine: "piscine", plouf: "piscine", cueillir: "cueillir", ramasser: "cueillir", chateau: "chateau", "bac a sable": "chateau", voler: "voler", envol: "voler", fenetres: "fenetres", portes: "fenetres", cadeau: "cadeau", velo: "velo", fete: "fete", fin: "fete", dormir: "dormir", nuit: "dormir",
  rouler: "rouler", route: "route", pont: "pont", arbre: "arbre", panne: "panne", reparer: "panne", chercher: "chercher", cacher: "chercher", paver: "route", parler: "parler", attendre: "parler",
};
const ALIAS_DECOR = {
  chantier: "chantier", ville: "ville", campagne: "campagne", foret: "foret", bois: "foret", ferme: "ferme", port: "port", bateau: "port", phare: "port",
  dinosaures: "dinosaures", dinosaure: "dinosaures", dinos: "dinosaures", plage: "plage", mer: "plage",
  neige: "neige", montagne: "montagne", ecole: "ecole", cour: "ecole", recre: "ecole", vacances: "vacances", piscine: "vacances", jardin: "jardin", pms: "pms", societe: "pms",
};

const sansAccent = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const a = (motif, texte) => new RegExp(motif).test(texte);

function vehicule(nom, defaut = "tractopelle") {
  const n = sansAccent(nom);
  for (const [motif, v] of ALIAS_VEHICULE) if (new RegExp("\\b(" + motif + ")\\b").test(n)) return v;
  return defaut;
}
function vehiculesCites(texte) {
  const n = sansAccent(texte), trouves = [];
  for (const [motif, v] of ALIAS_VEHICULE) for (const m of n.matchAll(new RegExp("\\b(" + motif + ")\\b", "g"))) trouves.push([m.index, v]);
  return trouves.sort((x, y) => x[0] - y[0]).map((x) => x[1]);
}
function amisCites(texte) {
  const n = sansAccent(texte), out = [];
  if (a("tyrannosaure|t-rex|\\btrex\\b|\\brexou\\b", n)) out.push("trex");
  if (a("\\bchats?\\b|\\bminou|\\bmoustache\\b", n)) out.push("chat");
  if (a("\\bpapa\\b", n)) out.push("papa");
  if (a("\\bmaman\\b", n)) out.push("maman");
  if (a("\\bpap(i|y)\\b", n)) out.push("papi");
  if (a("\\bmam(ie|y)\\b", n)) out.push("mamie");
  for (const [id, p] of Object.entries(PERSONNAGES)) { // personnages créés dans le configurateur (Jean-Eudes…)
    if (out.includes(id) || PERSONNAGES_DEFAUT[id] || !p.nom) continue;
    const nom = sansAccent(p.nom).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (a("(^|[^a-z])" + nom + "([^a-z]|$)", n)) out.push(id);
  }
  return out;
}
const decor = (nom, defaut = "chantier") => ALIAS_DECOR[sansAccent(nom).trim()] || defaut;
function action(nom, defaut = "parler") { const n = sansAccent(nom).trim(); return ALIAS_ACTION[n] || (ACTIONS.includes(n) ? n : defaut); }

function devineAction(texte, premiere, derniere) {
  const n = sansAccent(texte);
  if (a("artifice|\\bfete\\b|hourra|bravo|\\bgagne", n)) return "fete";
  if (a("\\bfeu\\b|flamme|incendie|brul", n)) return "feu";
  if (a("\\bpont\\b", n)) return "pont";
  if (a("arbres? (est |sont )?tombe|tronc|grosse branche", n)) return "arbre";
  if (a("en panne|repar|\\bcasse", n)) return "panne";
  if (a("cherch|perdu|cache|ou est", n)) return "chercher";
  if (a("\\btrous?\\b", n)) return "trou";
  if (a("chateaux? de sable|bac a sable", n)) return "chateau";
  if (a("\\bvelo\\b", n)) return "velo";
  if (a("cadeau|\\boffre", n)) return "cadeau";
  if (a("fenetre|\\bportes?\\b", n)) return "fenetres";
  if (a("s.envol|\\bvol(e|er|ent)\\b", n)) return "voler";
  if (a("\\broute\\b", n) && a("constru|pierre|pave", n)) return "route";
  if (a("deblay|\\bsable\\b|montagne|rocher|caillou|pierre|bloque|pousse|eboulement", n)) return "deblayer";
  if (a("constru|\\bbati|brique|\\btour\\b", n)) return "construire";
  if (a("\\b(mange|mangent|manger|miam|repas|croque)", n)) return "manger";
  if (a("spectacle|\\bshow\\b", n)) return "spectacle";
  if (a("\\bbulles?\\b", n)) return "bulles";
  if (a("calin|bisou", n)) return "calin";
  if (a("piscine|plouf|plonge", n)) return "piscine";
  if (a("\\bmures?\\b|cueill|ramass", n)) return "cueillir";
  if (a("\\b(copains?|copines?|amis?|aide|aider|renfort)\\b", n)) return "copains";
  if (a("\\b(dort|dormir|dodo|nuit|coucher|sommeil|endort)", n)) return "dormir";
  if (derniere && a("\\bfin\\b", n)) return "fete";
  if (premiere || a("\\b(roule|route|part|avance|balade|promene|file|va )", n)) return "rouler";
  return "parler";
}
function devineDecor(texte) {
  const n = sansAccent(texte);
  for (const [motif, d] of [["\\bpms\\b|societe", "pms"], ["\\bjardin", "jardin"], ["vacances|piscine", "vacances"], ["\\becole|\\brecre", "ecole"], ["dinosaure|dino\\b|volcan", "dinosaures"], ["\\bplage|\\bmer\\b", "plage"],
    ["\\bneige|\\bski", "neige"], ["\\bville\\b", "ville"], ["\\bport\\b|bateau|\\bphare", "port"], ["foret|\\bbois\\b", "foret"], ["\\bmontagnes?\\b(?! de)|cascade", "montagne"], ["\\bferme|grange|tracteur|vache", "ferme"], ["campagne|\\bchamps?\\b|prairie", "campagne"], ["chantier", "chantier"]])
    if (a(motif, n)) return d;
  return null;
}

const MOT_CODE = /\bconfiguration\b\s*[:,.!\-–]*\s*/gi;

function scene(d, decorCourant, premiere, derniere, heros) {
  let texte = String(d.texte || "").trim();
  let inter = d.interactif;
  if (MOT_CODE.test(texte)) {
    MOT_CODE.lastIndex = 0;
    texte = texte.replace(MOT_CODE, "").trim().replace(/(^|[.!?]\s+)(\p{L})/gu, (m, p, c) => p + c.toUpperCase());
    if (inter === undefined || inter === null) inter = true;
  }
  MOT_CODE.lastIndex = 0;
  const act = d.action ? action(d.action) : devineAction(texte, premiere, derniere);
  const dec = d.decor ? decor(d.decor, decorCourant) : devineDecor(texte) || decorCourant;
  let copains = d.copains;
  if ((copains === undefined || copains === null) && act === "copains") copains = vehiculesCites(texte).filter((v) => v !== heros);
  copains = (copains || []).map((c) => vehicule(c));
  let n = d.clics;
  if (act === "copains") n = copains.length || 2;
  if (n === undefined || n === null) n = CLICS_DEFAUT[act] ?? 3;
  const amis = d.amis !== undefined && d.amis !== null ? d.amis : amisCites(texte);
  const positions = {};
  for (const [k, v] of Object.entries(d.positions || {})) if (estAmi(k)) positions[k] = Number(v);
  return {
    texte, action: act, decor: dec, interactif: !!inter, clics: Math.max(inter ? 1 : 0, Math.min(10, Math.floor(n))), // 0 : on montre seulement (le problème reste là)
    consigne: d.consigne || CONSIGNES[act] || "Clique !", copains,
    texte_en: d.texte_en ? String(d.texte_en).trim() : null, consigne_en: d.consigne_en || null,
    vehicule: d.vehicule ? vehicule(d.vehicule) : null,
    amis: amis.filter(estAmi), partent: (d.partent || []).filter(estAmi),
    positions, humeur: { ...(d.humeur || {}) }, cache_heros: !!d.cache_heros, nuit: !!d.nuit,
    bulle: d.bulle && d.bulle.texte ? { qui: d.bulle.qui, texte: String(d.bulle.texte), texte_en: d.bulle.texte_en || null } : null,
    meteo: ["pluie", "neige", "arcenciel", "etoiles", "orage"].includes(d.meteo) ? d.meteo : null, voixPerso: d.voixPerso || null,
    objet: d.objet || null, partie: d.partie != null ? String(d.partie) : null, partie_en: d.partie_en || null,
  };
}

function normalise(brut, fichier, date) {
  const heros = vehicule(brut.heros, "tractopelle");
  let dec = decor(brut.decor, "chantier");
  // une histoire en plusieurs parties : {"parties": [{"titre": "…", "titre_en": "…", "scenes": […]}, …]}
  const brutes = Array.isArray(brut.parties) ? brut.parties.flatMap((p) => (p.scenes || []).map((s, i) =>
    (i === 0 ? { ...(typeof s === "string" ? { texte: s } : s), partie: p.titre || "", partie_en: p.titre_en || null } : s))) : brut.scenes || [];
  if (!brutes.length) throw new Error("aucune scène");
  const scenes = brutes.map((s, i) => {
    const sc = scene(typeof s === "string" ? { texte: s } : s, dec, i === 0, i === brutes.length - 1, heros);
    dec = sc.decor;
    return sc;
  });
  const chapitres = [];
  if (scenes.some((sc) => sc.partie !== null)) {
    if (scenes[0].partie === null) scenes[0].partie = "";
    scenes.forEach((sc, i) => { if (sc.partie !== null) chapitres.push({ titre: sc.partie, titre_en: sc.partie_en, debut: i }); sc.chap = chapitres.length - 1; });
  }
  return {
    titre: String(brut.titre || fichier.replace(/\.[^.]+$/, "")), titre_en: brut.titre_en || null, heros,
    couleur: String(brut.couleur || "").toLowerCase() || null,
    copains: (brut.copains || []).map((c) => vehicule(c)), scenes, chapitres, fichier, date,
  };
}

function remplaceHeros(texte, heros) { // « le tractopelle » devient {vehicule} pour suivre le choix de l'enfant
  for (const [motif, v] of ALIAS_VEHICULE) {
    if (v !== heros) continue;
    const re = new RegExp("(^|[^\\p{L}])([lL](?:e|a|')\\s*(?:" + motif.replace("betonnieres?", "b[ée]tonni[èe]res?") + "))(?![\\p{L}])", "giu");
    texte = texte.replace(re, (m, avant, mot, pos) => {
      const debut = pos + avant.length === 0 || /[.!?]\s*$/.test(texte.slice(0, pos + avant.length));
      return avant + (debut || mot[0] === mot[0].toUpperCase() ? "{Vehicule}" : "{vehicule}");
    });
  }
  return texte;
}

function lireTxt(contenu, fichier, date) {
  const entete = {}, corps = [];
  for (const l of contenu.replace(/^﻿/, "").split(/\r?\n/)) {
    const m = l.match(/^\s*(titre|h[ée]ros|couleur|d[ée]cor|copains)\s*:\s*(.+)$/i);
    if (m && !corps.length) entete[sansAccent(m[1])] = m[2].trim(); else corps.push(l);
  }
  const texte = corps.join("\n").trim();
  let blocs = texte.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocs.length <= 1) blocs = texte.split("\n").map((l) => l.trim()).filter(Boolean);
  const heros = vehicule(entete.heros, null) || (vehiculesCites(texte)[0] || "tractopelle");
  return normalise({
    titre: entete.titre, heros, couleur: entete.couleur,
    decor: entete.decor || devineDecor(texte) || "chantier",
    copains: (entete.copains || "").split(/[,;]| et /).filter((c) => c.trim()).map((c) => vehicule(c)),
    scenes: blocs.map((b) => ({ texte: remplaceHeros(b.split(/\s+/).join(" "), heros) })),
  }, fichier, date);
}

async function chargeTout() {
  const rep = await fetch("histoires/index.json", { cache: "no-store" });
  const index = await rep.json();
  const out = await Promise.all(index.histoires.map(async ({ fichier, date }) => {
    try {
      const r = await fetch("histoires/" + encodeURIComponent(fichier), { cache: "no-store" });
      if (!r.ok) throw new Error("fichier introuvable");
      const contenu = await r.text();
      return fichier.toLowerCase().endsWith(".txt") ? lireTxt(contenu, fichier, date) : normalise(JSON.parse(contenu), fichier, date);
    } catch (e) {
      return { titre: fichier, erreur: String(e.message || e), fichier, date, heros: "tractopelle" };
    }
  }));
  out.push(...histoiresPerso()); // + les histoires écrites dans l'appli (gardées sur l'appareil)
  const cachees = histoiresCachees();
  return out.filter((h) => !cachees.includes(h.fichier)) // moins celles retirées de cet appareil
    .sort((x, y) => (y.date || "").localeCompare(x.date || "") || y.fichier.localeCompare(x.fichier));
}
// histoires de l'appli retirées sur cet appareil (on peut les remettre)
const CLE_CACHEES = "tracto.cachees.v1";
function histoiresCachees() { try { return JSON.parse(localStorage.getItem(CLE_CACHEES) || "[]"); } catch (e) { return []; } }
function cacheHistoire(fichier) {
  try { localStorage.setItem(CLE_CACHEES, JSON.stringify([...new Set(histoiresCachees().concat([fichier]))])); } catch (e) { /* stockage indisponible */ }
}
function remetHistoires() { try { localStorage.removeItem(CLE_CACHEES); } catch (e) { /* stockage indisponible */ } }
function estNouvelle(h) { return h.date && Date.now() - new Date(h.date).getTime() < 3 * 24 * 3600 * 1000; }

function textes(heros, couleur, prenom, langue = LANGUE) { // {vehicule}, {heros}, {couleur}… dans une langue
  const L = TEXTES[langue], petit = INFOS_VEHICULE[heros][1], [nomV, genre] = L.vehicules[heros];
  const c = L.couleurs[couleur] || couleur, adj = genre === "f" ? L.couleursF[couleur] || c : c;
  const maj = (s) => s[0].toUpperCase() + s.slice(1);
  // français : « le tractopelle jaune » ; anglais : « the yellow backhoe »
  const heroS = langue === "en" ? nomV.replace(/^the /, `the ${adj} `) : `${nomV} ${adj}`;
  return { vehicule: nomV, Vehicule: maj(nomV), heros: heroS, Heros: maj(heroS), nom: petit, prenom, couleur: adj };
}
// textes d'une histoire dans la langue choisie (repli sur le français s'il manque la traduction)
const titreDe = (h) => (LANGUE === "en" && h.titre_en) || h.titre;
const traduite = (h) => LANGUE === "fr" || !!h.titre_en;
const texteDe = (d) => (LANGUE === "en" && d.texte_en) || d.texte;
const langueDe = (d) => (LANGUE === "en" && d.texte_en ? "en" : "fr");
const consigneDe = (d) => (langueDe(d) === "en" ? d.consigne_en || CONSIGNES_EN[d.action] || "Tap!" : d.consigne);
const rendu = (texte, valeurs) => String(texte).replace(/\{(\w+)\}/g, (m, k) => (k in valeurs ? valeurs[k] : m));

// durée approximative d'une histoire (en minutes) : lecture + touchers + transitions
function dureeHistoire(h) {
  let s = 0;
  for (const d of h.scenes || []) {
    s += Math.max(4, String(texteDe(d) || "").length / 11 + 1.5) + 1;
    if (d.bulle) s += String(d.bulle.texte).length / 11 + 1;
    if (d.interactif) s += 2.5 + 1.6 * d.clics;
  }
  s += 4 * (h.chapitres || []).length;
  return Math.max(1, Math.round(s / 60));
}
const titreChapitre = (h, k) => { const c = h.chapitres[k]; return (c && ((LANGUE === "en" && traduite(h) && c.titre_en) || c.titre)) || ""; };

// Lecture des histoires du dossier histoires/ (.json, ou simple .txt) — version web de histoires.py.
"use strict";

const VEHICULES = ["tractopelle", "benne", "toupie", "pompier", "bulldozer", "grue"];
const ACTIONS = ["rouler", "parler", "trou", "feu", "deblayer", "construire", "copains", "manger", "spectacle", "bulles", "calin", "piscine", "cueillir", "chateau", "route", "voler", "fenetres", "cadeau", "velo", "fete", "dormir", "pont", "arbre", "panne", "chercher", "libre", "chiffres", "lettres"];
const estAmi = (k) => k in AMIS_DESSIN; // animaux + tous les personnages (y compris ceux du configurateur)
const INFOS_VEHICULE = {
  tractopelle: ["le tractopelle", "Tracto", "m"], benne: ["le camion benne", "Benny", "m"],
  toupie: ["le camion toupie", "Toupie", "m"], pompier: ["le camion de pompiers", "Pimpon", "m"],
  bulldozer: ["le bulldozer", "Bouldo", "m"], grue: ["la grue", "Grutty", "f"],
};
const COULEUR_FEMININ = { bleu: "bleue", vert: "verte", violet: "violette" };
const CLICS_DEFAUT = { piscine: 4, cueillir: 5, chateau: 3, route: 5, voler: 3, fenetres: 4, cadeau: 1, velo: 3,manger: 3, spectacle: 4, bulles: 4, calin: 3, trou: 4, feu: 4, deblayer: 4, construire: 4, fete: 5, dormir: 4, rouler: 3, parler: 3, pont: 4, arbre: 4, panne: 4, chercher: 3, libre: 1, chiffres: 3, lettres: 3 };
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
  libre: "Touche l'image qui brille !", chiffres: "Touche les chiffres dans l'ordre !", lettres: "Touche les lettres dans l'ordre !",
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
  rouler: "rouler", route: "route", pont: "pont", arbre: "arbre", panne: "panne", reparer: "panne", chercher: "chercher", cacher: "chercher", libre: "libre", chiffres: "chiffres", compter: "chiffres", lettres: "lettres", paver: "route", parler: "parler", attendre: "parler",
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
// qui est cité dans un texte : prénoms, surnoms, pluriels, en français et en anglais
const MOTS_PERSOS = [
  ["papa", "\\b(papa|mon pere|daddy|dad)\\b"],
  ["maman", "\\b(maman|ma mere|mommy|mummy|mom|mum)\\b"],
  ["papi", "\\b(papi|papy|pepe|grand-?pere|grandpa|grand-?dad|grandfather)\\b"],
  ["mamie", "\\b(mamie|mamy|mammy|grand-?mere|grandma|granny|grandmother)\\b"],
  ["chat", "\\b(chats?|chatons?|minous?|moustache|cats?|kittens?|kitty|whiskers)\\b"],
  ["trex", "tyrannosaures?|t-?rex|\\brexou\\b"],
  ["dino", "diplodocus|brachiosaures?|brontosaures?|long[- ]cou|long[- ]neck"],
  ["stego", "stegosaures?|stegosaurus|triceratops"],
  ["dragon", "\\bdragons?\\b|\\bdragonnet"],
];
function amisCites(texte) {
  const n = sansAccent(texte), out = [];
  for (const [id, motif] of MOTS_PERSOS) if (a(motif, n)) out.push(id);
  // « des dinosaures », « les dinos » : toute la bande ; « un dinosaure » : Rexou
  if (a("\\b(dinosaures|dinos|dinosaurs)\\b", n)) { for (const id of ["trex", "dino", "stego"]) if (!out.includes(id)) out.push(id); }
  else if (a("\\b(dinosaure|dino|dinosaur)\\b", n) && !out.some((id) => ["trex", "dino", "stego"].includes(id))) out.push("trex");
  // le héros et les personnages créés dans l'atelier (Jean-Eudes, Noham…), même mal orthographiés par la dictée
  for (const { id } of nomsTrouves(texte)) if (!out.includes(id)) out.push(id);
  return out;
}
const decor = (nom, defaut = "chantier") => ALIAS_DECOR[sansAccent(nom).trim()] || defaut;
function action(nom, defaut = "parler") { const n = sansAccent(nom).trim(); return ALIAS_ACTION[n] || (ACTIONS.includes(n) ? n : defaut); }

function devineAction(texte, premiere, derniere) {
  const n = sansAccent(texte);
  for (const [motif, id] of typeof MOTS_ACTIVITES === "undefined" ? [] : MOTS_ACTIVITES) if (motif.test(n)) return id; // toboggan, gâteau, bain, train…
  if (a("\\b(compte|comptent|compter|chiffres?|1, 2, 3|un, deux, trois)\\b", n)) return "chiffres";
  if (a("\\b(lettres?|epele|alphabet)\\b", n)) return "lettres";
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
  for (const [motif, d] of typeof MOTS_DECORS_EXTRA === "undefined" ? [] : MOTS_DECORS_EXTRA) if (new RegExp(motif).test(n)) return d; // parc, zoo, gare…
  for (const [motif, d] of [["\\bpms\\b|societe", "pms"], ["\\bjardin", "jardin"], ["vacances|piscine", "vacances"], ["\\becole|\\brecre", "ecole"], ["pays des dino|ile des dino|volcan", "dinosaures"], ["\\bplage|\\bmer\\b", "plage"],
    ["\\bneige|\\bski", "neige"], ["\\bville\\b", "ville"], ["\\bport\\b|bateau|\\bphare", "port"], ["foret|\\bbois\\b", "foret"], ["\\bmontagnes?\\b(?! de)|cascade", "montagne"], ["\\bferme|grange|tracteur|vache", "ferme"], ["campagne|\\bchamps?\\b|prairie", "campagne"], ["chantier", "chantier"], ["dinosaure|dino\\b", "dinosaures"]]) // un lieu nommé passe avant les dinosaures cités
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
    elements: Array.isArray(d.elements) ? d.elements.filter((e) => e && isFinite(e.x) && isFinite(e.y)).slice(0, 80).map((e) => ({
      type: ["perso", "engin", "heros", "objet"].includes(e.type) ? e.type : "objet", id: String(e.id || ""), x: +e.x, y: +e.y,
      s: borneNb(+e.s || 1, 0.3, 3), f: e.f === -1 ? -1 : 1, col: e.col || null, toucher: !!e.toucher, humeur: e.humeur || null })) : [],
    choses: Array.isArray(d.choses) ? d.choses.filter((id) => typeof CHOSES !== "undefined" && CHOSES[id]).slice(0, 5) : [],
    objet: d.objet || null, mot: d.mot ? String(d.mot) : null, cleVoix: d.cleVoix || null, partie: d.partie != null ? String(d.partie) : null, partie_en: d.partie_en || null,
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
    if (!sc.cleVoix) sc.cleVoix = `${fichier}#${i}`; // où trouver la voix de la famille enregistrée pour cet écran
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
    miniature: brut.miniature && brut.miniature.type ? { type: brut.miniature.type, id: String(brut.miniature.id || ""), col: brut.miniature.col || null } : null,
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

const borneNb = (v, a, b) => Math.max(a, Math.min(b, v));

// ------------------------------------------------ retrouver un personnage même mal écrit (« Noam » pour « Noham »)
// La dictée écrit les prénoms comme elle les entend, surtout les prénoms rares (« Noam » pour « Noham », « Maélis » pour
// « Maëlys », « Ryan » pour « Rayane »…). On compare donc les mots aux prénoms des personnages « à l'oreille » : une
// phonétique simple du français, puis une distance où une voyelle qui change compte peu et une consonne beaucoup.
// Plus le mot ressemble à un prénom cité (majuscule au milieu d'une phrase, après « avec »…), plus on est tolérant.
const MOTS_COURANTS = new Set(("ton mon son ta ma sa tes mes ses les des une un sur dans avec pour nous vous tout tous toute bon bonne non oui lui elle ils elles " +
  "leur est et ou mais donc car puis alors aussi tres trop bien plus moins rien quand comme chez sous entre vers pres loin ici la le de du au aux en il on je tu " +
  "va vont fait font dit voit veut peut a ont sont etait avait the and you he she it his her " +
  "ce cet cette ces qui que quoi dont ou y ne pas jamais encore deja apres avant pendant depuis sans contre par parce voila voici comment pourquoi " +
  "petit petite petits grand grande grands gros grosse beau belle joli jolie gentil gentille mechant content contente triste rouge bleu vert jaune noir blanc rose " +
  "maison ecole parc jardin foret mer plage piscine route ville chantier ferme zoo lune soleil ciel nuit jour matin soir midi eau feu terre sable neige pluie vent " +
  "camion tracteur voiture train bateau avion fusee velo moto bus pelleteuse grue tractopelle bulldozer " +
  "chien chat lapin cheval vache cochon mouton poule canard lion tigre ours loup renard oiseau poisson souris elephant girafe singe dinosaure dragon licorne " +
  "arrive arrivent part partent joue jouent mange mangent court courent saute sautent nage nagent dort dorment roule roulent vole volent tombe tombent " +
  "aide aident cherche cherchent trouve trouvent regarde regardent ecoute chante chantent danse dansent rigole rigolent pleure pleurent creuse porte portent " +
  "monte montent descend descendent pousse tire construit casse repare lave range ouvre ferme donne prend prennent rentre rentrent sort sortent " +
  "avoir etre aller faire dire voir venir jouer manger dormir partir arriver aimer aime aiment adore veux voulait fin histoire aventure fois jour " +
  "papa maman papy papi mamie tonton tata copain copine ami amie amis bebe frere soeur cousin cousine monsieur madame tout toujours vite doucement " +
  "ca se si sa ni quel quelle quels quelles hop oh ah eh hourra bravo plouf splash boum vroum chut zut " +
  "paris noel tracto").split(" "));
function phonetique(texte) {
  // le tréma sépare les voyelles (Aï-cha, Ma-ë-lys) : on le garde de côté le temps des règles « ai », « ei »…
  let s = sansAccent(String(texte || "").replace(/ç/gi, "s").replace(/[ïÏ]/g, "1").replace(/[ëË]/g, "2")).replace(/[^a-z12]/g, "");
  s = s.replace(/ph/g, "f").replace(/th/g, "t").replace(/sch/g, "x").replace(/ch/g, "x").replace(/qu/g, "k").replace(/ck/g, "k").replace(/sc(?=[eiy])/g, "s")
    .replace(/c(?=[eiy])/g, "s").replace(/c/g, "k").replace(/q/g, "k").replace(/x(?=.)/g, "ks").replace(/dj/g, "j")
    .replace(/gu(?=[eiy])/g, "g").replace(/g(?=[eiy])/g, "j").replace(/gn/g, "ni").replace(/h/g, "").replace(/ill/g, "i").replace(/y/g, "i")
    .replace(/eau|au/g, "o").replace(/ai|ei|ay|ey/g, "e").replace(/oi/g, "wa").replace(/ou/g, "u").replace(/1/g, "i").replace(/2/g, "e")
    .replace(/[ae]n(?![aeioun])|[ae]m(?=[^aeiou]|$)/g, "an").replace(/om(?=[^aeiou]|$)/g, "on").replace(/(?:in|ain|ein|un|im)(?=[^aeiou]|$)/g, "in")
    .replace(/([aeiou])s(?=[aeiou])/g, "$1z").replace(/z/g, "s").replace(/w/g, "v").replace(/(.)\1+/g, "$1");
  if (s.length > 3) s = s.replace(/(?:er|ez|et)$/, "e").replace(/[stdxp]+$/, "").replace(/([^aeiou])e$/, "$1"); // lettres muettes à la fin
  return s;
}
function distanceMots(a, b) { // nombre de lettres à changer pour passer de a à b
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// la même chose « à l'oreille » : une voyelle changée ou en trop coûte peu, deux consonnes voisines (p/b, t/d, m/n…) aussi
const VOYELLES = "aeiou", PROCHES = ["pb", "td", "kg", "fv", "sj", "sx", "jx", "mn", "lr", "ei", "ea", "ou", "ie"];
const coutLettre = (c) => (VOYELLES.includes(c) ? 0.5 : 1);
const coutEchange = (x, y) => (x === y ? 0 : (VOYELLES.includes(x) && VOYELLES.includes(y)) || PROCHES.some((p) => p.includes(x) && p.includes(y)) ? 0.5 : 1);
function distanceSons(a, b) {
  const d = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) d[i][0] = d[i - 1][0] + coutLettre(a[i - 1]);
  for (let j = 1; j <= b.length; j++) d[0][j] = d[0][j - 1] + coutLettre(b[j - 1]);
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + coutLettre(a[i - 1]), d[i][j - 1] + coutLettre(b[j - 1]), d[i - 1][j - 1] + coutEchange(a[i - 1], b[j - 1]));
  return d[a.length][b.length];
}
const INDICES_PRENOM = /(?:^|\s)(?:avec|et|chez|a|à|de|d'|pour|voit|retrouve|rencontre|appelle|copain|copine|ami|amie|cousin|cousine|frère|frere|soeur|sœur)\s*$/i;
function nomsTrouves(texte) { // où sont cités le héros et les personnages : [{ id, debut, fin, nom, ecrit }]
  const src = String(texte || ""), mots = [...src.matchAll(/\p{L}[\p{L}'’]*/gu)], cand = [];
  const cibles = [];
  for (const [id, p] of Object.entries(PERSONNAGES)) {
    if (!p.nom) continue; // tous les personnages, y compris ceux de base renommés dans l'atelier (« Copain » devenu « Noham »…)
    // le prénom, et chaque façon dont la dictée l'a déjà écrit (appris dans l'atelier : « loane », « l'eau anne »…)
    for (const [t, appris] of [[p.nom, false], ...(p.entendu || []).map((x) => [x, true])]) {
      const k = t.split(/[\s-]+/).filter(Boolean).length, ph = phonetique(t);
      if (ph && !(appris && MOTS_COURANTS.has(sansAccent(t)))) cibles.push({ id, nom: p.nom, k, ph, appris });
    }
  }
  for (const c of cibles) {
    // la dictée coupe parfois un prénom en deux mots (« No am ») : on essaie aussi en collant le mot suivant
    for (const n of c.ph.length >= 4 ? [c.k, c.k + 1] : [c.k]) for (let i = 0; i + n <= mots.length; i++) {
      const fen = mots.slice(i, i + n), ecrit = fen.map((m) => m[0]).join(" "), debut = fen[0].index, fin = fen[n - 1].index + fen[n - 1][0].length;
      if (n === 1 && MOTS_COURANTS.has(sansAccent(ecrit)) && sansAccent(ecrit) !== sansAccent(c.nom)) continue;
      if (n > 1 && fen.some((m) => MOTS_COURANTS.has(sansAccent(m[0])))) continue;
      const ph = phonetique(ecrit);
      if (!ph) continue;
      // à quel point ce mot « a l'air » d'un prénom ?
      const avant = src.slice(0, debut), majuscule = /^\p{Lu}/u.test(ecrit), debutPhrase = /(^|[.!?…:]\s*)$/.test(avant);
      const indice = INDICES_PRENOM.test(avant), lettres = Math.max(ph.length, c.ph.length);
      if (ph === c.ph) {
        // un mot ordinaire qui sonne comme un prénom court (« caisse » / Kaïs) ne compte qu'après « avec », « et »…
        if (majuscule || indice || c.appris || ph.length >= 4 || sansAccent(ecrit) === sansAccent(c.nom)) cand.push({ id: c.id, nom: c.nom, debut, fin, ecrit, d: 0, exact: true });
        continue;
      }
      if (n !== c.k || c.appris || ph.length < 2) continue;
      // prénom très court (Zoé, Kaïs) : à peu près pareil ne suffit pas, sauf s'il a vraiment l'air d'un prénom cité
      if (Math.min(ph.length, c.ph.length) <= 3 && !((majuscule && !debutPhrase) || indice)) continue;
      let tolerance = 0;
      if (majuscule && !debutPhrase) tolerance = Math.max(1, 0.34 * lettres);       // « … avec Maélis » : très probablement un prénom
      else if (majuscule || indice) tolerance = Math.max(1, 0.26 * lettres);         // début de phrase, ou juste après « avec », « et »…
      else if (lettres >= 5 && ph[0] === c.ph[0]) tolerance = 0.15 * lettres;         // mot en minuscules : seulement s'il est très proche
      if (!tolerance) continue;
      const d = distanceSons(ph, c.ph) + (ph[0] === c.ph[0] ? 0 : 0.5); // le premier son compte double
      if (d <= tolerance && (ph[0] === c.ph[0] || d <= 1)) cand.push({ id: c.id, nom: c.nom, debut, fin, ecrit, d, exact: false });
    }
  }
  // pour chaque endroit, le personnage le plus proche ; s'il y a deux personnages aussi proches, on ne devine pas
  const res = [];
  cand.sort((a, b) => b.exact - a.exact || (b.fin - b.debut) - (a.fin - a.debut) || a.d - b.d);
  for (const c of cand) {
    if (res.some((r) => r.debut < c.fin && c.debut < r.fin)) continue;
    if (!c.exact && cand.some((o) => o.id !== c.id && o.debut === c.debut && o.fin === c.fin && Math.abs(o.d - c.d) < 0.01)) continue;
    res.push(c);
  }
  return res.sort((a, b) => a.debut - b.debut);
}
function meilleureVersion(versions) { // parmi les propositions de la dictée, celle où l'on reconnaît le plus de personnages
  let mieux = versions[0] || "", score = -1;
  versions.forEach((v, rang) => {
    const n = nomsTrouves(v), exacts = n.filter((x) => x.ecrit === x.nom).length, s = new Set(n.map((x) => x.id)).size * 10 + exacts - rang * 0.1;
    if (s > score) { score = s; mieux = v; }
  });
  return mieux;
}
// ce que la dictée écrit quand on dit un prénom : on l'écoute et on retient toutes ses propositions
function ecouteUnPrenom(fini) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return fini(null);
  const r = new SR(), vu = [];
  r.lang = LANGUE === "en" ? "en-US" : "fr-FR"; r.continuous = false; r.interimResults = false; r.maxAlternatives = 8;
  r.onresult = (ev) => { for (const res of ev.results) for (const alt of res) { const t = alt.transcript.trim().replace(/[.!?,]+$/, ""); if (t && !vu.includes(t)) vu.push(t); } };
  r.onerror = () => {};
  r.onend = () => fini(vu);
  try { r.start(); } catch (e) { fini(null); }
  return r;
}

// « Écrire une histoire » : les parents composent une histoire dans l'appli, sans Claude, avec des
// choix guidés (lieu, ce qui se passe, qui est là). Le texte s'écrit tout seul en français et en
// anglais ; un texte écrit à la main passe par le filtre « pour enfants » (filtre.js).
// Les histoires sont gardées sur l'appareil (localStorage).
"use strict";

const CLE_HISTOIRES = "tracto.histoires.v1";
const LIEUX_ECRITURE = ["chantier", "ville", "campagne", "jardin", "ecole", "vacances", "plage", "neige", "dinosaures", "foret", "montagne", "ferme", "port"];
const ACTIONS_ECRITURE = ["libre", "chiffres", "lettres", "rouler", "parler", "trou", "feu", "deblayer", "construire", "copains", "manger", "spectacle", "bulles", "calin",
  "piscine", "cueillir", "chateau", "route", "voler", "fenetres", "cadeau", "velo", "fete", "dormir", "pont", "arbre", "panne", "chercher"];
const ANIMAUX_ECRITURE = ["trex", "dino", "stego", "dragon", "chat"];
const MAX_SCENES = 300; // largement de quoi faire une histoire de plus d'une demi-heure
const METEOS = ["aucune", "pluie", "orage", "neige", "arcenciel", "etoiles"];
const OBJETS = ["ballon", "doudou", "cle", "chat"];
const nouvelId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const cleVoix = (e, et) => e.id + ":" + et.vid; // la voix enregistrée d'une scène (IndexedDB)

// le texte automatique de chaque action, en français et en anglais
const MODELES = {
  libre: ["Regarde !", "Look!"],
  chiffres: ["On compte ensemble ! Touche les chiffres dans l'ordre.", "Let's count together! Tap the numbers in order."],
  lettres: ["Écrivons un mot avec les lettres !", "Let's spell a word with the letters!"],
  rouler: ["{nom}, {heros}, part en balade. Vroum, vroum !", "{nom}, {heros}, goes for a ride. Vroom, vroom!"],
  parler: ["Tout le monde se retrouve et discute joyeusement.", "Everyone meets up and has a happy chat."],
  trou: ["Oh ! Un gros trou sur la route. {nom} le remplit avec de la terre.", "Oh! A big hole in the road. {nom} fills it with dirt."],
  feu: ["Oh ! Une maison fume. Vite, on arrose pour éteindre le feu !", "Oh! A house is smoking. Quick, let's spray water to put out the fire!"],
  deblayer: ["Une montagne de sable bloque le chemin. {nom} la pousse.", "A mountain of sand is blocking the road. {nom} pushes it away."],
  construire: ["On construit une jolie maison, brique par brique.", "Let's build a lovely house, brick by brick."],
  copains: ["{nom} appelle ses copains pour l'aider !", "{nom} calls his friends to help!"],
  manger: ["C'est l'heure du goûter ! Tout le monde mange. Miam, miam !", "It's snack time! Everyone eats. Yum, yum!"],
  spectacle: ["Les camions font un grand spectacle. Bravo !", "The trucks put on a big show. Hooray!"],
  bulles: ["Tout le monde souffle de jolies bulles.", "Everyone blows pretty bubbles."],
  calin: ["On se fait un gros câlin.", "Time for a big hug."],
  piscine: ["Plouf ! On saute dans la piscine !", "Splash! Let's jump in the pool!"],
  cueillir: ["On ramasse des mûres et on remplit le camion benne.", "We pick blackberries and fill the dump truck."],
  chateau: ["{prenom} fait de beaux châteaux de sable.", "{prenom} makes beautiful sandcastles."],
  route: ["On construit une route, pierre après pierre.", "Let's build a road, stone by stone."],
  voler: ["Et hop ! Tout le monde s'envole sur {nom} !", "Whoosh! Everyone flies away on {nom}!"],
  fenetres: ["On pose les fenêtres et la porte de la maison.", "Let's put in the windows and the door of the house."],
  cadeau: ["Surprise ! Un cadeau pour {prenom}. Qu'est-ce que c'est ?", "Surprise! A present for {prenom}. What could it be?"],
  velo: ["{prenom} s'envole sur le vélo jaune !", "{prenom} flies away on the yellow bike!"],
  fete: ["Hourra ! On fait la fête avec des feux d'artifice !", "Hooray! Let's party with fireworks!"],
  dormir: ["Le soir arrive. Bonne nuit, {nom} !", "Evening comes. Good night, {nom}!"],
  pont: ["Oh non ! Le pont est cassé. {nom} pose de nouvelles planches.", "Oh no! The bridge is broken. {nom} lays down new planks."],
  arbre: ["Oh ! Un arbre est tombé sur la route. {nom} le pousse.", "Oh! A tree has fallen across the road. {nom} pushes it away."],
  panne: ["Un camion est en panne. On va le réparer !", "A truck has broken down. Let's fix it!"],
  chercher: ["Quelque chose est perdu… On cherche derrière les buissons !", "Something is lost… Let's look behind the bushes!"],
};
const NOMS_PERSOS = { // comment on appelle chacun dans le texte
  fr: { arthur: "{prenom}", trex: "Rexou", chat: "Moustache", dino: "le diplodocus", stego: "le stégosaure", dragon: "le petit dragon" },
  en: { arthur: "{prenom}", papa: "Daddy", maman: "Mommy", papi: "Grandpa", mamie: "Grandma", trex: "Rexou", chat: "Whiskers", dino: "the diplodocus", stego: "the stegosaurus", dragon: "the little dragon" },
};
const nomPerso = (id, l) => NOMS_PERSOS[l][id] || (PERSONNAGES[id] && PERSONNAGES[id].nom) || id;
function liste(noms, l) { // « A, B et C » / « A, B and C »
  if (noms.length < 2) return noms.join("");
  return noms.slice(0, -1).join(", ") + (l === "fr" ? " et " : " and ") + noms[noms.length - 1];
}

// ------------------------------------------------ une histoire écrite -> une histoire jouable
const ACTIONS_SANS_ENGIN = ["calin", "chateau", "cadeau", "velo"]; // scènes pour les personnages seulement
const ACTIONS_JOYEUSES = ["fete", "calin", "bulles", "spectacle", "cadeau", "piscine", "velo", "chateau", "manger", "voler"];
function compileHistoire(e) {
  let avant = [];
  const scenes = e.etapes.map((et, i) => {
    let presents = et.presents.filter(estAmi);
    const arrivent = presents.filter((id) => !avant.includes(id)), partent = avant.filter((id) => !presents.includes(id));
    const cache = ACTIONS_SANS_ENGIN.includes(et.action) || (et.action === "bulles" && presents.length > 0);
    const positions = {};
    if (et.action === "piscine") { // un adulte dans l'eau, les autres au bord
      const adulte = presents.find((id) => STYLES[id] && STYLES[id].L > 70 && id !== "arthur");
      let k = 0;
      for (const id of presents) positions[id] = id === adulte ? 690 : id === "arthur" ? 380 : 70 + 90 * k++;
    } else if (cache) presents.forEach((id, k) => { positions[id] = Math.round(200 + (presents.length > 1 ? (580 * k) / (presents.length - 1) : 290)); });
    // sinon : c'est le moteur qui place tout le monde (bien espacé, en évitant le véhicule)
    for (const id of presents) if (et.positions && et.positions[id] != null) positions[id] = et.positions[id]; // placés à la main
    const humeur = {}, h = et.humeur || "auto";
    if (h === "joie" || h === "peur" || (h === "auto" && ACTIONS_JOYEUSES.includes(et.action))) for (const id of presents) humeur[id] = h === "peur" ? "peur" : "joie";
    const textes = [0, 1].map((n) => {
      const l = n ? "en" : "fr", libre = et.texteLibre && et.texteLibre[l];
      if (et.texteLibre) return libre || null;
      const intro = arrivent.length ? (l === "fr" ? `Voici ${liste(arrivent.map((id) => nomPerso(id, l)), l)} ! ` : `${arrivent.length === 1 ? "Here comes" : "Here come"} ${liste(arrivent.map((id) => nomPerso(id, l)), l)}! `) : "";
      return intro + MODELES[et.action][n];
    });
    avant = presents;
    return {
      texte: textes[0] || textes[1] || "", texte_en: et.texteLibre ? textes[1] : textes[1], action: et.action, decor: et.decor,
      interactif: !!et.interactif, amis: arrivent, partent, positions, humeur, cache_heros: cache,
      nuit: !!et.nuit, copains: (et.copains || []).filter((k) => k !== e.heros),
      ...(et.clics ? { clics: et.clics } : {}),
      ...(et.consigne ? { consigne: et.consigne.fr, consigne_en: et.consigne.en || null } : {}),
      ...(et.meteo && et.meteo !== "aucune" ? { meteo: et.meteo } : {}),
      ...(et.bulle && et.bulle.fr ? { bulle: { qui: et.bulle.qui, texte: et.bulle.fr, texte_en: et.bulle.en || null } } : {}),
      ...(et.voix && et.vid ? { voixPerso: cleVoix(e, et) } : {}),
      ...(et.partie ? { partie: et.partie.fr || "", partie_en: et.partie.en || null } : {}),
      ...(et.objet ? { objet: et.objet } : {}),
      ...(et.elements && et.elements.length ? { elements: et.elements } : {}),
      ...(et.mot ? { mot: et.mot } : {}),
      ...(et.vid ? { cleVoix: cleVoix(e, et) } : {}),
    };
  });
  return { titre: e.titre, titre_en: e.titre, heros: e.heros, couleur: e.couleur, decor: e.etapes[0].decor, scenes, miniature: e.miniature || null };
}
function litHistoiresPerso() {
  try { return JSON.parse(localStorage.getItem(CLE_HISTOIRES) || "[]"); } catch (e) { return []; }
}
function supprimeHistoirePerso(id) { // supprime pour de bon une histoire écrite dans l'appli
  const toutes = litHistoiresPerso(), e = toutes.find((x) => x.id === id);
  if (e) effaceVoixHistoire(e);
  try { localStorage.setItem(CLE_HISTOIRES, JSON.stringify(toutes.filter((x) => x.id !== id))); } catch (err) { /* stockage indisponible */ }
}
function effaceVoixHistoire(e) { // les voix enregistrées d'une histoire qu'on supprime
  for (const et of e.etapes || []) if (et.voix && et.vid) Memoire.efface(cleVoix(e, et));
}
function histoiresPerso() { // pour l'accueil : les histoires écrites dans l'appli, prêtes à jouer
  return litHistoiresPerso().filter((e) => e.etapes && e.etapes.length).map((e) => {
    try { return { ...normalise(compileHistoire(e), "moi-" + e.id, e.date), perso: e.id }; } catch (err) { return { titre: e.titre, erreur: String(err), fichier: "moi-" + e.id, date: e.date, heros: "tractopelle", perso: e.id }; }
  });
}

// ------------------------------------------------ « texte libre » : toute l'histoire d'un coup -> des scènes
const MOTS_TOUCHER = /\b(configuration|touche|touches|toucher|clique|cliquer|appuie|appuyer)\b/i;
function quiParle(nom, prenom) { // « Papa », « Tracto », « Arthur »… -> l'identifiant du personnage (ou null)
  const n = sansAccent(nom).trim();
  if (!n || n.split(/\s+/).length > 3) return null;
  if (prenom && n === sansAccent(prenom)) return "arthur";
  if (Object.values(INFOS_VEHICULE).some((v) => sansAccent(v[1]) === n) || vehiculesCites(nom).length) return "heros";
  return amisCites(nom)[0] || null;
}
function etapesDepuisTexte(lignes, prenom) {
  const presents = new Set(), etapes = [];
  let decor = null, partie = null;
  const pousse = (et) => { if (partie !== null) { et.partie = { fr: partie, en: null }; partie = null; } etapes.push(et); };
  lignes.forEach((brut, i) => {
    const chap = brut.trim().match(/^(?:#+\s*(.*)|📖\s*(.*)|(?:(?:chapitre|chapter)\s*(?:\d+|une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|one|two|three|four|five|seven|eight|nine|ten)?|partie\s*\d+)\s*[:.\-–]?\s*(.*))$/iu);
    if (chap) { partie = (chap[1] ?? chap[2] ?? chap[3] ?? "").trim(); return; } // « 📖 L'orage », « # L'orage » ou « Chapitre 2 : L'orage »
    const texte = brut.replace(/\bconfiguration\b\s*[:,.!\-–]*\s*/gi, "").trim().replace(/(^|[.!?]\s+)(\p{L})/gu, (m, p, c) => p + c.toUpperCase());
    const dialogue = texte.match(/^([^:]{1,30}?)\s*:\s*(.+)$/), qui = dialogue && quiParle(dialogue[1], prenom);
    if (qui) { // « Papa : On y va ! » -> une bulle sur la scène d'avant (ou une scène pour parler)
      if (qui !== "heros") presents.add(qui);
      let et = etapes[etapes.length - 1];
      if (!et || et.bulle || partie !== null) {
        et = { action: "parler", decor: decor || "campagne", presents: [], interactif: false, texteLibre: { fr: "", en: null }, humeur: "auto", nuit: et ? et.nuit : false, copains: [], clics: null, consigne: null };
        pousse(et);
      }
      et.presents = [...presents];
      et.bulle = { qui, fr: dialogue[2].trim(), en: null };
      return;
    }
    const sa = sansAccent(texte);
    const cites = (t) => amisCites(t).concat(prenom && new RegExp("(^|[^a-z])" + sansAccent(prenom) + "([^a-z]|$)").test(sansAccent(t)) ? ["arthur"] : []);
    for (const id of cites(texte)) presents.add(id);
    // ceux qui s'en vont : « Papy rentre à la maison », « au revoir Rexou »
    const depart = sa.match(/(.*?)\b(s'en va|s'en vont|rentre(nt)? (a la maison|chez)|goes? home|leaves?)\b/), adieu = sa.match(/\b(au revoir|goodbye|bye bye)\b(.*)/);
    const partants = (depart ? cites(depart[1]) : []).concat(adieu ? cites(adieu[2]) : []);
    // « un dinosaure arrive à la piscine » : le dinosaure vient, on reste à la piscine
    let lieu = devineDecor(texte);
    if (lieu === "dinosaures" && decor && !/volcan|pays|ile|monde|terre|vallee|chez les dino/.test(sa)) lieu = null;
    decor = lieu || decor || "campagne";
    pousse({
      action: devineAction(texte, i === 0, i === lignes.length - 1), decor, presents: [...presents], interactif: MOTS_TOUCHER.test(brut),
      texteLibre: { fr: texte, en: null }, humeur: "auto", nuit: /\b(nuit|soir|dodo|dort|etoiles?)\b/.test(sa), copains: vehiculesCites(texte), clics: null, consigne: null,
      objet: /\bdoudou\b/.test(sa) ? "doudou" : /\bcles?\b/.test(sa) ? "cle" : /\b(chat|moustache|minou)\b/.test(sa) ? "chat" : null,
      meteo: /\barc[- ]en[- ]ciel\b/.test(sa) ? "arcenciel" : /\b(orage|tonnerre|eclairs?)\b/.test(sa) ? "orage" : /\b(pluie|pleut)\b/.test(sa) ? "pluie" : /\b(neige|neiger|flocons?)\b/.test(sa) ? "neige" : /\betoiles? filantes?\b/.test(sa) ? "etoiles" : "aucune",
    });
    for (const id of partants) presents.delete(id); // encore là sur cet écran, plus au suivant
  });
  return etapes;
}

// ------------------------------------------------ l'écran
class Ecriture {
  constructor(app) {
    this.app = app; this.histoires = []; this.id = null; this.sc = 0; this.zones = []; this.message = ""; this.messageT = 0;
    this.onglet = "lieu"; this.libre = null; this.debut = 0; this.choisi = null; this.choixEl = -1; this.drag = null; this.categorie = "perso";
  }
  ouvre() { this.histoires = litHistoiresPerso(); this.app.etat = "ecrire"; if (!this.histoire()) this.id = null; }
  ferme() { this.fermeLibre(); }
  histoire() { return this.histoires.find((e) => e.id === this.id) || null; }
  sauve() {
    const e = this.histoire();
    if (e) e.date = new Date().toISOString();
    try { localStorage.setItem(CLE_HISTOIRES, JSON.stringify(this.histoires)); } catch (err) { /* stockage indisponible */ }
  }
  dit(msg) { this.message = msg; this.messageT = 5; }
  ajoute(e) { this.histoires.unshift(e); this.id = e.id; this.sc = 0; this.onglet = "lieu"; this.sauve(); joue("magie"); }
  nouvelle() {
    this.ajoute({ id: Date.now().toString(36), date: new Date().toISOString(), titre: tr("titreDefaut") + " " + (this.histoires.length + 1),
      heros: "tractopelle", couleur: "jaune", etapes: [{ action: "rouler", decor: "campagne", presents: ["arthur"], interactif: false, texteLibre: null, vid: nouvelId() }] });
  }
  etape() { const e = this.histoire(); return e ? e.etapes[Math.min(this.sc, e.etapes.length - 1)] : null; }
  change(champs) { Object.assign(this.etape(), champs); this.sauve(); joue("pop"); }
  renomme() {
    const e = this.histoire(), t = (window.prompt(tr("promptTitre"), e.titre) || "").trim();
    if (!t) return;
    const refus = texteRefuse(t, 80);
    if (refus) return this.dit(tr("refuse", { raison: refus }));
    e.titre = t; this.sauve();
  }
  ecritTexte() {
    const et = this.etape(), fr = window.prompt(tr("promptTexte"), (et.texteLibre && et.texteLibre.fr) || "");
    if (fr === null) return;
    const refusFr = texteRefuse(fr);
    if (refusFr) return this.dit(tr("refuse", { raison: refusFr }));
    if (!fr.trim()) return this.change({ texteLibre: null });
    const en = window.prompt(tr("promptTexteEn"), (et.texteLibre && et.texteLibre.en) || "") || "";
    const refusEn = texteRefuse(en);
    if (refusEn) return this.dit(tr("refuse", { raison: refusEn }));
    this.change({ texteLibre: { fr: fr.trim(), en: en.trim() || null } });
  }
  ecritConsigne() {
    const et = this.etape(), t = window.prompt(tr("promptConsigne"), (et.consigne && et.consigne.fr) || "");
    if (t === null) return;
    const refus = texteRefuse(t, 140);
    if (refus) return this.dit(tr("refuse", { raison: refus }));
    this.change({ consigne: t.trim() ? { fr: t.trim(), en: null } : null });
  }
  ajouteScene() {
    const e = this.histoire();
    if (e.etapes.length >= MAX_SCENES) return this.dit(tr("maxScenes"));
    const prec = e.etapes[e.etapes.length - 1];
    const ici = e.etapes[this.sc] || prec; // le nouvel écran se met juste après celui qu'on regarde
    e.etapes.splice(this.sc + 1, 0, { action: ici.action === "libre" ? "libre" : "parler", decor: ici.decor, presents: [...ici.presents], interactif: false, texteLibre: null, nuit: !!ici.nuit, humeur: "auto", copains: [], meteo: ici.meteo, vid: nouvelId(),
      ...(ici.action === "libre" ? { elements: (ici.elements || []).map((x) => ({ ...x, toucher: false })) } : {}) });
    this.sc++; this.sauve(); joue("pop");
  }
  dupliqueScene() {
    const e = this.histoire();
    if (e.etapes.length >= MAX_SCENES) return this.dit(tr("maxScenes"));
    const copie = JSON.parse(JSON.stringify(this.etape()));
    copie.vid = nouvelId(); copie.voix = false; copie.partie = null;
    e.etapes.splice(this.sc + 1, 0, copie);
    this.sc++; this.sauve(); joue("pop");
  }
  deplaceScene(d) {
    const e = this.histoire(), j = this.sc + d;
    if (j < 0 || j >= e.etapes.length) return;
    [e.etapes[this.sc], e.etapes[j]] = [e.etapes[j], e.etapes[this.sc]];
    this.sc = j; this.sauve(); joue("clic");
  }
  choisitAction(a) {
    const et = this.etape(), champs = { action: a };
    if (a === "libre" && !(et.elements && et.elements.length)) { // on part de ce qu'il y avait : le véhicule et les personnages
      const pres = et.presents.filter(estAmi);
      champs.elements = [{ type: "heros", id: "", x: 330, y: G, s: 1, f: 1 }].concat(pres.map((id, k) => ({ type: "perso", id, x: 560 + k * 110, y: G, s: 1, f: -1 })));
    }
    this.change(champs);
  }
  // --- onglet « 🎨 Écran » : on pose des images et on les fait glisser
  elements() { const et = this.etape(); if (!et.elements) et.elements = []; return et.elements; }
  ajouteElement(type, id) {
    const els = this.elements();
    if (els.length >= 80) return;
    const el = { type, id, x: VW / 2 + (Math.random() - 0.5) * 200, y: type === "objet" && ["nuage", "soleil", "lune", "etoile", "arcenciel"].includes(id) ? 170 : G, s: 1, f: 1 };
    if (type === "engin") el.col = COULEUR_DEFAUT[id];
    if (type === "objet") { els.unshift(el); this.choixEl = 0; } // le décor se met derrière les personnages
    else { els.push(el); this.choixEl = els.length - 1; }
    this.sauve();
    joue(type === "engin" || type === "heros" ? "klaxon" : "pop");
  }
  outil(nom) {
    const els = this.elements(), el = els[this.choixEl];
    if (!el) return;
    if (nom === "plus") el.s = Math.min(3, +(el.s * 1.2).toFixed(2));
    if (nom === "moins") el.s = Math.max(0.3, +(el.s / 1.2).toFixed(2));
    if (nom === "miroir") el.f = -(el.f || 1);
    if (nom === "toucher") { el.toucher = !el.toucher; this.dit(tr(el.toucher ? "toucherOui" : "toucherNon", { prenom: this.app.prenom })); if (el.toucher) this.etape().interactif = true; }
    if (nom === "devant") { // devant tout, ou (s'il y est déjà) derrière tout
      els.splice(this.choixEl, 1);
      if (this.choixEl === els.length) { els.unshift(el); this.choixEl = 0; } else { els.push(el); this.choixEl = els.length - 1; }
    }
    if (nom === "couleur") { const c = Object.keys(COULEURS); el.col = c[(c.indexOf(el.col) + 1) % c.length]; }
    if (nom === "efface") { els.splice(this.choixEl, 1); this.choixEl = -1; }
    this.sauve(); joue("pop");
  }
  toucheCadre(p, cadre) { // doigt posé sur l'aperçu : on prend l'image qui est dessous
    const q = [(p[0] - cadre[0]) / cadre[4], (p[1] - cadre[1]) / cadre[4]], et = this.etape(), els = this.elements();
    for (let k = els.length - 1; k >= 0; k--) {
      if (dans(boiteElement(els[k]), q)) { this.choixEl = k; this.drag = { k, dx: q[0] - els[k].x, dy: q[1] - els[k].y, cadre, bouge: false }; return; }
    }
    if (et.action !== "libre") { // les personnages présents (placés automatiquement) se déplacent aussi
      const pos = positionsApercu(compileHistoire(this.histoire()).scenes[this.sc], et.presents.filter(estAmi));
      for (const id of et.presents.filter(estAmi)) {
        const x = pos[id] ?? 470;
        if (Math.abs(q[0] - x) < 50 && q[1] > G - 220 && q[1] < G + 15) { this.choixEl = -1; this.drag = { perso: id, cadre, bouge: false }; return; }
      }
    }
    this.choixEl = -1;
  }
  glisse(p) {
    const d = this.drag;
    if (!d) return;
    const q = [(p[0] - d.cadre[0]) / d.cadre[4], (p[1] - d.cadre[1]) / d.cadre[4]];
    d.bouge = true;
    if (d.perso) { const et = this.etape(); et.positions = { ...(et.positions || {}), [d.perso]: Math.round(borne(q[0], 70, VW - 70)) }; return; }
    const el = this.elements()[d.k];
    if (el) { el.x = Math.round(borne(q[0] - d.dx, 0, VW)); el.y = Math.round(borne(q[1] - d.dy, 30, VH + 40)); }
  }
  lache() { if (this.drag && this.drag.bouge) this.sauve(); this.drag = null; }
  enleveScene() {
    const e = this.histoire();
    if (e.etapes.length <= 1) return;
    const [partie] = e.etapes.splice(this.sc, 1);
    if (partie.voix) Memoire.efface(cleVoix(e, partie)); this.sc = Math.max(0, this.sc - 1); this.sauve(); joue("clic");
  }
  supprime() {
    const e = this.histoire();
    if (!window.confirm(tr("confirmeSupprimerHistoire", { titre: e.titre }))) return;
    this.histoires = this.histoires.filter((x) => x !== e); this.id = null; this.sauve();
    effaceVoixHistoire(e);
  }
  debutsChapitres() { // les écrans où commence un chapitre (vide s'il n'y a pas de chapitres)
    const e = this.histoire();
    if (!e.etapes.some((x) => x.partie)) return [];
    return [0].concat(e.etapes.map((x, i) => (i > 0 && x.partie ? i : -1)).filter((i) => i > 0));
  }
  nouveauChapitre() { // un nouvel écran, qui commence un chapitre, juste après le chapitre en cours
    const e = this.histoire(), debuts = this.debutsChapitres();
    if (e.etapes.length >= MAX_SCENES) return this.dit(tr("maxScenes"));
    const titre = this.demandeTitre({});
    if (!titre) return;
    const cc = debuts.filter((i) => i <= this.sc).length - 1, ou = debuts[cc + 1] ?? e.etapes.length;
    const ici = e.etapes[ou - 1];
    e.etapes.splice(ou, 0, { action: ici.action === "libre" ? "libre" : "parler", decor: ici.decor, presents: [...ici.presents], interactif: false, texteLibre: null,
      nuit: false, humeur: "auto", copains: [], meteo: "aucune", vid: nouvelId(), partie: titre });
    this.sc = ou; this.sauve(); joue("magie");
  }
  chapitreIci() { // l'écran en cours devient le début d'un chapitre
    if (this.sc === 0 || this.etape().partie) return;
    const titre = this.demandeTitre({});
    if (titre) { this.etape().partie = titre; this.sauve(); joue("magie"); }
  }
  retireChapitre(i) { const e = this.histoire(); delete e.etapes[i].partie; this.sauve(); joue("clic"); }
  demandeTitre(p) {
    const fr = window.prompt(tr("promptChapitre"), p.fr || "");
    if (fr === null) return null;
    const refus = texteRefuse(fr, 80);
    if (refus) { this.dit(tr("refuse", { raison: refus })); return null; }
    const en = window.prompt(tr("promptChapitreEn"), p.en || "") || "";
    const refusEn = texteRefuse(en, 80);
    if (refusEn) { this.dit(tr("refuse", { raison: refusEn })); return null; }
    return { fr: fr.trim(), en: en.trim() || null };
  }
  renommeChapitre(i) {
    const e = this.histoire(), titre = this.demandeTitre(e.etapes[i].partie || {});
    if (titre) { e.etapes[i].partie = titre; this.sauve(); }
  }
  ecritChapitre() {
    const et = this.etape(), p = et.partie || {};
    const fr = window.prompt(tr("promptChapitre"), p.fr || "");
    if (fr === null) return;
    const refus = texteRefuse(fr, 80);
    if (refus) return this.dit(tr("refuse", { raison: refus }));
    const en = window.prompt(tr("promptChapitreEn"), p.en || "") || "";
    const refusEn = texteRefuse(en, 80);
    if (refusEn) return this.dit(tr("refuse", { raison: refusEn }));
    this.change({ partie: { fr: fr.trim(), en: en.trim() || null } });
  }
  numeroChapitre(i) { const e = this.histoire(); let n = 1; for (let j = 1; j <= i; j++) if (e.etapes[j].partie) n++; return n; }
  duree() { // durée estimée (minutes), recalculée quand l'histoire change
    const e = this.histoire();
    if (!this.dureeCache || this.dureeCache.date !== e.date || this.dureeCache.id !== e.id) {
      let m = 1;
      try { m = dureeHistoire(normalise(compileHistoire(e), "moi-" + e.id, e.date)); } catch (err) { /* histoire incomplète */ }
      this.dureeCache = { id: e.id, date: e.date, m };
    }
    return this.dureeCache.m;
  }
  ecritBulle() {
    const et = this.etape(), b = et.bulle;
    if (!b || !b.qui) return;
    const qui = b.qui === "heros" ? INFOS_VEHICULE[this.histoire().heros][1] : nomPerso(b.qui, "fr").replace("{prenom}", this.app.prenom);
    const fr = window.prompt(tr("promptBulle", { qui }), b.fr || "");
    if (fr === null) return;
    const refus = texteRefuse(fr, 140);
    if (refus) return this.dit(tr("refuse", { raison: refus }));
    const en = fr.trim() ? window.prompt(tr("promptBulleEn"), b.en || "") || "" : "";
    const refusEn = texteRefuse(en, 140);
    if (refusEn) return this.dit(tr("refuse", { raison: refusEn }));
    this.change({ bulle: { qui: b.qui, fr: fr.trim(), en: en.trim() || null } });
  }
  // --- la voix des parents, enregistrée au micro (gardée sur l'appareil)
  async enregistre() {
    const e = this.histoire(), et = this.etape();
    if (Micro.enCours()) return Micro.arrete();
    if (!et.vid) { et.vid = nouvelId(); this.sauve(); }
    const cle = cleVoix(e, et);
    this.app.voix.stop();
    try {
      await Micro.demarre(async (blob) => {
        await Memoire.met(cle, blob);
        this.app.voixPerso.delete(cle);
        et.voix = true; this.sauve(); this.dit(tr("voixOk")); joue("magie");
      });
    } catch (err) { this.dit(tr("microRefuse")); }
  }
  async ecoute() {
    const blob = await Memoire.lit(cleVoix(this.histoire(), this.etape()));
    if (!blob || !Audio_.ctx) return;
    try {
      const buf = await new Promise((ok, ko) => blob.arrayBuffer().then((ab) => Audio_.ctx.decodeAudioData(ab, ok, ko)));
      this.app.voix.joueBuffer(buf);
    } catch (err) { this.dit(String(err)); }
  }
  effaceVoix() {
    const e = this.histoire(), et = this.etape(), cle = cleVoix(e, et);
    Memoire.efface(cle); this.app.voixPerso.delete(cle);
    this.change({ voix: false });
  }
  place(p, cadre) { // onglet « Placer » : touche l'image -> le personnage choisi y va
    const et = this.etape();
    if (!this.choisi || !et.presents.includes(this.choisi)) return;
    const x = Math.round(borne((p[0] - cadre[0]) / cadre[4], 70, VW - 70));
    this.change({ positions: { ...(et.positions || {}), [this.choisi]: x } });
  }
  essaie() {
    const e = this.histoire();
    try { this.app.ouvreConfig({ ...normalise(compileHistoire(e), "moi-" + e.id, e.date), perso: e.id }); this.app.departScene = this.sc; } // on essaie à partir de l'écran en cours
    catch (err) { this.dit(String(err)); }
  }

  // ------------------------------------------------ « texte libre » : une vraie zone de texte par-dessus l'appli
  ouvreLibre(voix = false) {
    if (this.libre) return;
    this.dictee = voix;
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;inset:0;background:rgba(60,45,30,.45);display:flex;align-items:center;justify-content:center;z-index:10;touch-action:auto;-webkit-user-select:text;user-select:text;font-family:Fredoka,'Comic Sans MS',sans-serif";
    d.innerHTML = `
      <div style="background:#fffaf0;border-radius:22px;padding:22px;width:min(760px,92vw);max-height:94vh;overflow:auto;box-sizing:border-box;box-shadow:0 10px 40px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px">
        <div style="font-size:26px;font-weight:700;color:#e08a2c">${tr(voix ? "dicteeTitre" : "libreTitre")}</div>
        <div style="font-size:15px;color:#7a6a58;line-height:1.35">${tr(voix ? "dicteeAide" : "libreAide", { prenom: this.app.prenom })}</div>
        ${voix ? `<button id="libreMicro" style="font:inherit;font-size:24px;padding:16px;border:0;border-radius:18px;background:#dc5a78;color:#fff">${tr("dicteeGo")}</button>` : ""}
        <input id="libreTitre" maxlength="80" placeholder="${tr("libreTitrePlace")}" style="font:inherit;font-size:20px;padding:10px 14px;border:2px solid #e6d8c2;border-radius:12px">
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button id="libreChapitre" style="font:inherit;font-size:18px;padding:8px 18px;border:0;border-radius:12px;background:#eb8246;color:#fff">${tr("chapNouveau")}</button>
        </div>
        <textarea id="libreTexte" rows="12" placeholder="${tr("libreExemple")}" style="font:inherit;font-size:18px;line-height:1.5;padding:12px 14px;border:2px solid #e6d8c2;border-radius:12px;resize:vertical"></textarea>
        <div id="libreErreur" style="color:#b23c32;font-size:16px;min-height:20px"></div>
        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button id="libreAnnuler" style="font:inherit;font-size:20px;padding:10px 22px;border:0;border-radius:14px;background:#b8b2a8;color:#fff">${tr("libreAnnuler")}</button>
          <button id="libreCreer" style="font:inherit;font-size:20px;padding:10px 22px;border:0;border-radius:14px;background:#46b95a;color:#fff">${tr("libreCreer")}</button>
        </div>
      </div>`;
    document.body.appendChild(d);
    this.libre = d;
    d.querySelector("#libreTitre").value = tr("titreDefaut") + " " + (this.histoires.length + 1);
    d.querySelector("#libreAnnuler").onclick = () => this.fermeLibre();
    d.querySelector("#libreCreer").onclick = () => this.creeDepuisTexte();
    if (voix) d.querySelector("#libreMicro").onclick = () => this.dicte();
    d.querySelector("#libreChapitre").onclick = () => { // insère « 📖 Titre » sur sa propre ligne, là où est le curseur
      const zone = d.querySelector("#libreTexte"), titre = window.prompt(tr("promptChapitre"), "");
      if (titre === null) return zone.focus();
      const debut = zone.selectionStart ?? zone.value.length, avant = zone.value.slice(0, debut), apres = zone.value.slice(zone.selectionEnd ?? debut);
      const ligne = (avant && !avant.endsWith("\n") ? "\n" : "") + "📖 " + (titre.trim() || tr("chapitre")) + "\n";
      zone.value = avant + ligne + apres.replace(/^\n/, "");
      zone.focus(); zone.selectionStart = zone.selectionEnd = (avant + ligne).length;
    };
    setTimeout(() => d.querySelector("#libreTexte").focus(), 50);
  }
  fermeLibre() { if (this.reco) { try { this.reco.stop(); } catch (e) { /* déjà arrêtée */ } this.reco = null; } if (this.libre) { this.libre.remove(); this.libre = null; } }
  dicte() { // la dictée du navigateur (Safari, Chrome) : on parle, le texte s'écrit
    const d = this.libre, zone = d.querySelector("#libreTexte"), bouton = d.querySelector("#libreMicro");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (this.reco) { this.reco.stop(); return; }
    if (!SR) { d.querySelector("#libreErreur").textContent = tr("dicteeIndispo"); return zone.focus(); }
    const r = new SR();
    r.lang = LANGUE === "en" ? "en-US" : "fr-FR"; r.continuous = true; r.interimResults = true;
    let base = zone.value.trim();
    r.onresult = (ev) => {
      let fini = "", encours = "";
      for (let k = ev.resultIndex; k < ev.results.length; k++) (ev.results[k].isFinal ? (fini += ev.results[k][0].transcript) : (encours += ev.results[k][0].transcript));
      if (fini) base = (base + " " + fini).replace(/\s+/g, " ").trim();
      zone.value = (base + " " + encours).trim();
      zone.scrollTop = zone.scrollHeight;
    };
    r.onerror = (ev) => { if (ev.error !== "no-speech" && ev.error !== "aborted") d.querySelector("#libreErreur").textContent = tr("dicteeIndispo"); };
    r.onend = () => { this.reco = null; if (this.libre) bouton.textContent = tr("dicteeGo"); };
    try { r.start(); this.reco = r; bouton.textContent = tr("dicteeStop"); } catch (e) { d.querySelector("#libreErreur").textContent = tr("dicteeIndispo"); }
  }
  creeDepuisTexte() {
    const d = this.libre, erreur = (m) => { d.querySelector("#libreErreur").textContent = m; joue("clic"); };
    const titre = d.querySelector("#libreTitre").value.trim() || tr("titreDefaut");
    const brut = d.querySelector("#libreTexte").value;
    let lignes = this.dictee ? decoupeRecit(brut) : brut.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (!lignes.length) return erreur(tr("libreVide"));
    const refusTitre = texteRefuse(titre, 80);
    if (refusTitre) return erreur(tr("refuse", { raison: refusTitre }));
    for (let i = 0; i < lignes.length; i++) {
      const refus = texteRefuse(lignes[i]);
      if (refus) return erreur(tr("libreLigne", { n: i + 1, raison: refus }));
    }
    const trop = lignes.length > MAX_SCENES;
    lignes = lignes.slice(0, MAX_SCENES);
    const texte = lignes.join(" ");
    this.ajoute({ id: Date.now().toString(36), date: new Date().toISOString(), titre, heros: vehiculesCites(texte)[0] || "tractopelle",
      couleur: "jaune", etapes: etapesDepuisTexte(lignes, this.app.prenom).map((et) => ({ ...et, vid: nouvelId() })) });
    const dictee = this.dictee;
    this.fermeLibre();
    if (dictee) return this.essaie(); // raconté à voix haute : on passe directement à l'histoire (sans l'éditeur)
    if (trop) this.dit(tr("libreTrop"));
  }

  touche(p) {
    if (this.libre) return;
    for (const z of this.zones) {
      const ok = z.cercle ? Math.hypot(p[0] - z.cercle[0], p[1] - z.cercle[1]) < z.cercle[2] : dans(z.r, p);
      if (ok) { if (z.cadre) this.toucheCadre(p, z.cadre); else z.action(); if (this.app.etat === "ecrire") this.app.dessine(); return; }
    }
  }

  dessine(ctx, t) {
    const z = (this.zones = []), app = this.app, e = this.histoire();
    this.messageT -= 1 / 60;
    const bouton = (r, texte, col, action, taille = 20, actif = true) => {
      rrect(ctx, r[0], r[1] + 3, r[2], r[3], 12, fonce(col, 0.7));
      rrect(ctx, ...r, 12, actif ? col : [205, 205, 205], 3);
      ecrit(ctx, texte, taille, [255, 255, 255], [r[0] + r[2] / 2, r[1] + r[3] / 2], fonce(actif ? col : [165, 165, 165], 0.55));
      if (actif) z.push({ r, action });
    };
    const puce = (r, texte, on, action, col = [255, 200, 60], taille = 17) => { // petit choix
      rrect(ctx, ...r, 10, on ? col : [255, 255, 255], on ? 4 : 2, on ? fonce(col, 0.75) : [200, 190, 175]);
      ecrit(ctx, texte, taille, CONTOUR, [r[0] + r[2] / 2, r[1] + r[3] / 2]);
      z.push({ r, action });
    };
    const titre = (texte, x, y) => ecrit(ctx, texte, 20, [110, 90, 70], [x, y], null, true);
    const vignette = (r, on, dessin, action, col = [90, 170, 80]) => {
      rrect(ctx, ...r, 12, on ? clair(col, 0.75) : [255, 255, 255], on ? 4 : 2, on ? col : [205, 195, 180]);
      ctx.save(); ctx.beginPath(); ctx.rect(r[0] + 2, r[1] + 2, r[2] - 4, r[3] - 4); ctx.clip(); dessin(); ctx.restore();
      z.push({ r, action });
    };
    app.bRetour.dessine(ctx);
    z.push({ r: app.bRetour.r, action: () => app.menu() });
    ecrit(ctx, tr("ecrireTitre"), 36, [255, 200, 40], [W / 2, 38], [200, 80, 40]);
    ecrit(ctx, tr("gardeAppareil"), 16, [150, 140, 130], [W - 120, 38]);

    // --- mes histoires (à gauche)
    titre(tr("mesHistoires"), 18, 76);
    bouton([14, 522, 115, 50], tr("recevoir"), [110, 140, 220], () => this.recoit(), 17);
    bouton([135, 522, 115, 50], tr("partager"), [110, 140, 220], () => this.partage(), 17, !!e);
    this.histoires.slice(0, 7).forEach((h, i) => {
      const r = [14, 98 + i * 58, 236, 50], on = h.id === this.id;
      rrect(ctx, ...r, 12, on ? [255, 248, 215] : [255, 255, 255], on ? 4 : 2, on ? [255, 140, 30] : [205, 195, 180]);
      ecrit(ctx, coupe(ctx, h.titre, 18, 210)[0] || "", 18, CONTOUR, [r[0] + 12, r[1] + 14], null, true);
      z.push({ r, action: () => { this.id = h.id; this.sc = 0; joue("clic"); } });
    });
    bouton([14, 584, 236, 52], tr("guidee"), [70, 185, 90], () => this.nouvelle(), 20);
    bouton([14, 646, 236, 52], tr("texteLibreBouton"), [235, 130, 70], () => this.ouvreLibre(), 20);
    if (!e) {
      ecrit(ctx, tr("aucuneMienne"), 26, [150, 140, 130], [765, 360]);
      ecrit(ctx, tr("astuceLibre"), 18, [150, 140, 130], [765, 400]);
      return this.messageBas(ctx);
    }

    // --- titre, véhicule, couleur
    const rt = [265, 76, 310, 54];
    { // la miniature de l'histoire : on l'ouvre en grand pour la personnaliser
      const r = [581, 76, 56, 54], hm = { fichier: "moi-" + e.id, heros: e.heros, perso: e.id };
      rrect(ctx, ...r, 10, [255, 255, 255], 2, [235, 150, 60]);
      ctx.save(); ctx.beginPath(); ctx.roundRect(r[0] + 2, r[1] + 2, r[2] - 4, r[3] - 4, 8); ctx.clip(); ctx.translate(r[0] + 2, r[1] + 2); ctx.scale(52 / 165, 50 / 178);
      dessineZoneMiniature(ctx, hm, miniatureDe(hm), 0, 0, 165, 178, t, COULEURS[camionDe(hm).col]);
      ctx.restore();
      ecrit(ctx, "🖼", 15, [0, 0, 0], [r[0] + r[2] - 10, r[1] + 10]);
      z.push({ r, action: () => { joue("pop"); this.app.miniEd.ouvre({ ...normalise(compileHistoire(e), "moi-" + e.id, e.date), perso: e.id }, "ecrire"); } });
    }
    rrect(ctx, ...rt, 12, [255, 255, 255], 2, [205, 195, 180]);
    ecrit(ctx, "✎ " + (coupe(ctx, e.titre, 22, 280)[0] || ""), 22, CONTOUR, [rt[0] + 14, rt[1] + 15], null, true);
    z.push({ r: rt, action: () => this.renomme() });
    VEHICULES.forEach((k, i) => vignette([650 + i * 60, 76, 56, 54], e.heros === k,
      () => dessineVehicule(ctx, k, e.heros === k ? e.couleur : COULEUR_DEFAUT[k], 678 + i * 60, 124, t, 0, 0, 0.2),
      () => { e.heros = k; this.sauve(); joue("klaxon"); }, [255, 140, 30]));
    Object.keys(COULEURS).forEach((c, i) => {
      const x = 1030 + i * 33, y = 103, on = e.couleur === c;
      if (on) rond(ctx, x, y, 17, [255, 255, 255], 3);
      rond(ctx, x, y, 13, COULEURS[c], 3);
      z.push({ cercle: [x, y, 16], action: () => { e.couleur = c; this.sauve(); joue("pop"); } });
    });

    // --- les scènes
    const VUES = 8, nb = e.etapes.length; // 8 scènes visibles, des flèches pour les autres
    if (this.sc < this.debut) this.debut = this.sc;
    if (this.sc >= this.debut + VUES) this.debut = this.sc - VUES + 1;
    this.debut = borne(this.debut, 0, Math.max(0, nb - VUES));
    bouton([265, 144, 40, 64], "‹", [150, 160, 175], () => { this.debut = Math.max(0, this.debut - VUES); this.sc = this.debut; joue("clic"); }, 30, this.debut > 0);
    bouton([311 + VUES * 98, 144, 40, 64], "›", [150, 160, 175], () => { this.debut = Math.min(nb - 1, this.debut + VUES); this.sc = this.debut; joue("clic"); }, 30, this.debut + VUES < nb);
    e.etapes.forEach((et, i) => {
      if (i < this.debut || i >= this.debut + VUES) return;
      const r = [311 + (i - this.debut) * 98, 144, 92, 64], on = i === this.sc, sol = SOLS[et.decor] || SOLS.campagne;
      rrect(ctx, ...r, 10, et.nuit ? CIELS.nuit[0] : (CIELS[et.decor] || CIELS.campagne)[0], on ? 5 : 2, on ? [255, 140, 30] : [205, 195, 180]);
      rrect(ctx, r[0] + 3, r[1] + 42, r[2] - 6, 19, 6, sol[0]);
      ecrit(ctx, String(i + 1), 18, [255, 255, 255], [r[0] + 14, r[1] + 14], [90, 90, 110]);
      ecrit(ctx, tr("actions")[et.action] || et.action, 15, CONTOUR, [r[0] + r[2] / 2, r[1] + 51]);
      if (et.interactif) rond(ctx, r[0] + r[2] - 14, r[1] + 14, 8, [255, 210, 60], 2);
      if (et.partie && i > 0) { rrect(ctx, r[0] - 5, r[1] - 4, 8, r[3] + 8, 4, [235, 130, 40]); ecrit(ctx, "📖", 13, [0, 0, 0], [r[0] + 36, r[1] + 14]); }
      if (et.bulle && et.bulle.fr) ecrit(ctx, "💬", 14, [0, 0, 0], [r[0] + r[2] - 34, r[1] + 15]);
      if (et.voix) ecrit(ctx, "🎤", 14, [0, 0, 0], [r[0] + r[2] - 14, r[1] + 34]);
      z.push({ r, action: () => { this.sc = i; joue("clic"); } });
    });
    if (nb < MAX_SCENES) bouton([357 + VUES * 98, 144, 64, 64], tr("ajouterScene"), [70, 185, 90], () => this.ajouteScene(), 30);
    ecrit(ctx, `${this.sc + 1} / ${nb}`, 15, [150, 140, 130], [1243, 166]);
    ecrit(ctx, "≈ " + tr("minutes", { n: this.duree() }), 14, [150, 140, 130], [1243, 188]);

    // --- la barre des chapitres
    const debuts = this.debutsChapitres(), cc = debuts.filter((i) => i <= this.sc).length - 1;
    bouton([1045, 214, 220, 36], tr("chapNouveau"), [235, 130, 40], () => this.nouveauChapitre(), 17);
    bouton([879, 214, 158, 36], tr("chapIci"), [235, 165, 90], () => this.chapitreIci(), 16, this.sc > 0 && !this.etape().partie);
    if (!debuts.length) ecrit(ctx, tr("chapPas"), 16, [150, 140, 130], [270, 223], null, true);
    else {
      const larg = Math.min(190, (554 - 6 * debuts.length) / debuts.length + 6);
      debuts.forEach((i, k) => {
        const r = [265 + k * larg, 214, larg - 6, 36], on = k === cc, p = e.etapes[i].partie || {};
        const titreC = (LANGUE === "en" && p.en) || p.fr || `${tr("chapitre")} ${k + 1}`;
        rrect(ctx, ...r, 10, on ? [255, 225, 170] : [255, 250, 240], on ? 4 : 2, on ? [235, 130, 40] : [220, 200, 175]);
        const txt = r[2] < 70 ? String(k + 1) : coupe(ctx, `${k + 1}. ${titreC}`, 15, r[2] - 14)[0] || "";
        ecrit(ctx, txt, 15, [150, 80, 30], [r[0] + r[2] / 2, r[1] + r[3] / 2]);
        // toucher un chapitre : on y va ; toucher le chapitre en cours : on change son titre
        z.push({ r, action: () => { if (on) this.renommeChapitre(i); else { this.sc = i; joue("clic"); } } });
      });
      const iRetire = cc >= 1 ? debuts[cc] : debuts.length === 1 ? 0 : -1;
      if (iRetire >= 0) bouton([829, 214, 44, 36], "✕", [150, 160, 175], () => this.retireChapitre(iRetire), 18);
    }

    // --- les onglets de la scène
    const et = this.etape();
    [["lieu", tr("ongletOuQuoi")], ["qui", tr("ongletQui")], ["toucher", tr("ongletToucher")], ["texte", tr("ongletTexte")],
      ["plus", tr("ongletPlus")], ["placer", tr("ongletPlacer")]].forEach(([o, nom], k) => {
      const r = [265 + k * 166, 258, 160, 38], on = this.onglet === o;
      rrect(ctx, ...r, 12, on ? [255, 200, 60] : [255, 255, 255], 3, on ? [200, 120, 30] : [205, 195, 180]);
      ecrit(ctx, nom, 19, on ? [120, 60, 20] : CONTOUR, [r[0] + r[2] / 2, r[1] + r[3] / 2]);
      z.push({ r, action: () => { this.onglet = o; joue("clic"); } });
    });
    const Y = 306;
    if (this.onglet === "lieu") {
      titre(tr("lieu"), 268, Y);
      LIEUX_ECRITURE.forEach((l, i) => puce([265 + (i % 9) * 111, Y + 20 + Math.floor(i / 9) * 46, 104, 40], tr("lieux")[l], et.decor === l, () => this.change({ decor: l }), [140, 200, 240], 16));
      titre(tr("action"), 268, Y + 110);
      ACTIONS_ECRITURE.forEach((a, i) => puce([265 + (i % 9) * 111, Y + 130 + Math.floor(i / 9) * 44, 104, 38], tr("actions")[a], et.action === a, () => this.choisitAction(a), [255, 200, 60], 15));
      ecrit(ctx, tr("moment"), 18, [110, 90, 70], [800, Y + 86]);
      puce([850, Y + 66, 112, 40], "☀ " + tr("jour"), !et.nuit, () => this.change({ nuit: false }), [255, 215, 90]);
      puce([968, Y + 66, 112, 40], "☾ " + tr("nuitMot"), !!et.nuit, () => this.change({ nuit: true }), [150, 160, 230]);
    } else if (this.onglet === "qui") {
      titre(tr("quiEstLa"), 268, Y);
      Object.keys(PERSONNAGES).concat(ANIMAUX_ECRITURE).slice(0, 14).forEach((id, i) => {
        const on = et.presents.includes(id);
        vignette([265 + i * 71, Y + 20, 66, 66], on, () => {
          if (STYLES[id]) { const st = STYLES[id], ech = st.L > 70 ? 0.36 : 0.48; personne(ctx, 298 + i * 71, Y + 50 + (st.L + st.T + st.R - 6) * ech, ech, t, 1, 0, 0, null, id); }
          else dessineAmi(ctx, id, 298 + i * 71, Y + 82, t, 1, 0, 0, id === "dino" ? 0.33 : 0.42);
        }, () => this.change({ presents: on ? et.presents.filter((x) => x !== id) : et.presents.concat([id]) }));
      });
      titre(tr("humeurMot"), 268, Y + 108);
      [["auto", tr("humAuto")], ["joie", tr("humJoie")], ["calme", tr("humCalme")], ["peur", tr("humPeur")]].forEach(([h, nom], i) =>
        puce([265 + i * 130, Y + 128, 122, 40], nom, (et.humeur || "auto") === h, () => this.change({ humeur: h })));
      titre(tr("enginsCopains"), 268, Y + 190);
      VEHICULES.forEach((k, i) => {
        const on = (et.copains || []).includes(k);
        vignette([265 + i * 92, Y + 210, 86, 66], on, () => dessineVehicule(ctx, k, COULEUR_DEFAUT[k], 308 + i * 92, Y + 266, t, 0, 0, 0.3),
          () => this.change({ copains: on ? et.copains.filter((x) => x !== k) : (et.copains || []).concat([k]) }));
      });
    } else if (this.onglet === "toucher") {
      titre(tr("toucher", { prenom: app.prenom }), 268, Y);
      puce([265, Y + 20, 120, 42], tr("oui"), et.interactif, () => this.change({ interactif: true }));
      puce([395, Y + 20, 120, 42], tr("non"), !et.interactif, () => this.change({ interactif: false }));
      if (et.interactif) {
        titre(tr("combien"), 268, Y + 84);
        const defaut = CLICS_DEFAUT[et.action] || 3;
        for (let n = 1; n <= 8; n++) puce([265 + (n - 1) * 72, Y + 104, 64, 42], String(n), (et.clics || defaut) === n, () => this.change({ clics: n }), [255, 200, 60], 20);
        titre(tr("phraseConsigne"), 268, Y + 168);
        const rc = [265, Y + 188, 640, 52];
        rrect(ctx, ...rc, 12, [255, 255, 255], 2, [205, 195, 180]);
        const consigne = et.consigne ? (LANGUE === "en" && et.consigne.en) || et.consigne.fr : rendu(LANGUE === "en" ? CONSIGNES_EN[et.action] : CONSIGNES[et.action], { prenom: app.prenom });
        ecrit(ctx, coupe(ctx, consigne, 18, 610)[0] || "", 18, [235, 110, 20], [rc[0] + 14, rc[1] + 15], null, true);
        bouton([920, Y + 188, 160, 52], tr("maPhrase"), [110, 140, 220], () => this.ecritConsigne(), 18);
        bouton([1090, Y + 188, 160, 52], tr("phraseAuto"), [150, 160, 175], () => this.change({ consigne: null }), 17, !!et.consigne);
      }
    } else if (this.onglet === "plus") {
      titre(tr("meteo"), 268, Y);
      METEOS.forEach((m, i) => puce([265 + i * 160, Y + 20, 152, 40], tr("meteos")[m], (et.meteo || "aucune") === m, () => this.change({ meteo: m }), [140, 200, 240]));
      titre(tr("bulleMot"), 268, Y + 80);
      const parleurs = ["heros"].concat(et.presents.filter(estAmi)), b = et.bulle || {};
      puce([265, Y + 100, 130, 40], tr("bulleAucune"), !b.qui, () => this.change({ bulle: null }), [255, 200, 60], 16);
      parleurs.slice(0, 6).forEach((id, i) => {
        const nom = id === "heros" ? INFOS_VEHICULE[e.heros][1] : nomPerso(id, LANGUE).replace("{prenom}", app.prenom);
        puce([403 + i * 138, Y + 100, 130, 40], coupe(ctx, nom, 16, 120)[0] || nom, b.qui === id, () => this.change({ bulle: { qui: id, fr: b.fr || "", en: b.en || null } }), [255, 200, 60], 16);
      });
      if (b.qui) {
        const rb = [265, Y + 152, 640, 48];
        rrect(ctx, ...rb, 12, [255, 255, 255], 2, [205, 195, 180]);
        const phrase = (LANGUE === "en" && b.en) || b.fr;
        ecrit(ctx, coupe(ctx, phrase ? "« " + phrase + " »" : "…", 18, 610)[0] || "", 18, [60, 110, 190], [rb[0] + 14, rb[1] + 13], null, true);
        bouton([920, Y + 152, 160, 48], tr("bulleEcrire"), [110, 140, 220], () => this.ecritBulle(), 18);
      }
      titre(tr("voixMot"), 268, Y + 222);
      const rec = Micro.enCours();
      bouton([265, Y + 244, 220, 50], rec ? tr("arreter", { s: Micro.secondes() }) : tr("enregistrer"), rec ? [220, 80, 80] : [235, 130, 70], () => this.enregistre(), 19);
      bouton([495, Y + 244, 160, 50], tr("ecouter"), [70, 185, 90], () => this.ecoute(), 19, !!et.voix && !rec);
      bouton([665, Y + 244, 160, 50], tr("effacerVoix"), [150, 160, 175], () => this.effaceVoix(), 19, !!et.voix && !rec);
      if (rec) rond(ctx, 465, Y + 256, 6 + 2 * Math.sin(t * 8), [255, 255, 255]);
      if (et.action === "lettres") {
        titre(tr("motMot"), 848, Y + 222);
        bouton([845, Y + 244, 410, 50], "✎ " + (et.mot || app.prenom), [110, 140, 220], () => {
          const m = window.prompt(tr("promptMot"), et.mot || app.prenom);
          if (m === null) return;
          const refus = texteRefuse(m, 20);
          if (refus) return this.dit(tr("refuse", { raison: refus }));
          this.change({ mot: m.trim() || null });
        }, 20);
      }
      if (et.action === "chercher") {
        titre(tr("objetMot"), 848, Y + 222);
        OBJETS.forEach((o, i) => puce([845 + i * 104, Y + 244, 98, 50], tr("objets")[o], (et.objet || "ballon") === o, () => this.change({ objet: o }), [255, 200, 60], 16));
      }
    } else if (this.onglet === "placer") {
      const sceneC = compileHistoire(e).scenes[Math.min(this.sc, e.etapes.length - 1)], libre = et.action === "libre", els = this.elements();
      if (this.choixElSc !== this.sc + ":" + this.id) { this.choixEl = -1; this.choixElSc = this.sc + ":" + this.id; }
      const sc = 0.6, cadre = [265, Y + 2, VW * sc, VH * sc, sc], heros = { kind: e.heros, col: COULEURS[e.couleur] };
      ctx.save(); ctx.translate(cadre[0], cadre[1]);
      ctx.beginPath(); ctx.rect(0, 0, cadre[2], cadre[3]); ctx.clip(); ctx.scale(sc, sc);
      dessineDecor(ctx, VW, VH, et.decor, 0, t, !!et.nuit, G);
      if (et.meteo === "arcenciel") arcEnCiel(ctx, VW * 0.62, G - 40, 330);
      els.forEach((el, k) => {
        if (k === this.choixEl) { const b = boiteElement(el); ctx.globalAlpha = 0.3; rrect(ctx, b[0] - 8, b[1] - 8, b[2] + 16, b[3] + 16, 16, [255, 200, 60]); ctx.globalAlpha = 1; rrect(ctx, b[0] - 8, b[1] - 8, b[2] + 16, b[3] + 16, 16, null, 5, [255, 150, 30]); }
        dessineElement(ctx, el, t, heros);
        if (el.toucher) etoile(ctx, el.x, boiteElement(el)[1] - 12, 20, [255, 210, 50], t);
      });
      if (!libre) {
        if (!sceneC.cache_heros) dessineVehicule(ctx, e.heros, COULEURS[e.couleur], 430, G, t);
        for (const id of et.presents.filter(estAmi)) {
          const x = positionsApercu(sceneC, et.presents.filter(estAmi))[id];
          dessineAmi(ctx, id, x, G, t, x < VW / 2 ? 1 : -1, 0, 0, 1, (sceneC.humeur || {})[id] || null);
        }
      }
      ctx.restore();
      rrect(ctx, cadre[0], cadre[1], cadre[2], cadre[3], 10, null, 3, [205, 195, 180]);
      z.push({ r: cadre.slice(0, 4), cadre });
      ecrit(ctx, coupe(ctx, tr(libre ? "composerAide" : "composerLibre"), 15, cadre[2])[0] || "", 15, [150, 140, 130], [cadre[0], cadre[1] + cadre[3] + 8], null, true);
      // la palette d'images
      const xd = cadre[0] + cadre[2] + 14;
      [["perso", tr("catPerso")], ["engin", tr("catEngins")], ["objet", tr("catObjets")]].forEach(([c, nom], k) =>
        puce([xd + k * 126, Y + 2, 120, 38], nom, this.categorie === c, () => { this.categorie = c; }, [140, 200, 240], 16));
      const items = this.categorie === "perso" ? Object.keys(PERSONNAGES).concat(ANIMAUX_ECRITURE).filter((id) => id in AMIS_DESSIN).map((id) => ({ type: "perso", id }))
        : this.categorie === "engin" ? [{ type: "heros", id: "" }].concat(VEHICULES.map((id) => ({ type: "engin", id, col: COULEUR_DEFAUT[id] })))
        : Object.keys(OBJETS_DECOR).map((id) => ({ type: "objet", id }));
      items.slice(0, 24).forEach((it, k) => {
        const r = [xd + (k % 6) * 62, Y + 48 + Math.floor(k / 6) * 59, 56, 54];
        rrect(ctx, ...r, 10, it.type === "objet" ? [225, 240, 252] : [255, 255, 255], 2, [205, 195, 180]);
        const [w, h] = tailleElement(it), ech = Math.min(48 / w, 44 / h);
        ctx.save(); ctx.beginPath(); ctx.rect(r[0] + 2, r[1] + 2, r[2] - 4, r[3] - 4); ctx.clip();
        dessineElement(ctx, { ...it, x: r[0] + r[2] / 2, y: r[1] + r[3] - 4, s: ech, f: 1 }, t, heros);
        ctx.restore();
        z.push({ r, action: () => this.ajouteElement(it.type, it.id) });
      });
      // ce qu'on peut faire avec l'image choisie
      const el = els[this.choixEl], yo = Y + 290;
      [["moins", "−"], ["plus", "+"], ["miroir", "↔"], ["toucher", "⭐"], [el && el.type === "engin" ? "couleur" : "devant", el && el.type === "engin" ? "🎨" : "⬆"], ["efface", "🗑"]].forEach(([nom, txt], k) => {
        const r = [xd + k * 62, yo, 56, 46], on = nom === "toucher" && el && el.toucher;
        bouton(r, txt, on ? [255, 170, 40] : nom === "efface" ? [210, 90, 80] : [110, 140, 220], () => this.outil(nom), 22, !!el);
      });
    } else {
      const histoire = compileHistoire(e), sceneC = histoire.scenes[Math.min(this.sc, histoire.scenes.length - 1)];
      const en = LANGUE === "en" && sceneC.texte_en, vals = textes(e.heros, e.couleur, app.prenom, en ? "en" : "fr");
      const rx = [265, Y, 1000, 170];
      rrect(ctx, ...rx, 14, [255, 255, 255], 2, [205, 195, 180]);
      coupe(ctx, rendu(en ? sceneC.texte_en : sceneC.texte, vals), 21, 970).slice(0, 5).forEach((l, i) => ecrit(ctx, l, 21, CONTOUR, [rx[0] + 16, rx[1] + 14 + i * 29], null, true));
      bouton([265, Y + 186, 200, 50], tr("monTexte"), [110, 140, 220], () => this.ecritTexte(), 19);
      bouton([475, Y + 186, 200, 50], tr("texteAuto"), [150, 160, 175], () => this.change({ texteLibre: null }), 19, !!et.texteLibre);
      ecrit(ctx, tr("astuceLibre"), 16, [150, 140, 130], [265, Y + 262], null, true);
    }
    bouton([265, 650, 200, 52], tr("essayer"), [70, 185, 90], () => this.essaie(), 22);
    bouton([475, 650, 170, 52], tr("dupliquer"), [110, 140, 220], () => this.dupliqueScene(), 18);
    bouton([655, 650, 56, 52], "◀", [150, 160, 175], () => this.deplaceScene(-1), 20, this.sc > 0);
    bouton([717, 650, 56, 52], "▶", [150, 160, 175], () => this.deplaceScene(1), 20, this.sc < e.etapes.length - 1);
    bouton([783, 650, 180, 52], tr("supprimerScene"), [210, 120, 90], () => this.enleveScene(), 17, e.etapes.length > 1);
    bouton([973, 650, 160, 52], tr("supprimerHistoire"), [210, 80, 80], () => this.supprime(), 18);
    this.messageBas(ctx);
  }
  // --- envoyer une histoire à la famille (avec les voix enregistrées), ou en recevoir une
  async partage() {
    const e = this.histoire();
    if (!e) return;
    const voix = {};
    for (let i = 0; i < e.etapes.length; i++) {
      const et = e.etapes[i], blob = await Memoire.lit(et.vid ? cleVoix(e, et) : `moi-${e.id}#${i}`);
      if (blob) voix[i] = await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(blob); });
    }
    const photo = await Memoire.lit("mini:moi-" + e.id); // la photo de la miniature
    const photoUrl = photo ? await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(photo); }) : null;
    const json = JSON.stringify({ format: "tracto-histoire", version: 1, histoire: e, voix, photo: photoUrl });
    const nom = (sansAccent(e.titre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "histoire") + ".tracto.json";
    const fichier = new File([json], nom, { type: "application/json" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [fichier] })) return await navigator.share({ files: [fichier], title: e.titre });
    } catch (err) { if (err && err.name === "AbortError") return; }
    const a = document.createElement("a"); // sinon : on télécharge le fichier
    a.href = URL.createObjectURL(fichier); a.download = nom; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  recoit() {
    const entree = document.createElement("input");
    entree.type = "file"; entree.accept = ".json,application/json";
    entree.onchange = async () => {
      const f = entree.files && entree.files[0];
      if (!f) return;
      if (f.size > 40e6) return this.dit(tr("importErreur"));
      let paquet;
      try { paquet = JSON.parse(await f.text()); } catch (err) { return this.dit(tr("importErreur")); }
      const e = paquet && paquet.format === "tracto-histoire" && paquet.histoire;
      if (!e || !Array.isArray(e.etapes) || !e.etapes.length) return this.dit(tr("importErreur"));
      // le filtre « pour enfants » s'applique aussi aux histoires reçues
      const textes = [e.titre];
      for (const et of e.etapes) for (const champ of ["texteLibre", "bulle", "consigne", "partie"]) if (et[champ]) textes.push(et[champ].fr, et[champ].en);
      for (const s of textes) { const refus = s && texteRefuse(String(s), 400); if (refus) return this.dit(tr("importRefus", { raison: refus })); }
      const ancien = e.id;
      e.id = nouvelId(); e.date = new Date().toISOString(); e.titre = String(e.titre || tr("titreDefaut")).slice(0, 80);
      e.etapes = e.etapes.slice(0, MAX_SCENES);
      for (const [i, url] of Object.entries(paquet.voix || {})) {
        const et = e.etapes[+i];
        if (!et || typeof url !== "string" || !url.startsWith("data:audio/")) continue;
        if (!et.vid) et.vid = nouvelId();
        await Memoire.met(cleVoix(e, et), await (await fetch(url)).blob());
        et.voix = true;
      }
      if (typeof paquet.photo === "string" && paquet.photo.startsWith("data:image/")) await Memoire.met("mini:moi-" + e.id, await (await fetch(paquet.photo)).blob());
      if (e.miniature) sauveMiniature({ fichier: "moi-" + e.id }, normaliseMini(e.miniature));
      this.ajoute(e);
      this.dit(tr("importOk", { titre: e.titre }));
      this.app.dessine();
    };
    entree.click();
  }
  messageBas(ctx) {
    if (this.messageT > 0) {
      rrect(ctx, 360, 12, 760, 46, 12, [255, 245, 225], 3, [235, 150, 60]);
      ecrit(ctx, coupe(ctx, this.message, 17, 730)[0] || "", 17, [150, 80, 30], [740, 35]);
    }
  }
}

const MOTS_DEBUT = /^(aujourd'?hui|ce|cet|cette|il|elle|ils|elles|on|apres|ensuite|puis|alors|tout|soudain|arthur|papa|maman|papy|papi|mamie|tracto|today|then)$/;
// une histoire racontée à voix haute (souvent sans ponctuation) -> des écrans
function decoupeRecit(texte) {
  let t = String(texte).replace(/\s+/g, " ").trim().replace(/\s*\b(chapitre|chapter)\b/gi, "\n$1");
  let morceaux = t.split("\n").flatMap((l) => l.split(/(?<=[.!?…])\s+/));
  // « chapitre deux la forêt Arthur arrive… » : le titre = jusqu'à la ponctuation, ou 5 mots
  morceaux = morceaux.flatMap((m) => {
    const c = m.match(/^((?:chapitre|chapter)\s+(?:\d+|une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|one|two|three|four|five|seven|eight|nine|ten)?\s*[:,.\-–]?\s*)(.*)$/i);
    if (!c) return [m];
    // le titre s'arrête à la ponctuation, ou au mot qui commence visiblement une phrase (3 mots au plus)
    const mots = c[2].split(" "), fin = mots.findIndex((x) => /[,.:!?]$/.test(x));
    const debutPhrase = mots.findIndex((x, k) => k > 0 && MOTS_DEBUT.test(sansAccent(x)));
    const n = fin >= 0 && fin < 3 ? fin + 1 : Math.min(3, mots.length, debutPhrase > 0 ? debutPhrase : 99);
    return ["📖 " + mots.slice(0, n).join(" ").replace(/[,.:!?]$/, ""), mots.slice(n).join(" ")];
  });
  // sans ponctuation : on coupe avant « et puis », « ensuite », « tout à coup »…
  morceaux = morceaux.flatMap((m) => (m.length > 150 ? m.split(/\s+(?=(?:et puis|ensuite|après|tout à coup|soudain|alors|and then|suddenly|then)\b)/i) : [m]));
  morceaux = morceaux.flatMap((m) => { const mots = m.split(" "); if (mots.length <= 30) return [m]; const out = []; for (let k = 0; k < mots.length; k += 22) out.push(mots.slice(k, k + 22).join(" ")); return out; });
  morceaux = morceaux.map((m) => m.trim()).filter((m) => m && m !== "📖");
  for (let k = morceaux.length - 2; k >= 0; k--) // les bouts trop courts (« et puis ») rejoignent la suite
    if (!morceaux[k].startsWith("📖") && !morceaux[k + 1].startsWith("📖") && morceaux[k].split(" ").length < 4) morceaux.splice(k, 2, morceaux[k] + " " + morceaux[k + 1]);
  return morceaux.slice(0, MAX_SCENES);
}

function positionsApercu(sc, presents) { // où le moteur placera chacun (pour l'aperçu de l'éditeur)
  const pos = { ...(sc.positions || {}) }, libres = presents.filter((id) => pos[id] == null);
  const places = presents.length >= 3 ? placesReparties(presents.length, 430, sc.cache_heros) : [180, 680];
  libres.forEach((id) => { pos[id] = places[presents.indexOf(id)] ?? 470; });
  return pos;
}

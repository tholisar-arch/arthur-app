// « Écrire une histoire » : les parents composent une histoire dans l'appli, sans Claude, avec des
// choix guidés (lieu, ce qui se passe, qui est là). Le texte s'écrit tout seul en français et en
// anglais ; un texte écrit à la main passe par le filtre « pour enfants » (filtre.js).
// Les histoires sont gardées sur l'appareil (localStorage).
"use strict";

const CLE_HISTOIRES = "tracto.histoires.v1";
const LIEUX_ECRITURE = ["chantier", "ville", "campagne", "jardin", "ecole", "vacances", "plage", "neige", "dinosaures"];
const ACTIONS_ECRITURE = ["rouler", "parler", "trou", "feu", "deblayer", "construire", "copains", "manger", "spectacle", "bulles", "calin",
  "piscine", "cueillir", "chateau", "route", "voler", "fenetres", "cadeau", "velo", "fete", "dormir"];
const ANIMAUX_ECRITURE = ["trex", "chat", "dino", "stego"];
const MAX_SCENES = 10;

// le texte automatique de chaque action, en français et en anglais
const MODELES = {
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
};
const NOMS_PERSOS = { // comment on appelle chacun dans le texte
  fr: { arthur: "{prenom}", trex: "Rexou", chat: "Moustache", dino: "le dinosaure", stego: "le stégosaure" },
  en: { arthur: "{prenom}", papa: "Daddy", maman: "Mommy", papi: "Grandpa", mamie: "Grandma", trex: "Rexou", chat: "Whiskers", dino: "the dinosaur", stego: "the stegosaurus" },
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
    else presents.forEach((id, k) => { positions[id] = k < 3 ? 70 + 95 * k : 900 - 95 * (k - 3); });
    const humeur = {};
    if (ACTIONS_JOYEUSES.includes(et.action)) for (const id of presents) humeur[id] = "joie";
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
    };
  });
  return { titre: e.titre, titre_en: e.titre, heros: e.heros, couleur: e.couleur, decor: e.etapes[0].decor, scenes };
}
function litHistoiresPerso() {
  try { return JSON.parse(localStorage.getItem(CLE_HISTOIRES) || "[]"); } catch (e) { return []; }
}
function histoiresPerso() { // pour l'accueil : les histoires écrites dans l'appli, prêtes à jouer
  return litHistoiresPerso().filter((e) => e.etapes && e.etapes.length).map((e) => {
    try { return { ...normalise(compileHistoire(e), "moi-" + e.id, e.date), perso: e.id }; } catch (err) { return { titre: e.titre, erreur: String(err), fichier: "moi-" + e.id, date: e.date, heros: "tractopelle", perso: e.id }; }
  });
}

// ------------------------------------------------ l'écran
class Ecriture {
  constructor(app) { this.app = app; this.histoires = []; this.id = null; this.sc = 0; this.zones = []; this.message = ""; this.messageT = 0; }
  ouvre() { this.histoires = litHistoiresPerso(); this.app.etat = "ecrire"; if (!this.histoire()) this.id = null; }
  histoire() { return this.histoires.find((e) => e.id === this.id) || null; }
  sauve() {
    const e = this.histoire();
    if (e) e.date = new Date().toISOString();
    try { localStorage.setItem(CLE_HISTOIRES, JSON.stringify(this.histoires)); } catch (err) { /* stockage indisponible */ }
  }
  dit(msg) { this.message = msg; this.messageT = 4; }
  nouvelle() {
    const e = { id: Date.now().toString(36), date: new Date().toISOString(), titre: tr("titreDefaut") + " " + (this.histoires.length + 1),
      heros: "tractopelle", couleur: "jaune", etapes: [{ action: "rouler", decor: "campagne", presents: ["arthur"], interactif: false, texteLibre: null }] };
    this.histoires.unshift(e); this.id = e.id; this.sc = 0; this.sauve(); joue("magie");
  }
  etape() { const e = this.histoire(); return e ? e.etapes[Math.min(this.sc, e.etapes.length - 1)] : null; }
  change(champs) { Object.assign(this.etape(), champs); this.sauve(); joue("pop"); }
  renomme() {
    const e = this.histoire(), t = (window.prompt(tr("promptTitre"), e.titre) || "").trim();
    if (!t) return;
    const refus = texteRefuse(t, 60);
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
  ajouteScene() {
    const e = this.histoire();
    if (e.etapes.length >= MAX_SCENES) return this.dit(tr("maxScenes"));
    const prec = e.etapes[e.etapes.length - 1];
    e.etapes.push({ action: "parler", decor: prec.decor, presents: [...prec.presents], interactif: false, texteLibre: null });
    this.sc = e.etapes.length - 1; this.sauve(); joue("pop");
  }
  enleveScene() {
    const e = this.histoire();
    if (e.etapes.length <= 1) return;
    e.etapes.splice(this.sc, 1); this.sc = Math.max(0, this.sc - 1); this.sauve(); joue("clic");
  }
  supprime() {
    const e = this.histoire();
    if (!window.confirm(tr("confirmeSupprimerHistoire", { titre: e.titre }))) return;
    this.histoires = this.histoires.filter((x) => x !== e); this.id = null; this.sauve();
  }
  essaie() {
    const e = this.histoire();
    try { this.app.ouvreConfig({ ...normalise(compileHistoire(e), "moi-" + e.id, e.date), perso: e.id }); }
    catch (err) { this.dit(String(err)); }
  }
  touche(p) {
    for (const z of this.zones) {
      const ok = z.cercle ? Math.hypot(p[0] - z.cercle[0], p[1] - z.cercle[1]) < z.cercle[2] : dans(z.r, p);
      if (ok) { z.action(); if (this.app.etat === "ecrire") this.app.dessine(); return; }
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
    const puce = (r, texte, on, action, col = [255, 200, 60]) => { // petit choix (lieu, action, oui/non)
      rrect(ctx, ...r, 10, on ? col : [255, 255, 255], on ? 4 : 2, on ? fonce(col, 0.75) : [200, 190, 175]);
      ecrit(ctx, texte, 17, CONTOUR, [r[0] + r[2] / 2, r[1] + r[3] / 2]);
      z.push({ r, action });
    };
    const titre = (texte, x, y) => ecrit(ctx, texte, 20, [110, 90, 70], [x, y], null, true);
    app.bRetour.dessine(ctx);
    z.push({ r: app.bRetour.r, action: () => app.menu() });
    ecrit(ctx, tr("ecrireTitre"), 36, [255, 200, 40], [W / 2, 38], [200, 80, 40]);
    ecrit(ctx, tr("gardeAppareil"), 16, [150, 140, 130], [W - 120, 38]);

    // --- mes histoires (à gauche)
    titre(tr("mesHistoires"), 18, 76);
    this.histoires.slice(0, 9).forEach((h, i) => {
      const r = [14, 100 + i * 58, 236, 50], on = h.id === this.id;
      rrect(ctx, ...r, 12, on ? [255, 248, 215] : [255, 255, 255], on ? 4 : 2, on ? [255, 140, 30] : [205, 195, 180]);
      ecrit(ctx, coupe(ctx, h.titre, 18, 210)[0] || "", 18, CONTOUR, [r[0] + 12, r[1] + 14], null, true);
      z.push({ r, action: () => { this.id = h.id; this.sc = 0; joue("clic"); } });
    });
    bouton([14, 640, 236, 56], tr("nouvelleHistoire"), [70, 185, 90], () => this.nouvelle(), 20);
    if (!e) {
      ecrit(ctx, tr("aucuneMienne"), 26, [150, 140, 130], [765, 380]);
      return this.messageBas(ctx);
    }

    // --- titre, véhicule, couleur
    const rt = [265, 76, 370, 54];
    rrect(ctx, ...rt, 12, [255, 255, 255], 2, [205, 195, 180]);
    ecrit(ctx, "✎ " + (coupe(ctx, e.titre, 22, 340)[0] || ""), 22, CONTOUR, [rt[0] + 14, rt[1] + 15], null, true);
    z.push({ r: rt, action: () => this.renomme() });
    VEHICULES.forEach((k, i) => {
      const r = [650 + i * 60, 76, 56, 54], on = e.heros === k;
      rrect(ctx, ...r, 10, on ? [255, 248, 215] : [255, 255, 255], on ? 4 : 2, on ? [255, 140, 30] : [205, 195, 180]);
      ctx.save(); ctx.beginPath(); ctx.rect(...r); ctx.clip();
      dessineVehicule(ctx, k, on ? e.couleur : COULEUR_DEFAUT[k], r[0] + 28, r[1] + 48, t, 0, 0, 0.2);
      ctx.restore();
      z.push({ r, action: () => { e.heros = k; this.sauve(); joue("klaxon"); } });
    });
    Object.keys(COULEURS).forEach((c, i) => {
      const x = 1030 + i * 33, y = 103, on = e.couleur === c;
      if (on) rond(ctx, x, y, 17, [255, 255, 255], 3);
      rond(ctx, x, y, 13, COULEURS[c], 3);
      z.push({ cercle: [x, y, 16], action: () => { e.couleur = c; this.sauve(); joue("pop"); } });
    });

    // --- les scènes
    titre(tr("scenes"), 268, 146);
    e.etapes.forEach((et, i) => {
      const r = [265 + i * 98, 166, 92, 64], on = i === this.sc, sol = SOLS[et.decor] || SOLS.campagne;
      rrect(ctx, ...r, 10, (CIELS[et.decor] || CIELS.campagne)[0], on ? 5 : 2, on ? [255, 140, 30] : [205, 195, 180]);
      rrect(ctx, r[0] + 3, r[1] + 42, r[2] - 6, 19, 6, sol[0]);
      ecrit(ctx, String(i + 1), 18, [255, 255, 255], [r[0] + 14, r[1] + 14], [90, 90, 110]);
      ecrit(ctx, tr("actions")[et.action] || et.action, 15, CONTOUR, [r[0] + r[2] / 2, r[1] + 51]);
      if (et.interactif) rond(ctx, r[0] + r[2] - 14, r[1] + 14, 8, [255, 210, 60], 2);
      z.push({ r, action: () => { this.sc = i; joue("clic"); } });
    });
    if (e.etapes.length < MAX_SCENES) bouton([265 + e.etapes.length * 98, 166, 64, 64], tr("ajouterScene"), [70, 185, 90], () => this.ajouteScene(), 30);

    // --- la scène choisie : où, quoi (à gauche)
    const et = this.etape();
    titre(tr("lieu"), 268, 250);
    LIEUX_ECRITURE.forEach((l, i) => puce([265 + (i % 5) * 101, 270 + Math.floor(i / 5) * 44, 96, 38], tr("lieux")[l], et.decor === l, () => this.change({ decor: l }), [140, 200, 240]));
    titre(tr("action"), 268, 366);
    ACTIONS_ECRITURE.forEach((a, i) => puce([265 + (i % 5) * 101, 386 + Math.floor(i / 5) * 42, 96, 36], tr("actions")[a], et.action === a, () => this.change({ action: a })));

    // --- qui est là, interaction, texte (à droite)
    titre(tr("quiEstLa"), 790, 250);
    const qui = Object.keys(PERSONNAGES).concat(ANIMAUX_ECRITURE);
    qui.slice(0, 14).forEach((id, i) => {
      const r = [785 + (i % 7) * 69, 270 + Math.floor(i / 7) * 70, 64, 64], on = et.presents.includes(id);
      rrect(ctx, ...r, 12, on ? [225, 245, 215] : [255, 255, 255], on ? 4 : 2, on ? [90, 170, 80] : [205, 195, 180]);
      ctx.save(); ctx.beginPath(); ctx.rect(r[0] + 2, r[1] + 2, r[2] - 4, r[3] - 4); ctx.clip();
      if (STYLES[id]) { const st = STYLES[id], ech = st.L > 70 ? 0.36 : 0.48; personne(ctx, r[0] + 32, r[1] + 30 + (st.L + st.T + st.R - 6) * ech, ech, t, 1, 0, 0, null, id); }
      else dessineAmi(ctx, id, r[0] + 32, r[1] + 60, t, 1, 0, 0, id === "dino" ? 0.33 : 0.42);
      ctx.restore();
      z.push({ r, action: () => this.change({ presents: on ? et.presents.filter((x) => x !== id) : et.presents.concat([id]) }) });
    });
    titre(tr("toucher", { prenom: app.prenom }), 790, 422);
    puce([785, 440, 110, 40], tr("oui"), et.interactif, () => this.change({ interactif: true }));
    puce([905, 440, 110, 40], tr("non"), !et.interactif, () => this.change({ interactif: false }));
    titre(tr("texte"), 790, 500);
    const rx = [785, 518, 476, 100];
    rrect(ctx, ...rx, 12, [255, 255, 255], 2, [205, 195, 180]);
    const histoire = compileHistoire(e), sceneC = histoire.scenes[Math.min(this.sc, histoire.scenes.length - 1)];
    const vals = textes(e.heros, e.couleur, app.prenom, LANGUE === "en" && sceneC.texte_en ? "en" : "fr");
    const apercu = rendu(LANGUE === "en" && sceneC.texte_en ? sceneC.texte_en : sceneC.texte, vals);
    coupe(ctx, apercu, 17, 456).slice(0, 4).forEach((l, i) => ecrit(ctx, l, 17, CONTOUR, [rx[0] + 10, rx[1] + 8 + i * 22], null, true));
    bouton([785, 628, 150, 42], tr("monTexte"), [110, 140, 220], () => this.ecritTexte(), 18);
    bouton([945, 628, 150, 42], tr("texteAuto"), [150, 160, 175], () => this.change({ texteLibre: null }), 18, !!et.texteLibre);
    bouton([1105, 628, 156, 42], tr("supprimerScene"), [210, 120, 90], () => this.enleveScene(), 16, e.etapes.length > 1);
    bouton([265, 650, 250, 52], tr("essayer"), [70, 185, 90], () => this.essaie(), 24);
    bouton([525, 650, 160, 52], tr("supprimerHistoire"), [210, 80, 80], () => this.supprime(), 20);
    this.messageBas(ctx);
  }
  messageBas(ctx) {
    if (this.messageT > 0) {
      rrect(ctx, 700, 676, 565, 36, 12, [255, 235, 230], 2, [220, 120, 110]);
      ecrit(ctx, coupe(ctx, this.message, 16, 545)[0] || "", 16, [170, 60, 50], [982, 694]);
    }
  }
}

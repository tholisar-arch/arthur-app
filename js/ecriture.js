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
    };
  });
  return { titre: e.titre, titre_en: e.titre, heros: e.heros, couleur: e.couleur, decor: e.etapes[0].decor, scenes };
}
function litHistoiresPerso() {
  try { return JSON.parse(localStorage.getItem(CLE_HISTOIRES) || "[]"); } catch (e) { return []; }
}
function supprimeHistoirePerso(id) { // supprime pour de bon une histoire écrite dans l'appli
  try { localStorage.setItem(CLE_HISTOIRES, JSON.stringify(litHistoiresPerso().filter((e) => e.id !== id))); } catch (e) { /* stockage indisponible */ }
}
function histoiresPerso() { // pour l'accueil : les histoires écrites dans l'appli, prêtes à jouer
  return litHistoiresPerso().filter((e) => e.etapes && e.etapes.length).map((e) => {
    try { return { ...normalise(compileHistoire(e), "moi-" + e.id, e.date), perso: e.id }; } catch (err) { return { titre: e.titre, erreur: String(err), fichier: "moi-" + e.id, date: e.date, heros: "tractopelle", perso: e.id }; }
  });
}

// ------------------------------------------------ « texte libre » : toute l'histoire d'un coup -> des scènes
const MOTS_TOUCHER = /\b(configuration|touche|touches|toucher|clique|cliquer|appuie|appuyer)\b/i;
function etapesDepuisTexte(lignes, prenom) {
  const presents = new Set(), n = lignes.length;
  let decor = null;
  return lignes.map((brut, i) => {
    const texte = brut.replace(/\bconfiguration\b\s*[:,.!\-–]*\s*/gi, "").trim().replace(/(^|[.!?]\s+)(\p{L})/gu, (m, p, c) => p + c.toUpperCase());
    const sa = sansAccent(texte);
    for (const id of amisCites(texte)) presents.add(id);
    if (prenom && new RegExp("(^|[^a-z])" + sansAccent(prenom) + "([^a-z]|$)").test(sa)) presents.add("arthur");
    decor = devineDecor(texte) || decor || "campagne";
    return {
      action: devineAction(texte, i === 0, i === n - 1), decor, presents: [...presents], interactif: MOTS_TOUCHER.test(brut),
      texteLibre: { fr: texte, en: null }, humeur: "auto", nuit: /\b(nuit|soir|dodo|dort|etoiles?)\b/.test(sa), copains: [], clics: null, consigne: null,
    };
  });
}

// ------------------------------------------------ l'écran
class Ecriture {
  constructor(app) {
    this.app = app; this.histoires = []; this.id = null; this.sc = 0; this.zones = []; this.message = ""; this.messageT = 0;
    this.onglet = "lieu"; this.libre = null;
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
      heros: "tractopelle", couleur: "jaune", etapes: [{ action: "rouler", decor: "campagne", presents: ["arthur"], interactif: false, texteLibre: null }] });
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
  ecritConsigne() {
    const et = this.etape(), t = window.prompt(tr("promptConsigne"), (et.consigne && et.consigne.fr) || "");
    if (t === null) return;
    const refus = texteRefuse(t, 90);
    if (refus) return this.dit(tr("refuse", { raison: refus }));
    this.change({ consigne: t.trim() ? { fr: t.trim(), en: null } : null });
  }
  ajouteScene() {
    const e = this.histoire();
    if (e.etapes.length >= MAX_SCENES) return this.dit(tr("maxScenes"));
    const prec = e.etapes[e.etapes.length - 1];
    e.etapes.push({ action: "parler", decor: prec.decor, presents: [...prec.presents], interactif: false, texteLibre: null, nuit: !!prec.nuit, humeur: "auto", copains: [] });
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

  // ------------------------------------------------ « texte libre » : une vraie zone de texte par-dessus l'appli
  ouvreLibre() {
    if (this.libre) return;
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;inset:0;background:rgba(60,45,30,.45);display:flex;align-items:center;justify-content:center;z-index:10;touch-action:auto;-webkit-user-select:text;user-select:text;font-family:Fredoka,'Comic Sans MS',sans-serif";
    d.innerHTML = `
      <div style="background:#fffaf0;border-radius:22px;padding:22px;width:min(760px,92vw);max-height:94vh;overflow:auto;box-sizing:border-box;box-shadow:0 10px 40px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px">
        <div style="font-size:26px;font-weight:700;color:#e08a2c">${tr("libreTitre")}</div>
        <div style="font-size:15px;color:#7a6a58;line-height:1.35">${tr("libreAide", { prenom: this.app.prenom })}</div>
        <input id="libreTitre" maxlength="60" placeholder="${tr("libreTitrePlace")}" style="font:inherit;font-size:20px;padding:10px 14px;border:2px solid #e6d8c2;border-radius:12px">
        <textarea id="libreTexte" rows="9" placeholder="${tr("libreExemple")}" style="font:inherit;font-size:18px;line-height:1.5;padding:12px 14px;border:2px solid #e6d8c2;border-radius:12px;resize:vertical"></textarea>
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
    setTimeout(() => d.querySelector("#libreTexte").focus(), 50);
  }
  fermeLibre() { if (this.libre) { this.libre.remove(); this.libre = null; } }
  creeDepuisTexte() {
    const d = this.libre, erreur = (m) => { d.querySelector("#libreErreur").textContent = m; joue("clic"); };
    const titre = d.querySelector("#libreTitre").value.trim() || tr("titreDefaut");
    let lignes = d.querySelector("#libreTexte").value.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (!lignes.length) return erreur(tr("libreVide"));
    const refusTitre = texteRefuse(titre, 60);
    if (refusTitre) return erreur(tr("refuse", { raison: refusTitre }));
    for (let i = 0; i < lignes.length; i++) {
      const refus = texteRefuse(lignes[i]);
      if (refus) return erreur(tr("libreLigne", { n: i + 1, raison: refus }));
    }
    const trop = lignes.length > MAX_SCENES;
    lignes = lignes.slice(0, MAX_SCENES);
    const texte = lignes.join(" ");
    this.ajoute({ id: Date.now().toString(36), date: new Date().toISOString(), titre, heros: vehiculesCites(texte)[0] || "tractopelle",
      couleur: "jaune", etapes: etapesDepuisTexte(lignes, this.app.prenom) });
    this.fermeLibre();
    if (trop) this.dit(tr("libreTrop"));
  }

  touche(p) {
    if (this.libre) return;
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
    this.histoires.slice(0, 8).forEach((h, i) => {
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
    const rt = [265, 76, 370, 54];
    rrect(ctx, ...rt, 12, [255, 255, 255], 2, [205, 195, 180]);
    ecrit(ctx, "✎ " + (coupe(ctx, e.titre, 22, 340)[0] || ""), 22, CONTOUR, [rt[0] + 14, rt[1] + 15], null, true);
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
    e.etapes.forEach((et, i) => {
      const r = [265 + i * 98, 144, 92, 64], on = i === this.sc, sol = SOLS[et.decor] || SOLS.campagne;
      rrect(ctx, ...r, 10, et.nuit ? CIELS.nuit[0] : (CIELS[et.decor] || CIELS.campagne)[0], on ? 5 : 2, on ? [255, 140, 30] : [205, 195, 180]);
      rrect(ctx, r[0] + 3, r[1] + 42, r[2] - 6, 19, 6, sol[0]);
      ecrit(ctx, String(i + 1), 18, [255, 255, 255], [r[0] + 14, r[1] + 14], [90, 90, 110]);
      ecrit(ctx, tr("actions")[et.action] || et.action, 15, CONTOUR, [r[0] + r[2] / 2, r[1] + 51]);
      if (et.interactif) rond(ctx, r[0] + r[2] - 14, r[1] + 14, 8, [255, 210, 60], 2);
      z.push({ r, action: () => { this.sc = i; joue("clic"); } });
    });
    if (e.etapes.length < MAX_SCENES) bouton([265 + e.etapes.length * 98, 144, 64, 64], tr("ajouterScene"), [70, 185, 90], () => this.ajouteScene(), 30);

    // --- les onglets de la scène
    const et = this.etape();
    [["lieu", tr("ongletOuQuoi")], ["qui", tr("ongletQui")], ["toucher", tr("ongletToucher")], ["texte", tr("ongletTexte")]].forEach(([o, nom], k) => {
      const r = [265 + k * 175, 222, 168, 42], on = this.onglet === o;
      rrect(ctx, ...r, 12, on ? [255, 200, 60] : [255, 255, 255], 3, on ? [200, 120, 30] : [205, 195, 180]);
      ecrit(ctx, nom, 19, on ? [120, 60, 20] : CONTOUR, [r[0] + r[2] / 2, r[1] + r[3] / 2]);
      z.push({ r, action: () => { this.onglet = o; joue("clic"); } });
    });
    const Y = 282;
    if (this.onglet === "lieu") {
      titre(tr("lieu"), 268, Y);
      LIEUX_ECRITURE.forEach((l, i) => puce([265 + i * 111, Y + 20, 104, 40], tr("lieux")[l], et.decor === l, () => this.change({ decor: l }), [140, 200, 240]));
      titre(tr("action"), 268, Y + 78);
      ACTIONS_ECRITURE.forEach((a, i) => puce([265 + (i % 7) * 143, Y + 98 + Math.floor(i / 7) * 46, 136, 40], tr("actions")[a], et.action === a, () => this.change({ action: a })));
      titre(tr("moment"), 268, Y + 250);
      puce([265, Y + 270, 120, 40], "☀ " + tr("jour"), !et.nuit, () => this.change({ nuit: false }), [255, 215, 90]);
      puce([395, Y + 270, 120, 40], "☾ " + tr("nuitMot"), !!et.nuit, () => this.change({ nuit: true }), [150, 160, 230]);
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
    bouton([265, 650, 230, 52], tr("essayer"), [70, 185, 90], () => this.essaie(), 24);
    bouton([505, 650, 190, 52], tr("supprimerScene"), [210, 120, 90], () => this.enleveScene(), 17, e.etapes.length > 1);
    bouton([705, 650, 170, 52], tr("supprimerHistoire"), [210, 80, 80], () => this.supprime(), 19);
    this.messageBas(ctx);
  }
  messageBas(ctx) {
    if (this.messageT > 0) {
      rrect(ctx, 885, 656, 380, 40, 12, [255, 235, 230], 2, [220, 120, 110]);
      ecrit(ctx, coupe(ctx, this.message, 15, 360)[0] || "", 15, [170, 60, 50], [1075, 676]);
    }
  }
}

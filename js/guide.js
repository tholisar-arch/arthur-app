// La création guidée en pyramide : on bâtit chaque scène étage par étage, du plus large au plus précis.
//   1. Le thème (à la maison, sorties, sport, nature, chantier, aventure)  ->  2. l'endroit (le salon, le stade…)
//   ->  3. ce qui s'y passe (les activités de cet endroit d'abord)  ->  4. qui est là (avec des suggestions).
// La pyramide à gauche montre où l'on en est (on peut toucher un étage pour revenir), l'aperçu montre la scène,
// et en bas défilent les scènes déjà faites. Grosses cartes illustrées, et la voix lit chaque question.
"use strict";

const THEMES_GUIDE = [
  { id: "maison", icone: "🏠", fr: "À la maison", en: "At home", col: [250, 170, 90], lieux: ["chambre", "salon", "cuisine", "salledebain", "jardin"] },
  { id: "sorties", icone: "🎡", fr: "Sorties", en: "Outings", col: [240, 110, 160], lieux: ["parc", "zoo", "cinema", "cirque", "fetforaine", "boulangerie", "restaurant", "magasin", "marche", "bibliotheque", "musee", "aquarium", "docteur", "classe", "ecole", "ville"] },
  { id: "sport", icone: "⚽", fr: "Sport", en: "Sport", col: [80, 180, 110], lieux: ["foot", "rugby", "tennis", "basket", "natation", "gymnase", "danseSalle", "poney", "patinoire", "ski", "skatepark", "athletisme"] },
  { id: "nature", icone: "🌳", fr: "Nature", en: "Nature", col: [110, 185, 80], lieux: ["campagne", "foret", "montagne", "ferme", "lac", "plage", "neige", "camping", "jungle", "desert", "banquise"] },
  { id: "engins", icone: "🚧", fr: "Chantier et engins", en: "Diggers & trucks", col: [245, 185, 50], lieux: ["chantier", "pms", "garage", "caserne", "port", "gare", "aeroport"] },
  { id: "aventure", icone: "🚀", fr: "Aventure", en: "Adventure", col: [140, 120, 230], lieux: ["chateau", "dinosaures", "espace", "sousmarin", "nuages", "vacances"] },
];
const ICONES_ACTIONS = {
  rouler: "🚜", parler: "💬", trou: "🕳️", deblayer: "🪨", construire: "🏗️", route: "🛣️", fenetres: "🪟", pont: "🌉", arbre: "🌳", panne: "🔧", feu: "🔥", copains: "🤝", laver: "🫧",
  manger: "🍽️", calin: "🤗", dormir: "😴", fete: "🎉", cadeau: "🎁", velo: "🚲", spectacle: "🎭", bulles: "🫧", piscine: "🏊", cueillir: "🫐", chateau: "🏰", voler: "🪽",
  chercher: "🔎", chiffres: "🔢", lettres: "🔤", libre: "🎨", toboggan: "🛝", balancoire: "🌈", ballon: "🏐", cerfvolant: "🪁", flaques: "💦", cubes: "🧱", puzzle: "🧩",
  danse: "💃", musique: "🎵", gateau: "🎂", bain: "🛁", dents: "🪥", ranger: "🧸", cuisine: "🥣", peinture: "🖍️", livre: "📖", docteur: "🩺", courses: "🛒", sapin: "🎄",
  jardiner: "🌱", peche: "🎣", nourrir: "🐔", bonhomme: "⛄", coquillages: "🐚", glace: "🍦", train: "🚂", avion: "✈️", bateau: "⛵", fusee: "🚀",
  tele: "📺", dodo: "🛏️", repas: "🍲", film: "🍿", jongle: "🤹", manege: "🎠", pain: "🥖", guimauves: "🔥", plonger: "🤿", glisser: "⛸️", poissons: "🐠",
  tirerBut: "⚽", essai: "🏉", jouerTennis: "🎾", panier: "🏀", nager: "🏊", roulade: "🤸", monterPoney: "🐴", skier: "⛷️", skate: "🛹", courir: "🏃",
};
const ACTIONS_LIEU = { // ce qu'on fait volontiers dans chaque endroit (en plus des activités qui y ont leur place)
  chantier: ["trou", "deblayer", "construire", "route", "fenetres", "pont", "arbre", "panne", "laver", "feu"], pms: ["construire", "fenetres", "laver", "panne"],
  ville: ["rouler", "copains", "feu", "panne", "courses"], campagne: ["rouler", "cueillir", "velo", "flaques", "cerfvolant", "peche"], foret: ["chercher", "cueillir", "arbre"],
  montagne: ["rouler", "pont", "chercher"], ferme: ["nourrir", "cueillir", "jardiner"], plage: ["coquillages", "glace", "chateau", "bateau"], neige: ["bonhomme", "glisser", "skier"],
  jardin: ["jardiner", "cueillir", "flaques", "chercher", "piscine"], ecole: ["chiffres", "lettres", "spectacle"], classe: ["peinture", "livre", "chiffres", "lettres"],
  vacances: ["piscine", "glace", "fete"], dinosaures: ["chercher", "manger", "calin"], espace: ["fusee", "voler"], nuages: ["voler", "velo"], port: ["bateau", "rouler"],
  gare: ["train"], aeroport: ["avion"], garage: ["panne", "laver"], caserne: ["feu", "rouler"], salon: ["tele", "danse", "musique", "gateau", "sapin", "cadeau", "fete"],
  chambre: ["dodo", "livre", "cubes", "puzzle", "ranger", "calin"], cuisine: ["repas", "cuisine", "gateau"], salledebain: ["bain", "dents"], restaurant: ["repas"],
  bibliotheque: ["livre"], musee: ["chercher"], marche: ["courses"], lac: ["peche", "bateau"], camping: ["guimauves", "chercher"], chateau: ["fete", "danse", "chercher"],
  jungle: ["chercher"], desert: ["chercher", "rouler"], banquise: ["glisser", "chercher"], danseSalle: ["danse", "musique"], patinoire: ["glisser"],
};
const ACTIONS_PARTOUT = ["parler", "calin", "fete", "manger", "chercher"];
const QUI_LIEU = { // qui l'on croise volontiers à chaque endroit
  boulangerie: ["boulanger"], classe: ["maitresse"], ecole: ["maitresse"], docteur: ["docteur", "infirmiere"], cirque: ["clown", "magicien"], caserne: ["sapeur"],
  garage: ["garagiste"], ferme: ["fermier", "vache", "cochon", "mouton", "poule"], restaurant: ["cuisinier"], magasin: ["vendeur"], marche: ["vendeur"],
  chateau: ["princesse", "chevalier", "roi", "reine"], espace: ["astronaute"], sousmarin: ["dauphin", "pieuvre", "crabe", "poisson"], zoo: ["lion", "elephant", "girafe", "singe"],
  jungle: ["tigre", "singe", "serpent", "crocodile"], banquise: ["pingouin"], lac: ["canard", "grenouille"], foret: ["renard", "hibou", "ecureuil", "herisson"],
  dinosaures: ["trex", "dino", "stego"], poney: ["cheval"], chambre: ["chat"], salon: ["chat", "chien"], parc: ["chien", "oiseau"], campagne: ["vache", "lapin"],
  plage: ["crabe"], desert: ["serpent"], nuages: ["oiseau", "papillon"], aquarium: ["pieuvre"],
};
const MINI_LIEUX = new Map(); // les petits dessins des lieux (pour les cartes), faits une seule fois
function miniLieu(nom) {
  if (!MINI_LIEUX.has(nom)) {
    const c = document.createElement("canvas"); c.width = 245; c.height = 128;
    const x = c.getContext("2d"); x.scale(0.25, 0.25); dessineDecor(x, VW, VH, nom, 0, 2, false, G);
    MINI_LIEUX.set(nom, c);
  }
  return MINI_LIEUX.get(nom);
}
const emoji = (ctx, e, x, y, taille) => { ctx.font = `${taille}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#000"; ctx.fillText(e, x, y); };
const ftr = (fr, en) => (LANGUE === "en" ? en : fr);
const nomCourt = (id) => (PERSONNAGES[id] ? PERSONNAGES[id].nom : String(nomPerso(id, LANGUE) || id).replace(/^(le |la |l'|the )/i, "").replace(/^\p{L}/u, (c) => c.toUpperCase()));

class Guide {
  constructor(app) { this.app = app; this.zones = []; this.niveau = 0; this.choix = {}; this.page = 0; this.e = null; this.retour = "menu"; }
  ouvre(depuis = "menu") {
    this.retour = depuis; this.e = null; this.niveau = 0; this.page = 0;
    this.choix = { theme: null, lieu: null, action: null, presents: ["arthur"] };
    this.app.etat = "guide"; this.dit();
  }
  ferme() {
    if (this.retour === "ecrire") { this.app.ecriture.ouvre(); if (this.e) { this.app.ecriture.id = this.e.id; this.app.ecriture.sc = 0; } }
    else this.app.menu();
  }
  theme() { return THEMES_GUIDE.find((t) => t.id === this.choix.theme) || null; }
  question(n = this.niveau) {
    const p = this.app.prenom;
    return [ftr("Où se passe l'histoire ?", "Where does the story happen?"), ftr("Quel endroit ?", "Which place?"), ftr("Que se passe-t-il ?", "What happens?"),
      ftr(`Qui est avec ${p} ?`, `Who is with ${p}?`), ftr("Bravo ! Et ensuite ?", "Well done! What next?")][n];
  }
  dit() { try { this.app.voix.dire(this.question()); } catch (e) { /* pas de voix */ } }
  va(n) { this.niveau = n; this.page = 0; joue("pop"); this.dit(); }
  lieux() { const t = this.theme(); return t ? t.lieux.filter((l) => SOLS[l]) : []; }
  actions() { // d'abord ce qui se fait vraiment ici, puis ce qu'on peut faire partout
    const l = this.choix.lieu, out = [];
    const ajoute = (a) => { if (a && MODELES[a] && !out.includes(a)) out.push(a); };
    for (const [id, A] of Object.entries(ACTIVITES)) if (A.decor === l) ajoute(id);
    (ACTIONS_LIEU[l] || []).forEach(ajoute);
    const ici = out.length;
    ACTIONS_PARTOUT.forEach(ajoute);
    return { liste: out, ici };
  }
  gens() { // les suggestions de l'endroit, puis la famille, puis tout le monde
    const sugg = (QUI_LIEU[this.choix.lieu] || []).filter((id) => id in AMIS_DESSIN);
    const tous = Object.keys(PERSONNAGES).concat(ANIMAUX_ECRITURE).filter((id) => id in AMIS_DESSIN);
    return { liste: [...new Set(["arthur", ...sugg, ...tous])], sugg };
  }
  ajouteScene() {
    const ecr = this.app.ecriture, a = this.choix.action;
    const et = { action: a, decor: this.choix.lieu, presents: [...new Set(this.choix.presents)], interactif: !["rouler", "parler"].includes(a), texteLibre: null, humeur: "auto",
      nuit: false, copains: [], clics: null, consigne: null, vid: nouvelId() };
    if (!this.e) {
      ecr.histoires = litHistoiresPerso();
      this.e = { id: Date.now().toString(36), date: new Date().toISOString(), titre: "", heros: "tractopelle", couleur: "jaune", etapes: [et] };
      ecr.histoires.unshift(this.e);
    } else this.e.etapes.push(et);
    const lieux = [...new Set(this.e.etapes.map((x) => tr("lieux")[x.decor] || x.decor))];
    this.e.titre = `${this.app.prenom} : ${lieux.slice(0, 3).join(", ")}${lieux.length > 3 ? "…" : ""}`.slice(0, 60);
    ecr.id = this.e.id; ecr.sauve();
    joue("magie"); this.niveau = 4; this.page = 0; this.dit();
  }
  regarde() { const ecr = this.app.ecriture; ecr.id = this.e.id; ecr.sc = 0; ecr.essaie(); }
  retouche() { const ecr = this.app.ecriture; ecr.ouvre(); ecr.id = this.e.id; ecr.sc = this.e.etapes.length - 1; ecr.onglet = "lieu"; }
  touche(p) {
    for (const z of this.zones) if (dans(z.r, p)) { z.action(); if (this.app.etat === "guide") this.app.dessine(); return; }
  }

  // ------------------------------------------------ le dessin
  dessine(ctx, t) {
    const z = (this.zones = []), th = this.theme(), col = th ? th.col : [120, 170, 240];
    ctx.fillStyle = css(clair(col, 0.82)); ctx.fillRect(0, 0, W, H_);
    const carte = (r, fond, bord, action) => { rrect(ctx, r[0], r[1] + 5, r[2], r[3], 18, fonce(bord, 0.75)); rrect(ctx, ...r, 18, fond, 4, bord); if (action) z.push({ r, action }); };
    const bouton = (r, texte, c, action, taille = 22) => { carte(r, c, fonce(c, 0.7), action); ecrit(ctx, texte, taille, [255, 255, 255], [r[0] + r[2] / 2, r[1] + r[3] / 2], fonce(c, 0.5)); };
    bouton([16, 14, 150, 52], "‹ " + ftr("Retour", "Back"), [110, 140, 220], () => this.ferme(), 21);
    ecrit(ctx, "🪄 " + ftr("Je crée mon histoire", "I make my story"), 34, [255, 255, 255], [W / 2 + 80, 40], fonce(col, 0.55));

    // --- l'aperçu de la scène qu'on est en train de bâtir
    const ap = [24, 86, 320, 167];
    ctx.save(); ctx.beginPath(); ctx.roundRect(...ap, 16); ctx.clip();
    if (this.choix.lieu && this.niveau >= 2) {
      ctx.drawImage(miniLieu(this.choix.lieu), ap[0], ap[1], ap[2], ap[3]);
      const qui = this.niveau >= 3 ? this.choix.presents.slice(0, 5) : [];
      qui.forEach((id, i) => dessineAmi(ctx, id, ap[0] + 60 + i * 52, ap[1] + ap[3] - 8, t, 1, 0, 0, STYLES[id] && STYLES[id].adulte ? 0.36 : 0.42, "joie"));
    } else { rrect(ctx, ...ap, 0, clair(col, 0.4)); emoji(ctx, th ? th.icone : "✨", ap[0] + ap[2] / 2, ap[1] + ap[3] / 2, 70); }
    ctx.restore(); rrect(ctx, ...ap, 16, null, 4, fonce(col, 0.7));
    if (this.choix.action && this.niveau >= 3) { rond(ctx, ap[0] + ap[2] - 26, ap[1] + 26, 24, [255, 255, 255], 3); emoji(ctx, ICONES_ACTIONS[this.choix.action] || "✨", ap[0] + ap[2] - 26, ap[1] + 27, 28); }

    // --- la pyramide : un étage par choix (on touche un étage pour y revenir)
    const etages = [
      [ftr("1 · Thème", "1 · Theme"), th ? th.icone + " " + (LANGUE === "en" ? th.en : th.fr) : ""],
      [ftr("2 · Endroit", "2 · Place"), this.choix.lieu ? tr("lieux")[this.choix.lieu] || this.choix.lieu : ""],
      [ftr("3 · Action", "3 · Action"), this.choix.action ? (ICONES_ACTIONS[this.choix.action] || "") + " " + (tr("actions")[this.choix.action] || this.choix.action) : ""],
      [ftr("4 · Qui", "4 · Who"), this.niveau >= 4 || this.niveau === 3 ? this.choix.presents.map(nomCourt).slice(0, 3).join(", ") : ""],
    ];
    etages.forEach(([titre, val], i) => {
      const w = 330 - i * 58, h = 72, x = 24 + (320 - w) / 2, y = 596 - (i + 1) * 78, fait = this.niveau > i, ici = this.niveau === i;
      const c = fait ? col : ici ? [255, 215, 80] : [225, 225, 230];
      if (ici) { ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 5); rrect(ctx, x - 8, y - 6, w + 16, h + 12, 16, [255, 240, 150]); ctx.globalAlpha = 1; }
      carte([x, y, w, h], c, fonce(c, 0.7), i <= this.niveau && i < 4 ? () => this.va(i) : null);
      ecrit(ctx, titre, 15, fait || ici ? [255, 255, 255] : [150, 150, 160], [x + w / 2, y + 18], fait || ici ? fonce(c, 0.5) : null);
      const tl = val.length > 18 ? 15 : 18;
      if (val) ecrit(ctx, val.length > 24 ? val.slice(0, 23) + "…" : val, tl, [255, 255, 255], [x + w / 2, y + 48], fonce(c, 0.5));
    });
    if (this.niveau >= 4) { const y = 596 - 4 * 78 - 34; etoile(ctx, 184, y, 26 + 3 * Math.sin(t * 4), [255, 210, 60], t); }

    // --- à droite : la question et les grandes cartes
    const X = 370, Y = 86, LW = 890;
    ecrit(ctx, this.question(), 32, fonce(col, 0.45), [X + LW / 2, Y + 22]);
    const grille = (items, cols, w, h, dessin, choisi, action, parPage) => {
      const pages = Math.max(1, Math.ceil(items.length / parPage)), page = (this.page = Math.min(this.page, pages - 1));
      const gx = (LW - cols * w - (cols - 1) * 18) / 2;
      items.slice(page * parPage, page * parPage + parPage).forEach((it, i) => {
        const r = [X + gx + (i % cols) * (w + 18), Y + 60 + Math.floor(i / cols) * (h + 18), w, h], on = choisi(it);
        carte(r, on ? [255, 250, 225] : [255, 255, 255], on ? [90, 180, 90] : fonce(col, 0.75), () => action(it));
        dessin(it, r, on);
        if (on) { rond(ctx, r[0] + r[2] - 18, r[1] + 18, 16, [90, 180, 90], 3); ecrit(ctx, "✓", 20, [255, 255, 255], [r[0] + r[2] - 18, r[1] + 19]); }
      });
      if (pages > 1) {
        bouton([X + LW - 210, Y + 470, 96, 48], "◀", [150, 160, 190], () => { this.page = (page - 1 + pages) % pages; joue("clic"); }, 24);
        bouton([X + LW - 104, Y + 470, 96, 48], "▶", [150, 160, 190], () => { this.page = (page + 1) % pages; joue("clic"); }, 24);
        ecrit(ctx, `${page + 1} / ${pages}`, 18, fonce(col, 0.5), [X + LW - 250, Y + 494]);
      }
    };
    const titreCarte = (r, texte, y = r[1] + r[3] - 22, taille = 20) => {
      let tl = taille; ctx.font = `700 ${tl}px Fredoka, sans-serif`; while (tl > 12 && ctx.measureText(texte).width > r[2] - 16) { tl--; ctx.font = `700 ${tl}px Fredoka, sans-serif`; }
      ecrit(ctx, texte, tl, CONTOUR, [r[0] + r[2] / 2, y]);
    };
    if (this.niveau === 0) {
      grille(THEMES_GUIDE, 3, 270, 200, (th2, r) => { rrect(ctx, r[0] + 10, r[1] + 10, r[2] - 20, r[3] - 64, 14, clair(th2.col, 0.55)); emoji(ctx, th2.icone, r[0] + r[2] / 2, r[1] + 72, 72); titreCarte(r, LANGUE === "en" ? th2.en : th2.fr, r[1] + r[3] - 28, 24); },
        (th2) => this.choix.theme === th2.id, (th2) => { this.choix.theme = th2.id; this.va(1); }, 6);
    } else if (this.niveau === 1) {
      grille(this.lieux(), 4, 200, 136, (l, r) => { ctx.save(); ctx.beginPath(); ctx.roundRect(r[0] + 6, r[1] + 6, r[2] - 12, r[3] - 46, 12); ctx.clip(); ctx.drawImage(miniLieu(l), r[0] + 6, r[1] + 6, r[2] - 12, (r[2] - 12) * 128 / 245); ctx.restore(); titreCarte(r, tr("lieux")[l] || l, r[1] + r[3] - 20, 19); },
        (l) => this.choix.lieu === l, (l) => { this.choix.lieu = l; this.choix.action = null; this.va(2); }, 12);
    } else if (this.niveau === 2) {
      const { liste, ici } = this.actions();
      grille(liste, 4, 200, 136, (a, r) => { emoji(ctx, ICONES_ACTIONS[a] || "✨", r[0] + r[2] / 2, r[1] + 52, 52); titreCarte(r, tr("actions")[a] || a, r[1] + r[3] - 24, 19);
        if (liste.indexOf(a) < ici) { etoile(ctx, r[0] + 20, r[1] + 20, 11, [255, 200, 60]); } },
        (a) => this.choix.action === a, (a) => { this.choix.action = a; if (!this.e) this.choix.presents = ["arthur"]; this.va(3); }, 12);
    } else if (this.niveau === 3) {
      const { liste, sugg } = this.gens();
      grille(liste, 6, 132, 120, (id, r) => { const [w2, h2] = tailleElement({ type: "perso", id }), ech = Math.min(96 / w2, 80 / h2, 1);
        ctx.save(); ctx.beginPath(); ctx.roundRect(r[0] + 4, r[1] + 4, r[2] - 8, r[3] - 30, 12); ctx.clip(); dessineAmi(ctx, id, r[0] + r[2] / 2, r[1] + r[3] - 30, t, 1, 0, 0, ech); ctx.restore();
        titreCarte(r, nomCourt(id), r[1] + r[3] - 14, 15); if (sugg.includes(id)) etoile(ctx, r[0] + 18, r[1] + 18, 10, [255, 200, 60]); },
        (id) => this.choix.presents.includes(id), (id) => { const p = this.choix.presents; this.choix.presents = p.includes(id) ? p.filter((x) => x !== id) : p.concat([id]); joue("clic"); }, 18);
      this.boutonOk = () => bouton([W - 300, 640, 280, 64], "✓ " + ftr("C'est bon !", "Done!"), [90, 180, 90], () => { if (!this.choix.presents.length) this.choix.presents = ["arthur"]; this.ajouteScene(); }, 26);
    } else {
      const choix = [
        ["➕", ftr("Encore ici", "More here"), tr("lieux")[this.choix.lieu] || "", [250, 170, 90], () => { this.choix.action = null; this.va(2); }],
        ["🗺️", ftr("Aller ailleurs", "Go somewhere else"), ftr("autre endroit", "another place"), [110, 170, 240], () => { this.choix.theme = null; this.choix.lieu = null; this.choix.action = null; this.va(0); }],
        ["▶", ftr("Regarder mon histoire", "Watch my story"), `${this.e.etapes.length} ${ftr("scène(s)", "scene(s)")}`, [90, 180, 90], () => this.regarde()],
        ["✏️", ftr("Retoucher les détails", "Fine-tune"), ftr("textes, nuit, toucher…", "texts, night, taps…"), [170, 140, 220], () => this.retouche()],
      ];
      choix.forEach(([ic, titre, sous, c, action], i) => {
        const r = [X + 30 + (i % 2) * 430, Y + 70 + Math.floor(i / 2) * 200, 400, 180];
        carte(r, clair(c, 0.55), fonce(c, 0.7), action);
        emoji(ctx, ic, r[0] + 70, r[1] + r[3] / 2, 64); ecrit(ctx, titre, 26, CONTOUR, [r[0] + 130, r[1] + 72], null, true); ecrit(ctx, sous, 18, [110, 100, 90], [r[0] + 130, r[1] + 112], null, true);
      });
    }

    // --- en bas : les scènes déjà faites
    const et = this.e ? this.e.etapes : [];
    ecrit(ctx, ftr("Mon histoire :", "My story:"), 18, fonce(col, 0.45), [370, 626], null, true);
    if (!et.length) ecrit(ctx, ftr("(pas encore de scène)", "(no scene yet)"), 17, [150, 140, 130], [520, 626], null, true);
    const vis = et.slice(-7);
    vis.forEach((s, i) => {
      const r = [370 + i * 128, 642, 118, 66], n = et.length - vis.length + i + 1;
      ctx.save(); ctx.beginPath(); ctx.roundRect(...r, 10); ctx.clip(); ctx.drawImage(miniLieu(s.decor), r[0], r[1], r[2], r[2] * 128 / 245); ctx.restore();
      rrect(ctx, ...r, 10, null, 3, fonce(col, 0.7)); rond(ctx, r[0] + 16, r[1] + 16, 13, [255, 255, 255], 2); ecrit(ctx, String(n), 15, CONTOUR, [r[0] + 16, r[1] + 17]);
      emoji(ctx, ICONES_ACTIONS[s.action] || "✨", r[0] + r[2] - 20, r[1] + r[3] - 20, 26);
    });
    if (this.niveau === 3 && this.boutonOk) this.boutonOk(); // « C'est bon ! » : la scène est prête
    else if (et.length) bouton([W - 220, 646, 200, 58], "▶ " + ftr("Regarder", "Watch"), [90, 180, 90], () => this.regarde(), 22);
    this.boutonOk = null;
  }
}

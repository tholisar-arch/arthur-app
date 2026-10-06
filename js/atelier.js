// L'atelier des personnages : on crée et on habille Arthur, Jean-Eudes, Célestin, Papi, Mamie…
// Les personnages de base viennent de personnages.json ; les changements faits ici sont gardés
// sur l'appareil (localStorage).
"use strict";

const CLE_LOCALE = "tracto.personnages.v1";
const NOMS_COIFFURES = { court: "Court", herisse: "En pics", boucle: "Bouclés", milong: "Mi-longs", long: "Longs", couettes: "Couettes", chignon: "Chignon", chauve: "Dégarni" };
const NOMS_DESSINS = { tractopelle: "Tractopelle", dino: "Dinosaure", etoile: "Étoile", coeur: "Cœur" };

async function chargePersonnages() {
  let fichier = {}, local = { modifies: {}, supprimes: [] };
  try { fichier = await (await fetch("personnages.json", { cache: "no-store" })).json(); } catch (e) { /* on garde ceux de base */ }
  try { local = { modifies: {}, supprimes: [], ...JSON.parse(localStorage.getItem(CLE_LOCALE) || "{}") }; } catch (e) { /* pas de stockage */ }
  const tout = { ...PERSONNAGES_DEFAUT, ...fichier, ...local.modifies };
  for (const id of local.supprimes) if (!PERSONNAGES_DEFAUT[id]) delete tout[id];
  definitPersonnages(tout);
  return local;
}

const auHasard = (l) => l[Math.floor(Math.random() * l.length)];
function modeleAuHasard(nom, age = "enfant") {
  const fille = Math.random() < 0.5;
  return {
    nom, age, peau: auHasard(Object.keys(PALETTES.peau)), cheveux: auHasard(Object.keys(PALETTES.cheveux).filter((c) => age === "adulte" || !["gris", "blanc"].includes(c))),
    coiffure: auHasard(fille ? ["long", "milong", "couettes", "boucle", "chignon"] : ["court", "herisse", "boucle", "milong"]),
    yeux: auHasard(Object.keys(PALETTES.yeux)), haut: auHasard(Object.keys(PALETTES.habits)), bas: auHasard(["jean", "marine", "noir", "beige", "rouge", "vert"]),
    robe: fille && Math.random() < 0.6, cils: fille, dessin: auHasard(DESSINS_TSHIRT),
  };
}

class Atelier {
  constructor(app) {
    this.app = app; this.sel = "arthur"; this.onglet = "visage"; this.page = 0;
    this.zones = []; this.local = { modifies: {}, supprimes: [] }; this.messageT = 0;
  }
  ouvre() {
    if (!PERSONNAGES[this.sel]) this.sel = Object.keys(PERSONNAGES)[0];
    this.app.etat = "perso";
    this.app.voix.dire("L'atelier des personnages ! Choisis qui tu veux habiller.");
  }
  sauve() {
    try { localStorage.setItem(CLE_LOCALE, JSON.stringify(this.local)); this.messageT = 2.5; } catch (e) { /* stockage indisponible */ }
  }
  modifie(champs) {
    const p = { ...PERSONNAGES[this.sel], ...champs };
    this.local.modifies[this.sel] = p;
    definitPersonnages({ ...PERSONNAGES, [this.sel]: p });
    this.sauve();
    joue("pop");
  }
  nouveau() {
    const nom = (window.prompt("Prénom du nouveau personnage ?") || "").trim();
    if (!nom) return;
    let id = sansAccent(nom).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "perso", base = id, n = 2;
    while (PERSONNAGES[id]) id = `${base}-${n++}`;
    const p = modeleAuHasard(nom);
    this.local.modifies[id] = p;
    this.local.supprimes = this.local.supprimes.filter((x) => x !== id);
    definitPersonnages({ ...PERSONNAGES, [id]: p });
    this.sel = id;
    this.page = Math.floor(Object.keys(PERSONNAGES).indexOf(id) / 8);
    this.sauve(); joue("magie");
    this.app.voix.dire(`Bonjour ${nom} !`);
  }
  renomme() {
    const nom = (window.prompt("Nouveau prénom ?", PERSONNAGES[this.sel].nom) || "").trim();
    if (nom) this.modifie({ nom });
  }
  supprime() {
    const p = PERSONNAGES[this.sel];
    if (PERSONNAGES_DEFAUT[this.sel] || !window.confirm(`Supprimer ${p.nom} ?`)) return;
    const reste = { ...PERSONNAGES };
    delete reste[this.sel];
    delete this.local.modifies[this.sel];
    this.local.supprimes.push(this.sel);
    definitPersonnages(reste);
    this.sel = "arthur";
    this.sauve();
  }
  hasard() {
    const p = PERSONNAGES[this.sel], h = modeleAuHasard(p.nom, p.age);
    this.modifie({ ...h, taille: p.taille, muscle: p.muscle });
    joue("magie");
  }
  touche(p) {
    for (const z of this.zones) {
      const ok = z.cercle ? Math.hypot(p[0] - z.cercle[0], p[1] - z.cercle[1]) < z.cercle[2] : dans(z.r, p);
      if (ok) { z.action(); if (this.app.etat === "perso") this.app.dessine(); return; } // redessine : zones à jour pour le toucher suivant
    }
  }

  // ------------------------------------------------ dessin
  dessine(ctx, t) {
    const z = (this.zones = []), app = this.app, p = PERSONNAGES[this.sel], st = STYLES[this.sel];
    const bouton = (r, texte, col, action, taille = 22, actif = true) => {
      rrect(ctx, r[0], r[1] + 4, r[2], r[3], 14, fonce(col, 0.6));
      rrect(ctx, r[0], r[1], r[2], r[3], 14, actif ? col : [200, 200, 205], 3);
      ecrit(ctx, texte, taille, [255, 255, 255], [r[0] + r[2] / 2, r[1] + r[3] / 2], fonce(actif ? col : [160, 160, 165], 0.55));
      if (actif) z.push({ r, action });
    };
    app.bRetour.dessine(ctx);
    z.push({ r: app.bRetour.r, action: () => app.menu() });
    ecrit(ctx, "L'atelier des personnages", 40, [255, 200, 40], [W / 2, 40], [200, 80, 40]);
    bouton([W - 200, 14, 182, 52], "Au hasard !", [240, 130, 50], () => this.hasard(), 22);

    // --- la liste à gauche
    const ids = Object.keys(PERSONNAGES), pages = Math.max(1, Math.ceil(ids.length / 8));
    this.page = Math.min(this.page, pages - 1);
    ids.slice(this.page * 8, this.page * 8 + 8).forEach((id, i) => {
      const r = [20, 84 + i * 64, 275, 56], choisi = id === this.sel;
      rrect(ctx, ...r, 14, choisi ? [255, 248, 215] : [255, 255, 255], choisi ? 5 : 3, choisi ? [255, 140, 30] : CONTOUR);
      ctx.save(); ctx.beginPath(); ctx.rect(r[0] + 4, r[1] + 3, 64, r[3] - 6); ctx.clip();
      const s2 = STYLES[id], ech = s2.L > 70 ? 0.4 : 0.52;
      personne(ctx, r[0] + 36, r[1] + 30 + (s2.L + s2.T + s2.R - 6) * ech, ech, t, 1, 0, 0, null, id);
      ctx.restore();
      ecrit(ctx, PERSONNAGES[id].nom, 24, CONTOUR, [r[0] + 78, r[1] + 14], null, true);
      z.push({ r, action: () => { this.sel = id; joue("clic"); app.voix.dire(PERSONNAGES[id].nom); } });
    });
    bouton([20, 84 + 8 * 64, 275, 56], "+ Nouveau", [70, 185, 90], () => this.nouveau(), 24);
    if (pages > 1) {
      bouton([20, 664, 80, 44], "◀", [110, 140, 220], () => { this.page = mod(this.page - 1, pages); }, 22);
      ecrit(ctx, `${this.page + 1}/${pages}`, 20, CONTOUR, [157, 686]);
      bouton([215, 664, 80, 44], "▶", [110, 140, 220], () => { this.page = mod(this.page + 1, pages); }, 22);
    }

    // --- le personnage au centre
    rrect(ctx, 312, 80, 395, 555, 22, [215, 240, 255], 4);
    rrect(ctx, 316, 560, 387, 71, 0, [150, 205, 110]);
    ecrit(ctx, p.nom, 34, [255, 255, 255], [510, 116], [90, 120, 200]);
    const ech = 380 / (st.L + st.T + 2 * st.R), salut = Math.sin(t * 1.4) > 0.6;
    dessineAmi(ctx, this.sel, 510, 590, t, 1, 0, 0, ech, salut ? "joie" : null);
    bouton([318, 648, 186, 52], "Renommer", [110, 140, 220], () => this.renomme(), 22);
    bouton([516, 648, 186, 52], "Supprimer", [210, 80, 80], () => this.supprime(), 22, !PERSONNAGES_DEFAUT[this.sel]);

    // --- les réglages à droite
    [["visage", "Visage"], ["habits", "Habits"], ["plus", "Plus"]].forEach(([o, nom], k) => {
      const r = [725 + k * 180, 82, 168, 50], actif = this.onglet === o;
      rrect(ctx, ...r, 14, actif ? [255, 200, 60] : [255, 255, 255], 3);
      ecrit(ctx, nom, 24, actif ? [120, 60, 20] : CONTOUR, [r[0] + r[2] / 2, r[1] + r[3] / 2]);
      z.push({ r, action: () => { this.onglet = o; joue("clic"); } });
    });
    const titre = (texte, y) => ecrit(ctx, texte, 22, CONTOUR, [735, y], null, true);
    const nuancier = (y, pal, champ, extra = []) => { // rangée de pastilles de couleur
      const noms = extra.concat(Object.keys(PALETTES[pal])), pas = Math.min(52, 520 / noms.length), r = Math.min(21, pas / 2 - 3);
      noms.forEach((nom, i) => {
        const x = 755 + i * pas, cy = y + 52, col = nom === "peau" ? st.peau : PALETTES[pal][nom], choisi = (p[champ] || "") === nom;
        if (choisi) rond(ctx, x, cy, r + 7, [255, 255, 255], 3);
        rond(ctx, x, cy, r, col, 3);
        if (nom === "peau") ecrit(ctx, "nu", 13, CONTOUR, [x, cy]);
        z.push({ cercle: [x, cy, r + 6], action: () => this.modifie({ [champ]: nom }) });
      });
    };
    const choix = (y, options, choisi, action, largeur = 150) => { // rangée de boutons texte
      options.forEach(([val, texte], i) => {
        const r = [735 + i * (largeur + 12), y + 30, largeur, 46], on = choisi(val);
        rrect(ctx, ...r, 12, on ? [255, 200, 60] : [255, 255, 255], on ? 4 : 2, on ? [200, 120, 30] : CONTOUR);
        ecrit(ctx, texte, 20, CONTOUR, [r[0] + r[2] / 2, r[1] + r[3] / 2]);
        z.push({ r, action: () => action(val) });
      });
    };
    const vignettes = (y, valeurs, choisi, dessin, action) => { // petites cases illustrées
      valeurs.forEach((val, i) => {
        const r = [735 + i * 64, y + 28, 58, 58], on = choisi(val);
        rrect(ctx, ...r, 10, on ? [255, 248, 215] : [255, 255, 255], on ? 4 : 2, on ? [255, 140, 30] : CONTOUR);
        ctx.save(); ctx.beginPath(); ctx.rect(r[0] + 2, r[1] + 2, r[2] - 4, r[3] - 4); ctx.clip();
        dessin(val, r[0] + 29, r[1] + 29);
        ctx.restore();
        z.push({ r, action: () => action(val) });
      });
    };
    if (this.onglet === "visage") {
      titre("Peau", 148); nuancier(148, "peau", "peau");
      titre("Yeux", 266); nuancier(266, "yeux", "yeux");
      titre("Cheveux", 384); nuancier(384, "cheveux", "cheveux");
      titre(`Coiffure : ${NOMS_COIFFURES[st.coiffure]}`, 502);
      vignettes(502, COIFFURES, (c) => st.coiffure === c, (c, cx, cy) => {
        STYLES.__apercu = styleDe({ ...p, coiffure: c, age: "enfant", taille: "moyen" });
        const s3 = STYLES.__apercu, e3 = 0.95;
        personne(ctx, cx, cy + (s3.L + s3.T + s3.R - 6) * e3 + 6, e3, 0.5, 1, 0, 0, null, "__apercu");
      }, (c) => this.modifie({ coiffure: c }));
    } else if (this.onglet === "habits") {
      titre("Haut", 148); nuancier(148, "habits", "haut");
      titre("Bas", 266); nuancier(266, "habits", "bas", ["peau"]);
      titre("Robe", 384); choix(384, [[false, "Non"], [true, "Oui"]], (v) => !!p.robe === v, (v) => this.modifie({ robe: v, bas: v && p.bas === "jean" ? "peau" : p.bas }));
      titre(`Dessin sur le haut : ${NOMS_DESSINS[st.dessin] || "aucun"}`, 502);
      vignettes(502, DESSINS_TSHIRT, (d) => (st.dessin || null) === d, (d, cx, cy) => {
        if (d === "tractopelle") dessineVehicule(ctx, "tractopelle", "jaune", cx + 4, cy + 20, 0.5, 0.3, 0, 0.21);
        else if (d === "dino") dinoLongCou(ctx, cx - 4, cy + 24, 0.2, undefined, 0.5);
        else if (d === "etoile") etoile(ctx, cx, cy, 20, [255, 215, 60]);
        else if (d === "coeur") coeur(ctx, cx, cy - 4, 17, [230, 60, 90]);
        else ecrit(ctx, "Aucun", 15, [150, 140, 130], [cx, cy]);
      }, (d) => this.modifie({ dessin: d }));
    } else {
      titre("Âge", 148); choix(148, [["enfant", "Enfant"], ["adulte", "Adulte"]], (v) => (p.age || "enfant") === v, (v) => this.modifie({ age: v }));
      titre("Taille", 266); choix(266, [["petit", "Petit"], ["moyen", "Moyen"], ["grand", "Grand"]], (v) => (p.taille || "moyen") === v, (v) => this.modifie({ taille: v }));
      const bascule = (champ) => (v) => this.modifie({ [champ]: !p[champ] });
      titre("Accessoires", 384);
      choix(384, [["lunettes", "Lunettes"], ["couronne", "Couronne"], ["cils", "Cils"]], (v) => !!p[v], (v) => bascule(v)(v));
      choix(470, [["moustache", "Moustache"], ["barbe", "Barbe"], ["muscle", "Musclé"]], (v) => !!p[v], (v) => bascule(v)(v));
    }
    ecrit(ctx, this.messageT > 0 ? "✓ Enregistré sur cet appareil" : "Les changements sont gardés sur cet appareil", 17,
      this.messageT > 0 ? [60, 150, 70] : [150, 140, 130], [995, 700]);
  }
}

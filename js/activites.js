// Tout ce qu'un enfant peut vivre dans une histoire : de nouveaux lieux et des activités de tous les jours
// (parc, anniversaire, bain, docteur, train, fusée…). Chaque activité est décrite une fois ici (dessin, endroit à
// toucher, son, textes, mots-clés) et devient disponible partout : histoires, texte libre, dictée, éditeur, IA.
"use strict";

// ================================================================= les nouveaux lieux
const INTERIEURS = new Set(["maison", "magasin", "docteur"]); // dedans : le camion reste dehors (sauf pour les travaux)
const AVEC_ENGIN = new Set(["rouler", "trou", "deblayer", "construire", "route", "fenetres", "pont", "arbre", "panne", "laver", "copains", "spectacle", "voler", "feu"]);
const murInterieur = (ctx, W, horizon, col, scroll) => {
  rrect(ctx, 0, 0, W, horizon + 20, 0, col);
  for (let x = mod(-scroll * 0.3, 60) - 60; x < W; x += 60) rrect(ctx, x, 0, 22, horizon, 0, clair(col, 0.25));
};
const fenetreMur = (ctx, x, y, w, h, nuit, t) => {
  rrect(ctx, x - 8, y - 8, w + 16, h + 16, 8, [255, 255, 255], 3);
  rrect(ctx, x, y, w, h, 4, nuit ? [30, 35, 80] : [150, 205, 250]);
  if (nuit) { rond(ctx, x + w * 0.7, y + h * 0.3, 14, [250, 245, 200]); for (let k = 0; k < 5; k++) rond(ctx, x + 10 + k * w / 5, y + 12 + (k % 2) * 20, 2, [255, 255, 220]); }
  else { nuage(ctx, x + 14, y + h * 0.35, 0.5); rond(ctx, x + w - 22, y + 22, 13, [255, 220, 70]); }
  trait(ctx, [x + w / 2, y], [x + w / 2, y + h], 5, [255, 255, 255]); trait(ctx, [x, y + h / 2], [x + w, y + h / 2], 5, [255, 255, 255]);
};
const DECORS_EXTRA = {
  parc: { ciel: [[100, 185, 250], [220, 245, 255]], sol: [[140, 205, 90], [222, 200, 150]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll);
      for (let k = 0; k < 4; k++) arbre(ctx, boucle(k * 300 + 60, scroll, 0.35, W), hz + 5, 1.05, [[80, 170, 80], [100, 180, 70]][k % 2]);
      const x = boucle(820, scroll, 0.4, W, 300); // une petite aire de jeux au fond
      trait(ctx, [x, hz], [x, hz - 90], 5, [230, 90, 80]); trait(ctx, [x + 70, hz], [x + 70, hz - 90], 5, [230, 90, 80]);
      trait(ctx, [x - 6, hz - 90], [x + 76, hz - 90], 6, [230, 90, 80]);
      trait(ctx, [x + 22, hz - 90], [x + 22, hz - 34], 2, [90, 90, 90]); rrect(ctx, x + 12, hz - 36, 22, 6, 2, [250, 200, 60]);
      const bx = boucle(1120, scroll, 0.4, W, 300); // un banc
      rrect(ctx, bx, hz - 30, 80, 8, 3, [180, 120, 70], 2); rrect(ctx, bx, hz - 46, 80, 8, 3, [180, 120, 70], 2);
      for (const dx of [6, 66]) trait(ctx, [bx + dx, hz - 22], [bx + dx, hz], 4, [90, 90, 100]);
    } },
  zoo: { ciel: [[100, 185, 245], [225, 245, 255]], sol: [[140, 200, 90], [220, 195, 140]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll, [160, 210, 110], [130, 190, 90], false);
      for (let k = 0; k < 3; k++) palmier(ctx, boucle(k * 360 + 100, scroll, 0.3, W), hz, 0.8);
      const x = boucle(860, scroll, 0.35, W, 300); // l'entrée du zoo
      for (const dx of [-120, 120]) rrect(ctx, x + dx - 14, hz - 170, 28, 170, 4, [160, 110, 70], 3);
      rrect(ctx, x - 140, hz - 200, 280, 50, 14, [80, 160, 90], 3);
      ecrireCentre(ctx, "ZOO", x, hz - 175, 36, [255, 255, 255]);
      for (let k = 0; k < 40; k++) { const px = boucle(k * 34, scroll, 0.5, W, 40); trait(ctx, [px, hz], [px, hz - 44], 4, [130, 100, 70]); }
      trait(ctx, [0, hz - 36], [W, hz - 36], 3, [130, 100, 70]); trait(ctx, [0, hz - 16], [W, hz - 16], 3, [130, 100, 70]);
    } },
  maison: { ciel: [[250, 236, 210], [250, 236, 210]], sol: [[200, 150, 105], [225, 175, 130]], interieur: true,
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [252, 228, 196], scroll);
      fenetreMur(ctx, boucle(520, scroll, 0.3, W, 300), hz - 260, 170, 140, nuit, t);
      const cx = boucle(940, scroll, 0.3, W, 300); // un tableau (un camion dessiné) et une lampe
      rrect(ctx, cx - 60, hz - 250, 120, 90, 6, [255, 255, 255], 5, [190, 140, 90]);
      dessineVehicule(ctx, "tractopelle", COULEURS.jaune, cx, hz - 172, 0, 0, 0, 0.22);
      const lx = boucle(1200, scroll, 0.3, W, 300);
      trait(ctx, [lx, hz], [lx, hz - 150], 5, [120, 110, 100]); poly(ctx, [[lx - 40, hz - 150], [lx + 40, hz - 150], [lx + 24, hz - 200], [lx - 24, hz - 200]], [255, 220, 120], 3);
      if (nuit) { ctx.globalAlpha = 0.25; rond(ctx, lx, hz - 170, 90, [255, 230, 150]); ctx.globalAlpha = 1; }
      rrect(ctx, 0, hz - 6, W, 14, 0, [255, 255, 255], 2); // la plinthe
    } },
  magasin: { ciel: [[240, 244, 250], [240, 244, 250]], sol: [[200, 205, 215], [230, 232, 238]], interieur: true,
    fond(ctx, W, H, hz, scroll, t) {
      murInterieur(ctx, W, hz, [235, 242, 250], scroll);
      const produits = [[230, 80, 80], [255, 200, 60], [90, 170, 240], [110, 200, 110], [240, 140, 200], [250, 150, 60]];
      for (let r = 0; r < 4; r++) {
        const y = hz - 60 - r * 62;
        rrect(ctx, 0, y, W, 10, 0, [170, 150, 130]);
        for (let k = 0; k < 26; k++) { const x = mod(k * 44 + r * 17 - scroll * 0.3, W + 44) - 22; rrect(ctx, x, y - 40, 30, 40, 5, produits[(k + r) % produits.length], 2); }
      }
      const x = boucle(820, scroll, 0.2, W, 300);
      rrect(ctx, x - 150, 20, 300, 56, 16, [235, 90, 80], 4);
      ecrireCentre(ctx, LANGUE === "en" ? "SHOP" : "MAGASIN", x, 50, 34, [255, 255, 255]);
    } },
  docteur: { ciel: [[232, 245, 250], [232, 245, 250]], sol: [[190, 215, 225], [215, 235, 240]], interieur: true,
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [225, 242, 248], scroll);
      const x = boucle(560, scroll, 0.3, W, 300);
      rrect(ctx, x - 60, hz - 270, 120, 120, 20, [255, 255, 255], 4, [220, 80, 80]);
      rrect(ctx, x - 16, hz - 250, 32, 80, 4, [230, 70, 70]); rrect(ctx, x - 40, hz - 226, 80, 32, 4, [230, 70, 70]);
      fenetreMur(ctx, boucle(1120, scroll, 0.3, W, 300), hz - 260, 150, 120, nuit, t);
      const lx = boucle(860, scroll, 0.3, W, 300); // un lit d'examen et une plante
      rrect(ctx, lx - 90, hz - 70, 180, 26, 8, [255, 255, 255], 3); for (const dx of [-80, 80]) trait(ctx, [lx + dx, hz - 44], [lx + dx, hz], 5, [150, 160, 170]);
      const px = boucle(1300, scroll, 0.3, W, 300); rrect(ctx, px - 22, hz - 46, 44, 46, 6, [210, 120, 80], 3);
      for (const [dx, dy] of [[-18, -70], [0, -86], [18, -70]]) ovale(ctx, px + dx - 12, hz + dy, 24, 40, [80, 170, 90], 2);
    } },
  gare: { ciel: [[110, 185, 245], [220, 240, 255]], sol: [[150, 200, 110], [190, 185, 180]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll);
      const x = boucle(860, scroll, 0.3, W, 300);
      rrect(ctx, x - 200, hz - 150, 400, 150, 0, [235, 215, 180], 3);
      poly(ctx, [[x - 230, hz - 150], [x + 230, hz - 150], [x + 190, hz - 200], [x - 190, hz - 200]], [180, 80, 70], 3);
      rond(ctx, x, hz - 175, 20, [255, 255, 255], 3); trait(ctx, [x, hz - 175], [x, hz - 188], 3, CONTOUR); trait(ctx, [x, hz - 175], [x + 9, hz - 175], 3, CONTOUR);
      for (const dx of [-150, -60, 60, 150]) rrect(ctx, x + dx - 26, hz - 120, 52, 70, 6, VITRE, 3);
      rrect(ctx, x - 70, hz - 140, 140, 22, 6, [60, 110, 190]);
      ecrireCentre(ctx, LANGUE === "en" ? "STATION" : "GARE", x, hz - 129, 18, [255, 255, 255]);
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { // les rails
      const y = G + 30;
      for (let k = 0; k < 40; k++) rrect(ctx, mod(k * 40 - scroll, W + 40) - 20, y - 8, 14, 30, 2, [130, 95, 70]);
      trait(ctx, [0, y], [W, y], 5, [120, 120, 130]); trait(ctx, [0, y + 14], [W, y + 14], 5, [120, 120, 130]);
    } },
  espace: { ciel: [[20, 22, 55], [45, 35, 90]], sol: [[150, 150, 165], [175, 175, 190]],
    fond(ctx, W, H, hz, scroll, t) {
      const r = hasard(11);
      for (let k = 0; k < 70; k++) rond(ctx, r() * W, r() * hz, 1 + (k % 3) * 0.7 + 0.6 * Math.sin(t * 2 + k), [255, 255, 230]);
      const p1 = boucle(260, scroll, 0.1, W, 200), p2 = boucle(800, scroll, 0.15, W, 200);
      rond(ctx, p1, 120, 48, [240, 150, 90], 3); ovale(ctx, p1 - 80, 112, 160, 22, null, 4, [250, 220, 150]);
      rond(ctx, p2, 90, 30, [90, 160, 240], 3); ovale(ctx, p2 - 14, 78, 22, 14, [110, 200, 110]);
      rond(ctx, boucle(560, scroll, 0.12, W, 200), 220, 18, [220, 90, 90], 3);
    },
    devant(ctx, W, H, hz, scroll, t) { for (let k = 0; k < 8; k++) ovale(ctx, mod(k * 170 - scroll, W + 170) - 85, hz + 34 + (k % 3) * 22, 60, 16, [140, 140, 155], 2); } },
  aeroport: { ciel: [[95, 180, 250], [220, 242, 255]], sol: [[150, 200, 110], [120, 125, 135]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      const x = boucle(1060, scroll, 0.3, W, 300); // la tour de contrôle et le hangar
      rrect(ctx, x - 16, hz - 210, 32, 210, 0, [235, 235, 240], 3); rrect(ctx, x - 44, hz - 250, 88, 44, 10, VITRE, 3);
      const hx = boucle(620, scroll, 0.3, W, 300);
      rrect(ctx, hx - 130, hz - 110, 260, 110, 0, [200, 205, 215], 3); ovale(ctx, hx - 130, hz - 160, 260, 100, [200, 205, 215], 3);
      rrect(ctx, hx - 130, hz - 110, 260, 10, 0, [200, 205, 215]);
      const mx = boucle(1340, scroll, 0.3, W, 300); trait(ctx, [mx, hz], [mx, hz - 100], 4, [120, 120, 130]);
      poly(ctx, [[mx, hz - 100], [mx + 50, hz - 92 + 4 * Math.sin(t * 4)], [mx, hz - 80]], [255, 140, 40], 2);
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { for (let k = 0; k < 16; k++) rrect(ctx, mod(k * 110 - scroll, W + 110) - 55, G + 20, 60, 10, 3, [255, 255, 255]); } },
};
for (const [nom, d] of Object.entries(DECORS_EXTRA)) { CIELS[nom] = d.ciel; SOLS[nom] = d.sol; }

// ================================================================= les activités
// dessin(ctx, x, sol, e) avec e = { k: étapes faites, n: total, p: étape en cours (0→1) ou null, t, acteur, sc (la scène), fini (s) }
const elan = (e) => (e.p === null || e.p === undefined ? 0 : Math.sin(PI * e.p));
const acteurDe = (e) => e.acteur || "arthur";
const PRODUITS = [ // de petites choses à ramasser, ranger, acheter…
  (ctx, x, y) => { rond(ctx, x, y - 14, 15, [230, 60, 60], 3); trait(ctx, [x, y - 28], [x + 3, y - 36], 3, [120, 80, 40]); ovale(ctx, x + 2, y - 38, 12, 7, [90, 170, 70]); }, // pomme
  (ctx, x, y) => { ovale(ctx, x - 30, y - 18, 60, 18, [225, 170, 90], 3); for (const dx of [-14, 0, 14]) trait(ctx, [x + dx - 4, y - 14], [x + dx + 4, y - 6], 2, [180, 120, 60]); }, // pain
  (ctx, x, y) => { rrect(ctx, x - 12, y - 40, 24, 40, 5, [255, 255, 255], 3); rrect(ctx, x - 12, y - 28, 24, 12, 0, [90, 160, 240]); rrect(ctx, x - 6, y - 48, 12, 10, 3, [90, 160, 240], 2); }, // lait
  (ctx, x, y) => { poly(ctx, [[x - 22, y - 30], [x + 20, y - 4], [x + 24, y - 12], [x - 14, y - 34]], [255, 220, 70], 3); }, // banane
  (ctx, x, y) => { poly(ctx, [[x - 22, y], [x + 22, y], [x + 22, y - 22], [x - 22, y - 30]], [255, 210, 80], 3); rond(ctx, x - 6, y - 14, 4, [235, 180, 60]); rond(ctx, x + 10, y - 10, 3, [235, 180, 60]); }, // fromage
];
const JOUETS = [
  (ctx, x, y) => objetPerdu(ctx, "ballon", x, y + 6, 0),
  (ctx, x, y) => { rrect(ctx, x - 20, y - 40, 40, 40, 6, [90, 170, 240], 3); ecrireCentre(ctx, "A", x, y - 20, 24, [255, 255, 255]); },
  (ctx, x, y) => objetPerdu(ctx, "doudou", x, y + 4, 0),
  (ctx, x, y) => dessineVehicule(ctx, "benne", COULEURS.orange, x, y, 0, 0, 0, 0.25),
  (ctx, x, y) => { rrect(ctx, x - 22, y - 30, 44, 30, 6, [240, 140, 200], 3); rond(ctx, x, y - 30, 10, [240, 140, 200], 3); },
];
const COQUILLES = [
  (ctx, x, y) => { poly(ctx, [[x - 18, y], [x + 18, y], [x + 12, y - 22], [x, y - 28], [x - 12, y - 22]], [250, 200, 190], 3); for (const dx of [-8, 0, 8]) trait(ctx, [x + dx, y - 2], [x, y - 24], 2, [220, 150, 140]); },
  (ctx, x, y) => { ovale(ctx, x - 16, y - 22, 32, 22, [255, 230, 180], 3); arcRect(ctx, x - 8, y - 18, 16, 12, 0, 2 * PI, 2, [230, 180, 120]); },
  (ctx, x, y) => etoile(ctx, x, y - 14, 16, [250, 150, 90]),
];
function collecte(ctx, x, G, e, choses, depart, dest, dessineDest) { // des choses volent une à une vers un endroit
  dessineDest(ctx, e);
  for (let i = 0; i < e.n; i++) {
    const [sx, sy] = depart(i), [dx, dy] = dest(i), f = choses[i % choses.length];
    if (i < e.k) continue; // déjà rangée (dans la destination)
    if (i === e.k && e.p !== null && e.p !== undefined) { const u = Math.min(1, e.p * 1.4); f(ctx, lerp(sx, dx, u), lerp(sy, dy, u) - 120 * Math.sin(PI * u)); }
    else f(ctx, sx, sy);
  }
}
function personnage(ctx, e, x, y, s = 0.8, humeur = "joie") { dessineAmi(ctx, acteurDe(e), x, y, e.t, 1, 0, 0, s, humeur); }

const ACTIVITES = {
  // ---------------------------------------------------------------- au parc, les jeux
  toboggan: { fr: "Toboggan", en: "Slide", decor: "parc", clics: 3, prendActeur: true, son: "magie", poste: 140, cx: 600, largeur: 360,
    mots: "toboggans?|slide", modele: ["{prenom} grimpe sur le toboggan… et zou, ça glisse !", "{prenom} climbs up the slide… and whee, down he goes!"],
    consigne: ["Touche le haut du toboggan pour glisser !", "Tap the top of the slide to whoosh down!"],
    cible: (sc) => [sc.cx - 95, G - 190],
    dessin(ctx, x, G, e) {
      for (const dx of [-130, -100]) trait(ctx, [x + dx, G], [x + dx, G - 180], 7, [90, 140, 220]);
      for (let k = 1; k < 6; k++) trait(ctx, [x - 130, G - k * 30], [x - 100, G - k * 30], 5, [90, 140, 220]);
      rrect(ctx, x - 136, G - 186, 70, 12, 4, [90, 140, 220], 3);
      poly(ctx, [[x - 70, G - 184], [x - 50, G - 192], [x + 150, G - 22], [x + 150, G - 4], [x + 120, G - 4]], [250, 200, 60], 3);
      trait(ctx, [x + 150, G - 22], [x + 150, G], 6, [90, 140, 220]);
      if (e.objet) return;
      if (e.p !== null && e.p !== undefined) { const u = e.p; personnage(ctx, e, lerp(x - 80, x + 150, u), lerp(G - 186, G - 6, u) + 4, 0.75); }
      else personnage(ctx, e, x - 175, G, 0.85);
    } },
  balancoire: { fr: "Balançoire", en: "Swing", decor: "parc", clics: 3, prendActeur: true, son: "pop", poste: 140, cx: 620, largeur: 260,
    mots: "balancoires?|se balance|swings?", modele: ["{prenom} monte sur la balançoire. Plus haut, plus haut !", "{prenom} gets on the swing. Higher, higher!"],
    consigne: ["Touche la balançoire pour la pousser !", "Tap the swing to push it!"],
    angle: (e) => (0.12 + 0.4 * Math.min(1, (e.k + elan(e)) / Math.max(1, e.n))) * Math.sin(e.t * 2.6),
    cible(sc) { const a = this.angle(sc.etatAct()); return [sc.cx + 150 * Math.sin(a), G - 230 + 150 * Math.cos(a)]; },
    dessin(ctx, x, G, e) {
      for (const k of [-1, 1]) { trait(ctx, [x + k * 110, G], [x + k * 80, G - 240], 8, [230, 90, 80]); trait(ctx, [x + k * 150, G], [x + k * 90, G - 240], 8, [230, 90, 80]); }
      trait(ctx, [x - 100, G - 240], [x + 100, G - 240], 9, [230, 90, 80]);
      const a = e.objet ? 0 : this.angle(e), sx = x + 150 * Math.sin(a), sy = G - 240 + 150 * Math.cos(a);
      for (const dx of [-22, 22]) trait(ctx, [x + dx, G - 240], [sx + dx, sy], 3, [100, 100, 110]);
      if (!e.objet) personnage(ctx, e, sx, sy + 4, 0.7);
      rrect(ctx, sx - 30, sy - 4, 60, 10, 3, [250, 200, 60], 2);
    } },
  ballon: { fr: "Foot", en: "Soccer", decor: "parc", clics: 3, son: "pop", poste: 150, cx: 520, largeur: 520,
    mots: "foot|football|soccer|joue(nt)? au ballon|tire(nt)? au but|marque(nt)? un but|kick", modele: ["On joue au foot ! {prenom} tire au but…", "Let's play soccer! {prenom} kicks at the goal…"],
    consigne: ["Touche le ballon pour marquer un but !", "Tap the ball to score a goal!"],
    cible: (sc) => [sc.cx - 120, G - 26],
    dessin(ctx, x, G, e) {
      const bx = x + 250; // le but
      for (const dx of [-60, 60]) trait(ctx, [bx + dx, G], [bx + dx, G - 130], 8, [255, 255, 255]);
      trait(ctx, [bx - 60, G - 130], [bx + 60, G - 130], 8, [255, 255, 255]);
      for (let k = 1; k < 6; k++) trait(ctx, [bx - 60 + k * 20, G - 128], [bx - 60 + k * 20, G], 1, [200, 200, 210]);
      for (let k = 0; k < e.k; k++) etoile(ctx, bx - 40 + k * 26, G - 160, 11, [255, 210, 50]);
      if (e.objet) return objetPerdu(ctx, "ballon", x - 120, G, 0);
      const u = e.p !== null && e.p !== undefined ? Math.min(1, e.p * 1.3) : 0;
      objetPerdu(ctx, "ballon", lerp(x - 120, bx, u), G - 160 * Math.sin(PI * u) * 0.6, e.t);
    } },
  cerfvolant: { fr: "Cerf-volant", en: "Kite", decor: "parc", clics: 3, prendActeur: true, son: "magie", poste: 140, cx: 560,
    mots: "cerfs?[- ]volants?|kites?", modele: ["Le vent souffle ! {prenom} fait voler son cerf-volant.", "The wind is blowing! {prenom} flies his kite."],
    consigne: ["Touche le cerf-volant pour le faire monter !", "Tap the kite to make it fly higher!"],
    pos: (x, G, e) => [x + 160 + 30 * Math.sin(e.t * 1.3), G - 170 - 210 * Math.min(1, (e.k + elan(e)) / Math.max(1, e.n)) + 10 * Math.sin(e.t * 2)],
    cible(sc) { return this.pos(sc.cx, G, sc.etatAct()); },
    dessin(ctx, x, G, e) {
      const [kx, ky] = e.objet ? [x, G - 60] : this.pos(x, G, e), hx = x - 120, hy = G - 80;
      if (!e.objet) { personnage(ctx, e, x - 130, G, 0.85); trait(ctx, [hx + 20, hy], [kx, ky + 30], 2, [90, 90, 90]); }
      poly(ctx, [[kx, ky - 40], [kx + 30, ky], [kx, ky + 40], [kx - 30, ky]], [240, 80, 90], 3);
      poly(ctx, [[kx, ky - 40], [kx + 30, ky], [kx, ky]], [255, 200, 60], 0);
      for (let k = 0; k < 4; k++) { const qx = kx - 6 * Math.sin(e.t * 3 + k), qy = ky + 50 + k * 18; poly(ctx, [[qx - 8, qy - 5], [qx + 8, qy + 5], [qx + 8, qy - 5], [qx - 8, qy + 5]], [[90, 170, 240], [110, 200, 110]][k % 2], 0); }
    } },
  cubes: { fr: "Tour de cubes", en: "Block tower", decor: "maison", clics: 5, son: "pop", poste: 160, cx: 640,
    mots: "\\bcubes?\\b|lego|duplo|\\bblocks?\\b|tour de cubes", modele: ["On construit une grande tour de cubes. Encore un, encore un !", "Let's build a big block tower. One more, one more!"],
    consigne: ["Touche les cubes pour monter la tour !", "Tap the blocks to build the tower!"],
    cible: (sc) => [sc.cx - 190, G - 30],
    dessin(ctx, x, G, e) {
      const cols = [[230, 80, 80], [255, 200, 60], [90, 170, 240], [110, 200, 110], [200, 130, 240], [250, 150, 60], [240, 140, 200], [90, 200, 200]], lettres = "ABCDEFGH";
      const cube = (cx, cy, i) => { rrect(ctx, cx - 26, cy - 52, 52, 52, 8, cols[i % 8], 3); ecrireCentre(ctx, lettres[i % 8], cx, cy - 26, 26, [255, 255, 255]); };
      for (let i = 0; i < e.n; i++) { if (i < e.k) cube(x, G - i * 52, i); }
      if (!e.objet) for (let i = e.k; i < e.n; i++) { // le tas de cubes à poser
        const sx = x - 190 + ((i * 37) % 60) - 30, sy = G;
        if (i === e.k && e.p !== null && e.p !== undefined) { const u = Math.min(1, e.p * 1.4); cube(lerp(sx, x, u), lerp(sy, G - i * 52, u) - 90 * Math.sin(PI * u), i); }
        else cube(sx, sy - (i - e.k) * 6, i);
      }
    } },
  puzzle: { fr: "Puzzle", en: "Puzzle", decor: "maison", clics: 4, son: "pop", poste: 160, cx: 640,
    mots: "puzzles?|casse-tetes?|jigsaw", modele: ["On fait un puzzle : il faut mettre toutes les pièces !", "Let's do a puzzle: we need to put in all the pieces!"],
    consigne: ["Touche les pièces pour les mettre dans le puzzle !", "Tap the pieces to put them in the puzzle!"],
    depart: (x, i) => [x - 260 + (i % 2) * 70, 300 + Math.floor(i / 2) * 60],
    cible(sc) { return this.depart(sc.cx, Math.min(sc.fait, sc.n - 1)); },
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 20, G - 40, 260, 40, 6, [190, 140, 90], 3); // la table
      const ox = x + 10, oy = G - 250, c = 100, cols = [[150, 205, 250], [150, 205, 250], [140, 200, 90], [140, 200, 90]];
      rrect(ctx, ox - 6, oy - 6, 2 * c + 12, 2 * c + 12, 6, [255, 255, 255], 3);
      const piece = (px, py, i) => { rrect(ctx, px, py, c, c, 4, cols[i % 4], 3); if (i === 0) rond(ctx, px + 70, py + 30, 16, [255, 220, 70]); if (i === 2) dessineVehicule(ctx, "tractopelle", COULEURS.jaune, px + 100, py + 90, 0, 0, 0, 0.28); if (i === 3) arbre(ctx, px + 50, py + 90, 0.45); };
      for (let i = 0; i < Math.min(4, e.n); i++) {
        const fx = ox + (i % 2) * c, fy = oy + Math.floor(i / 2) * c;
        if (i < e.k || e.objet) piece(fx, fy, i);
        else { const [sx, sy] = this.depart(x, i), en = i === e.k && e.p !== null && e.p !== undefined, u = en ? Math.min(1, e.p * 1.4) : 0; piece(lerp(sx - c / 2, fx, u), lerp(sy - c / 2, fy, u), i); }
      }
    } },
  flaques: { fr: "Flaques", en: "Puddles", decor: "campagne", clics: 3, prendActeur: true, son: "splash", poste: 140, cx: 600,
    mots: "flaques?|puddles?|saute dans l'eau", modele: ["Il a plu ! {prenom} saute dans les flaques. Splash !", "It rained! {prenom} jumps in the puddles. Splash!"],
    consigne: ["Touche la flaque pour sauter dedans !", "Tap the puddle to jump in!"],
    px: (x, i, n) => x - 220 + (i * 440) / Math.max(1, n - 1),
    cible(sc) { return [this.px(sc.cx, Math.min(sc.fait, sc.n - 1), sc.n), G + 14]; },
    effet(sc, m) { const [x, y] = sc.cible(); m.eclat(x, y - 10, 30, [[120, 190, 250], [200, 235, 255]], 380, "rond", 0.8, 900); },
    dessin(ctx, x, G, e) {
      for (let i = 0; i < e.n; i++) ovale(ctx, this.px(x, i, e.n) - 70, G + 4, 140, 26, i < e.k ? [130, 190, 240] : [100, 160, 220], 2);
      if (e.objet) return;
      const de = e.k > 0 ? this.px(x, e.k - 1, e.n) : x - 330, vers = this.px(x, Math.min(e.k, e.n - 1), e.n);
      const u = e.p !== null && e.p !== undefined ? e.p : 0;
      personnage(ctx, e, lerp(de, vers, u), G + 10 - 120 * Math.sin(PI * u), 0.8);
    } },
  danse: { fr: "Danse", en: "Dance", decor: "maison", clics: 4, son: "magie", poste: 200, cx: 640,
    mots: "\\bdans(e|ent|er|eurs?)\\b|disco|boum\\b|dances?|dancing", modele: ["La musique commence ! Tout le monde danse.", "The music starts! Everyone dances."],
    consigne: ["Touche la musique pour faire danser tout le monde !", "Tap the music to make everyone dance!"],
    cible: (sc) => [sc.cx, G - 70],
    effet(sc, m) { for (const a of m.amis) a.dy = -40; for (let i = 0; i < 4; i++) m.parts.push({ x: sc.cx + rnd(-40, 40), y: G - 120, vx: rnd(-60, 60), vy: -120, g: 0, vie: 1.2, max: 1.2, col: [90, 60, 160], r: rnd(4, 8), type: "note", a: 0, va: 0 }); },
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 70, G - 110, 140, 90, 14, [80, 80, 100], 3); // la radio
      for (const dx of [-35, 35]) { rond(ctx, x + dx, G - 64, 26 + 3 * elan(e), [40, 40, 55], 2); rond(ctx, x + dx, G - 64, 10, [120, 120, 140]); }
      trait(ctx, [x - 40, G - 110], [x - 20, G - 140], 4, [80, 80, 100]);
      if (!e.objet) for (let k = 0; k < 6; k++) { ctx.globalAlpha = 0.25; rond(ctx, 120 + k * 150, 120 + 30 * Math.sin(e.t * 3 + k), 40, [[255, 90, 120], [255, 210, 60], [90, 170, 250]][k % 3]); ctx.globalAlpha = 1; }
    } },
  musique: { fr: "Musique", en: "Music", decor: "maison", clics: 4, son: (k) => (k % 2 ? "magie" : "boum"), poste: 160, cx: 640,
    mots: "musique|tambour|batterie|xylophone|guitare|chante|chanson|instruments?|music|drums?|guitar|sing", modele: ["On fait de la musique : boum, boum, tin, tin !", "Let's make music: boom, boom, ting, ting!"],
    consigne: ["Touche les instruments pour jouer de la musique !", "Tap the instruments to play music!"],
    cible: (sc) => [sc.cx + (sc.fait % 2 ? 130 : -110), G - 80],
    effet(sc) { const [x] = sc.cible(); for (let i = 0; i < 4; i++) sc.m.parts.push({ x: x + rnd(-30, 30), y: G - 120, vx: rnd(-40, 40), vy: -130, g: 0, vie: 1.2, max: 1.2, col: [[90, 60, 160], [230, 80, 120]][i % 2], r: rnd(4, 8), type: "note", a: 0, va: 0 }); },
    dessin(ctx, x, G, e) {
      const tape = elan(e), tambour = e.p !== null && e.p !== undefined && e.k % 2 === 0, xylo = e.p !== null && e.p !== undefined && e.k % 2 === 1;
      const dx = x - 110; // le tambour
      ovale(ctx, dx - 60, G - 70, 120, 70, [230, 80, 80], 3); rrect(ctx, dx - 60, G - 36, 120, 36, 0, [230, 80, 80]); ovale(ctx, dx - 60, G - 90 - (tambour ? 4 * tape : 0), 120, 40, [255, 240, 220], 3);
      for (let k = 0; k < 5; k++) trait(ctx, [dx - 50 + k * 25, G - 60], [dx - 40 + k * 25, G - 10], 3, [255, 220, 120]);
      const xx = x + 130; // le xylophone
      const cols = [[230, 80, 80], [250, 150, 60], [255, 210, 60], [110, 200, 110], [90, 170, 240], [200, 130, 240]];
      for (let k = 0; k < 6; k++) rrect(ctx, xx - 90 + k * 30, G - 110 + k * 6 - (xylo && k === (e.k * 2) % 6 ? 6 * tape : 0), 24, 90 - k * 10, 5, cols[k], 2);
      trait(ctx, [xx - 96, G - 20], [xx + 96, G - 50], 5, [150, 110, 70]);
    } },
  // ---------------------------------------------------------------- à la maison
  gateau: { fr: "Gâteau d'anniversaire", en: "Birthday cake", decor: "maison", clics: 3, son: "pop", poste: 160, cx: 640,
    mots: "anniversaires?|bougies?|souffle(r|nt)? les bougies|birthday|candles?", modele: ["Joyeux anniversaire ! Il faut souffler les bougies du gâteau.", "Happy birthday! Time to blow out the candles on the cake."],
    consigne: ["Touche les bougies pour les souffler !", "Tap the candles to blow them out!"],
    bougie: (x, i, n) => x - 80 + (i * 160) / Math.max(1, n - 1),
    cible(sc) { return [this.bougie(sc.cx, Math.min(sc.fait, sc.n - 1), sc.n), G - 196]; },
    effet(sc, m) { const [x, y] = sc.cible(); m.eclat(x, y - 10, 10, [[200, 200, 210], [235, 235, 240]], 90, "rond", 1, -60); },
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 170, G - 70, 340, 18, 6, [190, 140, 90], 3); for (const dx of [-150, 150]) trait(ctx, [x + dx, G - 52], [x + dx, G], 8, [160, 110, 70]);
      rrect(ctx, x - 120, G - 130, 240, 62, 14, [250, 200, 220], 3); rrect(ctx, x - 100, G - 170, 200, 46, 12, [255, 245, 235], 3);
      for (let k = 0; k < 8; k++) rond(ctx, x - 105 + k * 30, G - 128, 9, [240, 120, 170]);
      for (let i = 0; i < e.n; i++) {
        const bx = this.bougie(x, i, e.n);
        rrect(ctx, bx - 6, G - 200, 12, 32, 4, [[90, 170, 240], [255, 200, 60], [110, 200, 110], [200, 130, 240]][i % 4], 2);
        const allumee = e.objet || i > e.k || (i === e.k && (e.p === null || e.p === undefined || e.p < 0.5));
        if (allumee) { const h = 16 + 3 * Math.sin(e.t * 12 + i); poly(ctx, [[bx - 7, G - 202], [bx, G - 202 - h], [bx + 7, G - 202]], [255, 160, 40]); rond(ctx, bx, G - 206, 4, [255, 230, 120]); }
      }
    } },
  bain: { fr: "Bain", en: "Bath", decor: "maison", clics: 3, prendActeur: true, sansEngin: true, son: "splash", cx: 600,
    mots: "\\bbains?\\b|baignoire|bath|bathtub", modele: ["C'est l'heure du bain ! Plein de mousse et un petit canard.", "Bath time! Lots of bubbles and a little duck."],
    consigne: ["Touche la baignoire pour faire de la mousse !", "Tap the bathtub to make bubbles!"],
    cible: (sc) => [sc.cx, G - 120],
    dessin(ctx, x, G, e) {
      if (!e.objet) personnage(ctx, e, x, G - 40, 0.8);
      const mousse = e.objet ? 3 : e.k + elan(e);
      for (let k = 0; k < 5 + 4 * mousse; k++) rond(ctx, x - 130 + ((k * 53) % 260), G - 95 - ((k * 29) % 30), 16 + (k % 3) * 5, [255, 255, 255], 2, [200, 220, 240]);
      rrect(ctx, x - 160, G - 100, 320, 92, 30, [255, 255, 255], 4, [170, 190, 210]);
      for (const dx of [-130, 130]) rond(ctx, x + dx, G - 4, 10, [200, 170, 90], 2);
      if (e.objet || e.k >= 1) { const cx = x + 80, cy = G - 112 + 4 * Math.sin(e.t * 3); ovale(ctx, cx - 22, cy - 14, 44, 24, [255, 220, 70], 2); rond(ctx, cx + 14, cy - 18, 12, [255, 220, 70], 2); poly(ctx, [[cx + 24, cy - 20], [cx + 36, cy - 16], [cx + 24, cy - 12]], [250, 140, 40]); }
    } },
  dents: { fr: "Brosser les dents", en: "Brush teeth", decor: "maison", clics: 3, sansEngin: true, son: "pop", cx: 640,
    mots: "dents|brosse a dents|brosser|teeth|toothbrush|brush", modele: ["Avant de dormir, on se brosse les dents. Frotte, frotte !", "Before bed, we brush our teeth. Scrub, scrub!"],
    consigne: ["Touche les dents pour les brosser !", "Tap the teeth to brush them!"],
    cible: (sc) => [sc.cx, G - 210],
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 110, G - 300, 220, 170, 20, [200, 230, 250], 5, [255, 255, 255]); // le miroir avec un grand sourire
      ovale(ctx, x - 80, G - 250, 160, 80, [230, 90, 100], 3);
      for (let k = 0; k < 6; k++) { rrect(ctx, x - 66 + k * 22, G - 244, 20, 22, 4, [255, 255, 255], 2); rrect(ctx, x - 66 + k * 22, G - 196, 20, 18, 4, [255, 255, 255], 2); }
      const sales = e.objet ? 0 : e.n - e.k;
      for (let k = 0; k < sales * 2; k++) rond(ctx, x - 56 + ((k * 37) % 120), G - 236 + (k % 2) * 46, 4, [200, 170, 90]);
      if (e.objet || e.k >= e.n) for (let k = 0; k < 3; k++) etoile(ctx, x - 60 + k * 60, G - 270, 10, [255, 255, 255], e.t * 2);
      rrect(ctx, x - 140, G - 120, 280, 30, 10, [255, 255, 255], 3); rrect(ctx, x - 20, G - 90, 40, 90, 6, [255, 255, 255], 3);
      const bx = x + 120 + 30 * Math.sin((e.p || 0) * PI * 6), by = G - 210; // la brosse
      if (!e.objet) { rrect(ctx, bx - 8, by, 16, 70, 6, [90, 170, 240], 2); rrect(ctx, bx - 10, by - 18, 20, 20, 4, [255, 255, 255], 2); }
    } },
  ranger: { fr: "Ranger", en: "Tidy up", decor: "maison", clics: 4, son: "pop", poste: 160, cx: 620,
    mots: "\\brange(r|nt)?\\b|rangement|tidy|clean up|put away", modele: ["Oh là là, des jouets partout ! On range tout dans le coffre.", "Oh dear, toys everywhere! Let's put them all in the toy box."],
    consigne: ["Touche les jouets pour les ranger !", "Tap the toys to put them away!"],
    depart: (x, i) => [x - 250 + i * 70, G + 10 + (i % 2) * 14],
    cible(sc) { const [a, b] = this.depart(sc.cx, Math.min(sc.fait, sc.n - 1)); return [a, b - 20]; },
    dessin(ctx, x, G, e) {
      const bx = x + 220;
      collecte(ctx, x, G, e, JOUETS, (i) => this.depart(x, i), () => [bx, G - 70], () => {
        rrect(ctx, bx - 80, G - 90, 160, 90, 8, [230, 120, 80], 3); rrect(ctx, bx - 86, G - 100, 172, 18, 6, [210, 100, 70], 3);
        ecrireCentre(ctx, LANGUE === "en" ? "TOYS" : "JOUETS", bx, G - 45, 22, [255, 255, 255]);
      });
    } },
  cuisine: { fr: "Cuisine", en: "Cooking", decor: "maison", clics: 4, sansEngin: true, son: "pop", cx: 640,
    mots: "fai[ts]? un gateau|prepare(nt)? un gateau|cuisin|patiss|recette|cookies?|crepes?|bake|baking|cook", modele: ["On fait un gâteau ! Un œuf, de la farine, du chocolat… et on mélange.", "Let's bake a cake! An egg, some flour, chocolate… and stir."],
    consigne: ["Touche le saladier pour ajouter les ingrédients !", "Tap the bowl to add the ingredients!"],
    cible: (sc) => [sc.cx, G - 170],
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 200, G - 70, 400, 20, 6, [190, 140, 90], 3); for (const dx of [-180, 180]) trait(ctx, [x + dx, G - 50], [x + dx, G], 8, [160, 110, 70]);
      const niveau = e.objet ? 1 : Math.min(1, (e.k + elan(e) * 0.5) / Math.max(1, e.n));
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, G - 110, 90, 50, 0, 0, PI); ctx.clip();
      rrect(ctx, x - 90, G - 110 + 40 * (1 - niveau), 180, 60, 0, [200, 150, 100]); ctx.restore();
      ctx.beginPath(); ctx.ellipse(x, G - 110, 90, 50, 0, 0, PI); bordure(ctx, null, 4, [120, 160, 200]);
      ovale(ctx, x - 90, G - 120, 180, 22, null, 4, [120, 160, 200]);
      if (!e.objet) {
        trait(ctx, [x + 40, G - 120], [x + 90, G - 190 + 10 * Math.sin(e.t * 6)], 6, [200, 160, 110]); // la cuillère
        const ingr = [(cx, cy) => { ovale(ctx, cx - 14, cy - 18, 28, 36, [255, 250, 240], 2); }, (cx, cy) => { rrect(ctx, cx - 18, cy - 24, 36, 40, 6, [255, 255, 255], 2); ecrireCentre(ctx, "🌾", cx, cy - 4, 18, [0, 0, 0]); },
          (cx, cy) => { rrect(ctx, cx - 22, cy - 14, 44, 28, 4, [110, 70, 40], 2); }, (cx, cy) => { rond(ctx, cx, cy, 14, [230, 60, 80], 2); ovale(ctx, cx - 8, cy - 18, 16, 8, [90, 170, 70]); }];
        if (e.p !== null && e.p !== undefined && e.p < 0.6) ingr[e.k % 4](x, G - 260 + 220 * (e.p / 0.6));
      }
      if (e.objet || e.k >= e.n) { const gx = x + 170; rrect(ctx, gx - 50, G - 110, 100, 40, 10, [120, 80, 50], 3); rrect(ctx, gx - 50, G - 120, 100, 16, 8, [250, 240, 230], 2); rond(ctx, gx, G - 128, 8, [230, 60, 80]); }
    } },
  peinture: { fr: "Peinture", en: "Painting", decor: "maison", clics: 4, sansEngin: true, son: "magie", cx: 640,
    mots: "\\bpein(t|tre|ture|dre)\\b|dessin|dessine|colori|crayons?|paint|draw|coloring", modele: ["On fait de la peinture ! Un ciel bleu, un soleil, une maison…", "Let's paint! A blue sky, a sun, a house…"],
    consigne: ["Touche le tableau pour peindre !", "Tap the canvas to paint!"],
    cible: (sc) => [sc.cx, G - 200],
    dessin(ctx, x, G, e) {
      for (const [a, b] of [[[x - 90, G], [x - 30, G - 300]], [[x + 90, G], [x + 30, G - 300]], [[x, G], [x, G - 290]]]) trait(ctx, a, b, 7, [170, 120, 80]);
      const ox = x - 110, oy = G - 300, w = 220, h = 170;
      rrect(ctx, ox, oy, w, h, 6, [255, 255, 255], 4, [200, 160, 110]);
      const etapes = e.objet ? 4 : e.k + (e.p !== null && e.p !== undefined && e.p > 0.5 ? 1 : 0);
      if (etapes > 0) rrect(ctx, ox + 6, oy + 6, w - 12, 80, 4, [150, 205, 250]);
      if (etapes > 0) rrect(ctx, ox + 6, oy + 110, w - 12, h - 116, 4, [140, 200, 90]);
      if (etapes > 1) rond(ctx, ox + 170, oy + 40, 22, [255, 220, 70]);
      if (etapes > 2) { rrect(ctx, ox + 40, oy + 80, 60, 50, 2, [250, 230, 190], 2); poly(ctx, [[ox + 32, oy + 80], [ox + 108, oy + 80], [ox + 70, oy + 50]], [220, 80, 70], 2); }
      if (etapes > 3) for (let k = 0; k < 3; k++) { trait(ctx, [ox + 140 + k * 20, oy + 160], [ox + 140 + k * 20, oy + 130], 3, [60, 140, 60]); rond(ctx, ox + 140 + k * 20, oy + 128, 7, [[255, 90, 120], [255, 220, 60], [180, 120, 255]][k]); }
      if (!e.objet) { const px = x + 140 + 20 * Math.sin((e.p || 0) * PI * 4); trait(ctx, [px, G - 150], [px - 30, G - 220], 6, [200, 160, 110]); rond(ctx, px - 32, G - 224, 8, [[230, 80, 80], [255, 200, 60], [90, 170, 240], [110, 200, 110]][e.k % 4]); }
    } },
  livre: { fr: "Lire un livre", en: "Read a book", decor: "maison", clics: 4, sansEngin: true, son: "clic", cx: 640,
    mots: "\\blivres?\\b|lis(ent)? une histoire|lecture|\\bbooks?\\b|bedtime story", modele: ["On lit un beau livre ensemble. On tourne les pages…", "We read a lovely book together. Let's turn the pages…"],
    consigne: ["Touche le livre pour tourner la page !", "Tap the book to turn the page!"],
    cible: (sc) => [sc.cx + 110, G - 130],
    dessin(ctx, x, G, e) {
      const ox = x - 170, oy = G - 230;
      rrect(ctx, ox - 10, oy - 10, 360, 200, 16, [90, 140, 220], 3);
      rrect(ctx, ox, oy, 168, 180, 8, [255, 252, 240], 2); rrect(ctx, ox + 172, oy, 168, 180, 8, [255, 252, 240], 2);
      const images = [(cx, cy) => etoile(ctx, cx, cy, 40, [255, 210, 50]), (cx, cy) => coeur(ctx, cx, cy, 34, [240, 80, 110]),
        (cx, cy) => dessineVehicule(ctx, "tractopelle", COULEURS.jaune, cx, cy + 40, 0, 0, 0, 0.35), (cx, cy) => { rond(ctx, cx, cy, 34, [255, 220, 70], 3); },
        (cx, cy) => arbre(ctx, cx, cy + 60, 0.6)];
      const page = e.objet ? 2 : e.k;
      images[page % images.length](ox + 84, oy + 80);
      for (let k = 0; k < 4; k++) trait(ctx, [ox + 200, oy + 40 + k * 26], [ox + 310, oy + 40 + k * 26], 3, [200, 190, 175]);
      if (e.p !== null && e.p !== undefined) { const u = e.p, lx = ox + 172 + 168 * Math.cos(PI * u); poly(ctx, [[ox + 172, oy], [lx, oy - 20 * Math.sin(PI * u)], [lx, oy + 180 - 20 * Math.sin(PI * u)], [ox + 172, oy + 180]], [250, 245, 230], 2); }
    } },
  docteur: { fr: "Docteur", en: "Doctor", decor: "docteur", clics: 3, sansEngin: true, son: "magie", cx: 600,
    mots: "docteur|medecin|infirmi|bobos?|pansements?|soigne|doctor|nurse|band-?aid|vaccin", modele: ["On joue au docteur ! Le doudou a un petit bobo : on le soigne.", "Let's play doctor! Teddy has a little boo-boo: let's make it better."],
    consigne: ["Touche le doudou pour le soigner !", "Tap teddy to make him better!"],
    cible: (sc) => [sc.cx - 40, G - 120],
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 160, G - 70, 260, 24, 8, [255, 255, 255], 3); for (const dx of [-150, 90]) trait(ctx, [x + dx, G - 46], [x + dx, G], 5, [150, 160, 170]);
      ctx.save(); ctx.translate(x - 40, G - 70); ctx.scale(1.7, 1.7); objetPerdu(ctx, "doudou", 0, 0, e.t); ctx.restore();
      const soins = e.objet ? 3 : e.k;
      if (soins >= 1) coeur(ctx, x - 100, G - 190 - 6 * Math.sin(e.t * 4), 14, [240, 80, 110]);
      if (soins >= 2) { ctx.save(); ctx.translate(x - 10, G - 110); ctx.rotate(-0.5); rrect(ctx, -22, -8, 44, 16, 6, [250, 220, 180], 2); rrect(ctx, -8, -8, 16, 16, 2, [255, 245, 230]); ctx.restore(); }
      if (soins >= 3) etoile(ctx, x - 70, G - 120, 14, [255, 210, 50], e.t);
      const kx = x + 170; rrect(ctx, kx - 60, G - 70, 120, 70, 10, [230, 70, 70], 3); rrect(ctx, kx - 25, G - 84, 50, 16, 6, null, 4, [180, 50, 50]); // la mallette
      rrect(ctx, kx - 8, G - 58, 16, 46, 2, [255, 255, 255]); rrect(ctx, kx - 23, G - 43, 46, 16, 2, [255, 255, 255]);
    } },
  courses: { fr: "Courses", en: "Shopping", decor: "magasin", clics: 4, son: "pop", poste: 150, cx: 620,
    mots: "faire les courses|courses|supermarche|caddies?|achete|shopping|grocer", modele: ["On fait les courses ! Une pomme, du pain, du lait…", "Let's go shopping! An apple, some bread, some milk…"],
    consigne: ["Touche les produits pour les mettre dans le caddie !", "Tap the groceries to put them in the cart!"],
    depart: (x, i) => [x - 240 + i * 75, G - 150 - (i % 2) * 30],
    cible(sc) { const [a, b] = this.depart(sc.cx, Math.min(sc.fait, sc.n - 1)); return [a, b - 20]; },
    dessin(ctx, x, G, e) {
      const cx = x + 210;
      collecte(ctx, x, G, e, PRODUITS, (i) => this.depart(x, i), () => [cx, G - 110], () => {
        trait(ctx, [cx - 110, G - 150], [cx - 80, G - 130], 5, [120, 120, 130]);
        poly(ctx, [[cx - 80, G - 130], [cx + 90, G - 130], [cx + 70, G - 60], [cx - 66, G - 60]], [200, 205, 215], 3);
        for (let k = 1; k < 5; k++) trait(ctx, [cx - 76 + k * 33, G - 128], [cx - 64 + k * 27, G - 62], 2, [150, 155, 165]);
        for (let i = 0; i < Math.min(e.k, 5); i++) PRODUITS[i % 5](ctx, cx - 50 + i * 26, G - 120);
        for (const dx of [-50, 50]) rond(ctx, cx + dx, G - 12, 12, [60, 60, 70], 2);
        trait(ctx, [cx - 66, G - 50], [cx + 70, G - 50], 4, [120, 120, 130]);
      });
    } },
  sapin: { fr: "Sapin de Noël", en: "Christmas tree", decor: "maison", clics: 5, son: "magie", poste: 160, cx: 640,
    mots: "noel|sapin de noel|guirlandes?|boules de noel|christmas|xmas", modele: ["C'est bientôt Noël ! On décore le sapin avec des boules.", "Christmas is coming! Let's decorate the tree with baubles."],
    consigne: ["Touche le sapin pour le décorer !", "Tap the tree to decorate it!"],
    boules: [[-50, -80], [40, -100], [-20, -150], [55, -170], [-45, -210], [10, -240], [-30, -120], [30, -60]],
    cible(sc) { const [dx, dy] = this.boules[Math.min(sc.fait, this.boules.length - 1)]; return sc.fait >= sc.n - 1 ? [sc.cx, G - 330] : [sc.cx + dx, G + dy]; },
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 22, G - 40, 44, 40, 4, [140, 90, 60], 3);
      for (let k = 0; k < 4; k++) { const y = G - 40 - k * 70, w = 150 - k * 30; poly(ctx, [[x - w, y], [x + w, y], [x, y - 110]], [[40, 130, 80], [50, 145, 85], [60, 155, 90], [70, 165, 95]][k], 3); }
      const cols = [[230, 70, 70], [255, 210, 60], [90, 170, 240], [240, 140, 200], [255, 255, 255]];
      const nb = e.objet ? 8 : Math.min(e.k, e.n - 1);
      for (let i = 0; i < Math.min(nb, this.boules.length); i++) { const [dx, dy] = this.boules[i]; rond(ctx, x + dx, G + dy, 12, cols[i % 5], 2); rond(ctx, x + dx - 4, G + dy - 4, 3, [255, 255, 255]); }
      if (e.objet || e.k >= e.n) etoile(ctx, x, G - 335, 34, [255, 215, 50], 0.2 + 0.1 * Math.sin(e.t * 3));
      if (e.objet || e.k >= e.n) for (let k = 0; k < 8; k++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(e.t * 5 + k); rond(ctx, x - 90 + k * 26, G - 90 - (k % 4) * 60, 5, [255, 240, 150]); ctx.globalAlpha = 1; }
    } },
  // ---------------------------------------------------------------- dehors, la nature
  jardiner: { fr: "Jardiner", en: "Gardening", decor: "jardin", clics: 4, son: "magie", poste: 150, cx: 620,
    mots: "jardine|jardinage|plante(r|nt)?\\b|graines?|arrose|garden(ing)?|seeds?|plant", modele: ["On plante des graines dans le jardin… et les fleurs poussent !", "We plant seeds in the garden… and the flowers grow!"],
    consigne: ["Touche la terre pour faire pousser une fleur !", "Tap the soil to grow a flower!"],
    px: (x, i, n) => x - 200 + ((i + 0.5) * 400) / n,
    cible(sc) { return [this.px(sc.cx, Math.min(sc.fait, sc.n - 1), sc.n), G - 10]; },
    dessin(ctx, x, G, e) {
      ovale(ctx, x - 220, G - 20, 440, 44, [150, 100, 60], 3);
      for (let i = 0; i < e.n; i++) {
        const fx = this.px(x, i, e.n), h = e.objet || i < e.k ? 1 : i === e.k && e.p !== null && e.p !== undefined ? e.p : 0;
        if (h <= 0) { rond(ctx, fx, G - 6, 5, [110, 70, 40]); continue; }
        trait(ctx, [fx, G - 6], [fx, G - 6 - 90 * h], 4, [60, 140, 60]); ovale(ctx, fx, G - 50 * h, 26 * h, 12 * h, [80, 170, 80]);
        const col = [[255, 90, 120], [255, 210, 60], [180, 120, 255], [255, 150, 60]][i % 4];
        for (let k = 0; k < 6; k++) { const a = (k / 6) * 2 * PI; rond(ctx, fx + 16 * h * Math.cos(a), G - 6 - 90 * h + 16 * h * Math.sin(a), 11 * h, col); }
        rond(ctx, fx, G - 6 - 90 * h, 9 * h, [255, 230, 120]);
      }
      if (!e.objet) { const ax = this.px(x, Math.min(e.k, e.n - 1), e.n) + 50, ay = G - 120; rrect(ctx, ax - 22, ay - 20, 44, 34, 8, [90, 170, 240], 3); trait(ctx, [ax - 22, ay - 10], [ax - 50, ay - 30], 6, [90, 170, 240]);
        if (e.p !== null && e.p !== undefined) for (let k = 0; k < 4; k++) trait(ctx, [ax - 52, ay - 30 + k * 12], [ax - 58, ay - 20 + k * 12], 2, [120, 190, 250]); }
    } },
  peche: { fr: "Pêche", en: "Fishing", decor: "campagne", clics: 3, prendActeur: true, son: "splash", poste: 120, cx: 600,
    mots: "\\bpeche(nt|r)?\\b|poissons?|canne a peche|fishing|\\bfish(es)?\\b", modele: ["On va à la pêche au bord de l'étang. Un poisson ? Oui !", "Let's go fishing by the pond. A fish? Yes!"],
    consigne: ["Touche le bouchon pour attraper un poisson !", "Tap the float to catch a fish!"],
    cible: (sc) => [sc.cx + 80, G - 10],
    dessin(ctx, x, G, e) {
      ovale(ctx, x - 100, G - 40, 380, 90, [90, 165, 225], 3); for (let k = 0; k < 5; k++) arcRect(ctx, x - 60 + k * 60, G - 10 + (k % 2) * 16, 30, 10, 0, PI, 3, [200, 230, 255]);
      if (e.objet) return;
      personnage(ctx, e, x - 230, G, 0.85);
      const bob = 4 * Math.sin(e.t * 3);
      trait(ctx, [x - 200, G - 110], [x - 60, G - 230], 5, [140, 100, 60]); trait(ctx, [x - 60, G - 230], [x + 80, G - 14 + bob], 1.5, [80, 80, 80]);
      rond(ctx, x + 80, G - 14 + bob, 8, [230, 60, 60], 2); rrect(ctx, x + 72, G - 22 + bob, 16, 6, 3, [255, 255, 255]);
      const sx = x - 310; rrect(ctx, sx - 30, G - 50, 60, 50, 6, [150, 160, 175], 3); // le seau de poissons
      for (let i = 0; i < e.k; i++) ovale(ctx, sx - 24 + i * 10, G - 62 - i * 4, 34, 16, [250, 160, 60], 2);
      if (e.p !== null && e.p !== undefined) { const u = e.p, fx = lerp(x + 80, sx, u), fy = G - 20 - 200 * Math.sin(PI * u); ovale(ctx, fx - 20, fy - 10, 40, 20, [250, 160, 60], 2); poly(ctx, [[fx - 20, fy], [fx - 34, fy - 10], [fx - 34, fy + 10]], [250, 160, 60], 2); }
    } },
  nourrir: { fr: "Nourrir les animaux", en: "Feed the animals", decor: "ferme", clics: 3, son: "croque", poste: 140, cx: 380,
    mots: "nourri|donne(nt)? a manger|feed", modele: ["C'est l'heure du repas des animaux ! On leur donne à manger.", "It's feeding time for the animals! Let's give them their food."],
    consigne: ["Touche les animaux pour leur donner à manger !", "Tap the animals to feed them!"],
    mangeurs(sc) { const l = sc.m.amis.filter((a) => !a.part && a.kind !== "arthur" && !STYLES[a.kind]); return l.length ? l : sc.m.amis.filter((a) => !a.part); },
    cible(sc) { const l = this.mangeurs(sc); if (!l.length) return [sc.cx, G - 60]; const a = l[sc.fait % l.length]; return [a.x, G - Math.min(140, (TAILLE_AMI[a.kind] || [0, 120])[1] * 0.6)]; },
    effet(sc, m) { const l = this.mangeurs(sc); const a = l[(sc.fait) % Math.max(1, l.length)]; if (a) { a.mange = 1; m.eclat(a.x, G - 120, 8, [[255, 100, 140], [255, 160, 190]], 140, "coeur", 1.1, -60); } },
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 70, G - 40, 140, 40, 6, [170, 120, 80], 3); for (let k = 0; k < 6; k++) rond(ctx, x - 50 + k * 20, G - 42, 8, [235, 200, 90]);
      if (!e.objet && e.p !== null && e.p !== undefined && e.sc) { const [tx, ty] = this.cible(e.sc), u = e.p; rond(ctx, lerp(x, tx, u), lerp(G - 50, ty, u) - 100 * Math.sin(PI * u), 10, [235, 200, 90], 2); }
    } },
  bonhomme: { fr: "Bonhomme de neige", en: "Snowman", decor: "neige", clics: 3, son: "pop", poste: 150, cx: 640,
    mots: "bonhommes? de neige|snowman|snowmen", modele: ["Il a neigé ! On fait un grand bonhomme de neige.", "It snowed! Let's build a big snowman."],
    consigne: ["Touche la neige pour faire le bonhomme !", "Tap the snow to build the snowman!"],
    cible: (sc) => [sc.cx, G - [40, 130, 205][Math.min(sc.fait, 2)]],
    dessin(ctx, x, G, e) {
      const parts = e.objet ? 3 : e.k, roule = e.p !== null && e.p !== undefined ? e.p : 0;
      const boule = (cy, r, i) => { const s = i < parts ? 1 : i === parts ? roule : 0; if (s > 0) rond(ctx, x, cy, r * s, [255, 255, 255], 3, [190, 205, 225]); };
      boule(G - 55, 60, 0); boule(G - 150, 44, 1); boule(G - 222, 32, 2);
      if (parts >= 2) for (const dy of [-170, -150, -130]) rond(ctx, x, G + dy, 4, CONTOUR);
      if (parts >= 3) {
        for (const dx of [-10, 10]) rond(ctx, x + dx, G - 230, 4, CONTOUR);
        poly(ctx, [[x, G - 222], [x + 30, G - 216], [x, G - 212]], [250, 140, 40], 2);
        rrect(ctx, x - 30, G - 262, 60, 10, 2, [50, 50, 60]); rrect(ctx, x - 20, G - 300, 40, 40, 4, [50, 50, 60]);
        trait(ctx, [x - 40, G - 150], [x - 90, G - 190], 4, [120, 80, 50]); trait(ctx, [x + 40, G - 150], [x + 90, G - 190], 4, [120, 80, 50]);
        rrect(ctx, x - 34, G - 200, 68, 12, 5, [230, 70, 70], 2);
      }
    } },
  coquillages: { fr: "Coquillages", en: "Seashells", decor: "plage", clics: 4, son: "pop", poste: 150, cx: 600,
    mots: "coquillages?|seashells?|\\bshells?\\b", modele: ["Sur la plage, on ramasse de jolis coquillages.", "On the beach, we pick up pretty seashells."],
    consigne: ["Touche les coquillages pour les ramasser !", "Tap the shells to pick them up!"],
    depart: (x, i) => [x - 230 + i * 90, G + 20 - (i % 2) * 16],
    cible(sc) { const [a, b] = this.depart(sc.cx, Math.min(sc.fait, sc.n - 1)); return [a, b - 14]; },
    dessin(ctx, x, G, e) {
      const sx = x + 230;
      collecte(ctx, x, G, e, COQUILLES, (i) => this.depart(x, i), () => [sx, G - 40], () => {
        poly(ctx, [[sx - 40, G - 70], [sx + 40, G - 70], [sx + 30, G], [sx - 30, G]], [90, 170, 240], 3);
        arcRect(ctx, sx - 34, G - 110, 68, 80, PI, 2 * PI, 3, [90, 90, 100]);
        for (let i = 0; i < Math.min(e.k, 4); i++) COQUILLES[i % 3](ctx, sx - 24 + i * 16, G - 66);
      });
    } },
  glace: { fr: "Glace", en: "Ice cream", decor: "plage", clics: 3, son: "pop", poste: 150, cx: 640,
    mots: "\\bglaces?\\b|ice ?creams?|sorbet|cornet", modele: ["Miam, une glace ! Une boule fraise, une boule vanille, une boule chocolat…", "Yum, ice cream! A strawberry scoop, a vanilla scoop, a chocolate scoop…"],
    consigne: ["Touche le cornet pour ajouter une boule !", "Tap the cone to add a scoop!"],
    cible: (sc) => [sc.cx, G - 160 - sc.fait * 40],
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 10, G - 100, 20, 100, 4, [200, 200, 210], 2); // le présentoir
      poly(ctx, [[x - 34, G - 140], [x + 34, G - 140], [x, G - 70]], [230, 180, 100], 3);
      for (let k = 0; k < 4; k++) trait(ctx, [x - 26 + k * 16, G - 138], [x - 8 + k * 6, G - 86], 2, [200, 150, 80]);
      const cols = [[250, 160, 190], [255, 245, 215], [140, 90, 60], [170, 220, 140], [255, 200, 90]], nb = e.objet ? 3 : e.k;
      for (let i = 0; i < nb; i++) rond(ctx, x + (i % 2 ? 4 : -4), G - 160 - i * 40, 36, cols[i % 5], 3);
      if (e.p !== null && e.p !== undefined && !e.objet) rond(ctx, x, lerp(G - 400, G - 160 - e.k * 40, Math.min(1, e.p * 1.4)), 36, cols[e.k % 5], 3);
      if (e.objet || (e.k >= e.n && e.n)) rond(ctx, x, G - 160 - (nb - 1) * 40 - 40, 10, [220, 40, 60], 2);
    } },
  laver: { fr: "Laver le camion", en: "Truck wash", decor: "chantier", clics: 4, son: "splash", poste: 430, cx: 430,
    mots: "\\blav(e|er|ent|age)\\b|douche|savon|nettoie|wash", modele: ["{Vehicule} est tout sale ! On le lave avec de l'eau et du savon.", "{Vehicule} is all dirty! Let's wash it with water and soap."],
    consigne: ["Touche le camion pour le laver !", "Tap the truck to wash it!"],
    cible: (sc) => [sc.m.hero.x, G - 90],
    effet(sc, m) { const x = m.hero.x; m.jet(x + 260, G - 140, x, G - 90, [120, 190, 250], 24, [3, 6], [0.3, 0.5], 60); },
    dessin(ctx, x, G, e) {
      const hx = e.sc ? e.sc.m.hero.x : x, mousse = e.objet ? 0 : Math.min(e.k, e.n - 1);
      if (!e.objet && e.k < e.n) for (let k = 0; k < 4 + 4 * mousse; k++) rond(ctx, hx - 100 + ((k * 47) % 220), G - 40 - ((k * 31) % 130), 12 + (k % 3) * 5, [255, 255, 255], 2, [200, 220, 240]);
      if (!e.objet && e.k >= e.n) for (let k = 0; k < 4; k++) etoile(ctx, hx - 90 + k * 60, G - 160 - 20 * Math.sin(e.t * 3 + k), 12, [255, 255, 255], e.t * 2);
      const tx = hx + 260; trait(ctx, [tx, G], [tx, G - 140], 6, [90, 170, 240]); rrect(ctx, tx - 20, G - 150, 30, 18, 6, [90, 170, 240], 2); // le tuyau
    } },
  // ---------------------------------------------------------------- les voyages
  train: { fr: "Train", en: "Train", decor: "gare", clics: 3, sansEngin: true, son: "klaxon", cx: 640,
    mots: "\\btrains?\\b|locomotives?|wagons?|tchou", modele: ["Tchou-tchou ! Le train arrive en gare. Tout le monde monte !", "Choo-choo! The train pulls into the station. All aboard!"],
    consigne: ["Touche la locomotive pour accrocher un wagon !", "Tap the engine to hook up a carriage!"],
    cible: (sc) => [sc.cx + 230, G - 110],
    effet(sc, m) { m.eclat(sc.cx + 250, G - 190, 10, [[220, 220, 230], [255, 255, 255]], 80, "rond", 1.4, -80); },
    dessin(ctx, x, G, e) {
      const depart = e.fini !== null && e.fini !== undefined ? Math.max(0, e.fini - 0.5) * 320 : 0, y = G + 20, lx = x + 220 + depart;
      const wagon = (wx, i) => { rrect(ctx, wx - 60, y - 90, 120, 70, 10, [[90, 170, 240], [110, 200, 110], [240, 140, 200], [255, 200, 60]][i % 4], 3); for (const dx of [-30, 30]) rrect(ctx, wx + dx - 16, y - 80, 32, 26, 4, VITRE, 2); for (const dx of [-36, 36]) rond(ctx, wx + dx, y - 16, 14, [60, 60, 70], 2); trait(ctx, [wx + 60, y - 40], [wx + 70, y - 40], 5, [80, 80, 90]); };
      const nb = e.objet ? 2 : e.k;
      for (let i = 0; i < nb; i++) wagon(lx - 140 * (i + 1), i);
      if (!e.objet && e.p !== null && e.p !== undefined && e.k < e.n) wagon(lerp(-100, lx - 140 * (e.k + 1), Math.min(1, e.p * 1.3)), e.k);
      rrect(ctx, lx - 70, y - 100, 120, 80, 10, [230, 70, 70], 3); rrect(ctx, lx - 70, y - 150, 60, 54, 8, [230, 70, 70], 3); // la locomotive
      rrect(ctx, lx - 62, y - 140, 44, 30, 4, VITRE, 2); rrect(ctx, lx + 10, y - 140, 26, 44, 4, [60, 60, 70], 3);
      poly(ctx, [[lx + 50, y - 60], [lx + 80, y - 20], [lx + 50, y - 20]], [90, 90, 100], 2);
      for (const dx of [-40, 0, 32]) rond(ctx, lx + dx, y - 16, dx === -40 ? 20 : 14, [60, 60, 70], 2);
      for (let k = 0; k < 3; k++) { const u = mod(e.t * 0.6 + k / 3, 1); ctx.globalAlpha = 1 - u; rond(ctx, lx + 23 + 10 * Math.sin(u * 6), y - 160 - u * 90, 10 + 18 * u, [235, 235, 240]); ctx.globalAlpha = 1; }
    } },
  avion: { fr: "Avion", en: "Plane", decor: "aeroport", clics: 3, sansEngin: true, son: "fusee", cx: 520,
    mots: "\\bavions?\\b|aeroports?|decolle|airplanes?|\\bplanes?\\b|airport|take ?off", modele: ["L'avion roule sur la piste… et décolle vers le ciel !", "The plane rolls down the runway… and takes off into the sky!"],
    consigne: ["Touche l'avion pour le faire décoller !", "Tap the plane to make it take off!"],
    pos(x, G, e) { const q = Math.min(1, (e.k + elan(e)) / Math.max(1, e.n)), part = e.fini !== null && e.fini !== undefined ? e.fini : 0; return [x - 200 + 400 * q + 300 * part, G - 40 - 260 * q * q - 160 * part]; },
    cible(sc) { return this.pos(sc.cx, G, sc.etatAct()); },
    dessin(ctx, x, G, e) {
      const [px, py] = e.objet ? [x, G - 60] : this.pos(x, G, e), a = e.objet ? 0 : -0.25 * Math.min(1, e.k / Math.max(1, e.n));
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      ovale(ctx, -110, -30, 220, 60, [255, 255, 255], 3);
      poly(ctx, [[-90, -20], [-120, -80], [-70, -24]], [230, 70, 70], 3);
      poly(ctx, [[-20, 0], [40, 0], [-40, 60]], [90, 140, 220], 3);
      for (let k = 0; k < 5; k++) rond(ctx, -50 + k * 26, -6, 8, VITRE, 2);
      ovale(ctx, 70, -18, 34, 20, VITRE, 2);
      ctx.restore();
    } },
  bateau: { fr: "Bateau", en: "Boat", decor: "port", clics: 3, sansEngin: true, son: "splash", cx: 600,
    mots: "\\bbateaux?\\b|voiliers?|barques?|navigue|\\bboats?\\b|\\bsail", modele: ["Tout le monde monte dans le bateau. On hisse la voile !", "Everyone climbs into the boat. Hoist the sail!"],
    consigne: ["Touche la voile pour la hisser !", "Tap the sail to hoist it!"],
    cible: (sc) => [sc.cx + 10, G - 150],
    dessin(ctx, x, G, e) {
      const part = e.fini !== null && e.fini !== undefined ? e.fini * 140 : 0, bx = x + part, by = G - 30 + 6 * Math.sin(e.t * 2);
      rrect(ctx, 0, G - 40, VW, 80, 0, [80, 160, 225]); for (let k = 0; k < 12; k++) arcRect(ctx, mod(k * 90 + e.t * 30, VW + 90) - 45, G - 30 + (k % 3) * 18, 40, 12, 0, PI, 3, [210, 235, 255]);
      if (!e.objet && e.sc) e.sc.m.amis.filter((a) => !a.part).slice(0, 3).forEach((a, i) => dessineAmi(ctx, a.kind, bx - 70 + i * 60, by - 20, e.t, 1, 0, 0, 0.55, "joie"));
      poly(ctx, [[bx - 140, by - 30], [bx + 140, by - 30], [bx + 110, by + 20], [bx - 110, by + 20]], [230, 80, 70], 3);
      trait(ctx, [bx - 10, by - 30], [bx - 10, by - 250], 6, [140, 100, 60]);
      const v = e.objet ? 1 : Math.min(1, (e.k + elan(e)) / Math.max(1, e.n)), h = 200 * v;
      if (v > 0) poly(ctx, [[bx - 4, by - 40], [bx - 4, by - 40 - h], [bx + 100 * v + 10, by - 40]], [255, 255, 255], 3);
    } },
  fusee: { fr: "Fusée", en: "Rocket", decor: "campagne", clics: 3, sansEngin: true, son: "boum", cx: 600,
    mots: "fusees?|rockets?|astronautes?|astronauts?|compte a rebours|countdown", modele: ["La fusée est prête ! 3… 2… 1… Décollage !", "The rocket is ready! 3… 2… 1… Blast off!"],
    consigne: ["Touche le gros bouton rouge pour le compte à rebours !", "Tap the big red button for the countdown!"],
    parole: (k, n) => (k + 1 >= n ? (LANGUE === "en" ? "Blast off!" : "Décollage !") : String(n - k - 1)),
    cible: (sc) => [sc.cx + 200, G - 40],
    fin(sc) { joue("fusee"); },
    dessin(ctx, x, G, e) {
      const vol = e.fini !== null && e.fini !== undefined ? Math.pow(Math.max(0, e.fini - 0.2), 2) * 260 : 0, y = G - vol;
      rrect(ctx, x - 90, G - 16, 180, 16, 4, [150, 150, 165], 3);
      if (vol > 0) for (let k = 0; k < 6; k++) rond(ctx, x + (k - 2.5) * 18, G - 10 + 10 * Math.sin(e.t * 20 + k), 16, [[255, 160, 40], [255, 220, 80], [220, 220, 230]][k % 3]);
      poly(ctx, [[x - 50, y - 60], [x - 90, y - 10], [x - 50, y - 30]], [230, 70, 70], 3); poly(ctx, [[x + 50, y - 60], [x + 90, y - 10], [x + 50, y - 30]], [230, 70, 70], 3);
      rrect(ctx, x - 50, y - 230, 100, 200, 30, [250, 250, 255], 3);
      poly(ctx, [[x - 50, y - 210], [x, y - 300], [x + 50, y - 210]], [230, 70, 70], 3);
      rond(ctx, x, y - 160, 24, VITRE, 4, [150, 160, 180]);
      if (vol > 0) { poly(ctx, [[x - 30, y - 30], [x, y + 60 + 20 * Math.sin(e.t * 30)], [x + 30, y - 30]], [255, 170, 40]); poly(ctx, [[x - 15, y - 30], [x, y + 20], [x + 15, y - 30]], [255, 240, 120]); }
      if (!e.objet && !vol) { // le bouton et le compte à rebours
        const bx = x + 200; rrect(ctx, bx - 40, G - 30, 80, 30, 6, [120, 120, 130], 3); rond(ctx, bx, G - 38 + 4 * elan(e), 26, [230, 60, 60], 3);
        if (e.k > 0 || (e.p !== null && e.p !== undefined)) ecrireCentre(ctx, String(Math.max(1, e.n - e.k)), x + 200, G - 220, 90, [255, 200, 50]);
      }
    } },
};

// la place que prend chaque activité (objets autour compris) : les personnages se mettent ailleurs
const ZONES_ACTIVITES = { toboggan: [-195, 170], balancoire: [-170, 175], ballon: [-160, 330], cerfvolant: [-185, 230], cubes: [-245, 45], puzzle: [-315, 250], flaques: [-310, 300], danse: [-90, 90], musique: [-195, 240], gateau: [-180, 180], bain: [-170, 170], dents: [-150, 150], ranger: [-290, 310], cuisine: [-210, 230], peinture: [-120, 180], livre: [-190, 190], docteur: [-170, 240], courses: [-275, 340], sapin: [-160, 160], jardiner: [-230, 230], peche: [-350, 290], nourrir: [-80, 80], bonhomme: [-110, 110], coquillages: [-265, 280], glace: [-50, 50], laver: [-150, 290], train: [0, 0], avion: [-120, 120], bateau: [0, 0], fusee: [-100, 245] };
ACTIVITES.train.devant = true; ACTIVITES.bateau.passagers = true; // le train passe devant le quai ; dans le bateau, tout le monde est à bord
// ================================================================= on branche tout ça dans l'appli
const MOTS_ACTIVITES = Object.entries(ACTIVITES).map(([id, A]) => [new RegExp(A.mots), id]);
const MOTS_DECORS_EXTRA = [
  ["\\bparc\\b|aire de jeux|square|playground|\\bpark\\b", "parc"], ["\\bzoo\\b|safari", "zoo"],
  ["salon|chambre|salle de bain|a l'interieur|dans la maison|kitchen|bedroom|bathroom|living room|indoors", "maison"],
  ["magasin|supermarche|boutique|epicerie|\\bshop\\b|\\bstore\\b|supermarket", "magasin"],
  ["docteur|medecin|hopital|cabinet|hospital|doctor", "docteur"], ["\\bgare\\b|\\bstation\\b|\\bquai\\b", "gare"],
  ["espace|planetes?|sur la lune|outer space|\\bspace\\b|planets?|on the moon|cosmos", "espace"], ["aeroport|airport|runway", "aeroport"],
];
ACTIONS.push(...Object.keys(ACTIVITES));
for (const [id, A] of Object.entries(ACTIVITES)) {
  CLICS_DEFAUT[id] = A.clics; CONSIGNES[id] = A.consigne[0]; CONSIGNES_EN[id] = A.consigne[1];
  TEXTES.fr.actions[id] = A.fr; TEXTES.en.actions[id] = A.en; MODELES[id] = A.modele;
  ALIAS_ACTION[id] = id; ALIAS_ACTION[sansAccent(A.fr)] = id;
}
const LIEUX_EXTRA = { parc: ["Parc", "Park"], zoo: ["Zoo", "Zoo"], maison: ["Maison", "Home"], magasin: ["Magasin", "Shop"], docteur: ["Docteur", "Doctor"], gare: ["Gare", "Station"], espace: ["Espace", "Space"], aeroport: ["Aéroport", "Airport"] };
for (const [id, [fr, en]] of Object.entries(LIEUX_EXTRA)) { TEXTES.fr.lieux[id] = fr; TEXTES.en.lieux[id] = en; ALIAS_DECOR[id] = id; LIEUX_ECRITURE.push(id); LIEUX_MINI.push(id); }
Object.assign(ALIAS_DECOR, { aire: "parc", supermarche: "magasin", hopital: "docteur", medecin: "docteur", lune: "espace" });
// les actions rangées par thème (pour l'éditeur)
const CATEGORIES_ACTIONS = [
  ["chantier", "🚧", ["rouler", "parler", "trou", "deblayer", "construire", "route", "fenetres", "pont", "arbre", "panne", "feu", "copains", "laver"]],
  ["jeux", "🎈", ["libre", "chiffres", "lettres", "chercher", "ballon", "toboggan", "balancoire", "cerfvolant", "flaques", "cubes", "puzzle", "bulles", "chateau", "spectacle"]],
  ["maison", "🏠", ["manger", "calin", "dormir", "bain", "dents", "ranger", "cuisine", "peinture", "livre", "musique", "danse", "docteur", "courses"]],
  ["nature", "🌳", ["cueillir", "jardiner", "peche", "nourrir", "bonhomme", "coquillages", "glace", "piscine"]],
  ["voyages", "✈️", ["voler", "velo", "train", "avion", "bateau", "fusee"]],
  ["fetes", "🎉", ["fete", "cadeau", "gateau", "sapin"]],
];
const NOMS_CATEGORIES = { fr: { chantier: "Chantier", jeux: "Jeux", maison: "Maison", nature: "Nature", voyages: "Voyages", fetes: "Fêtes" },
  en: { chantier: "Building", jeux: "Games", maison: "Home", nature: "Nature", voyages: "Travel", fetes: "Parties" } };
ACTIONS_ECRITURE.length = 0;
for (const [, , l] of CATEGORIES_ACTIONS) for (const a of l) if (!ACTIONS_ECRITURE.includes(a)) ACTIONS_ECRITURE.push(a);
// les activités deviennent aussi des images pour l'« écran libre » et les miniatures
for (const id of ["toboggan", "balancoire", "gateau", "bain", "cubes", "peinture", "livre", "musique", "courses", "sapin", "bonhomme", "glace", "train", "avion", "bateau", "fusee", "cerfvolant", "jardiner"]) {
  const A = ACTIVITES[id];
  const tailles = { toboggan: [340, 200], balancoire: [320, 250], gateau: [340, 210], bain: [320, 150], cubes: [70, 270], peinture: [230, 310], livre: [360, 240], musique: [420, 130],
    courses: [520, 170], sapin: [310, 380], bonhomme: [190, 310], glace: [90, 290], train: [420, 200], avion: [240, 130], bateau: [300, 300], fusee: [200, 310], cerfvolant: [80, 160], jardiner: [440, 120] }[id];
  OBJETS_DECOR[id] = [tailles[0], tailles[1], (ctx, t) => A.dessin(ctx, 0, 0, { k: A.clics, n: A.clics, p: null, t, acteur: null, objet: true, fini: null })];
}
// un emplacement pour chacun, loin de l'objet de l'activité et du camion
function placesLibres(n, interdits, largeurs) {
  let zones = [[70, VW - 70]];
  for (const [a, b] of interdits) zones = zones.flatMap(([z0, z1]) => [[z0, Math.min(z1, a)], [Math.max(z0, b), z1]]).filter(([z0, z1]) => z1 - z0 > 50);
  if (!zones.length) zones = [[70, VW - 70]];
  return placesDansZones(zones, n, largeurs);
}

// Le grand monde de l'enfant : tous les endroits où il peut être (chambre, salon devant la télé, cuisine, salle de
// bain, classe, boulangerie, cinéma, cirque, fête foraine, château, jungle, sous la mer…), les objets de tous les
// jours (télé, canapé, jouets, fruits…), encore plus d'animaux et des gens (la maîtresse, le docteur, le boulanger,
// une fée, un pirate, le Père Noël…). Tout est reconnu dans le texte (écrit ou raconté) et apparaît dans la scène.
"use strict";

// ================================================================= 1. les lieux
const pancarte = (ctx, x, y, texte, col, taille = 26) => {
  const w = Math.max(120, texte.length * taille * 0.62 + 40);
  rrect(ctx, x - w / 2, y - taille, w, taille * 2, 12, col, 3);
  ecrireCentre(ctx, texte, x, y + 1, taille, [255, 255, 255]);
};
const fr_en = (fr, en) => (LANGUE === "en" ? en : fr);
const carreaux = (ctx, W, y0, y1, col, pas = 40) => { // un mur carrelé
  rrect(ctx, 0, y0, W, y1 - y0, 0, col);
  for (let y = y0; y < y1; y += pas) trait(ctx, [0, y], [W, y], 1.5, fonce(col, 0.9));
  for (let x = 0; x < W; x += pas) trait(ctx, [x, y0], [x, y1], 1.5, fonce(col, 0.9));
};
const petitPoisson = (ctx, x, y, col, f = 1, s = 1) => {
  poly(ctx, [[x - f * 16 * s, y], [x - f * 28 * s, y - 9 * s], [x - f * 28 * s, y + 9 * s]], fonce(col, 0.85), 2);
  ovale(ctx, x - 18 * s, y - 10 * s, 36 * s, 20 * s, col, 2);
  rond(ctx, x + f * 8 * s, y - 3 * s, 2.5 * s, CONTOUR);
};
const ecranAnime = (ctx, x, y, w, h, t) => { // un petit dessin animé qui passe à l'écran (télé, cinéma)
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  rrect(ctx, x, y, w, h, 0, [140, 205, 250]);
  ovale(ctx, x - w * 0.2, y + h * 0.62, w * 0.9, h * 0.8, [120, 200, 90]); ovale(ctx, x + w * 0.4, y + h * 0.7, w * 0.9, h * 0.7, [100, 185, 80]);
  rond(ctx, x + w * 0.82, y + h * 0.22, h * 0.13, [255, 220, 70]);
  const px = x + mod(t * w * 0.18, w + 60) - 30;
  dessineVehicule(ctx, "tractopelle", COULEURS.jaune, px, y + h * 0.86 - Math.abs(Math.sin(t * 4)) * 4, t, 0, 0, h / 520);
  ctx.restore();
};
const etagereLivres = (ctx, x, y, w, graine) => {
  rrect(ctx, x, y, w, 8, 2, [170, 120, 80], 2);
  const r = hasard(graine); let bx = x + 4;
  while (bx < x + w - 14) { const bw = 9 + r() * 9, bh = 34 + r() * 22; rrect(ctx, bx, y - bh, bw, bh, 2, [[220, 80, 80], [80, 140, 220], [250, 200, 60], [110, 190, 110], [180, 120, 220], [250, 150, 70]][Math.floor(r() * 6)], 1.5); bx += bw + 1.5; }
};

const LIEUX_MONDE = {
  chambre: { fr: "Chambre", en: "Bedroom", interieur: true, ciel: [[214, 232, 250], [214, 232, 250]], sol: [[205, 165, 120], [226, 190, 145]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [200, 225, 248], scroll);
      for (let k = 0; k < 16; k++) etoile(ctx, boucle(k * 70 + 20, scroll, 0.3, W, 60), 34 + (k % 2) * 16, 10, [[255, 210, 60], [255, 150, 190], [150, 210, 255]][k % 3]);
      fenetreMur(ctx, boucle(260, scroll, 0.3, W, 300), hz - 290, 150, 130, nuit, t);
      const lx = boucle(640, scroll, 0.3, W, 300); // le lit
      rrect(ctx, lx - 170, hz - 150, 26, 160, 10, [180, 120, 80], 3); rrect(ctx, lx + 150, hz - 95, 22, 105, 8, [180, 120, 80], 3);
      rrect(ctx, lx - 150, hz - 72, 305, 38, 12, [255, 255, 255], 3);
      ovale(ctx, lx - 146, hz - 98, 80, 34, [255, 255, 255], 3);
      rrect(ctx, lx - 60, hz - 78, 215, 48, 14, [120, 170, 240], 3);
      for (let k = 0; k < 6; k++) rond(ctx, lx - 40 + k * 34, hz - 54 + (k % 2) * 10, 5, [255, 230, 120]);
      const sx = boucle(1010, scroll, 0.3, W, 300); // l'étagère à jouets
      for (const y of [hz - 200, hz - 120]) rrect(ctx, sx - 90, y, 180, 10, 3, [180, 120, 80], 2);
      rond(ctx, sx - 60, hz - 214, 14, [240, 90, 90], 2); rrect(ctx, sx - 30, hz - 230, 28, 28, 4, [90, 160, 240], 2); rrect(ctx, sx + 2, hz - 222, 22, 22, 4, [250, 200, 60], 2);
      rond(ctx, sx + 55, hz - 218, 12, [170, 120, 80], 2); for (const d of [-9, 9]) rond(ctx, sx + 55 + d, hz - 230, 5, [170, 120, 80], 2); // le nounours
      dessineVehicule(ctx, "benne", COULEURS.orange, sx - 30, hz - 120, 0, 0, 0, 0.25);
      rrect(ctx, sx + 30, hz - 160, 40, 40, 6, [255, 150, 190], 2);
      if (nuit) { ctx.globalAlpha = 0.3; rond(ctx, boucle(160, scroll, 0.3, W, 300), hz - 40, 60, [255, 230, 150]); ctx.globalAlpha = 1; }
      rrect(ctx, 0, hz - 6, W, 14, 0, [255, 255, 255], 2);
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { ovale(ctx, boucle(480, scroll, 1, W, 300) - 200, G + 2, 400, 50, [250, 170, 190], 3); } },
  salon: { fr: "Salon", en: "Living room", interieur: true, ciel: [[250, 236, 214], [250, 236, 214]], sol: [[190, 140, 100], [215, 165, 120]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [250, 232, 205], scroll);
      fenetreMur(ctx, boucle(150, scroll, 0.3, W, 300), hz - 290, 140, 130, nuit, t);
      const tx = boucle(430, scroll, 0.3, W, 300); // la télévision
      rrect(ctx, tx - 120, hz - 70, 240, 76, 8, [170, 120, 85], 3); for (const d of [-60, 60]) rond(ctx, tx + d, hz - 32, 4, [230, 200, 140]);
      rrect(ctx, tx - 110, hz - 220, 220, 140, 12, [45, 45, 55], 3); ecranAnime(ctx, tx - 98, hz - 208, 196, 116, t);
      trait(ctx, [tx, hz - 80], [tx, hz - 70], 6, [45, 45, 55]);
      const cx = boucle(800, scroll, 0.3, W, 300); // le canapé
      rrect(ctx, cx - 170, hz - 150, 340, 80, 30, [230, 110, 90], 3);
      rrect(ctx, cx - 180, hz - 80, 360, 60, 18, [230, 110, 90], 3);
      for (const d of [-200, 160]) rrect(ctx, cx + d, hz - 110, 40, 92, 18, [215, 95, 80], 3);
      rrect(ctx, cx - 120, hz - 130, 70, 52, 14, [250, 200, 80], 2); rrect(ctx, cx + 50, hz - 130, 70, 52, 14, [120, 180, 240], 2);
      for (const d of [-150, 150]) trait(ctx, [cx + d, hz - 20], [cx + d, hz + 4], 6, [120, 80, 60]);
      const lx = boucle(1080, scroll, 0.3, W, 300); // la lampe et la plante
      trait(ctx, [lx, hz], [lx, hz - 190], 5, [120, 110, 100]); poly(ctx, [[lx - 42, hz - 190], [lx + 42, hz - 190], [lx + 26, hz - 240], [lx - 26, hz - 240]], [255, 220, 120], 3);
      if (nuit) { ctx.globalAlpha = 0.25; rond(ctx, lx, hz - 200, 100, [255, 230, 150]); ctx.globalAlpha = 1; }
      rrect(ctx, cx - 60, hz - 260, 120, 80, 6, [255, 255, 255], 5, [190, 140, 90]); rond(ctx, cx - 20, hz - 230, 14, [255, 210, 60]); poly(ctx, [[cx - 50, hz - 186], [cx, hz - 236], [cx + 50, hz - 186]], [110, 190, 110]);
      rrect(ctx, 0, hz - 6, W, 14, 0, [255, 255, 255], 2);
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { rrect(ctx, boucle(560, scroll, 1, W, 300) - 220, G - 4, 440, 50, 20, [140, 190, 230], 3); } },
  cuisine: { fr: "Cuisine", en: "Kitchen", interieur: true, ciel: [[235, 245, 240], [235, 245, 240]], sol: [[215, 200, 180], [235, 225, 205]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [240, 248, 240], scroll);
      carreaux(ctx, W, hz - 190, hz - 90, [215, 238, 232], 32);
      for (let k = 0; k < 6; k++) { const x = boucle(k * 220, scroll, 0.3, W, 220); rrect(ctx, x, 30, 200, 100, 8, [190, 140, 100], 3); rond(ctx, x + 100, 110, 5, [240, 210, 150]); }
      rrect(ctx, 0, hz - 92, W, 16, 0, [235, 235, 240], 2); rrect(ctx, 0, hz - 76, W, 82, 0, [190, 140, 100], 2); // le plan de travail
      for (let k = 0; k < 8; k++) { const x = boucle(k * 160 + 40, scroll, 0.3, W, 160); rond(ctx, x, hz - 40, 5, [240, 210, 150]); trait(ctx, [x + 70, hz - 76], [x + 70, hz + 6], 2, [150, 105, 75]); }
      const fx = boucle(150, scroll, 0.3, W, 300); // le frigo
      rrect(ctx, fx - 62, hz - 290, 124, 300, 16, [250, 252, 255], 3); trait(ctx, [fx - 62, hz - 190], [fx + 62, hz - 190], 3, [200, 205, 215]);
      for (const y of [hz - 250, hz - 150]) rrect(ctx, fx + 40, y, 8, 40, 4, [190, 195, 205]);
      coeur(ctx, fx - 20, hz - 240, 9, [240, 90, 110]); etoile(ctx, fx + 6, hz - 130, 10, [255, 200, 60]); rond(ctx, fx - 24, hz - 120, 7, [100, 170, 240]);
      const ox = boucle(640, scroll, 0.3, W, 300); // la cuisinière
      rrect(ctx, ox - 80, hz - 100, 160, 106, 6, [240, 240, 245], 3); rrect(ctx, ox - 60, hz - 74, 120, 56, 8, [60, 60, 70], 2); rrect(ctx, ox - 52, hz - 68, 104, 44, 6, nuit ? [90, 60, 40] : [255, 170, 80]);
      for (const d of [-45, 45]) { ovale(ctx, ox + d - 26, hz - 106, 52, 10, [70, 70, 80]); }
      rrect(ctx, ox + 4, hz - 150, 70, 44, 10, [220, 80, 70], 3); trait(ctx, [ox + 74, hz - 140], [ox + 100, hz - 146], 5, [60, 60, 70]); // la casserole
      for (let k = 0; k < 3; k++) { ctx.globalAlpha = 0.5; rond(ctx, ox + 30 + k * 8, hz - 160 - mod(t * 30 + k * 18, 50), 7 + k * 2, [255, 255, 255]); ctx.globalAlpha = 1; }
      fenetreMur(ctx, boucle(1000, scroll, 0.3, W, 300), hz - 270, 160, 120, nuit, t);
    } },
  salledebain: { fr: "Salle de bain", en: "Bathroom", interieur: true, ciel: [[225, 242, 252], [225, 242, 252]], sol: [[200, 225, 235], [225, 240, 248]],
    fond(ctx, W, H, hz, scroll, t) {
      murInterieur(ctx, W, hz, [235, 248, 255], scroll);
      carreaux(ctx, W, hz - 170, hz + 6, [190, 225, 245], 36);
      const bx = boucle(380, scroll, 0.3, W, 300); // la baignoire pleine de mousse
      for (let k = 0; k < 9; k++) rond(ctx, bx - 140 + k * 36, hz - 118 + (k % 2) * 6, 22, [255, 255, 255], 2);
      rrect(ctx, bx - 180, hz - 120, 360, 110, 46, [255, 255, 255], 3);
      for (const d of [-150, 140]) rrect(ctx, bx + d, hz - 14, 14, 20, 4, [210, 180, 90], 2);
      trait(ctx, [bx + 150, hz - 180], [bx + 150, hz - 120], 6, [180, 185, 195]); trait(ctx, [bx + 150, hz - 180], [bx + 120, hz - 180], 6, [180, 185, 195]);
      ovale(ctx, bx - 110, hz - 140, 30, 22, [255, 220, 60], 2); poly(ctx, [[bx - 82, hz - 132], [bx - 70, hz - 128], [bx - 82, hz - 124]], [250, 140, 40]); // le canard
      for (let k = 0; k < 4; k++) { const y = hz - 150 - mod(t * 25 + k * 30, 120); ctx.globalAlpha = 0.6; rond(ctx, bx - 60 + k * 40, y, 6 + (k % 2) * 3, [200, 230, 255], 1.5); ctx.globalAlpha = 1; }
      const lx = boucle(900, scroll, 0.3, W, 300); // le lavabo et le miroir
      ovale(ctx, lx - 60, hz - 290, 120, 140, [210, 235, 250], 5, [200, 170, 120]);
      rrect(ctx, lx - 80, hz - 120, 160, 30, 12, [255, 255, 255], 3); rrect(ctx, lx - 20, hz - 90, 40, 96, 6, [255, 255, 255], 3);
      rrect(ctx, lx + 40, hz - 160, 22, 40, 4, [120, 200, 230], 2); trait(ctx, [lx + 46, hz - 160], [lx + 42, hz - 196], 3, [240, 90, 90]); trait(ctx, [lx + 56, hz - 160], [lx + 60, hz - 194], 3, [90, 170, 240]);
      const sx = boucle(1180, scroll, 0.3, W, 300); rrect(ctx, sx - 30, hz - 240, 60, 120, 10, [250, 170, 190], 3); trait(ctx, [sx - 20, hz - 250], [sx + 20, hz - 250], 5, [180, 185, 195]); // la serviette
    } },
  classe: { fr: "Classe", en: "Classroom", interieur: true, ciel: [[252, 240, 205], [252, 240, 205]], sol: [[200, 170, 130], [222, 195, 155]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [252, 238, 200], scroll);
      const bx = boucle(480, scroll, 0.3, W, 300); // le tableau
      rrect(ctx, bx - 220, hz - 300, 440, 180, 8, [70, 120, 90], 6, [170, 120, 80]);
      ecrireCentre(ctx, "A  B  C", bx - 90, hz - 250, 42, [255, 255, 255]); ecrireCentre(ctx, "1  2  3", bx + 100, hz - 250, 42, [255, 240, 150]);
      rond(ctx, bx - 120, hz - 170, 16, [255, 255, 255]); trait(ctx, [bx - 40, hz - 170], [bx + 160, hz - 170], 3, [255, 255, 255]);
      const hx = boucle(860, scroll, 0.3, W, 300); // l'horloge
      rond(ctx, hx, hz - 250, 34, [255, 255, 255], 4);
      trait(ctx, [hx, hz - 250], [hx + 20 * Math.cos(t * 0.5 - PI / 2), hz - 250 + 20 * Math.sin(t * 0.5 - PI / 2)], 4, CONTOUR, "round");
      trait(ctx, [hx, hz - 250], [hx + 26 * Math.cos(t * 3 - PI / 2), hz - 250 + 26 * Math.sin(t * 3 - PI / 2)], 2, [220, 70, 70], "round");
      for (let k = 0; k < 4; k++) { const x = boucle(k * 110 + 960, scroll, 0.3, W, 300); rrect(ctx, x, hz - 200, 80, 64, 2, [255, 255, 255], 2); rond(ctx, x + 22, hz - 182, 9, [255, 200, 60]); poly(ctx, [[x + 10, hz - 140], [x + 40, hz - 170], [x + 70, hz - 140]], [[110, 190, 110], [240, 120, 150], [120, 170, 240], [250, 160, 60]][k]); }
      for (let k = 0; k < 4; k++) { const x = boucle(k * 260 + 120, scroll, 0.3, W, 300); rrect(ctx, x - 60, hz - 60, 120, 14, 4, [240, 190, 90], 2); for (const d of [-50, 50]) trait(ctx, [x + d, hz - 46], [x + d, hz], 5, [150, 150, 160]); rrect(ctx, x - 20, hz - 92, 40, 30, 6, [90, 170, 240], 2); }
      for (let k = 0; k < 14; k++) { const x = boucle(k * 70, scroll, 0.3, W, 70); poly(ctx, [[x, 10], [x + 50, 10], [x + 25, 46]], [[240, 90, 90], [250, 200, 60], [90, 170, 240], [110, 190, 110]][k % 4]); ecrireCentre(ctx, "ABCDEFGHIJKLMN"[k], x + 25, 24, 18, [255, 255, 255]); }
    } },
  bibliotheque: { fr: "Bibliothèque", en: "Library", interieur: true, ciel: [[240, 232, 215], [240, 232, 215]], sol: [[170, 120, 90], [195, 145, 110]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [240, 228, 205], scroll);
      for (let k = 0; k < 6; k++) { const x = boucle(k * 240, scroll, 0.3, W, 240); rrect(ctx, x, hz - 300, 210, 306, 6, [190, 140, 95], 3); for (let r = 0; r < 4; r++) etagereLivres(ctx, x + 8, hz - 220 + r * 74, 194, k * 10 + r); }
      const fx = boucle(560, scroll, 0.3, W, 300); // le fauteuil de lecture
      rrect(ctx, fx - 80, hz - 140, 160, 100, 30, [200, 70, 70], 3); rrect(ctx, fx - 90, hz - 60, 180, 56, 16, [210, 80, 80], 3);
      for (const d of [-110, 80]) rrect(ctx, fx + d, hz - 100, 30, 90, 14, [190, 65, 65], 3);
      pancarte(ctx, boucle(820, scroll, 0.3, W, 300), 40, fr_en("BIBLIOTHÈQUE", "LIBRARY"), [90, 130, 200], 24);
    } },
  boulangerie: { fr: "Boulangerie", en: "Bakery", interieur: true, ciel: [[255, 240, 222], [255, 240, 222]], sol: [[200, 160, 120], [225, 190, 150]],
    fond(ctx, W, H, hz, scroll, t) {
      murInterieur(ctx, W, hz, [255, 236, 210], scroll);
      for (let k = 0; k < 18; k++) { const x = boucle(k * 60, scroll, 0.3, W, 60); poly(ctx, [[x, 0], [x + 60, 0], [x + 60, 46], [x + 30, 60], [x, 46]], k % 2 ? [255, 255, 255] : [230, 90, 90], 2); }
      pancarte(ctx, boucle(560, scroll, 0.3, W, 300), 100, fr_en("BOULANGERIE", "BAKERY"), [200, 130, 70], 28);
      for (let k = 0; k < 4; k++) { const x = boucle(k * 300 + 40, scroll, 0.3, W, 300); // les étagères de pains
        rrect(ctx, x, hz - 230, 240, 10, 3, [170, 120, 80], 2); rrect(ctx, x, hz - 160, 240, 10, 3, [170, 120, 80], 2);
        for (let j = 0; j < 5; j++) { ctx.save(); ctx.translate(x + 30 + j * 45, hz - 250); ctx.rotate(-0.25); rrect(ctx, -10, -40, 20, 70, 10, [225, 170, 90], 2); for (let c = 0; c < 3; c++) trait(ctx, [-5, -26 + c * 18], [5, -32 + c * 18], 2, [180, 120, 60]); ctx.restore(); }
        for (let j = 0; j < 4; j++) { ovale(ctx, x + 14 + j * 56, hz - 196, 48, 34, [215, 160, 85], 2); trait(ctx, [x + 26 + j * 56, hz - 182], [x + 50 + j * 56, hz - 186], 2, [175, 115, 60]); } }
      rrect(ctx, 0, hz - 90, W, 96, 0, [190, 140, 100], 3); rrect(ctx, 0, hz - 120, W, 32, 0, [215, 240, 250], 2); // la vitrine
      for (let k = 0; k < 14; k++) { const x = boucle(k * 80 + 20, scroll, 0.3, W, 80); if (k % 2) { poly(ctx, [[x, hz - 92], [x + 20, hz - 112], [x + 42, hz - 112], [x + 62, hz - 92]], [235, 175, 85], 2); } else { rrect(ctx, x + 10, hz - 112, 40, 20, 6, [250, 170, 200], 2); rond(ctx, x + 30, hz - 116, 6, [230, 50, 70]); } }
    } },
  restaurant: { fr: "Restaurant", en: "Restaurant", interieur: true, ciel: [[250, 230, 210], [250, 230, 210]], sol: [[160, 110, 80], [185, 135, 100]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [250, 225, 200], scroll);
      fenetreMur(ctx, boucle(200, scroll, 0.3, W, 300), hz - 280, 150, 120, nuit, t);
      pancarte(ctx, boucle(560, scroll, 0.3, W, 300), 70, fr_en("RESTAURANT", "RESTAURANT"), [190, 70, 70], 26);
      for (let k = 0; k < 6; k++) { const x = boucle(k * 230 + 100, scroll, 0.3, W, 230); trait(ctx, [x, 0], [x, 150], 2, [80, 70, 70]); poly(ctx, [[x - 30, 180], [x + 30, 180], [x + 14, 150], [x - 14, 150]], [250, 210, 90], 2); if (nuit) { ctx.globalAlpha = 0.25; rond(ctx, x, 200, 60, [255, 230, 150]); ctx.globalAlpha = 1; } }
      for (let k = 0; k < 4; k++) { const x = boucle(k * 300 + 160, scroll, 0.3, W, 300); // les tables à nappe à carreaux
        rrect(ctx, x - 90, hz - 80, 180, 60, 6, [255, 255, 255], 3);
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) rrect(ctx, x - 90 + i * 30, hz - 80 + j * 30, 30, 30, 0, [230, 80, 80]);
        ovale(ctx, x - 50, hz - 92, 40, 12, [255, 255, 255], 2); ovale(ctx, x + 10, hz - 92, 40, 12, [255, 255, 255], 2);
        rrect(ctx, x - 6, hz - 120, 12, 28, 4, [255, 250, 230], 2); rond(ctx, x, hz - 126, 4, [255, 180, 60]);
        for (const d of [-130, 110]) { rrect(ctx, x + d, hz - 110, 20, 80, 6, [170, 110, 70], 2); rrect(ctx, x + d - 6, hz - 50, 32, 10, 3, [170, 110, 70], 2); } }
    } },
  cinema: { fr: "Cinéma", en: "Cinema", interieur: true, ciel: [[45, 35, 60], [45, 35, 60]], sol: [[120, 40, 50], [140, 50, 60]],
    fond(ctx, W, H, hz, scroll, t) {
      rrect(ctx, 0, 0, W, hz + 20, 0, [45, 35, 60]);
      const x = boucle(490, scroll, 0.15, W, 300);
      rrect(ctx, x - 330, 30, 660, 290, 6, [250, 250, 245], 4); ecranAnime(ctx, x - 318, 42, 636, 266, t);
      for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) { const px = x + sx * (360 + k * 22); trait(ctx, [px, 0], [px, hz + 10], 24, [190, 40, 50]); trait(ctx, [px - 8, 0], [px - 8, hz + 10], 3, [150, 25, 35]); }
      ctx.globalAlpha = 0.12; poly(ctx, [[x - 40, 0], [x + 40, 0], [x + 330, 320], [x - 330, 320]], [255, 255, 220]); ctx.globalAlpha = 1;
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { for (let r = 0; r < 2; r++) for (let k = 0; k < 16; k++) { const x = mod(k * 80 + r * 40 - scroll, W + 80) - 40; rrect(ctx, x - 32, G + 40 + r * 50, 64, 46, 16, [200, 50, 60], 3); } } },
  cirque: { fr: "Cirque", en: "Circus", interieur: true, ciel: [[250, 235, 220], [250, 235, 220]], sol: [[230, 200, 140], [215, 180, 120]],
    fond(ctx, W, H, hz, scroll, t) {
      const cx = W / 2;
      for (let k = 0; k < 16; k++) { const x0 = (k / 16) * W * 1.6 - W * 0.3, x1 = ((k + 1) / 16) * W * 1.6 - W * 0.3; poly(ctx, [[cx, -60], [x0, hz + 20], [x1, hz + 20]], k % 2 ? [255, 250, 240] : [225, 60, 70]); }
      for (let k = 0; k < 18; k++) { const x = k * (W / 17); poly(ctx, [[x, 70 + Math.abs(x - cx) * 0.05], [x + 30, 70 + Math.abs(x - cx) * 0.05], [x + 15, 100 + Math.abs(x - cx) * 0.05]], [[255, 210, 60], [90, 170, 240], [110, 190, 110], [240, 120, 180]][k % 4]); }
      for (const d of [-1, 1]) { ctx.globalAlpha = 0.18; poly(ctx, [[cx + d * 380, -10], [cx + d * 330, -10], [cx + d * 40 + 40 * Math.sin(t), hz + 40], [cx + d * 200 + 40 * Math.sin(t), hz + 40]], [255, 255, 200]); ctx.globalAlpha = 1; }
      for (let k = 0; k < 8; k++) etoile(ctx, mod(k * 137, W), 150 + (k % 3) * 50, 12 + 3 * Math.sin(t * 3 + k), [255, 220, 80], t * 0.5);
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { ovale(ctx, W / 2 - 360, G - 30, 720, 100, null, 10, [220, 60, 70]); ovale(ctx, W / 2 - 360, G - 30, 720, 100, null, 3, [255, 220, 90]); } },
  fetforaine: { fr: "Fête foraine", en: "Funfair", ciel: [[110, 180, 245], [225, 240, 255]], sol: [[140, 200, 90], [220, 200, 160]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      const rx = boucle(260, scroll, 0.25, W, 300), ry = hz - 180, rr = 150; // la grande roue
      trait(ctx, [rx - 70, hz], [rx, ry], 8, [150, 150, 165]); trait(ctx, [rx + 70, hz], [rx, ry], 8, [150, 150, 165]);
      rond(ctx, rx, ry, rr, null, 6, [230, 80, 90]);
      for (let k = 0; k < 8; k++) { const a = t * 0.3 + (k / 8) * 2 * PI, px = rx + rr * Math.cos(a), py = ry + rr * Math.sin(a); trait(ctx, [rx, ry], [px, py], 3, [200, 200, 210]); rrect(ctx, px - 16, py, 32, 26, 8, [[255, 200, 60], [90, 170, 240], [110, 190, 110], [240, 120, 180]][k % 4], 2); }
      rond(ctx, rx, ry, 14, [255, 220, 90], 3);
      const mx = boucle(760, scroll, 0.3, W, 300); // le manège
      rrect(ctx, mx - 160, hz - 30, 320, 34, 10, [240, 200, 120], 3);
      for (let k = 0; k < 5; k++) { const x = mx - 120 + k * 60, y = hz - 90 + 10 * Math.sin(t * 3 + k * 1.3); trait(ctx, [x, hz - 170], [x, hz - 30], 3, [220, 190, 90]);
        ovale(ctx, x - 24, y - 6, 48, 26, [[255, 255, 255], [250, 180, 200], [180, 210, 250]][k % 3], 2); rond(ctx, x + 20, y - 12, 10, [[255, 255, 255], [250, 180, 200], [180, 210, 250]][k % 3], 2); }
      poly(ctx, [[mx - 180, hz - 170], [mx + 180, hz - 170], [mx, hz - 250]], [230, 70, 80], 3);
      for (let k = 0; k < 6; k++) poly(ctx, [[mx - 180 + k * 60, hz - 170], [mx - 150 + k * 60, hz - 170], [mx, hz - 250]], [255, 250, 240]);
      rond(ctx, mx, hz - 254, 10, [255, 210, 60], 2);
      const bx = boucle(1150, scroll, 0.3, W, 300); // le stand de barbe à papa
      rrect(ctx, bx - 70, hz - 100, 140, 100, 4, [255, 255, 255], 3); for (let k = 0; k < 5; k++) rrect(ctx, bx - 80 + k * 32, hz - 130, 32, 30, 4, k % 2 ? [255, 255, 255] : [240, 120, 180], 2);
      rond(ctx, bx, hz - 70, 22, [255, 190, 220], 2); trait(ctx, [bx, hz - 48], [bx, hz - 20], 3, [240, 230, 210]);
      for (let k = 0; k < 20; k++) { const x = boucle(k * 60, scroll, 0.3, W, 60); rond(ctx, x, 30 + 14 * Math.sin(k * 0.8), 6, nuit || Math.sin(t * 4 + k) > 0 ? [255, 230, 120] : [250, 160, 80]); }
    } },
  chateau: { fr: "Château", en: "Castle", ciel: [[120, 185, 250], [225, 240, 255]], sol: [[140, 200, 90], [200, 190, 170]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      const x = boucle(600, scroll, 0.25, W, 400), gris = [200, 200, 210];
      rrect(ctx, x - 220, hz - 200, 440, 200, 0, gris, 3);
      for (let k = 0; k < 11; k++) rrect(ctx, x - 220 + k * 42, hz - 222, 24, 24, 0, gris, 3);
      for (const d of [-260, 200]) { rrect(ctx, x + d, hz - 290, 60, 290, 0, clair(gris, 0.2), 3); poly(ctx, [[x + d - 12, hz - 290], [x + d + 72, hz - 290], [x + d + 30, hz - 370]], [80, 110, 200], 3);
        trait(ctx, [x + d + 30, hz - 370], [x + d + 30, hz - 410], 3, CONTOUR); poly(ctx, [[x + d + 32, hz - 410], [x + d + 62, hz - 400 + 4 * Math.sin(t * 4)], [x + d + 32, hz - 390]], [230, 70, 80], 2);
        rrect(ctx, x + d + 20, hz - 240, 20, 34, 10, [60, 50, 60]); }
      rrect(ctx, x - 60, hz - 120, 120, 120, 60, [120, 80, 55], 3); for (let k = 0; k < 3; k++) trait(ctx, [x - 40 + k * 40, hz - 110], [x - 40 + k * 40, hz], 3, [90, 60, 40]);
      for (const d of [-140, 100]) rrect(ctx, x + d, hz - 170, 40, 50, 20, [60, 50, 60]);
      for (let k = 0; k < 18; k++) rrect(ctx, x - 210 + (k % 9) * 48, hz - 60 - Math.floor(k / 9) * 70, 30, 14, 2, null, 1.5, fonce(gris, 0.85));
    } },
  jungle: { fr: "Jungle", en: "Jungle", ciel: [[150, 210, 175], [210, 240, 215]], sol: [[90, 160, 70], [130, 100, 65]],
    fond(ctx, W, H, hz, scroll, t) {
      const verts = [[40, 120, 60], [60, 150, 70], [80, 170, 80], [50, 135, 65]];
      for (let k = 0; k < 7; k++) { const x = boucle(k * 180 + 40, scroll, 0.25, W); rrect(ctx, x - 14, hz - 300, 28, 310, 8, [120, 85, 55], 3); for (let j = 0; j < 5; j++) ovale(ctx, x - 90 + j * 36, hz - 340 + (j % 2) * 30, 80, 60, verts[(k + j) % 4], 3); }
      for (let k = 0; k < 9; k++) { const x = boucle(k * 140 + 70, scroll, 0.35, W); ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 30 + 10 * Math.sin(t + k), 120, x - 10, 220 + (k % 3) * 30); ctx.lineWidth = 4; ctx.strokeStyle = css([70, 130, 60]); ctx.stroke(); for (let j = 1; j < 4; j++) ovale(ctx, x + 6 - j * 2, j * 60, 16, 10, [90, 170, 80]); }
      for (let k = 0; k < 12; k++) { const x = boucle(k * 100 + 20, scroll, 0.5, W); for (const a of [-2.4, -1.6, -0.8]) { ctx.save(); ctx.translate(x, hz + 10); ctx.rotate(a + PI / 2); ovale(ctx, -14, -90, 28, 90, verts[k % 4], 2); ctx.restore(); } }
      for (let k = 0; k < 5; k++) { const x = boucle(k * 250 + 120, scroll, 0.5, W); for (let j = 0; j < 5; j++) { const a = (j / 5) * 2 * PI; rond(ctx, x + 12 * Math.cos(a), hz - 20 + 12 * Math.sin(a), 9, [240, 80, 110], 2); } rond(ctx, x, hz - 20, 6, [255, 220, 80]); }
    } },
  desert: { fr: "Désert", en: "Desert", ciel: [[110, 185, 240], [250, 232, 190]], sol: [[238, 205, 135], [225, 190, 120]],
    fond(ctx, W, H, hz, scroll, t) {
      for (const [b, k, c] of [[300, 0.12, [240, 210, 150]], [800, 0.15, [235, 200, 140]]]) { const x = boucle(b, scroll, k, W, 600); ovale(ctx, x - 500, hz - 110, 1000, 260, c, 3); }
      const px = boucle(560, scroll, 0.2, W, 400); // les pyramides
      for (const [d, h] of [[-120, 200], [100, 150]]) { poly(ctx, [[px + d - h, hz], [px + d, hz - h], [px + d + h, hz]], [230, 190, 110], 3); poly(ctx, [[px + d, hz - h], [px + d + h, hz], [px + d + h * 0.3, hz]], [210, 170, 95]); }
      for (let k = 0; k < 5; k++) { const x = boucle(k * 260 + 100, scroll, 0.45, W), v = [90, 170, 90]; // les cactus
        rrect(ctx, x - 14, hz - 120, 28, 125, 14, v, 3); rrect(ctx, x - 50, hz - 90, 22, 50, 11, v, 3); rrect(ctx, x - 50, hz - 52, 46, 18, 9, v, 3); rrect(ctx, x + 28, hz - 100, 22, 46, 11, v, 3); rrect(ctx, x + 6, hz - 66, 44, 18, 9, v, 3);
        if (k % 2) rond(ctx, x, hz - 124, 7, [250, 120, 160], 2); }
    } },
  banquise: { fr: "Banquise", en: "North Pole", ciel: [[175, 212, 245], [232, 245, 255]], sol: [[245, 250, 255], [222, 236, 250]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      if (nuit) for (let k = 0; k < 3; k++) { ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(0, 80 + k * 30); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 80 + k * 30 + 25 * Math.sin(x * 0.01 + t + k)); ctx.lineWidth = 18; ctx.strokeStyle = css([[120, 240, 170], [140, 200, 250], [200, 150, 250]][k]); ctx.stroke(); ctx.globalAlpha = 1; }
      rrect(ctx, 0, hz - 70, W, 80, 0, [80, 150, 215]);
      for (let k = 0; k < 4; k++) { const x = boucle(k * 330 + 60, scroll, 0.2, W, 300); poly(ctx, [[x - 90, hz - 60], [x - 50, hz - 170 - (k % 2) * 40], [x, hz - 130], [x + 40, hz - 200 + (k % 2) * 30], [x + 100, hz - 60]], [240, 248, 255], 3); poly(ctx, [[x, hz - 130], [x + 40, hz - 200 + (k % 2) * 30], [x + 100, hz - 60], [x + 20, hz - 60]], [200, 225, 245]); }
      const ix = boucle(760, scroll, 0.3, W, 300); // l'igloo
      ctx.beginPath(); ctx.arc(ix, hz + 10, 110, PI, 2 * PI); ctx.closePath(); ctx.fillStyle = css([248, 252, 255]); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = css([150, 180, 210]); ctx.stroke();
      for (let r = 1; r < 4; r++) { const y = hz + 10 - r * 28, l = Math.sqrt(Math.max(0, 110 * 110 - (r * 28) ** 2)); trait(ctx, [ix - l, y], [ix + l, y], 2, [170, 195, 220]); }
      ctx.beginPath(); ctx.arc(ix + 40, hz + 10, 34, PI, 2 * PI); ctx.fillStyle = css([70, 90, 120]); ctx.fill();
    } },
  sousmarin: { fr: "Sous la mer", en: "Under the sea", interieur: true, sansCiel: true, ciel: [[40, 120, 190], [95, 185, 225]], sol: [[230, 210, 160], [215, 195, 145]],
    fond(ctx, W, H, hz, scroll, t) {
      ctx.fillStyle = "rgba(255,255,255,0.12)"; for (let k = 0; k < 5; k++) { const x = k * 220 + 40 * Math.sin(t * 0.3 + k); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 60, 0); ctx.lineTo(x + 180, hz); ctx.lineTo(x + 80, hz); ctx.fill(); }
      for (let k = 0; k < 6; k++) petitPoisson(ctx, mod(k * 190 + t * (30 + k * 6), W + 100) - 50, 80 + (k * 53) % 200, [[255, 170, 60], [250, 210, 70], [240, 120, 170], [120, 200, 250]][k % 4], 1, 0.8 + (k % 3) * 0.2);
      for (let k = 0; k < 6; k++) { const x = boucle(k * 200 + 80, scroll, 0.4, W); // les algues et le corail
        for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(x + j * 14, hz + 10); for (let y = 0; y < 160; y += 20) ctx.lineTo(x + j * 14 + 10 * Math.sin(t * 2 + y * 0.05 + j), hz + 10 - y); ctx.lineWidth = 7; ctx.strokeStyle = css([60, 160, 90]); ctx.lineCap = "round"; ctx.stroke(); ctx.lineCap = "butt"; }
        for (let j = 0; j < 5; j++) rond(ctx, x + 70 + (j % 3) * 14, hz - 10 - j * 12, 10, [[250, 120, 140], [255, 160, 90]][k % 2], 2); }
      for (let k = 0; k < 12; k++) { const x = (k * 97) % W, y = hz - mod(t * 40 + k * 60, hz); ctx.globalAlpha = 0.6; rond(ctx, x + 6 * Math.sin(t * 2 + k), y, 4 + (k % 3) * 2, [220, 240, 255], 1.5); ctx.globalAlpha = 1; }
    },
    devant(ctx, W, H, hz, scroll, t) { for (let k = 0; k < 6; k++) { const x = mod(k * 210 - scroll, W + 210) - 105; ovale(ctx, x, hz + 40 + (k % 2) * 30, 70, 30, [190, 175, 160], 2); } } },
  camping: { fr: "Camping", en: "Campsite", ciel: [[110, 185, 240], [220, 240, 255]], sol: [[120, 185, 85], [180, 150, 105]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      collines(ctx, W, hz, scroll, [120, 190, 100], [95, 170, 85], false);
      for (let k = 0; k < 7; k++) sapinVert(ctx, boucle(k * 190 + 30, scroll, 0.3, W), hz - 6, 0.8);
      for (const [b, c] of [[420, [240, 120, 70]], [860, [90, 160, 230]]]) { const x = boucle(b, scroll, 0.4, W, 300); // les tentes
        poly(ctx, [[x - 110, hz + 6], [x, hz - 130], [x + 110, hz + 6]], c, 3); poly(ctx, [[x - 30, hz + 6], [x, hz - 80], [x + 30, hz + 6]], fonce(c, 0.6)); trait(ctx, [x, hz - 130], [x, hz - 150], 3, CONTOUR); }
      const fx = boucle(640, scroll, 0.4, W, 300); // le feu de camp
      for (const a of [-0.4, 0.4]) { ctx.save(); ctx.translate(fx, hz - 6); ctx.rotate(a); rrect(ctx, -40, -6, 80, 12, 6, [140, 90, 60], 2); ctx.restore(); }
      for (const [c, h, d] of [[[240, 90, 40], 60, 0], [[255, 170, 50], 44, 0.5], [[255, 230, 120], 26, 1]]) poly(ctx, [[fx - h * 0.4, hz - 8], [fx + 6 * Math.sin(t * 9 + d), hz - 8 - h - 6 * Math.sin(t * 7 + d)], [fx + h * 0.4, hz - 8]], c);
      if (nuit) { ctx.globalAlpha = 0.25; rond(ctx, fx, hz - 30, 110, [255, 180, 80]); ctx.globalAlpha = 1; }
    } },
  caserne: { fr: "Caserne de pompiers", en: "Fire station", ciel: [[110, 180, 245], [220, 240, 255]], sol: [[150, 200, 110], [180, 180, 190]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      const x = boucle(600, scroll, 0.3, W, 400);
      rrect(ctx, x - 260, hz - 230, 520, 230, 0, [200, 70, 60], 3);
      for (let r = 0; r < 9; r++) trait(ctx, [x - 260, hz - 230 + r * 26], [x + 260, hz - 230 + r * 26], 1.5, [170, 55, 50]);
      pancarte(ctx, x, hz - 200, fr_en("POMPIERS", "FIRE STATION"), [150, 40, 40], 26);
      for (const d of [-200, 20]) { rrect(ctx, x + d, hz - 160, 180, 160, 10, d < 0 ? [60, 60, 70] : [235, 235, 240], 3); if (d > 0) for (let k = 1; k < 5; k++) trait(ctx, [x + d, hz - 160 + k * 32], [x + d + 180, hz - 160 + k * 32], 2, [190, 190, 200]); }
      dessineVehicule(ctx, "pompier", COULEURS.rouge, x - 110, hz - 2, t, 0, 0, 0.55);
      rond(ctx, x + 230, hz - 250, 14, Math.sin(t * 8) > 0 ? [80, 150, 255] : [230, 60, 60], 3);
      const tx = boucle(1080, scroll, 0.3, W, 300); rrect(ctx, tx - 40, hz - 320, 80, 320, 0, [210, 80, 70], 3); for (let k = 0; k < 6; k++) rrect(ctx, tx - 20, hz - 300 + k * 50, 40, 26, 4, VITRE, 2);
    } },
  garage: { fr: "Garage", en: "Garage", ciel: [[110, 180, 245], [220, 240, 255]], sol: [[150, 200, 110], [165, 165, 175]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      const x = boucle(560, scroll, 0.3, W, 400);
      rrect(ctx, x - 240, hz - 200, 480, 200, 0, [235, 235, 225], 3); pancarte(ctx, x, hz - 230, fr_en("GARAGE", "GARAGE"), [60, 120, 200], 28);
      rrect(ctx, x - 200, hz - 150, 220, 150, 6, [70, 70, 80], 3); dessineVehicule(ctx, "benne", COULEURS.orange, x - 90, hz - 2, t, 0, 0, 0.45);
      for (let k = 0; k < 4; k++) { rond(ctx, x + 70, hz - 18 - k * 34, 20, [50, 50, 58], 3); rond(ctx, x + 70, hz - 18 - k * 34, 9, [170, 170, 180]); }
      rrect(ctx, x + 110, hz - 140, 110, 70, 6, [255, 255, 255], 3); for (let k = 0; k < 4; k++) trait(ctx, [x + 124 + k * 26, hz - 130], [x + 124 + k * 26, hz - 84], 4, [[230, 80, 80], [90, 90, 100], [250, 200, 60], [90, 150, 230]][k]);
      const px = boucle(1100, scroll, 0.3, W, 300); // les pompes à essence
      rrect(ctx, px - 120, hz - 190, 240, 20, 4, [230, 80, 70], 3); for (const d of [-90, 70]) trait(ctx, [px + d + 10, hz - 170], [px + d + 10, hz], 8, [200, 200, 210]);
      for (const [d, c] of [[-40, [90, 170, 90]], [30, [240, 200, 60]]]) { rrect(ctx, px + d - 22, hz - 100, 44, 100, 8, c, 3); rrect(ctx, px + d - 14, hz - 88, 28, 24, 4, [230, 245, 255], 2); }
    } },
  aquarium: { fr: "Aquarium", en: "Aquarium", interieur: true, ciel: [[25, 45, 85], [25, 45, 85]], sol: [[70, 80, 110], [90, 100, 130]],
    fond(ctx, W, H, hz, scroll, t) {
      rrect(ctx, 0, 0, W, hz + 20, 0, [30, 50, 90]);
      for (let k = 0; k < 3; k++) { const x = boucle(k * 420 + 40, scroll, 0.3, W, 420); // les grands bassins
        rrect(ctx, x, 40, 360, hz - 60, 16, [70, 160, 220], 6, [60, 60, 75]);
        ctx.save(); ctx.beginPath(); ctx.rect(x, 40, 360, hz - 60); ctx.clip();
        for (let j = 0; j < 4; j++) petitPoisson(ctx, x + mod(j * 90 + t * (25 + j * 8) * (j % 2 ? 1 : -1), 400) - 20, 90 + j * 60, [[255, 170, 60], [250, 220, 70], [240, 120, 170], [255, 255, 255]][j], j % 2 ? 1 : -1, 1.1);
        for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x + 40 + j * 90, hz - 20); for (let y = 0; y < 120; y += 20) ctx.lineTo(x + 40 + j * 90 + 8 * Math.sin(t * 2 + y * 0.05 + j), hz - 20 - y); ctx.lineWidth = 6; ctx.strokeStyle = css([60, 160, 90]); ctx.stroke(); }
        for (let j = 0; j < 5; j++) { ctx.globalAlpha = 0.5; rond(ctx, x + 60 + j * 60, hz - 20 - mod(t * 40 + j * 50, hz - 60), 4, [220, 240, 255]); ctx.globalAlpha = 1; }
        ctx.restore(); }
    } },
  marche: { fr: "Marché", en: "Market", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[150, 200, 110], [210, 200, 185]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      const fruits = [[[230, 60, 60], [250, 140, 40], [110, 190, 80]], [[250, 220, 60], [120, 70, 160], [240, 120, 60]], [[250, 120, 160], [255, 220, 90], [255, 255, 255]]];
      for (let k = 0; k < 4; k++) { const x = boucle(k * 290 + 120, scroll, 0.35, W, 300), c = [[230, 80, 80], [90, 170, 90], [90, 140, 220], [240, 160, 60]][k];
        for (const d of [-120, 120]) trait(ctx, [x + d, hz], [x + d, hz - 170], 5, [150, 110, 80]);
        for (let j = 0; j < 6; j++) poly(ctx, [[x - 130 + j * 43, hz - 170], [x - 87 + j * 43, hz - 170], [x - 87 + j * 43, hz - 140], [x - 108 + j * 43, hz - 128], [x - 130 + j * 43, hz - 140]], j % 2 ? [255, 255, 255] : c, 2);
        rrect(ctx, x - 130, hz - 70, 260, 70, 4, [190, 140, 95], 3);
        for (let j = 0; j < 3; j++) { rrect(ctx, x - 120 + j * 82, hz - 92, 76, 26, 4, [210, 165, 110], 2); for (let i = 0; i < 6; i++) rond(ctx, x - 108 + j * 82 + i * 11, hz - 96 - (i % 2) * 6, 7, fruits[k % 3][j], 1.5); } }
    } },
  lac: { fr: "Lac", en: "Lake", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[130, 195, 90], [200, 185, 140]],
    fond(ctx, W, H, hz, scroll, t) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      ovale(ctx, -100, hz - 80, W + 200, 140, [90, 165, 220], 3);
      for (let k = 0; k < 12; k++) { const x = mod(k * 110 + t * 10, W + 100) - 50; trait(ctx, [x, hz - 40 + (k % 3) * 18], [x + 30, hz - 40 + (k % 3) * 18], 2, [200, 230, 250]); }
      for (let k = 0; k < 4; k++) { const x = boucle(k * 300 + 160, scroll, 0.3, W); ovale(ctx, x, hz - 50, 40, 14, [100, 180, 90], 2); rond(ctx, x + 22, hz - 52, 6, [250, 170, 200]); }
      const px = boucle(760, scroll, 0.35, W, 300); rrect(ctx, px - 120, hz - 40, 240, 16, 3, [180, 130, 85], 2); for (const d of [-100, 0, 100]) trait(ctx, [px + d, hz - 24], [px + d, hz + 6], 6, [150, 105, 70]); // le ponton
      for (let k = 0; k < 10; k++) { const x = boucle(k * 120 + 30, scroll, 0.5, W); for (const d of [-6, 0, 6]) { trait(ctx, [x + d, hz + 10], [x + d * 1.5, hz - 50 - (k % 3) * 10], 3, [90, 150, 70]); } ovale(ctx, x - 4, hz - 62 - (k % 3) * 10, 8, 20, [140, 95, 60]); }
    } },
  musee: { fr: "Musée", en: "Museum", interieur: true, ciel: [[238, 232, 220], [238, 232, 220]], sol: [[190, 180, 165], [210, 200, 185]],
    fond(ctx, W, H, hz, scroll, t) {
      murInterieur(ctx, W, hz, [236, 228, 214], scroll);
      pancarte(ctx, boucle(240, scroll, 0.3, W, 300), 50, fr_en("MUSÉE", "MUSEUM"), [150, 120, 90], 26);
      const dx = boucle(560, scroll, 0.3, W, 400), os = [245, 240, 225]; // le squelette de dinosaure
      rrect(ctx, dx - 200, hz - 30, 400, 36, 6, [170, 160, 150], 3);
      ctx.beginPath(); ctx.moveTo(dx - 190, hz - 120); ctx.quadraticCurveTo(dx - 40, hz - 230, dx + 90, hz - 160); ctx.quadraticCurveTo(dx + 130, hz - 230, dx + 170, hz - 290); ctx.lineWidth = 12; ctx.strokeStyle = css(os); ctx.lineCap = "round"; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = css(CONTOUR); ctx.stroke(); ctx.lineCap = "butt";
      for (let k = 0; k < 7; k++) { const x = dx - 100 + k * 26, y = hz - 190 + Math.abs(k - 3) * 6; trait(ctx, [x, y], [x - 6, y + 50], 6, os, "round"); }
      for (const d of [-80, 40]) { trait(ctx, [dx + d, hz - 150], [dx + d - 10, hz - 30], 9, os, "round"); trait(ctx, [dx + d + 20, hz - 150], [dx + d + 30, hz - 30], 9, os, "round"); }
      ovale(ctx, dx + 150, hz - 320, 70, 40, os, 3); rond(ctx, dx + 192, hz - 306, 6, CONTOUR); for (let k = 0; k < 4; k++) poly(ctx, [[dx + 176 + k * 9, hz - 284], [dx + 180 + k * 9, hz - 276], [dx + 184 + k * 9, hz - 284]], [255, 255, 255]);
      for (let k = 0; k < 3; k++) { const x = boucle(k * 260 + 900, scroll, 0.3, W, 300); rrect(ctx, x - 60, hz - 280, 120, 100, 4, [255, 255, 255], 6, [200, 160, 60]); [() => { rond(ctx, x, hz - 230, 24, [255, 200, 60]); }, () => { for (let j = 0; j < 5; j++) rond(ctx, x - 20 + j * 10, hz - 230 + (j % 2) * 14, 9, [[240, 90, 110], [120, 170, 240]][j % 2]); }, () => { poly(ctx, [[x - 50, hz - 190], [x - 10, hz - 260], [x + 30, hz - 190]], [110, 170, 110]); poly(ctx, [[x - 10, hz - 190], [x + 20, hz - 240], [x + 50, hz - 190]], [90, 150, 90]); }][k](); }
      for (let k = 0; k < 6; k++) { const x = boucle(k * 140 + 380, scroll, 0.3, W, 140); trait(ctx, [x, hz], [x, hz - 60], 4, [200, 170, 80]); rond(ctx, x, hz - 62, 6, [220, 190, 90]); if (k < 5) arcRect(ctx, x, hz - 70, 140, 30, PI, 2 * PI, 4, [200, 50, 60]); }
    } },
  nuages: { fr: "Dans les nuages", en: "In the clouds", ciel: [[120, 185, 250], [205, 230, 255]], sol: [[250, 252, 255], [240, 246, 255]],
    fond(ctx, W, H, hz, scroll, t) {
      arcEnCiel(ctx, boucle(700, scroll, 0.1, W, 400), hz + 40, 300);
      for (let k = 0; k < 8; k++) nuage(ctx, boucle(k * 150 + t * 8, scroll, 0.2 + (k % 3) * 0.1, W), 60 + (k * 41) % 260, 1 + (k % 3) * 0.4);
      for (let k = 0; k < 4; k++) { const x = mod(k * 260 + t * 40, W + 100) - 50, y = 120 + k * 30, a = Math.sin(t * 8 + k) * 8; ctx.beginPath(); ctx.moveTo(x - 14, y - a); ctx.quadraticCurveTo(x - 7, y - 8, x, y); ctx.quadraticCurveTo(x + 7, y - 8, x + 14, y - a); ctx.lineWidth = 3; ctx.strokeStyle = css(CONTOUR); ctx.stroke(); }
    },
    devant(ctx, W, H, hz, scroll, t) { for (let k = 0; k < 9; k++) nuage(ctx, mod(k * 130 - scroll * 0.8, W + 160) - 120, hz + 20 + (k % 3) * 22, 1.2); } },
};
for (const [id, L] of Object.entries(LIEUX_MONDE)) {
  DECORS_EXTRA[id] = L; CIELS[id] = L.ciel; SOLS[id] = L.sol;
  TEXTES.fr.lieux[id] = L.fr; TEXTES.en.lieux[id] = L.en; ALIAS_DECOR[id] = id; LIEUX_ECRITURE.push(id);
  if (L.interieur) INTERIEURS.add(id);
}
Object.assign(ALIAS_DECOR, { chambre: "chambre", salon: "salon", tele: "salon", cuisine: "cuisine", "salle de bain": "salledebain", classe: "classe", creche: "classe", bibliotheque: "bibliotheque",
  boulangerie: "boulangerie", restaurant: "restaurant", cinema: "cinema", cirque: "cirque", manege: "fetforaine", "fete foraine": "fetforaine", chateau: "chateau", jungle: "jungle", desert: "desert",
  banquise: "banquise", igloo: "banquise", "sous la mer": "sousmarin", camping: "camping", caserne: "caserne", garage: "garage", aquarium: "aquarium", marche: "marche", lac: "lac", musee: "musee", nuages: "nuages", ciel: "nuages" });
// pour les reconnaître dans le texte (avant les lieux plus généraux : « la chambre » n'est plus juste « la maison »)
MOTS_DECORS_EXTRA.unshift(
  ["\\bchambre|\\b(son|mon|ton|le|au|du|dans le|sur le) lit\\b|\\bbedroom", "chambre"],
  ["\\bsalon\\b|canape|devant la tele|\\btele(vision)?\\b|\\btv\\b|dessins? animes?|living room|\\bsofa\\b|\\bcouch\\b|watch(es|ing)? tv|television", "salon"],
  ["salle de bains?|baignoire|\\blavabo|bathroom|bathtub", "salledebain"],
  ["\\bcuisine\\b|\\bfrigo\\b|refrigerateur|\\bkitchen|\\bfridge", "cuisine"],
  ["\\bclasse\\b|maitresse|\\binstit|tableau noir|\\bcreche|maternelle|garderie|\\bnounou|classroom|\\bteacher|nursery|kindergarten|preschool", "classe"],
  ["bibliotheque|mediatheque|\\blibrary", "bibliotheque"],
  ["boulangerie|boulang(er|ere)|\\bbaguettes? de pain|croissants?|pains? au chocolat|\\bbakery|\\bbaker", "boulangerie"],
  ["restaurant|\\bresto\\b|pizzeria|creperie|restaurant|\\bdiner\\b au", "restaurant"],
  ["cinema|\\bcine\\b|\\bfilm\\b|\\bmovies?\\b|cinema", "cinema"],
  ["\\bcirque|\\bclowns?|acrobates?|jongl|\\bcircus", "cirque"],
  ["fete foraine|manege|grande roue|auto-?tamponneuses?|barbe a papa|carousel|ferris wheel|funfair|\\bfair\\b", "fetforaine"],
  ["chateau fort|\\bchateau\\b(?! de sable)|chevaliers?|princesses?|\\bprinces?\\b|\\broi\\b|\\breine\\b|\\bcastle|\\bknights?|\\bkings?\\b|\\bqueens?\\b", "chateau"],
  ["jungle|foret tropicale|\\blianes?|rainforest", "jungle"],
  ["\\bdesert|\\bdunes?\\b|chameaux?|dromadaires?|pyramides?|\\bcactus|\\bcamels?", "desert"],
  ["banquise|pole nord|pole sud|\\bigloo|ours blancs?|antarctique|arctique|north pole|south pole|iceberg", "banquise"],
  ["sous la mer|sous l'eau|fond de la mer|fond de l'ocean|sous-marin|\\bplong|recif|\\bcorail|under the sea|underwater|ocean floor|\\bcoral|\\bscuba", "sousmarin"],
  ["camping|\\btentes?\\b|feux? de camp|campfire|\\btents?\\b|\\bcamping", "camping"],
  ["caserne|fire station", "caserne"],
  ["\\bgarage\\b|garagiste|station[- ]service|pompe a essence|gas station|mechanic", "garage"],
  ["aquarium", "aquarium"],
  ["\\bau marche\\b|\\ble marche\\b|\\bmarchands?\\b|\\bmarket", "marche"],
  ["\\blac\\b|\\betang|\\blake\\b|\\bpond\\b", "lac"],
  ["\\bmusee|museum|squelette", "musee"],
  ["dans les nuages|dans le ciel|au-dessus des nuages|sur un nuage|in the sky|above the clouds|on a cloud", "nuages"],
);
// les activités de la maison ont maintenant leur vraie pièce
for (const [act, lieu] of Object.entries({ cubes: "chambre", puzzle: "chambre", ranger: "chambre", livre: "chambre", danse: "salon", musique: "salon", gateau: "salon", sapin: "salon", bain: "salledebain", dents: "salledebain", cuisine: "cuisine", peinture: "classe" }))
  if (ACTIVITES[act]) ACTIVITES[act].decor = lieu;

// ================================================================= 2. les objets de tous les jours
// [largeur, hauteur, dessin (le sol est en y = 0), taille dans les scènes]
const CHOSES = {
  tele: [180, 170, (ctx, t) => { rrect(ctx, -90, -50, 180, 50, 6, [170, 120, 85], 3); rrect(ctx, -80, -160, 160, 104, 10, [45, 45, 55], 3); ecranAnime(ctx, -70, -150, 140, 84, t); }, 0.8],
  canape: [280, 130, (ctx) => { rrect(ctx, -130, -120, 260, 70, 26, [230, 110, 90], 3); rrect(ctx, -140, -60, 280, 50, 16, [230, 110, 90], 3); for (const d of [-160, 124]) rrect(ctx, d, -92, 36, 82, 16, [215, 95, 80], 3); }, 0.7],
  lit: [300, 120, (ctx) => { rrect(ctx, -150, -120, 24, 120, 8, [180, 120, 80], 3); rrect(ctx, -126, -62, 270, 34, 12, [255, 255, 255], 3); ovale(ctx, -122, -86, 70, 30, [255, 255, 255], 3); rrect(ctx, -40, -66, 180, 44, 14, [120, 170, 240], 3); }, 0.7],
  table: [200, 100, (ctx) => { rrect(ctx, -100, -90, 200, 16, 4, [190, 140, 95], 3); for (const d of [-86, 76]) rrect(ctx, d, -74, 10, 74, 3, [170, 120, 80], 2); }, 0.8],
  chaise: [70, 110, (ctx) => { rrect(ctx, -30, -110, 12, 110, 4, [170, 120, 80], 2); rrect(ctx, -30, -52, 60, 12, 4, [190, 140, 95], 2); rrect(ctx, 18, -40, 10, 40, 3, [170, 120, 80], 2); }, 0.8],
  frigo: [110, 250, (ctx) => { rrect(ctx, -55, -250, 110, 250, 14, [250, 252, 255], 3); trait(ctx, [-55, -170], [55, -170], 3, [200, 205, 215]); rrect(ctx, 34, -230, 8, 40, 4, [190, 195, 205]); coeur(ctx, -16, -210, 8, [240, 90, 110]); }, 0.75],
  lampe: [80, 180, (ctx) => { trait(ctx, [0, 0], [0, -150], 5, [120, 110, 100]); rrect(ctx, -30, -6, 60, 8, 4, [120, 110, 100]); poly(ctx, [[-38, -150], [38, -150], [24, -190], [-24, -190]], [255, 220, 120], 3); }, 0.8],
  plante: [80, 120, (ctx, t) => { rrect(ctx, -26, -44, 52, 44, 6, [210, 120, 80], 3); for (const [dx, dy, a] of [[-16, -84, -0.4], [0, -100, 0], [16, -84, 0.4]]) { ctx.save(); ctx.translate(dx, -44); ctx.rotate(a + 0.05 * Math.sin(t * 2)); ovale(ctx, -11, dy + 44, 22, 46, [80, 170, 90], 2); ctx.restore(); } }, 0.85],
  horloge: [80, 90, (ctx, t) => { rond(ctx, 0, -44, 36, [255, 255, 255], 4); trait(ctx, [0, -44], [16 * Math.cos(t * 0.5 - PI / 2), -44 + 16 * Math.sin(t * 0.5 - PI / 2)], 4, CONTOUR, "round"); trait(ctx, [0, -44], [24 * Math.cos(t * 3 - PI / 2), -44 + 24 * Math.sin(t * 3 - PI / 2)], 2, [220, 70, 70], "round"); }, 0.85],
  jouets: [140, 110, (ctx) => { rrect(ctx, -70, -60, 140, 60, 8, [90, 160, 230], 3); rond(ctx, -30, -70, 16, [240, 90, 90], 2); rrect(ctx, 0, -92, 30, 30, 4, [250, 200, 60], 2); rond(ctx, 45, -76, 12, [170, 120, 80], 2); etoile(ctx, -2, -30, 14, [255, 230, 120]); }, 0.85],
  petiteVoiture: [90, 50, (ctx) => { rrect(ctx, -40, -34, 80, 22, 8, [230, 70, 70], 2); rrect(ctx, -20, -50, 40, 20, 6, [230, 70, 70], 2); rrect(ctx, -14, -46, 28, 12, 3, VITRE); for (const d of [-24, 24]) { rond(ctx, d, -12, 11, PNEU, 2); rond(ctx, d, -12, 4, JANTE); } }, 0.9],
  voiture: [200, 100, (ctx) => { rrect(ctx, -95, -64, 190, 44, 16, [80, 140, 220], 3); poly(ctx, [[-50, -64], [-30, -100], [40, -100], [64, -64]], [80, 140, 220], 3); poly(ctx, [[-38, -66], [-24, -92], [6, -92], [6, -66]], VITRE, 2); poly(ctx, [[14, -66], [14, -92], [36, -92], [52, -66]], VITRE, 2); for (const d of [-55, 55]) { rond(ctx, d, -20, 20, PNEU, 3); rond(ctx, d, -20, 8, JANTE); } rond(ctx, 88, -50, 6, [255, 230, 120]); }, 0.75],
  poupee: [60, 110, (ctx) => { poly(ctx, [[-24, -10], [24, -10], [14, -60], [-14, -60]], [240, 120, 180], 2); rond(ctx, 0, -76, 18, [250, 214, 180], 2); ovale(ctx, -20, -98, 40, 24, [230, 180, 90], 2); rond(ctx, -6, -76, 2.5, CONTOUR); rond(ctx, 6, -76, 2.5, CONTOUR); for (const d of [-10, 10]) trait(ctx, [d, -10], [d, 0], 4, [250, 214, 180]); }, 0.9],
  nounours: [80, 100, (ctx) => { const c = [190, 135, 85]; ovale(ctx, -28, -60, 56, 60, c, 3); ovale(ctx, -14, -46, 28, 32, clair(c, 0.4)); for (const d of [-18, 18]) rond(ctx, d, -94, 9, c, 2); rond(ctx, 0, -78, 22, c, 3); ovale(ctx, -9, -78, 18, 14, clair(c, 0.4)); rond(ctx, 0, -74, 3, CONTOUR); rond(ctx, -8, -84, 2.5, CONTOUR); rond(ctx, 8, -84, 2.5, CONTOUR); }, 0.9],
  robot: [80, 130, (ctx, t) => { rrect(ctx, -30, -80, 60, 70, 8, [170, 180, 200], 3); rrect(ctx, -24, -126, 48, 40, 8, [190, 200, 220], 3); for (const d of [-10, 10]) rond(ctx, d, -108, 6, Math.sin(t * 4) > 0 ? [90, 200, 255] : [255, 255, 255], 2); trait(ctx, [0, -126], [0, -140], 3, CONTOUR); rond(ctx, 0, -142, 5, [240, 80, 80], 2); for (const d of [-16, 16]) trait(ctx, [d, -10], [d, 0], 8, [140, 150, 170]); rrect(ctx, -14, -60, 28, 18, 4, [250, 200, 60], 2); }, 0.9],
  ballons: [120, 230, (ctx, t) => { [[-30, -200, [240, 80, 90]], [10, -220, [90, 160, 240]], [40, -190, [250, 200, 60]]].forEach(([x, y, c], k) => { const dx = 6 * Math.sin(t * 1.5 + k); trait(ctx, [0, 0], [x + dx, y + 30], 1.5, [120, 120, 130]); ovale(ctx, x + dx - 22, y - 28, 44, 56, c, 2); }); }, 0.85],
  pomme: [40, 44, (ctx) => { rond(ctx, 0, -20, 18, [225, 50, 50], 2); trait(ctx, [0, -36], [3, -46], 3, [120, 80, 50]); ovale(ctx, 4, -48, 16, 8, [90, 170, 80]); }, 1],
  banane: [60, 30, (ctx) => { ctx.beginPath(); ctx.arc(0, -40, 30, 0.2 * PI, 0.8 * PI); ctx.lineWidth = 12; ctx.strokeStyle = css([250, 215, 60]); ctx.lineCap = "round"; ctx.stroke(); ctx.lineCap = "butt"; }, 1],
  fraise: [40, 40, (ctx) => { poly(ctx, [[-16, -34], [16, -34], [0, -2]], [230, 50, 70], 2); for (const [x, y] of [[-6, -26], [6, -26], [0, -16]]) rond(ctx, x, y, 1.5, [255, 230, 120]); poly(ctx, [[-12, -36], [0, -44], [12, -36], [0, -32]], [90, 170, 80]); }, 1],
  carotte: [30, 70, (ctx) => { poly(ctx, [[-10, -50], [10, -50], [0, 0]], [250, 140, 40], 2); for (const d of [-6, 0, 6]) trait(ctx, [d * 0.5, -50], [d, -66], 3, [90, 170, 80]); }, 1],
  pizza: [100, 30, (ctx) => { ovale(ctx, -50, -16, 100, 16, [255, 255, 255], 2); ovale(ctx, -42, -22, 84, 14, [240, 200, 110], 2); ovale(ctx, -36, -20, 72, 10, [230, 80, 60]); for (const d of [-20, 0, 20]) rond(ctx, d, -16, 4, [200, 50, 50]); }, 1],
  biscuits: [80, 30, (ctx) => { ovale(ctx, -40, -12, 80, 12, [255, 255, 255], 2); for (const d of [-20, 0, 20]) { rond(ctx, d, -18, 12, [215, 160, 90], 2); rond(ctx, d - 3, -20, 2, [100, 60, 40]); rond(ctx, d + 4, -15, 2, [100, 60, 40]); } }, 1],
  bonbons: [60, 90, (ctx) => { rrect(ctx, -26, -70, 52, 70, 12, [220, 240, 255], 3); for (let k = 0; k < 9; k++) rond(ctx, -14 + (k % 3) * 14, -16 - Math.floor(k / 3) * 16, 6, [[240, 90, 110], [250, 200, 60], [90, 170, 240]][k % 3]); rrect(ctx, -20, -80, 40, 12, 4, [240, 120, 180], 2); }, 0.9],
  sucette: [40, 90, (ctx) => { trait(ctx, [0, 0], [0, -56], 4, [255, 255, 255]); rond(ctx, 0, -72, 18, [250, 120, 180], 2); ctx.beginPath(); ctx.arc(0, -72, 10, 0, 1.6 * PI); ctx.lineWidth = 4; ctx.strokeStyle = "#fff"; ctx.stroke(); }, 1],
  parapluie: [120, 140, (ctx) => { ctx.beginPath(); ctx.arc(0, -100, 60, PI, 2 * PI); ctx.closePath(); ctx.fillStyle = css([230, 70, 90]); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = css(fonce([230, 70, 90], 0.5)); ctx.stroke(); trait(ctx, [0, -160], [0, -10], 4, [90, 80, 80]); ctx.beginPath(); ctx.arc(-8, -10, 8, 0, PI); ctx.stroke(); }, 0.85],
  telephone: [40, 70, (ctx) => { rrect(ctx, -18, -64, 36, 64, 7, [50, 50, 60], 2); rrect(ctx, -14, -58, 28, 48, 3, [130, 200, 250]); rond(ctx, 0, -6, 2.5, [200, 200, 210]); }, 1],
  tablette: [110, 80, (ctx, t) => { rrect(ctx, -55, -76, 110, 76, 8, [50, 50, 60], 2); ecranAnime(ctx, -47, -68, 94, 60, t); }, 0.9],
  guitare: [60, 150, (ctx) => { rrect(ctx, -6, -150, 12, 90, 3, [120, 80, 50], 2); ovale(ctx, -28, -80, 56, 46, [220, 140, 60], 3); ovale(ctx, -34, -50, 68, 50, [220, 140, 60], 3); rond(ctx, 0, -50, 9, [80, 50, 30]); for (const d of [-3, 0, 3]) trait(ctx, [d, -150], [d, -36], 1, [240, 240, 240]); }, 0.85],
  tambour: [90, 80, (ctx) => { rrect(ctx, -40, -60, 80, 56, 6, [230, 70, 70], 3); ovale(ctx, -40, -70, 80, 20, [250, 245, 235], 3); for (let k = 0; k < 4; k++) trait(ctx, [-36 + k * 24, -56], [-24 + k * 24, -8], 2, [255, 220, 90]); trait(ctx, [20, -70], [44, -100], 3, [190, 140, 90]); rond(ctx, 46, -102, 5, [240, 220, 200]); }, 0.9],
  piano: [190, 150, (ctx) => { rrect(ctx, -95, -150, 190, 110, 8, [60, 50, 55], 3); rrect(ctx, -85, -60, 170, 24, 3, [255, 255, 255], 2); for (let k = 1; k < 10; k++) trait(ctx, [-85 + k * 17, -60], [-85 + k * 17, -36], 1.5, [150, 150, 160]); for (const k of [1, 2, 4, 5, 6, 8, 9]) rrect(ctx, -90 + k * 17, -60, 9, 14, 1, [30, 30, 35]); for (const d of [-86, 76]) rrect(ctx, d, -36, 10, 36, 2, [60, 50, 55]); }, 0.75],
  trottinette: [110, 110, (ctx) => { rrect(ctx, -50, -18, 90, 10, 4, [90, 170, 240], 2); trait(ctx, [36, -16], [44, -100], 5, [150, 150, 165]); trait(ctx, [30, -100], [58, -100], 6, [60, 60, 70], "round"); for (const d of [-44, 40]) { rond(ctx, d, -9, 9, PNEU, 2); rond(ctx, d, -9, 3, JANTE); } }, 0.9],
  seau: [110, 70, (ctx) => { poly(ctx, [[-40, -56], [0, -56], [-6, 0], [-34, 0]], [250, 200, 60], 3); ctx.beginPath(); ctx.arc(-20, -56, 20, PI, 2 * PI); ctx.lineWidth = 3; ctx.strokeStyle = css(CONTOUR); ctx.stroke(); trait(ctx, [20, -4], [46, -60], 4, [90, 170, 240]); ovale(ctx, 8, -12, 26, 18, [90, 170, 240], 2); }, 1],
  bouee: [90, 90, (ctx) => { rond(ctx, 0, -44, 40, [240, 90, 110], 3); rond(ctx, 0, -44, 18, [200, 230, 250], 2); for (let k = 0; k < 4; k++) { const a = k * PI / 2 + PI / 4; trait(ctx, [22 * Math.cos(a), -44 + 22 * Math.sin(a)], [38 * Math.cos(a), -44 + 38 * Math.sin(a)], 8, [255, 255, 255]); } }, 0.9],
  bocal: [80, 90, (ctx, t) => { ovale(ctx, -40, -84, 80, 84, [200, 235, 255], 3); rrect(ctx, -26, -88, 52, 8, 3, [180, 220, 240], 2); petitPoisson(ctx, 8 * Math.sin(t), -44, [255, 150, 50], Math.cos(t) > 0 ? 1 : -1, 0.8); ovale(ctx, -30, -14, 60, 10, [230, 210, 160]); }, 0.95],
  tente: [220, 140, (ctx) => { poly(ctx, [[-110, 0], [0, -130], [110, 0]], [240, 120, 70], 3); poly(ctx, [[-30, 0], [0, -80], [30, 0]], [150, 70, 40]); trait(ctx, [0, -130], [0, -150], 3, CONTOUR); }, 0.7],
  feuDeCamp: [110, 90, (ctx, t) => { for (const a of [-0.4, 0.4]) { ctx.save(); ctx.translate(0, -6); ctx.rotate(a); rrect(ctx, -42, -6, 84, 12, 6, [140, 90, 60], 2); ctx.restore(); } for (const [c, h, d] of [[[240, 90, 40], 70, 0], [[255, 170, 50], 50, 0.5], [[255, 230, 120], 28, 1]]) poly(ctx, [[-h * 0.42, -8], [6 * Math.sin(t * 9 + d), -8 - h - 6 * Math.sin(t * 7 + d)], [h * 0.42, -8]], c); }, 0.9],
  luge: [140, 60, (ctx) => { rrect(ctx, -60, -40, 120, 14, 5, [200, 70, 60], 2); for (const d of [-40, 0, 40]) trait(ctx, [d, -26], [d, -8], 4, [150, 150, 160]); ctx.beginPath(); ctx.moveTo(-64, -6); ctx.lineTo(56, -6); ctx.quadraticCurveTo(76, -6, 72, -26); ctx.lineWidth = 5; ctx.strokeStyle = css([150, 150, 160]); ctx.stroke(); }, 0.9],
  tresor: [130, 100, (ctx, t) => { rrect(ctx, -60, -60, 120, 60, 6, [170, 110, 60], 3); ctx.beginPath(); ctx.moveTo(-60, -60); ctx.quadraticCurveTo(0, -110, 60, -60); ctx.closePath(); ctx.fillStyle = css([190, 125, 70]); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = css([110, 70, 40]); ctx.stroke(); for (const d of [-40, 40]) rrect(ctx, d - 6, -84, 12, 84, 2, [240, 200, 60], 2); rrect(ctx, -10, -66, 20, 22, 4, [240, 200, 60], 2); for (let k = 0; k < 3; k++) etoile(ctx, -30 + k * 30, -110 - 6 * Math.sin(t * 3 + k), 7, [255, 240, 150], t); }, 0.85],
  baguetteMagique: [50, 110, (ctx, t) => { trait(ctx, [0, 0], [16, -80], 4, [80, 60, 90], "round"); etoile(ctx, 18, -92, 16, [255, 215, 60], t); for (let k = 0; k < 3; k++) rond(ctx, 18 + 24 * Math.cos(t * 2 + k * 2), -92 + 24 * Math.sin(t * 2 + k * 2), 3, [255, 250, 200]); }, 1],
  montgolfiere: [180, 300, (ctx, t) => { const y = -6 * Math.sin(t); ovale(ctx, -80, -300 + y, 160, 190, [240, 90, 90], 3); for (const [d, c] of [[-40, [255, 210, 60]], [0, [90, 170, 240]], [40, [255, 210, 60]]]) ovale(ctx, d - 14, -300 + y, 28, 190, c, 1.5); for (const d of [-30, 30]) trait(ctx, [d, -118 + y], [d * 0.6, -60 + y], 2, [120, 90, 70]); rrect(ctx, -26, -64 + y, 52, 40, 6, [180, 125, 75], 3); }, 0.7],
  poussette: [140, 140, (ctx) => { ctx.beginPath(); ctx.arc(-6, -70, 50, PI, 1.75 * PI); ctx.lineTo(-6, -70); ctx.closePath(); ctx.fillStyle = css([120, 170, 240]); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = css(fonce([120, 170, 240], 0.5)); ctx.stroke(); rrect(ctx, -56, -72, 100, 30, 12, [120, 170, 240], 3); trait(ctx, [44, -70], [66, -120], 4, [100, 100, 110]); for (const d of [-40, 30]) { rond(ctx, d, -16, 16, PNEU, 2); rond(ctx, d, -16, 6, JANTE); } }, 0.85],
  banc: [170, 70, (ctx) => { rrect(ctx, -80, -36, 160, 9, 3, [180, 120, 70], 2); rrect(ctx, -80, -60, 160, 9, 3, [180, 120, 70], 2); for (const d of [-70, 64]) trait(ctx, [d, -28], [d, 0], 5, [90, 90, 100]); }, 0.85],
  cartable: [80, 90, (ctx) => { rrect(ctx, -36, -80, 72, 80, 14, [90, 160, 230], 3); rrect(ctx, -36, -80, 72, 36, 14, [70, 130, 200], 3); rrect(ctx, -8, -50, 16, 10, 3, [250, 200, 60], 2); }, 0.95],
  fleurs: [70, 40, (ctx) => { for (const [dx, c] of [[-20, [255, 90, 120]], [0, [255, 220, 60]], [20, [180, 120, 255]]]) { trait(ctx, [dx, 0], [dx, -26], 3, [60, 140, 60]); rond(ctx, dx, -28, 9, c); } }, 1],
};
const MOTS_CHOSES = [ // id, motif (sans accents) ; le premier trouvé gagne pour un même mot
  ["tele", "\\btele(vision)?s?\\b|\\btv\\b|dessins? animes?|television|cartoons?"], ["canape", "canapes?|\\bsofas?\\b|\\bcouch"], ["lit", "\\b(son|mon|ton|le|un|au|du|dans le|sur le) lit\\b|\\bbeds?\\b"],
  ["table", "\\btables?\\b"], ["chaise", "chaises?|\\bchairs?\\b"], ["frigo", "\\bfrigos?\\b|refrigerateur|\\bfridge"], ["lampe", "\\blampes?\\b|\\blamps?\\b"],
  ["plante", "\\bplantes?\\b(?! des| un| une| les| la| le)|pots? de fleurs?|\\bplants?\\b"], ["horloge", "horloges?|pendules?|\\breveils?\\b|\\bclocks?\\b"],
  ["petiteVoiture", "petites? voitures?|voitures? miniatures?|toy cars?"], ["voiture", "\\bvoitures?\\b|\\bautos?\\b|\\bcars?\\b"],
  ["jouets", "\\bjouets?\\b|coffre a jouets|\\btoys?\\b"], ["poupee", "poupees?|\\bdolls?\\b"], ["nounours", "nounours|peluches?|ours en peluche|teddy"],
  ["robot", "\\brobots?\\b"], ["ballons", "ballons? de baudruche|ballons? gonflables?|\\bballoons?\\b"],
  ["pomme", "\\bpommes?\\b(?! de terre)|\\bapples?\\b"], ["banane", "bananes?|bananas?"], ["fraise", "\\bfraises?\\b|strawberr(y|ies)"], ["carotte", "carottes?|carrots?"],
  ["pizza", "\\bpizzas?\\b"], ["biscuits", "biscuits?|gateaux secs?|\\bcookies?\\b|madeleines?"], ["sucette", "sucettes?|lollipops?"], ["bonbons", "bonbons?|\\bcandy|candies|\\bsweets\\b"],
  ["parapluie", "parapluies?|umbrellas?"], ["telephone", "telephones?|\\bportables?\\b|\\bphones?\\b"], ["tablette", "\\btablettes?\\b|ordinateurs?|computers?|\\btablets?\\b"],
  ["guitare", "guitares?|guitars?"], ["tambour", "tambours?|\\bbatterie\\b|\\bdrums?\\b"], ["piano", "\\bpianos?\\b"], ["trottinette", "trottinettes?|\\bscooters?\\b"],
  ["seau", "\\bseaux?\\b|\\bbuckets?\\b|\\bspades?\\b"], ["bouee", "\\bbouees?\\b|rubber ring"], ["bocal", "poissons? rouges?|\\bbocal|goldfish"],
  ["tente", "\\btentes?\\b|\\btents?\\b"], ["feuDeCamp", "feux? de camp|campfire|guimauves?|marshmallows?"], ["luge", "\\bluges?\\b|\\bsleds?\\b|sledges?"],
  ["tresor", "tresors?|treasure"], ["baguetteMagique", "baguettes? magiques?|magic wands?"], ["montgolfiere", "montgolfieres?|hot air balloons?"],
  ["poussette", "poussettes?|strollers?|\\bprams?\\b"], ["banc", "\\bbancs?\\b|\\bbench(es)?\\b"], ["cartable", "cartables?|sacs? a dos|backpacks?|schoolbags?"],
  ["fleurs", "\\bfleurs?\\b|bouquets?|flowers?"],
];
const CHOSES_DU_DECOR = { salon: ["tele", "canape", "lampe"], chambre: ["lit"], cuisine: ["frigo"], camping: ["tente", "feuDeCamp"], classe: ["horloge"], marche: ["pomme", "banane", "carotte", "fraise"] };
for (const [id, [w, h, dessin]] of Object.entries(CHOSES)) OBJETS_DECOR[id] = [w, h, dessin];
function chosesCitees(texte, decor) { // les objets dont parle une phrase (4 au plus), sauf ceux déjà dessinés dans le décor
  const n = sansAccent(texte), deja = CHOSES_DU_DECOR[decor] || [], out = [];
  for (const [id, motif] of MOTS_CHOSES) if (!deja.includes(id) && !out.includes(id) && new RegExp(motif).test(n)) {
    if (id === "voiture" && out.includes("petiteVoiture")) continue;
    out.push(id);
  }
  return out.slice(0, 4);
}
// dans la scène : posés au fond, de part et d'autre, derrière les personnages
const PLACES_CHOSES = [120, 860, 270, 700, 520];
function elementsDesChoses(choses) {
  return (choses || []).filter((id) => CHOSES[id]).slice(0, 5).map((id, k) => ({ type: "objet", id, x: PLACES_CHOSES[k], y: G - 30, s: CHOSES[id][3] || 0.85, f: k % 2 ? -1 : 1, chose: true }));
}

// ================================================================= 3. encore plus d'animaux
const ANIMAUX_MONDE = {
  poisson(ctx, x, g, s, t, f) {
    const col = [250, 150, 60], pen = new Pen(ctx, x, g, s, f), y = -60 + 5 * Math.sin(t * 2), q = 6 * Math.sin(t * 6);
    pen.poly(fonce(col, 0.85), [[-30, y], [-56, y - 18 + q], [-56, y + 18 + q]]);
    pen.ellipse(col, -38, y - 22, 34, y + 20);
    pen.poly(fonce(col, 0.85), [[-8, y - 20], [8, y - 34], [16, y - 18]]);
    for (const d of [-14, -2]) pen.arc([255, 255, 255], d - 4, y - 16, d + 4, y + 16, -0.5 * PI, 0.5 * PI, 3);
    oeilA(pen, 16, y - 6, 4.5); sourireA(pen, 24, y + 7, 10);
    pen.circle([210, 235, 255], 44, y - 16 - mod(t * 20, 24), 4, true);
  },
  tortue(ctx, x, g, s, t, f, marche) {
    const col = [90, 160, 80], peau = [160, 205, 110], pen = new Pen(ctx, x, g, s, f);
    pattes4(pen, peau, [-26, -12, 12, 26], -14, -2, 9, marche * 0.5);
    const hx = 44, hy = -26 + 3 * Math.sin(t * 2);
    pen.bras(peau, [24, -20], [hx, hy], 14); pen.circle(peau, hx, hy, 14, true);
    oeilA(pen, hx + 4, hy - 4, 3.5); sourireA(pen, hx + 7, hy + 5, 8);
    pen.ellipse(col, -42, -60, 40, -6); pen.rect(fonce(col, 0.8), -44, -16, 42, -6, 5);
    for (const [dx, dy] of [[-20, -40], [0, -48], [20, -40], [-8, -26], [12, -26]]) pen.circle(fonce(col, 0.82), dx, dy, 7);
  },
  papillon(ctx, x, g, s, t, f) {
    const pen = new Pen(ctx, x, g, s, f), y = -110 + 10 * Math.sin(t * 2), ouv = 0.35 + 0.65 * Math.abs(Math.cos(t * 9));
    const c1 = [240, 120, 180], c2 = [120, 180, 250];
    pen.ellipse(c1, -40 * ouv, y - 40, -2, y - 2); pen.ellipse(c1, 2, y - 40, 40 * ouv, y - 2);
    pen.ellipse(c2, -28 * ouv, y - 6, -2, y + 22); pen.ellipse(c2, 2, y - 6, 28 * ouv, y + 22);
    for (const sx of [-1, 1]) pen.circle([255, 240, 150], sx * 20 * ouv, y - 22, 5 * ouv + 1);
    pen.ellipse([80, 60, 90], -4, y - 26, 4, y + 24);
    pen.line([80, 60, 90], [0, y - 26], [-8, y - 42], 2); pen.line([80, 60, 90], [0, y - 26], [8, y - 42], 2);
    pen.circle([80, 60, 90], -8, y - 43, 3); pen.circle([80, 60, 90], 8, y - 43, 3);
  },
  oiseau(ctx, x, g, s, t, f, marche) {
    const col = [90, 160, 230], pen = new Pen(ctx, x, g, s, f), h = Math.abs(Math.sin(marche * 0.7)) * 6;
    for (const d of [-5, 6]) pen.line([230, 150, 50], [d, -12 - h], [d + 2, -1], 2.5);
    pen.poly(fonce(col, 0.8), [[-18, -32 - h], [-40, -44 - h], [-38, -24 - h]]);
    pen.circle(col, 0, -32 - h, 20, true); pen.ellipse(clair(col, 0.6), -4, -32 - h, 17, -14 - h, false);
    pen.ellipse(fonce(col, 0.85), -16, -40 - h + 3 * Math.sin(t * 14), 4, -24 - h);
    oeilA(pen, 9, -40 - h, 3.5); pen.poly([250, 180, 50], [[18, -36 - h], [31, -32 - h], [18, -27 - h]]);
  },
  escargot(ctx, x, g, s, t, f) {
    const col = [205, 145, 90], corps = [215, 205, 150], pen = new Pen(ctx, x, g, s, f);
    pen.ellipse(corps, -42, -14, 40, 0); pen.bras(corps, [26, -8], [36, -28], 12);
    for (const [a, b] of [[[32, -32], [30, -48]], [[40, -32], [46, -46]]]) { pen.line(fonce(corps, 0.7), a, b, 2); oeilA(pen, b[0], b[1] - 2, 3); }
    sourireA(pen, 40, -20, 8);
    pen.circle(col, -8, -32, 26, true); pen.circle(fonce(col, 0.85), -6, -32, 17); pen.circle(col, -4, -32, 10); pen.circle(fonce(col, 0.85), -2, -32, 4);
  },
  grenouille(ctx, x, g, s, t, f, marche) {
    const col = [100, 190, 80], pen = new Pen(ctx, x, g, s, f), j = Math.max(0, Math.sin(marche * 0.5)) * 10;
    pen.ellipse(fonce(col, 0.85), -36, -26 - j, -4, -2 - j); pen.ellipse(fonce(col, 0.85), 4, -16 - j, 26, -2 - j);
    pen.ellipse(col, -30, -50 - j, 30, -6 - j); pen.ellipse(clair(col, 0.5), -12, -36 - j, 22, -8 - j, false);
    for (const d of [-4, 18]) { pen.circle(col, d, -50 - j, 11, true); oeilA(pen, d + 1, -51 - j, 4.5); }
    pen.arc(CONTOUR, -2, -46 - j, 30, -28 - j, 1.1 * PI, 1.9 * PI, 2.5); joueA(pen, 22, -30 - j, 4);
  },
  souris(ctx, x, g, s, t, f) {
    const col = [180, 180, 190], pen = new Pen(ctx, x, g, s, f);
    pen.bras(col, [-26, -12], [-50, -20 + 4 * Math.sin(t * 4)], 2.5); pen.bras(col, [-50, -20 + 4 * Math.sin(t * 4)], [-60, -36], 2);
    pen.ellipse(col, -30, -38, 22, -2);
    const hx = 22, hy = -24;
    pen.circle(col, hx - 8, hy - 16, 11, true); pen.circle([255, 180, 190], hx - 8, hy - 16, 6);
    pen.circle(col, hx, hy, 15, true); pen.circle([255, 130, 150], hx + 15, hy + 3, 3.5);
    oeilA(pen, hx + 4, hy - 4, 3.5); for (const d of [-3, 3]) pen.line(CONTOUR, [hx + 12, hy + 4], [hx + 26, hy + 4 + d * 1.5], 1);
  },
  renard(ctx, x, g, s, t, f, marche, mange) {
    const col = [235, 120, 50], blanc = [255, 250, 245], pen = new Pen(ctx, x, g, s, f), q = 6 * Math.sin(t * 3);
    pen.bras(col, [-40, -44], [-72, -60 + q], 15); pen.circle(blanc, -76, -62 + q, 9, true);
    pattes4(pen, [80, 50, 40], [-28, -14, 14, 28], -28, -3, 8, marche);
    pen.ellipse(col, -44, -58, 38, -22); pen.ellipse(blanc, 12, -52, 36, -26, false);
    const hx = 42, hy = -62 + 8 * mange;
    pen.poly(col, [[hx - 16, hy - 12], [hx - 10, hy - 38], [hx, hy - 16]]); pen.poly(col, [[hx + 2, hy - 16], [hx + 12, hy - 38], [hx + 16, hy - 12]]);
    pen.circle(col, hx, hy, 20, true); pen.poly(col, [[hx + 10, hy - 6], [hx + 38, hy + 6], [hx + 8, hy + 14]]);
    pen.ellipse(blanc, hx - 4, hy + 2, hx + 22, hy + 18, false); pen.circle(CONTOUR, hx + 37, hy + 5, 4);
    oeilA(pen, hx + 6, hy - 6, 4);
  },
  hibou(ctx, x, g, s, t) {
    const col = [150, 110, 80], pen = new Pen(ctx, x, g, s, 1), cligne = mod(t, 3.3) < 0.15;
    for (const d of [-10, 10]) pen.ellipse([250, 160, 50], d - 7, -6, d + 7, 0);
    pen.ellipse(col, -28, -86, 28, -4); pen.ellipse(clair(col, 0.5), -18, -54, 18, -10, false);
    for (const sx of [-1, 1]) { pen.poly(col, [[sx * 26, -78], [sx * 30, -100], [sx * 12, -84]]); pen.ellipse(fonce(col, 0.85), sx > 0 ? 18 : -34, -62, sx > 0 ? 34 : -18, -18); }
    pen.ellipse(clair(col, 0.65), -26, -80, 26, -46, false);
    for (const d of [-11, 11]) { if (cligne) pen.line(CONTOUR, [d - 7, -63], [d + 7, -63], 2.5); else oeilA(pen, d, -64, 7); }
    pen.poly([250, 170, 50], [[-5, -56], [5, -56], [0, -46]]);
  },
  ecureuil(ctx, x, g, s, t, f) {
    const col = [200, 110, 60], pen = new Pen(ctx, x, g, s, f), q = 4 * Math.sin(t * 3);
    pen.ellipse(col, -56, -116 + q, -14, -26); pen.ellipse(clair(col, 0.3), -48, -104 + q, -24, -44, false);
    pen.ellipse(col, -22, -62, 18, -4); pen.ellipse([250, 230, 200], -6, -52, 16, -8, false);
    const hx = 12, hy = -72;
    pen.poly(col, [[hx - 12, hy - 10], [hx - 8, hy - 30], [hx, hy - 14]]);
    pen.circle(col, hx, hy, 16, true); pen.circle(CONTOUR, hx + 15, hy + 2, 3);
    oeilA(pen, hx + 5, hy - 4, 4); joueA(pen, hx - 2, hy + 6, 4);
    pen.circle([175, 115, 60], hx + 12, hy + 26, 7, true); pen.ellipse([120, 80, 50], hx + 4, hy + 16, hx + 20, hy + 23);
  },
  abeille(ctx, x, g, s, t, f) {
    const pen = new Pen(ctx, x, g, s, f), y = -100 + 8 * Math.sin(t * 3), ail = 6 * Math.sin(t * 30);
    pen.ellipse([235, 245, 255], -14, y - 38 + ail, 2, y - 10); pen.ellipse([235, 245, 255], -2, y - 36 - ail, 14, y - 10);
    pen.poly(CONTOUR, [[-24, y], [-34, y + 2], [-24, y + 5]]);
    pen.ellipse([250, 200, 40], -26, y - 14, 20, y + 14);
    for (const d of [-12, 2]) pen.rect(CONTOUR, d, y - 12, d + 5, y + 12, 2, false);
    pen.circle([70, 60, 60], 22, y - 2, 10, true); oeilA(pen, 25, y - 5, 3);
    pen.line(CONTOUR, [24, y - 11], [30, y - 24], 1.5); pen.circle(CONTOUR, 30, y - 25, 2);
  },
  coccinelle(ctx, x, g, s, t, f, marche) {
    const pen = new Pen(ctx, x, g, s, f);
    for (const d of [-16, 0, 16]) pen.line(CONTOUR, [d, -8], [d + Math.sin(marche + d) * 4, 0], 2);
    pen.ellipse([230, 50, 50], -30, -42, 26, 0); pen.line(CONTOUR, [-2, -42], [-2, -2], 2);
    for (const [dx, dy] of [[-18, -26], [-12, -12], [10, -28], [14, -12]]) pen.circle(CONTOUR, dx, dy, 5);
    pen.circle([40, 35, 40], 28, -16, 12, true); oeilA(pen, 32, -20, 3); sourireA(pen, 34, -10, 6);
  },
  crocodile(ctx, x, g, s, t, f, marche) {
    const col = [90, 160, 90], pen = new Pen(ctx, x, g, s, f), b = 4 * Math.sin(t * 2);
    pen.poly(col, [[-60, -32], [-112, -12], [-60, -12]]);
    pattes4(pen, col, [-40, -24, 24, 40], -16, -2, 9, marche);
    pen.ellipse(col, -66, -46, 50, -8);
    for (let k = 0; k < 6; k++) pen.circle(fonce(col, 0.85), -50 + k * 16, -44, 5, true);
    pen.rect(col, 40, -40, 112, -22, 10); pen.rect(col, 40, -24 + b * 0.5, 108, -10, 8);
    for (let k = 0; k < 5; k++) pen.poly([255, 255, 255], [[56 + k * 11, -24], [61 + k * 11, -18], [66 + k * 11, -24]], false);
    pen.circle(col, 52, -44, 10, true); oeilA(pen, 54, -46, 4); pen.circle(CONTOUR, 106, -36, 2);
  },
  zebre(ctx, x, g, s, t, f, marche, mange) {
    const col = [250, 250, 250], pen = new Pen(ctx, x, g, s, f);
    pen.bras(CONTOUR, [-58, -104], [-78, -70 + 4 * Math.sin(t * 3)], 5);
    pattes4(pen, col, [-42, -26, 26, 42], -76, -4, 11, marche);
    for (const lx of [-42, -26, 26, 42]) pen.ellipse(CONTOUR, lx - 7, -10, lx + 7, 0, false);
    pen.ellipse(col, -64, -134, 60, -70);
    for (let k = 0; k < 7; k++) pen.line(CONTOUR, [-46 + k * 16, -132 + Math.abs(k - 3) * 2], [-40 + k * 16, -80], 5);
    pen.bras(col, [36, -118], [62, -168], 28);
    for (let k = 0; k < 3; k++) pen.line(CONTOUR, [40 + k * 9, -128 - k * 12], [60 + k * 9, -122 - k * 14], 4);
    const hx = 72, hy = -174 + 12 * mange;
    pen.ellipse(col, hx - 22, hy - 22, hx + 40, hy + 18); pen.ellipse([80, 80, 90], hx + 16, hy - 4, hx + 42, hy + 18);
    pen.poly(col, [[hx - 16, hy - 18], [hx - 12, hy - 40], [hx - 2, hy - 20]]);
    for (let k = 0; k < 5; k++) pen.circle(CONTOUR, 44 - k * 6, -150 + k * 14, 6);
    oeilA(pen, hx, hy - 6, 5);
  },
  tigre(ctx, x, g, s, t, f, marche, mange) {
    const col = [245, 150, 50], pen = new Pen(ctx, x, g, s, f), q = 6 * Math.sin(t * 3);
    pen.bras(col, [-50, -70], [-86, -60 + q], 7);
    pattes4(pen, col, [-36, -20, 20, 36], -40, -3, 13, marche);
    pen.ellipse(col, -56, -92, 44, -30); pen.ellipse([255, 245, 230], -30, -52, 34, -30, false);
    for (let k = 0; k < 5; k++) pen.line(CONTOUR, [-40 + k * 16, -90], [-36 + k * 16, -70], 4);
    const hx = 50, hy = -96 + 8 * mange;
    for (const d of [-20, 20]) { pen.circle(col, hx + d, hy - 24, 10, true); pen.circle([255, 245, 230], hx + d, hy - 24, 5); }
    pen.circle(col, hx, hy, 28, true); pen.ellipse([255, 245, 230], hx - 2, hy + 2, hx + 30, hy + 24, false);
    for (const d of [-8, 0, 8]) pen.line(CONTOUR, [hx + d, hy - 28], [hx + d, hy - 18], 3);
    pen.poly([200, 90, 90], [[hx + 12, hy + 4], [hx + 24, hy + 4], [hx + 18, hy + 11]], false);
    oeilA(pen, hx - 6, hy - 8, 5); oeilA(pen, hx + 14, hy - 8, 5); sourireA(pen, hx + 18, hy + 17, 12);
  },
  dauphin(ctx, x, g, s, t, f) {
    const col = [120, 160, 205], pen = new Pen(ctx, x, g, s, f), y = -70 + 10 * Math.sin(t * 2);
    pen.poly(col, [[-50, y], [-76, y - 22], [-70, y + 6], [-76, y + 26]]);
    pen.poly(fonce(col, 0.85), [[-6, y - 18], [8, y - 44], [20, y - 16]]);
    pen.ellipse(col, -56, y - 24, 50, y + 18); pen.ellipse(clair(col, 0.55), -30, y - 2, 40, y + 16, false);
    pen.ellipse(col, 38, y - 6, 78, y + 10);
    oeilA(pen, 32, y - 8, 4.5); sourireA(pen, 56, y + 6, 14);
  },
  baleine(ctx, x, g, s, t, f) {
    const col = [80, 130, 200], pen = new Pen(ctx, x, g, s, f);
    for (let k = 0; k < 4; k++) pen.circle([190, 230, 255], 34 + (k - 1.5) * 10, -150 - mod(t * 60 + k * 15, 60), 5);
    pen.poly(col, [[-100, -70], [-150, -120], [-140, -70], [-150, -30]]);
    pen.ellipse(col, -116, -134, 104, -10); pen.ellipse(clair(col, 0.5), -60, -60, 96, -12, false);
    for (let k = 0; k < 4; k++) pen.line(fonce(clair(col, 0.5), 0.85), [-30 + k * 26, -54], [-24 + k * 26, -16], 2);
    oeilA(pen, 62, -82, 6); pen.arc(CONTOUR, 50, -76, 96, -50, 1.3 * PI, 1.9 * PI, 3); joueA(pen, 50, -58, 8);
  },
  pieuvre(ctx, x, g, s, t, f) {
    const col = [200, 110, 200], pen = new Pen(ctx, x, g, s, f);
    for (let k = 0; k < 8; k++) { const x0 = -32 + k * 9, w = 10 * Math.sin(t * 3 + k); pen.bras(fonce(col, k % 2 ? 0.88 : 1), [x0, -34], [x0 + w, -12], 7); pen.bras(fonce(col, k % 2 ? 0.88 : 1), [x0 + w, -12], [x0 + w * 0.3 + (k < 4 ? -8 : 8), -2], 5); }
    pen.ellipse(col, -40, -104, 40, -26);
    for (const [dx, dy] of [[-18, -84], [14, -92], [-4, -96]]) pen.circle(clair(col, 0.4), dx, dy, 5);
    oeilA(pen, -10, -60, 6); oeilA(pen, 14, -60, 6); sourireA(pen, 2, -44, 14); joueA(pen, -22, -48, 6); joueA(pen, 26, -48, 6);
  },
  crabe(ctx, x, g, s, t, f, marche) {
    const col = [235, 90, 60], pen = new Pen(ctx, x, g, s, f), c = 6 * Math.sin(t * 5);
    for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) pen.line(fonce(col, 0.8), [sx * (14 + k * 8), -20], [sx * (30 + k * 8), -2 + Math.sin(marche + k) * 3], 3);
    for (const sx of [-1, 1]) { pen.line(fonce(col, 0.8), [sx * 26, -30], [sx * 40, -56 + c * sx], 4); pen.circle(col, sx * 42, -62 + c * sx, 11, true); pen.poly([255, 255, 255], [[sx * 42, -62 + c * sx], [sx * 54, -70 + c * sx], [sx * 54, -60 + c * sx]], false); }
    pen.ellipse(col, -36, -42, 36, -12);
    for (const d of [-9, 9]) { pen.line(fonce(col, 0.8), [d, -40], [d, -54], 3); oeilA(pen, d, -58, 4.5); }
    sourireA(pen, 0, -28, 14);
  },
  panda(ctx, x, g, s, t, f, marche, mange) {
    const blanc = [250, 250, 248], noir = [45, 45, 52], pen = new Pen(ctx, x, g, s, f);
    pattes4(pen, noir, [-40, -22, 22, 40], -50, -3, 18, marche);
    pen.ellipse(blanc, -62, -120, 52, -38); pen.ellipse(noir, -20, -118, 30, -70);
    const hx = 56, hy = -110 + 8 * mange;
    for (const ex of [-20, 20]) pen.circle(noir, hx + ex, hy - 24, 11, true);
    pen.circle(blanc, hx, hy, 30, true);
    for (const ex of [-6, 14]) pen.ellipse(noir, hx + ex - 8, hy - 18, hx + ex + 8, hy + 2);
    oeilA(pen, hx - 4, hy - 10, 3.5); oeilA(pen, hx + 16, hy - 10, 3.5);
    pen.circle(noir, hx + 22, hy + 6, 5); sourireA(pen, hx + 14, hy + 14, 10); joueA(pen, hx - 14, hy + 8, 6);
  },
  kangourou(ctx, x, g, s, t, f, marche) {
    const col = [200, 140, 90], pen = new Pen(ctx, x, g, s, f), h = Math.abs(Math.sin(marche * 0.5)) * 14;
    pen.bras(col, [-20, -36 - h], [-74, -6], 12);
    pen.ellipse(fonce(col, 0.9), -14, -14 - h, 38, -2 - h);
    pen.ellipse(col, -30, -116 - h, 30, -22 - h); pen.ellipse(clair(col, 0.45), -4, -76 - h, 26, -30 - h, false);
    pen.circle(col, 10, -80 - h, 9, true); oeilA(pen, 13, -82 - h, 2.5); // le bébé dans la poche
    pen.bras(col, [16, -96 - h], [30, -78 - h], 5);
    const hx = 18, hy = -134 - h;
    for (const d of [-8, 4]) pen.ellipse(col, hx + d - 6, hy - 40, hx + d + 6, hy - 8);
    pen.circle(col, hx, hy, 17, true); pen.ellipse(clair(col, 0.35), hx + 6, hy - 2, hx + 30, hy + 12); pen.circle(CONTOUR, hx + 28, hy + 2, 3);
    oeilA(pen, hx + 4, hy - 6, 4);
  },
  serpent(ctx, x, g, s, t, f) {
    const col = [110, 190, 90], pen = new Pen(ctx, x, g, s, f);
    for (let k = 0; k < 16; k++) { const px = -76 + k * 9, py = -12 + 6 * Math.sin(k * 0.7 - t * 4); pen.circle(k % 3 ? col : fonce(col, 0.85), px, py, 10 - Math.max(0, 6 - k) * 0.8, k === 0); }
    pen.ellipse(col, 58, -38, 92, -12);
    oeilA(pen, 76, -30, 4); pen.line([230, 70, 80], [92, -22], [102, -20 + 2 * Math.sin(t * 10)], 2); sourireA(pen, 84, -20, 8);
  },
  herisson(ctx, x, g, s, t, f, marche) {
    const pic = [140, 100, 70], face = [235, 200, 160], pen = new Pen(ctx, x, g, s, f), pts = [];
    for (let k = 0; k <= 12; k++) { const a = PI + (k / 12) * PI * 0.9, r = k % 2 ? 46 : 36; pts.push([-6 + r * Math.cos(a), -4 + r * Math.sin(a) * 0.95]); }
    pts.push([22, -4]); pen.poly(pic, pts);
    for (const d of [-20, 10]) pen.ellipse(fonce(face, 0.85), d - 6, -8, d + 6, 0);
    pen.ellipse(face, 4, -32, 44, -4); pen.circle(CONTOUR, 44, -18, 4); oeilA(pen, 22, -22, 3.5); joueA(pen, 18, -12, 4);
  },
  ane(ctx, x, g, s, t, f, marche, mange) {
    const col = [160, 160, 172], pen = new Pen(ctx, x, g, s, f);
    pen.bras(col, [-58, -100], [-74, -60 + 4 * Math.sin(t * 3)], 5); pen.circle(CONTOUR, -75, -58 + 4 * Math.sin(t * 3), 6);
    pattes4(pen, col, [-40, -24, 24, 40], -72, -4, 11, marche);
    for (const lx of [-40, -24, 24, 40]) pen.ellipse(CONTOUR, lx - 7, -10, lx + 7, 0, false);
    pen.ellipse(col, -60, -128, 56, -66); pen.ellipse(clair(col, 0.5), -36, -92, 40, -68, false);
    pen.bras(col, [34, -112], [58, -158], 26);
    const hx = 68, hy = -164 + 12 * mange;
    for (const d of [-14, -2]) pen.ellipse(col, hx + d - 7, hy - 56, hx + d + 7, hy - 10);
    pen.ellipse(col, hx - 22, hy - 22, hx + 38, hy + 18); pen.ellipse([245, 245, 245], hx + 12, hy - 4, hx + 42, hy + 20);
    for (let k = 0; k < 4; k++) pen.circle(fonce(col, 0.55), 40 - k * 6, -142 + k * 14, 6);
    oeilA(pen, hx, hy - 6, 5); pen.circle(fonce(col, 0.5), hx + 34, hy + 6, 2.5); sourireA(pen, hx + 26, hy + 12, 10);
  },
  chevre(ctx, x, g, s, t, f, marche, mange) {
    const col = [240, 236, 225], pen = new Pen(ctx, x, g, s, f);
    pattes4(pen, col, [-32, -18, 18, 32], -50, -3, 8, marche);
    for (const lx of [-32, -18, 18, 32]) pen.ellipse([90, 80, 80], lx - 6, -8, lx + 6, 0, false);
    pen.ellipse(col, -48, -96, 44, -44);
    const hx = 52, hy = -108 + 8 * mange;
    pen.bras([180, 170, 150], [hx - 6, hy - 18], [hx - 20, hy - 34], 5); pen.bras([180, 170, 150], [hx + 4, hy - 20], [hx - 6, hy - 38], 5);
    pen.ellipse(col, hx - 30, hy - 10, hx - 8, hy + 2);
    pen.ellipse(col, hx - 16, hy - 20, hx + 26, hy + 16); pen.poly(clair([200, 190, 170], 0.3), [[hx + 6, hy + 14], [hx + 16, hy + 14], [hx + 10, hy + 32]]);
    oeilA(pen, hx + 4, hy - 6, 4); pen.circle([255, 150, 160], hx + 22, hy + 4, 3);
  },
};
const MESURES_MONDE = {
  poisson: [100, 90, 34, -58], tortue: [110, 70, 52, -28], papillon: [80, 140, 0, -120], oiseau: [70, 60, 26, -32], escargot: [90, 60, 40, -24], grenouille: [80, 70, 14, -34],
  souris: [80, 60, 36, -22], renard: [140, 110, 70, -56], hibou: [70, 100, 0, -52], ecureuil: [90, 120, 26, -66], abeille: [70, 130, 26, -100], coccinelle: [70, 50, 34, -16],
  crocodile: [220, 60, 100, -30], zebre: [190, 190, 100, -150], tigre: [150, 130, 66, -86], dauphin: [150, 110, 70, -66], baleine: [260, 170, 90, -60], pieuvre: [100, 110, 2, -46],
  crabe: [100, 80, 0, -30], panda: [150, 160, 70, -96], kangourou: [110, 170, 40, -126], serpent: [180, 50, 86, -24], herisson: [90, 55, 44, -20], ane: [180, 220, 96, -150], chevre: [140, 140, 66, -100],
};
const NOMS_MONDE = {
  fr: { poisson: "le poisson", tortue: "la tortue", papillon: "le papillon", oiseau: "l'oiseau", escargot: "l'escargot", grenouille: "la grenouille", souris: "la souris", renard: "le renard",
    hibou: "le hibou", ecureuil: "l'écureuil", abeille: "l'abeille", coccinelle: "la coccinelle", crocodile: "le crocodile", zebre: "le zèbre", tigre: "le tigre", dauphin: "le dauphin",
    baleine: "la baleine", pieuvre: "la pieuvre", crabe: "le crabe", panda: "le panda", kangourou: "le kangourou", serpent: "le serpent", herisson: "le hérisson", ane: "l'âne", chevre: "la chèvre" },
  en: { poisson: "the fish", tortue: "the turtle", papillon: "the butterfly", oiseau: "the bird", escargot: "the snail", grenouille: "the frog", souris: "the mouse", renard: "the fox",
    hibou: "the owl", ecureuil: "the squirrel", abeille: "the bee", coccinelle: "the ladybird", crocodile: "the crocodile", zebre: "the zebra", tigre: "the tiger", dauphin: "the dolphin",
    baleine: "the whale", pieuvre: "the octopus", crabe: "the crab", panda: "the panda", kangourou: "the kangaroo", serpent: "the snake", herisson: "the hedgehog", ane: "the donkey", chevre: "the goat" },
};
const MOTS_MONDE_ANIMAUX = [
  ["poisson", "\\bpoissons?\\b(?! rouges?)|\\bfish(es)?\\b(?! tank)"], ["tortue", "tortues?|turtles?|tortoises?"], ["papillon", "papillons?|butterfl(y|ies)"],
  ["oiseau", "oiseaux?|\\bmerles?\\b|moineaux?|perroquets?|\\bbirds?\\b|parrots?"], ["escargot", "escargots?|\\bsnails?\\b"], ["grenouille", "grenouilles?|crapauds?|\\bfrogs?\\b|toads?"],
  ["souris", "\\bsouris\\b|\\bmouse\\b|\\bmice\\b"], ["renard", "renards?|\\bfox(es)?\\b"], ["hibou", "hiboux?|chouettes?|\\bowls?\\b"], ["ecureuil", "ecureuils?|squirrels?"],
  ["abeille", "abeilles?|\\bbees?\\b|bourdons?"], ["coccinelle", "coccinelles?|ladybirds?|ladybugs?"], ["crocodile", "crocodiles?|alligators?|\\bcrocos?\\b"],
  ["zebre", "zebres?|zebras?"], ["tigre", "\\btigres?\\b|\\btigers?\\b"], ["dauphin", "dauphins?|dolphins?"], ["baleine", "baleines?|whales?"],
  ["pieuvre", "pieuvres?|poulpes?|octopus"], ["crabe", "\\bcrabes?\\b|\\bcrabs?\\b"], ["panda", "\\bpandas?\\b"], ["kangourou", "kangourous?|kangaroos?"],
  ["serpent", "serpents?|\\bsnakes?\\b"], ["herisson", "herissons?|hedgehogs?"], ["ane", "\\banes?\\b|\\bdonkeys?\\b|\\banon\\b"], ["chevre", "chevres?|chevreaux?|\\bbiquettes?\\b|\\bgoats?\\b"],
];
for (const [id, dessin] of Object.entries(ANIMAUX_MONDE)) {
  AMIS_DESSIN[id] = (ctx, x, g, s, t, f, marche, mange) => dessin(ctx, x, g, s, t, f, marche, mange);
  MESURES_ANIMAUX[id] = MESURES_MONDE[id];
  const [w, h] = MESURES_MONDE[id];
  LARGEUR_OMBRE[id] = Math.min(1, w / 230); TAILLE_AMI[id] = [w, h];
}
for (const id of ["papillon", "abeille", "poisson", "dauphin"]) LARGEUR_OMBRE[id] = 0.12; // ils volent ou nagent : une toute petite ombre
MOTS_PERSOS.push(...MOTS_MONDE_ANIMAUX);
Object.assign(NOMS_PERSOS.fr, NOMS_MONDE.fr); Object.assign(NOMS_PERSOS.en, NOMS_MONDE.en);
ANIMAUX_ECRITURE.push(...Object.keys(ANIMAUX_MONDE));
{ const i = MOTS_PERSOS.findIndex(([id]) => id === "ours"); if (i >= 0) MOTS_PERSOS[i] = ["ours", "\\bours\\b(?! en peluche)|\\boursons?\\b|\\bbears?\\b(?! en peluche)"]; } // le nounours n'est pas un ours

// ================================================================= 4. les gens qu'on rencontre
// Chaque personne est un modèle comme ceux de l'atelier, avec en plus un chapeau, un objet à la main, des ailes…
const GENS = {
  maitresse: { fr: "la maîtresse", en: "the teacher", mots: "\\bmaitresses?\\b|\\bmaitre d'ecole|institut(rice|eur)s?|\\binstits?\\b|\\bteachers?\\b",
    m: { age: "adulte", peau: "beige", cheveux: "chatain", coiffure: "milong", yeux: "vert", haut: "lilas", bas: "marine", bas_type: "jupe", cils: true, lunettes: true, accessoire: "livre" } },
  nounou: { fr: "la nounou", en: "the nanny", mots: "\\bnounous?\\b|nourrices?|babysitters?|\\bnann(y|ies)\\b",
    m: { age: "adulte", peau: "cuivre", cheveux: "noir", coiffure: "chignon", yeux: "marron", haut: "orange", bas: "jean", cils: true } },
  docteur: { fr: "le docteur", en: "the doctor", mots: "\\b(le|la|un|une|du|au) (docteur|medecin|doctoresse)\\b|\\bdoctors?\\b",
    m: { age: "adulte", peau: "mat", cheveux: "brun_fonce", coiffure: "court", yeux: "marron", haut: "blanc", haut_type: "chemise", bas: "marine", lunettes: true, accessoire: "stethoscope" } },
  infirmiere: { fr: "l'infirmière", en: "the nurse", mots: "infirmi(ere|er)s?|\\bnurses?\\b",
    m: { age: "adulte", peau: "clair", cheveux: "blond", coiffure: "chignon", yeux: "bleu", haut: "blanc", robe: true, bas: "peau", cils: true, chapeau: "infirmiere" } },
  policier: { fr: "le policier", en: "the police officer", mots: "polici(er|ere)s?|gendarmes?|\\bpolice\\b|policem[ae]n",
    m: { age: "adulte", peau: "brun", cheveux: "noir", coiffure: "court", yeux: "marron_fonce", haut: "marine", haut_type: "chemise", bas: "marine", chapeau: "casquette", chapeauCol: [40, 60, 120] } },
  sapeur: { fr: "le pompier", en: "the firefighter", mots: "\\b(un|une|le|la|les|des|du) pompiers?\\b(?! (rouge|arrive en camion))|\\bsapeurs?|firefighters?|firem[ae]n",
    m: { age: "adulte", peau: "clair", cheveux: "roux", coiffure: "court", yeux: "vert", haut: "marine", haut_type: "pull", bas: "marine", chapeau: "casquePompier", barbe: false } },
  boulanger: { fr: "le boulanger", en: "the baker", mots: "boulang(er|ere)s?|\\bbakers?\\b",
    m: { age: "adulte", peau: "clair", cheveux: "brun", coiffure: "court", yeux: "marron", haut: "blanc", bas: "beige", chapeau: "toque", moustache: true, corpulence: "rond", accessoire: "pain" } },
  cuisinier: { fr: "le cuisinier", en: "the cook", mots: "cuisini(er|ere)s?|\\bchefs?\\b|\\bcooks?\\b",
    m: { age: "adulte", peau: "fonce", cheveux: "noir", coiffure: "court", yeux: "marron_fonce", haut: "blanc", haut_type: "chemise", bas: "noir", chapeau: "toque", accessoire: "louche" } },
  facteur: { fr: "le facteur", en: "the postman", mots: "facteurs?|factrices?|postm[ae]n|postwom[ae]n|mail carriers?",
    m: { age: "adulte", peau: "beige", cheveux: "chatain", coiffure: "court", yeux: "bleu", haut: "jaune", bas: "marine", chapeau: "casquette", chapeauCol: [60, 100, 190], accessoire: "lettre" } },
  fermier: { fr: "le fermier", en: "the farmer", mots: "fermi(er|ere)s?|agricult(eur|rice)s?|\\bfarmers?\\b",
    m: { age: "adulte", peau: "mat", cheveux: "blond_fonce", coiffure: "court", yeux: "noisette", haut: "rouge", haut_type: "salopette", bas: "jean", chapeau: "paille", petiteBarbe: true } },
  vendeur: { fr: "la vendeuse", en: "the shopkeeper", mots: "vendeu(r|se)s?|marchand(e)?s?|caissi(er|ere)s?|commer(cant|cante)s?|shopkeepers?|cashiers?",
    m: { age: "adulte", peau: "clair", cheveux: "roux", coiffure: "long", yeux: "vert", haut: "vert", bas: "jean", cils: true } },
  garagiste: { fr: "le garagiste", en: "the mechanic", mots: "garagistes?|mecanicien(ne)?s?|mechanics?",
    m: { age: "adulte", peau: "fonce", cheveux: "noir", coiffure: "chauve", yeux: "marron", haut: "bleu", haut_type: "salopette", bas: "marine", chapeau: "casquette", chapeauCol: [230, 80, 70], accessoire: "cle" } },
  bebe: { fr: "le bébé", en: "the baby", mots: "\\bbebes?\\b|\\bbab(y|ies)\\b|nourrissons?",
    m: { age: "enfant", bebe: true, peau: "tres_clair", cheveux: "blond_clair", coiffure: "chauve", yeux: "bleu", haut: "rose", bas: "rose", tetine: true } },
  clown: { fr: "le clown", en: "the clown", mots: "\\bclowns?\\b",
    m: { age: "adulte", peau: "clair", cheveux: "orange_vif", coiffure: "boucle", yeux: "bleu", haut: "jaune", haut_type: "salopette", bas: "rouge", nezRouge: true, chapeau: "melon", chapeauCol: [90, 160, 230], corpulence: "rond" } },
  magicien: { fr: "le magicien", en: "the magician", mots: "magicien(ne)?s?|\\bsorciers?\\b|\\bwizards?\\b|magicians?",
    m: { age: "adulte", peau: "beige", cheveux: "gris", coiffure: "court", yeux: "bleu", haut: "violet_nuit", robe: true, bas: "peau", barbe: true, chapeau: "pointu", chapeauCol: [70, 50, 150], accessoire: "baguette" } },
  sorciere: { fr: "la gentille sorcière", en: "the kind witch", mots: "sorcieres?|\\bwitch(es)?\\b",
    m: { age: "adulte", peau: "clair", cheveux: "roux", coiffure: "long", yeux: "vert", haut: "violet_nuit", robe: true, bas: "peau", cils: true, chapeau: "pointu", chapeauCol: [50, 40, 60], accessoire: "baguette" } },
  fee: { fr: "la fée", en: "the fairy", mots: "\\bfees?\\b|\\bfair(y|ies)\\b",
    m: { age: "adulte", taille: "petit", peau: "tres_clair", cheveux: "blond", coiffure: "long", yeux: "bleu_clair", haut: "rose", robe: true, bas: "peau", cils: true, ailes: true, chapeau: "diademe", accessoire: "baguette" } },
  princesse: { fr: "la princesse", en: "the princess", mots: "princesses?",
    m: { age: "enfant", peau: "beige", cheveux: "blond", coiffure: "long", yeux: "bleu", haut: "rose", robe: true, bas: "peau", cils: true, couronne: true } },
  prince: { fr: "le prince", en: "the prince", mots: "\\bprinces?\\b",
    m: { age: "enfant", peau: "mat", cheveux: "brun", coiffure: "court", yeux: "marron", haut: "bleu", haut_type: "chemise", bas: "blanc", couronne: true } },
  roi: { fr: "le roi", en: "the king", mots: "\\broi\\b|\\brois\\b|\\bkings?\\b",
    m: { age: "adulte", peau: "clair", cheveux: "blanc", coiffure: "court", yeux: "bleu", haut: "rouge", robe: true, bas: "peau", barbe: true, couronne: true, corpulence: "rond" } },
  reine: { fr: "la reine", en: "the queen", mots: "\\breines?\\b|\\bqueens?\\b",
    m: { age: "adulte", peau: "clair", cheveux: "gris", coiffure: "chignon", yeux: "vert", haut: "violet", robe: true, bas: "peau", cils: true, couronne: true } },
  chevalier: { fr: "le chevalier", en: "the knight", mots: "chevaliers?|\\bknights?\\b",
    m: { age: "adulte", peau: "beige", cheveux: "brun", coiffure: "court", yeux: "marron", haut: "argent", haut_type: "pull", bas: "argent", chapeau: "casqueChevalier", accessoire: "epee" } },
  pirate: { fr: "le pirate", en: "the pirate", mots: "pirates?",
    m: { age: "adulte", peau: "mat", cheveux: "noir", coiffure: "long", yeux: "marron", haut: "blanc", haut_type: "chemise", bas: "noir", barbe: true, chapeau: "pirate" } },
  astronaute: { fr: "l'astronaute", en: "the astronaut", mots: "astronautes?|cosmonautes?|spationautes?|astronauts?",
    m: { age: "adulte", peau: "beige", cheveux: "brun", coiffure: "court", yeux: "vert", haut: "blanc", haut_type: "pull", bas: "blanc", chaussures: "blanc", chapeau: "astronaute" } },
  pereNoel: { fr: "le Père Noël", en: "Santa", mots: "pere[- ]noel|\\bsanta( claus)?\\b|father christmas",
    m: { age: "adulte", peau: "clair", cheveux: "blanc", coiffure: "court", yeux: "bleu", haut: "rouge", haut_type: "pull", bas: "rouge", barbe: true, moustache: true, chapeau: "noel", corpulence: "rond" } },
};
// quelques couleurs en plus pour leurs tenues
Object.assign(PALETTES.habits, { violet_nuit: [90, 60, 150], argent: [185, 190, 205] });
Object.assign(PALETTES.cheveux, { orange_vif: [250, 120, 40] });
function definitGens() {
  for (const [id, G_] of Object.entries(GENS)) {
    STYLES[id] = styleDe({ nom: G_.fr, ...G_.m });
    AMIS_DESSIN[id] = (ctx, x, g, s, t, f, marche, mange, humeur) => personne(ctx, x, g, s * (G_.m.bebe ? 0.62 : 1), t, f, marche, mange, humeur, id);
  }
}
definitGens();
for (const [id, G_] of Object.entries(GENS)) { MOTS_PERSOS.push([id, G_.mots]); NOMS_PERSOS.fr[id] = G_.fr; NOMS_PERSOS.en[id] = G_.en; ANIMAUX_ECRITURE.push(id); }

// dedans (chambre, classe, cinéma, sous la mer…), le camion ne vient que pour de vrais travaux, pas pour jouer ou rouler
for (const a of ["rouler", "copains", "spectacle", "voler"]) AVEC_ENGIN.delete(a);

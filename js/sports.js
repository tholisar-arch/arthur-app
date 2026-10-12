// Les sports : stade de foot, rugby, tennis, basket, piscine, gymnase, danse, poney, patinoire, ski, skatepark,
// athlétisme. Chaque lieu a son activité qu'on joue en touchant (tirer au but, marquer un panier, sauter à poney…).
// Même branchement que monde.js : reconnus dans le texte, dans l'éditeur (thème « ⚽ Sport ») et dans la création guidée.
"use strict";

// ================================================================= les lieux de sport
const tribunes = (ctx, W, hz, scroll, cols) => { // des gradins pleins de supporters
  rrect(ctx, 0, hz - 190, W, 150, 0, [170, 175, 190], 3);
  for (let r = 0; r < 4; r++) { rrect(ctx, 0, hz - 186 + r * 36, W, 6, 0, [140, 145, 160]);
    for (let k = 0; k < 40; k++) { const x = mod(k * 28 + r * 13 - scroll * 0.2, W + 28) - 14; rond(ctx, x, hz - 166 + r * 36, 9, cols[(k + r) % cols.length], 1.5); rond(ctx, x, hz - 180 + r * 36, 6, [240, 200, 160]); } }
  rrect(ctx, 0, hz - 44, W, 44, 0, [90, 120, 200], 3);
};
const projecteur = (ctx, x, hz) => { trait(ctx, [x, hz - 190], [x, hz - 330], 6, [150, 155, 170]); rrect(ctx, x - 34, hz - 360, 68, 32, 6, [230, 232, 240], 3); for (let k = 0; k < 3; k++) rond(ctx, x - 20 + k * 20, hz - 344, 7, [255, 245, 190]); };
const lignesTerrain = (ctx, W, hz, G, scroll) => {
  const c = [250, 252, 250], x = mod(500 - scroll, W + 200) - 100;
  trait(ctx, [0, hz + 12], [W, hz + 12], 4, c); trait(ctx, [x, hz + 12], [x, G + 60], 4, c);
  ctx.beginPath(); ctx.ellipse(x, G + 10, 120, 34, 0, 0, 2 * PI); ctx.lineWidth = 4; ctx.strokeStyle = css(c); ctx.stroke();
};
const LIEUX_SPORT = {
  foot: { fr: "Stade de foot", en: "Football pitch", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[110, 190, 80], [100, 178, 72]],
    fond(ctx, W, H, hz, scroll) { tribunes(ctx, W, hz, scroll, [[230, 60, 70], [255, 255, 255], [60, 110, 220]]); for (const x of [80, W - 80]) projecteur(ctx, x, hz); },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { lignesTerrain(ctx, W, hz, G, scroll); for (let k = 0; k < 12; k++) rrect(ctx, mod(k * 120 - scroll, W + 120) - 60, hz + 18, 60, G + 60 - hz, 0, null); } },
  rugby: { fr: "Terrain de rugby", en: "Rugby pitch", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[105, 185, 85], [95, 172, 75]],
    fond(ctx, W, H, hz, scroll) { tribunes(ctx, W, hz, scroll, [[250, 200, 60], [60, 140, 90], [255, 255, 255]]); for (const x of [80, W - 80]) projecteur(ctx, x, hz); },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { lignesTerrain(ctx, W, hz, G, scroll); } },
  tennis: { fr: "Court de tennis", en: "Tennis court", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[205, 115, 70], [210, 120, 75]],
    fond(ctx, W, H, hz, scroll) {
      rrect(ctx, 0, hz - 150, W, 150, 0, [60, 120, 80], 3);
      for (let k = 0; k < 6; k++) { const x = boucle(k * 220 + 30, scroll, 0.3, W, 220); rrect(ctx, x, hz - 120, 160, 40, 8, [[250, 200, 60], [255, 255, 255], [90, 160, 240]][k % 3], 2); }
      for (let k = 0; k < 30; k++) trait(ctx, [mod(k * 40 - scroll * 0.3, W + 40) - 20, hz - 150], [mod(k * 40 - scroll * 0.3, W + 40) - 20, hz], 1, [90, 150, 100]);
      const cx = boucle(860, scroll, 0.3, W, 300); trait(ctx, [cx, hz], [cx, hz - 200], 6, [240, 240, 245]); rrect(ctx, cx - 30, hz - 230, 60, 34, 6, [240, 240, 245], 3); // la chaise de l'arbitre
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { const c = [250, 250, 245]; trait(ctx, [0, hz + 14], [W, hz + 14], 4, c); trait(ctx, [0, G + 50], [W, G + 50], 4, c); trait(ctx, [mod(240 - scroll, W), hz + 14], [mod(240 - scroll, W), G + 50], 4, c); } },
  basket: { fr: "Basket", en: "Basketball court", interieur: true, ciel: [[235, 225, 210], [235, 225, 210]], sol: [[215, 160, 100], [225, 172, 112]],
    fond(ctx, W, H, hz, scroll) {
      murInterieur(ctx, W, hz, [225, 215, 200], scroll);
      for (let r = 0; r < 3; r++) rrect(ctx, 0, hz - 150 + r * 40, W, 36, 0, [[90, 120, 200], [80, 110, 190], [70, 100, 180]][r], 2);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 30; k++) { const x = mod(k * 36 + r * 17, W + 36) - 18; rond(ctx, x, hz - 132 + r * 40, 8, [[240, 120, 60], [255, 255, 255], [250, 200, 60]][(k + r) % 3], 1.5); }
      const sx = boucle(520, scroll, 0.3, W, 300); rrect(ctx, sx - 110, 30, 220, 80, 10, [40, 40, 50], 4); ecrireCentre(ctx, "12 : 10", sx, 70, 40, [255, 90, 70]);
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { const c = [250, 250, 245]; trait(ctx, [0, hz + 16], [W, hz + 16], 4, c); ctx.beginPath(); ctx.ellipse(mod(500 - scroll, W + 200) - 100, G + 14, 110, 30, 0, 0, 2 * PI); ctx.lineWidth = 4; ctx.strokeStyle = css(c); ctx.stroke(); } },
  natation: { fr: "Piscine (natation)", en: "Swimming pool", interieur: true, sansCiel: true, ciel: [[225, 242, 252], [225, 242, 252]], sol: [[90, 175, 230], [80, 165, 225]],
    fond(ctx, W, H, hz, scroll, t) {
      murInterieur(ctx, W, hz, [235, 248, 255], scroll); carreaux(ctx, W, hz - 120, hz + 6, [200, 230, 245], 34);
      const px = boucle(860, scroll, 0.3, W, 300); // le plongeoir
      rrect(ctx, px - 14, hz - 200, 28, 206, 4, [200, 205, 215], 3); rrect(ctx, px - 160, hz - 210, 170, 16, 6, [90, 170, 240], 3);
      for (let k = 0; k < 10; k++) { const x = boucle(k * 110, scroll, 0.3, W, 110); poly(ctx, [[x, 20], [x + 50, 20], [x + 25, 50]], [[240, 90, 90], [250, 200, 60], [90, 170, 240]][k % 3]); }
    },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { // les lignes d'eau
      for (let r = 0; r < 3; r++) { const y = hz + 30 + r * 34; for (let k = 0; k < 40; k++) rond(ctx, mod(k * 28 - scroll + r * 14, W + 28) - 14, y, 6, k % 4 < 2 ? [240, 80, 80] : [255, 255, 255], 1.5); }
      for (let k = 0; k < 14; k++) { const x = mod(k * 90 + t * 20, W + 90) - 45; trait(ctx, [x, G + 30 + (k % 3) * 16], [x + 30, G + 30 + (k % 3) * 16], 2, [190, 225, 250]); }
    } },
  gymnase: { fr: "Gymnastique", en: "Gym", interieur: true, ciel: [[240, 232, 218], [240, 232, 218]], sol: [[215, 165, 110], [225, 178, 122]],
    fond(ctx, W, H, hz, scroll, t) {
      murInterieur(ctx, W, hz, [238, 228, 210], scroll);
      const ex = boucle(180, scroll, 0.3, W, 300); for (let k = 0; k < 6; k++) trait(ctx, [ex + k * 22, hz - 260], [ex + k * 22, hz], 5, [190, 140, 90]); for (let r = 0; r < 9; r++) trait(ctx, [ex - 4, hz - 250 + r * 28], [ex + 114, hz - 250 + r * 28], 4, [200, 150, 100]); // l'espalier
      const ax = boucle(620, scroll, 0.3, W, 300); for (const d of [-40, 40]) { trait(ctx, [ax + d, 0], [ax + d + 4 * Math.sin(t), hz - 190], 2, [120, 110, 100]); rond(ctx, ax + d + 4 * Math.sin(t), hz - 176, 14, null, 5, [230, 190, 90]); } // les anneaux
      const tx = boucle(980, scroll, 0.3, W, 300); rrect(ctx, tx - 120, hz - 60, 240, 22, 6, [60, 60, 70], 3); ovale(ctx, tx - 110, hz - 70, 220, 24, [90, 160, 230], 3); for (const d of [-100, 100]) trait(ctx, [tx + d, hz - 38], [tx + d, hz], 5, [120, 120, 130]); // le trampoline
    } },
  danseSalle: { fr: "Salle de danse", en: "Dance studio", interieur: true, ciel: [[250, 232, 240], [250, 232, 240]], sol: [[200, 150, 110], [215, 165, 125]],
    fond(ctx, W, H, hz, scroll, t, nuit) {
      murInterieur(ctx, W, hz, [250, 228, 236], scroll);
      rrect(ctx, 60, hz - 280, W - 120, 220, 6, [215, 235, 250], 6, [220, 190, 150]); for (let k = 0; k < 6; k++) trait(ctx, [120 + k * 160, hz - 270], [180 + k * 160, hz - 80], 6, [240, 250, 255]); // le miroir
      trait(ctx, [0, hz - 110], [W, hz - 110], 8, [190, 140, 95]); for (let k = 0; k < 8; k++) trait(ctx, [mod(k * 160 - scroll * 0.3, W + 160) - 80, hz - 110], [mod(k * 160 - scroll * 0.3, W + 160) - 80, hz - 60], 5, [170, 125, 85]); // la barre
      for (let k = 0; k < 5; k++) { const x = mod(k * 210 + t * 30, W + 100) - 50; ecrireCentre(ctx, k % 2 ? "♪" : "♫", x, 40 + 20 * Math.sin(t * 2 + k), 34, [220, 90, 150]); }
    } },
  poney: { fr: "Poney-club", en: "Pony club", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[140, 200, 90], [205, 175, 125]],
    fond(ctx, W, H, hz, scroll) {
      collines(ctx, W, hz, scroll, undefined, undefined, false);
      const bx = boucle(820, scroll, 0.3, W, 300); rrect(ctx, bx - 120, hz - 150, 240, 150, 0, [200, 80, 65], 3); poly(ctx, [[bx - 140, hz - 150], [bx + 140, hz - 150], [bx, hz - 220]], [150, 60, 55], 3); rrect(ctx, bx - 40, hz - 100, 80, 100, 4, [245, 235, 220], 3);
      for (let k = 0; k < 30; k++) { const px = boucle(k * 44, scroll, 0.5, W, 50); rrect(ctx, px, hz - 46, 8, 46, 2, [255, 255, 255], 2); }
      trait(ctx, [0, hz - 36], [W, hz - 36], 5, [255, 255, 255]); trait(ctx, [0, hz - 18], [W, hz - 18], 5, [255, 255, 255]);
      for (let k = 0; k < 3; k++) { const fx = boucle(k * 300 + 150, scroll, 0.5, W); trait(ctx, [fx, hz - 50], [fx, hz - 110], 3, CONTOUR); poly(ctx, [[fx, hz - 110], [fx + 34, hz - 100], [fx, hz - 90]], [[230, 70, 80], [90, 160, 240], [250, 200, 60]][k], 2); }
    } },
  patinoire: { fr: "Patinoire", en: "Ice rink", interieur: true, ciel: [[200, 220, 240], [200, 220, 240]], sol: [[230, 242, 252], [215, 232, 248]],
    fond(ctx, W, H, hz, scroll, t) {
      rrect(ctx, 0, 0, W, hz + 20, 0, [70, 90, 140]);
      for (let k = 0; k < 8; k++) { const x = k * (W / 7); rond(ctx, x, 40, 10, [255, 250, 210]); ctx.globalAlpha = 0.12; poly(ctx, [[x - 10, 40], [x + 10, 40], [x + 80, hz], [x - 80, hz]], [255, 255, 220]); ctx.globalAlpha = 1; }
      for (let r = 0; r < 3; r++) for (let k = 0; k < 34; k++) { const x = mod(k * 30 + r * 15, W + 30) - 15; rond(ctx, x, hz - 150 + r * 34, 9, [[240, 120, 60], [255, 255, 255], [90, 160, 240], [250, 200, 60]][(k + r) % 4], 1.5); }
      rrect(ctx, 0, hz - 50, W, 60, 0, [255, 255, 255], 3); for (let k = 0; k < 8; k++) rrect(ctx, mod(k * 160 - scroll * 0.3, W + 160) - 80 + 10, hz - 42, 130, 40, 6, [[230, 70, 80], [90, 160, 240], [250, 200, 60], [110, 190, 110]][k % 4], 2);
    } },
  ski: { fr: "Piste de ski", en: "Ski slope", ciel: [[140, 195, 250], [230, 242, 255]], sol: [[250, 252, 255], [235, 242, 252]],
    fond(ctx, W, H, hz, scroll, t) {
      for (let k = 0; k < 3; k++) { const x = boucle(k * 420 + 120, scroll, 0.15, W, 300), h = 300 + (k % 2) * 60; poly(ctx, [[x - 280, hz], [x, hz - h], [x + 280, hz]], [[160, 175, 205], [140, 160, 195]][k % 2], 3); poly(ctx, [[x - 70, hz - h + 70], [x, hz - h], [x + 70, hz - h + 70], [x + 25, hz - h + 55], [x, hz - h + 72], [x - 25, hz - h + 55]], [255, 255, 255]); }
      ovale(ctx, -200, hz - 140, W + 400, 300, [250, 252, 255], 3);
      ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(W, 200); ctx.lineWidth = 3; ctx.strokeStyle = css([80, 80, 90]); ctx.stroke(); // le télésiège
      for (let k = 0; k < 5; k++) { const u = mod(t * 0.05 + k / 5, 1), x = u * W, y = 60 + 140 * u; trait(ctx, [x, y], [x, y + 30], 2, [80, 80, 90]); rrect(ctx, x - 18, y + 30, 36, 16, 5, [230, 70, 80], 2); }
      for (let k = 0; k < 6; k++) sapin(ctx, boucle(k * 200 + 60, scroll, 0.4, W), hz + 10, 0.7);
    } },
  skatepark: { fr: "Skatepark", en: "Skatepark", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[180, 180, 185], [195, 195, 200]],
    fond(ctx, W, H, hz, scroll) {
      rrect(ctx, 0, hz - 140, W, 140, 0, [200, 200, 205], 3);
      for (let k = 0; k < 6; k++) { const x = boucle(k * 230 + 20, scroll, 0.3, W, 230); rrect(ctx, x, hz - 120, 180, 90, 20, [[240, 90, 140], [90, 200, 220], [250, 200, 60], [140, 110, 230]][k % 4], 2); ecrireCentre(ctx, ["WOW", "ZOU", "YEAH", "GO"][k % 4], x + 90, hz - 75, 36, [255, 255, 255]); }
      for (const [b, f] of [[180, 1], [900, -1]]) { const x = boucle(b, scroll, 0.4, W, 300); ctx.beginPath(); ctx.moveTo(x, hz); ctx.quadraticCurveTo(x + f * 140, hz, x + f * 150, hz - 130); ctx.lineTo(x + f * 170, hz - 130); ctx.lineTo(x + f * 170, hz); ctx.closePath(); ctx.fillStyle = css([170, 170, 178]); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = css([110, 110, 120]); ctx.stroke(); }
    } },
  athletisme: { fr: "Piste d'athlétisme", en: "Running track", ciel: [[110, 185, 245], [222, 242, 255]], sol: [[110, 190, 80], [205, 90, 65]],
    fond(ctx, W, H, hz, scroll) { tribunes(ctx, W, hz, scroll, [[255, 255, 255], [250, 200, 60], [90, 160, 240]]); },
    devant(ctx, W, H, hz, scroll, t, nuit, G) { for (let r = 0; r < 4; r++) trait(ctx, [0, hz + 26 + r * 22], [W, hz + 26 + r * 22], 3, [250, 240, 235]); } },
};
for (const [id, L] of Object.entries(LIEUX_SPORT)) {
  DECORS_EXTRA[id] = L; CIELS[id] = L.ciel; SOLS[id] = L.sol;
  TEXTES.fr.lieux[id] = L.fr; TEXTES.en.lieux[id] = L.en; ALIAS_DECOR[id] = id; LIEUX_ECRITURE.push(id);
  if (L.interieur) INTERIEURS.add(id);
}
MOTS_DECORS_EXTRA.unshift(
  ["\\bfoot(ball)?\\b|terrain de foot|stade de foot|\\bstade\\b|\\bsoccer|football pitch", "foot"], ["rugby", "rugby"], ["tennis", "tennis"],
  ["basket-?ball|terrain de basket|jou(e|er|ent|ons) au basket|\\bhoops?\\b", "basket"],
  ["natation|piscine municipale|plongeoir|cours de natation|nag(e|er|ent) des longueurs|\\bbrasse\\b|\\bcrawl\\b|swimming (pool|lesson)", "natation"],
  ["gymnase|gymnastique|\\bgym\\b|roulades?|galipettes?|\\bpoutre|trampoline|gymnastics", "gymnase"],
  ["cours de danse|salle de danse|danse classique|\\bballet|dance (class|studio)", "danseSalle"],
  ["poney-?club|centre equestre|equitation|fai(t|re|s) du (poney|cheval)|horse riding|pony club", "poney"],
  ["patinoire|patins? a glace|\\bpatin(e|er|ent|age)\\b|ice rink|ice skating", "patinoire"],
  ["\\bski(e|er|ent|ons|s)?\\b|piste de ski|telesiege|station de ski|\\bskiing", "ski"],
  ["skate(park|board)?|planche a roulettes", "skatepark"],
  ["athletisme|course a pied|piste d'athletisme|fai(t|re|sons|tes) la course|\\bsprint|running (race|track)", "athletisme"],
);

// ================================================================= les activités de sport
const ballon = (ctx, x, y, r = 16) => { rond(ctx, x, y, r, [255, 255, 255], 3); for (const [dx, dy] of [[0, 0], [-0.55, -0.45], [0.55, -0.45], [0, 0.65]]) rond(ctx, x + dx * r, y + dy * r, r * 0.3, [50, 50, 60]); };
const bravo = (ctx, e, x, y, mot) => { if (e.p !== null && e.p !== undefined && e.p > 0.75) { ecrireCentre(ctx, mot, x + 2, y + 3, 54, [120, 60, 20]); ecrireCentre(ctx, mot, x, y, 54, [255, 210, 60]); } };
const etoilesGagnees = (ctx, e, x, y) => { for (let i = 0; i < e.k; i++) etoile(ctx, x + (i - (e.k - 1) / 2) * 40, y, 16, [255, 210, 60], e.t); };
const prog = (e) => (e.p === null || e.p === undefined ? null : e.p);
const ACTIVITES_SPORT = {
  tirerBut: { fr: "Tirer au but", en: "Score a goal", decor: "foot", clics: 3, son: "boum",
    mots: "tir(e|er|ent|ons)? au but|marqu(e|er|ent|ons) (un|des) buts?|jou(e|er|ent|ons) au foot|\\bfootball\\b|score(s|d)? a goal|play(s|ing)? (football|soccer)",
    modele: ["On joue au foot ! {prenom} prend son élan… et tire au but !", "Let's play football! {prenom} runs up… and shoots!"],
    consigne: ["Touche le ballon pour tirer au but !", "Tap the ball to shoot!"],
    cible: (sc) => [sc.cx - 150, G - 20],
    dessin(ctx, x, G, e) {
      const gx = x + 270; // la cage
      for (let i = 0; i <= 8; i++) trait(ctx, [gx - 80 + i * 20, G - 170], [gx - 80 + i * 20 + 10, G], 1.5, [220, 225, 230]);
      for (let j = 0; j <= 8; j++) trait(ctx, [gx - 80, G - 170 + j * 21], [gx + 90, G - 170 + j * 21], 1.5, [220, 225, 230]);
      for (const d of [-90, 90]) rrect(ctx, gx + d - 6, G - 176, 12, 176, 3, [255, 255, 255], 3); rrect(ctx, gx - 96, G - 182, 192, 12, 3, [255, 255, 255], 3);
      const p = prog(e), dp = p === null ? 0 : p;
      dessineAmi(ctx, e.acteur || "arthur", x - 200 + 30 * Math.min(1, dp * 3), G, e.t, 1, dp * 8, 0, 0.9, "joie");
      if (p !== null) ballon(ctx, lerp(x - 150, gx, p), G - 16 - 70 * p - 110 * Math.sin(PI * p) + 70 * p * p);
      else if (e.k < e.n) ballon(ctx, x - 150, G - 16);
      for (let i = 0; i < Math.min(e.k, 3); i++) ballon(ctx, gx - 40 + i * 30, G - 16, 13);
      bravo(ctx, e, gx, G - 240, fr_en("BUT !", "GOAL!")); etoilesGagnees(ctx, e, x, G - 330);
    } },
  essai: { fr: "Marquer un essai", en: "Kick a conversion", decor: "rugby", clics: 3, son: "boum",
    mots: "\\bessais?\\b|jou(e|er|ent|ons) au rugby|transformation|ballon de rugby|rugby ball|\\brugby\\b",
    modele: ["Au rugby, {prenom} pose le ballon… et tape entre les grands poteaux !", "At rugby, {prenom} places the ball… and kicks it between the tall posts!"],
    consigne: ["Touche le ballon pour le taper entre les poteaux !", "Tap the ball to kick it through the posts!"],
    cible: (sc) => [sc.cx - 140, G - 24],
    dessin(ctx, x, G, e) {
      const px = x + 280; for (const d of [-60, 60]) rrect(ctx, px + d - 6, G - 360, 12, 360, 3, [255, 255, 255], 3); rrect(ctx, px - 66, G - 150, 132, 12, 3, [255, 255, 255], 3); // les poteaux en H
      const p = prog(e);
      dessineAmi(ctx, e.acteur || "arthur", x - 200, G, e.t, 1, (p || 0) * 8, 0, 0.9, "joie");
      const bx = p === null ? x - 140 : lerp(x - 140, px, p), by = p === null ? G - 24 : G - 24 - 300 * Math.sin(PI * p * 0.85);
      if (p !== null || e.k < e.n) { ctx.save(); ctx.translate(bx, by); ctx.rotate((p || 0) * 10); ovale(ctx, -22, -14, 44, 28, [180, 110, 60], 3); trait(ctx, [-10, 0], [10, 0], 2, [255, 255, 255]); ctx.restore(); }
      bravo(ctx, e, px, G - 400, fr_en("BRAVO !", "GREAT!")); etoilesGagnees(ctx, e, x - 60, G - 300);
    } },
  jouerTennis: { fr: "Jouer au tennis", en: "Play tennis", decor: "tennis", clics: 4, son: "pop",
    mots: "tennis|raquettes?|\\brackets?\\b",
    modele: ["Au tennis, la balle passe au-dessus du filet. Et hop, on la renvoie !", "At tennis, the ball flies over the net. Hop, hit it back!"],
    consigne: ["Touche la balle pour la renvoyer !", "Tap the ball to hit it back!"],
    cible(sc) { const u = sc.m.t * 1.4; return [sc.cx + 230 * Math.sin(u), G - 80 - 90 * Math.abs(Math.cos(u))]; },
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 4, G - 100, 8, 100, 2, [250, 250, 250], 2); for (let j = 0; j < 4; j++) trait(ctx, [x - 200, G - 90 + j * 18], [x + 200, G - 90 + j * 18], 1.5, [80, 80, 90]); for (let i = 0; i < 21; i++) trait(ctx, [x - 200 + i * 20, G - 92], [x - 200 + i * 20, G - 36], 1.5, [80, 80, 90]); rrect(ctx, x - 202, G - 96, 404, 8, 3, [255, 255, 255], 2);
      dessineAmi(ctx, e.acteur || "arthur", x - 290, G, e.t, 1, 0, 0, 0.9, "joie");
      ctx.save(); ctx.translate(x - 250, G - 110); ctx.rotate(-0.6 + 0.6 * Math.sin(e.t * 3)); trait(ctx, [0, 0], [0, -30], 5, [60, 60, 70]); ovale(ctx, -16, -64, 32, 40, [230, 240, 255], 4, [230, 70, 80]); ctx.restore();
      const u = e.t * 1.4; rond(ctx, x + 230 * Math.sin(u), G - 80 - 90 * Math.abs(Math.cos(u)), 11, [210, 240, 60], 2);
      etoilesGagnees(ctx, e, x, G - 300);
    } },
  panier: { fr: "Marquer un panier", en: "Shoot a hoop", decor: "basket", clics: 3, son: "pop",
    mots: "marqu(e|er|ent|ons) (un|des) paniers?|lanc(e|er|ent) (le ballon )?dans le panier|jou(e|er|ent|ons) au basket|basket-?ball|shoot(s|ing)? (a )?hoops?",
    modele: ["{prenom} lance le ballon… et hop, dans le panier !", "{prenom} throws the ball… and swish, in the hoop!"],
    consigne: ["Touche le ballon pour le lancer dans le panier !", "Tap the ball to throw it in the hoop!"],
    cible: (sc) => [sc.cx - 130, G - 160],
    dessin(ctx, x, G, e) {
      const hx = x + 250; rrect(ctx, hx + 50, G - 360, 14, 360, 3, [120, 125, 140], 3); rrect(ctx, hx + 30, G - 380, 20, 140, 4, [255, 255, 255], 3); rrect(ctx, hx + 32, G - 335, 16, 50, 2, null, 3, [230, 80, 60]);
      for (let i = 0; i < 6; i++) trait(ctx, [hx - 40 + i * 14, G - 290], [hx - 30 + i * 10, G - 240], 1.5, [240, 240, 240]);
      ovale(ctx, hx - 46, G - 298, 80, 16, null, 5, [235, 90, 50]);
      const p = prog(e);
      dessineAmi(ctx, e.acteur || "arthur", x - 170, G, e.t, 1, 0, 0, 0.9, "joie");
      const bx = p === null ? x - 130 : lerp(x - 130, hx - 6, p), by = p === null ? G - 160 : lerp(G - 160, G - 300, p) - 160 * Math.sin(PI * p) + (p > 0.85 ? (p - 0.85) * 400 : 0);
      if (p !== null || e.k < e.n) { rond(ctx, bx, by, 18, [240, 130, 50], 3); trait(ctx, [bx - 18, by], [bx + 18, by], 2, [120, 60, 30]); trait(ctx, [bx, by - 18], [bx, by + 18], 2, [120, 60, 30]); }
      bravo(ctx, e, hx - 10, G - 400, fr_en("PANIER !", "SWISH!")); etoilesGagnees(ctx, e, x - 60, G - 330);
    } },
  nager: { fr: "Nager", en: "Swim", decor: "natation", clics: 3, prendActeur: true, son: "splash",
    mots: "\\bnag(e|ent|er|eons|eait)\\b(?! sous)|natation|\\bbrasse\\b|\\bcrawl\\b|longueurs|\\bswim(s|ming)?\\b(?! underwater)",
    modele: ["Dans la piscine, {prenom} nage, nage… jusqu'au bout du bassin !", "In the pool, {prenom} swims and swims… all the way to the end!"],
    consigne: ["Touche l'eau pour nager plus loin !", "Tap the water to swim further!"],
    cible(sc) { return [sc.cx - 200 + 150 * Math.min(sc.fait + 1, sc.n), G - 40]; },
    dessin(ctx, x, G, e) {
      const px = x - 260 + 150 * (e.k + avanceEtape(e)), y = G - 40;
      ctx.save(); ctx.translate(px, y); ctx.rotate(PI / 2); (AMIS_DESSIN[e.acteur || "arthur"] || chat)(ctx, 0, 0, 0.8, e.t, 1, e.t * 6, 0, "joie"); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.7; rrect(ctx, x - 360, y - 6, 720, 60, 0, [90, 175, 230]); ctx.restore();
      for (let k = 0; k < 4; k++) rond(ctx, px - 30 - k * 16, y - 10 + 6 * Math.sin(e.t * 8 + k), 6 - k, [255, 255, 255]);
      etoilesGagnees(ctx, e, x, G - 300);
    } },
  roulade: { fr: "Faire des roulades", en: "Roly-polies", decor: "gymnase", clics: 3, prendActeur: true, son: "magie",
    mots: "roulades?|galipettes?|culbutes?|fai(t|re|s) de la gym|\\bgym\\b|gymnastique|poutre|somersaults?|forward rolls?|gymnastics|cartwheels?",
    modele: ["Sur le grand tapis bleu, {prenom} fait des roulades. Une, deux, trois !", "On the big blue mat, {prenom} does roly-polies. One, two, three!"],
    consigne: ["Touche le tapis pour faire une roulade !", "Tap the mat to do a roll!"],
    cible: (sc) => [sc.cx, G - 30],
    dessin(ctx, x, G, e) {
      rrect(ctx, x - 260, G - 26, 520, 28, 8, [90, 150, 230], 3); for (let k = 1; k < 5; k++) trait(ctx, [x - 260 + k * 104, G - 24], [x - 260 + k * 104, G], 2, [70, 120, 200]);
      const p = prog(e), px = x - 200 + 120 * (e.k + (p || 0)), st = STYLES[e.acteur || "arthur"], h = st ? (st.L + st.T + st.R) * 0.45 : 60;
      ctx.save(); ctx.translate(px, G - 26 - h); ctx.rotate((p || 0) * 2 * PI); (AMIS_DESSIN[e.acteur || "arthur"] || chat)(ctx, 0, h, 0.85, e.t, 1, 0, 0, e.k >= e.n ? "joie" : null); ctx.restore();
      etoilesGagnees(ctx, e, x, G - 300);
    } },
  monterPoney: { fr: "Faire du poney", en: "Pony ride", decor: "poney", clics: 3, prendActeur: true, son: "magie",
    mots: "mont(e|er|ent|ons) (sur |a )?(le |un |son )?(poney|cheval)|fai(t|re|s|sons) du (poney|cheval)|equitation|\\bgalop|rides? a (pony|horse)|horse riding",
    modele: ["{prenom} monte sur le poney. Au galop… et hop, par-dessus la barre !", "{prenom} rides the pony. Off we gallop… and hop, over the bar!"],
    consigne: ["Touche le poney pour sauter la barre !", "Tap the pony to jump the bar!"],
    cible: (sc) => [sc.cx - 170, G - 100],
    dessin(ctx, x, G, e) {
      for (const d of [-16, 16]) trait(ctx, [x + d, G], [x + d, G - 80], 5, [255, 255, 255]); rrect(ctx, x - 60, G - 64, 120, 10, 4, [230, 70, 80], 2); for (let k = 0; k < 3; k++) rrect(ctx, x - 40 + k * 40, G - 64, 20, 10, 0, [255, 255, 255]); // la barre
      const p = prog(e), px = p === null ? (e.k >= e.n ? x + 190 : x - 170) : x - 170 + 360 * p, py = p === null ? 0 : -120 * Math.sin(PI * p), s = 0.62;
      const k = e.acteur || "arthur", st = STYLES[k];
      (AMIS_DESSIN[k] || chat)(ctx, px - 8, G + py - 128 * s - 4 + (st ? st.L * 0.75 : 0), 0.75, e.t, 1, 0, 0, "joie");
      dessineAmi(ctx, "cheval", px, G + py, e.t, 1, p === null ? 0 : e.t * 10, 0, s);
    } },
  skier: { fr: "Faire du ski", en: "Skiing", decor: "ski", clics: 3, prendActeur: true, son: "magie",
    mots: "\\bski(e|er|ent|ons)\\b|fai(t|re|s|sons) du ski|\\bskiing\\b|\\bslalom",
    modele: ["Sur la piste, {prenom} descend à ski entre les petits drapeaux. Ziiiip !", "On the slope, {prenom} skis down between the little flags. Whoosh!"],
    consigne: ["Touche les skis pour descendre !", "Tap the skis to go down!"],
    cible(sc) { const u = Math.min(sc.fait, sc.n); return [sc.cx - 240 + 160 * u, G - 140 + 40 * u]; },
    dessin(ctx, x, G, e) {
      for (let k = 0; k < 4; k++) { const fx = x - 170 + k * 160, fy = G - 110 + k * 40; trait(ctx, [fx, fy], [fx, fy - 50], 3, CONTOUR); poly(ctx, [[fx, fy - 50], [fx + 26, fy - 42], [fx, fy - 34]], k % 2 ? [230, 70, 80] : [90, 140, 240], 2); }
      const u = e.k + avanceEtape(e), px = x - 240 + 160 * u, py = G - 120 + 40 * u;
      ctx.save(); ctx.translate(px, py); ctx.rotate(0.24); dessineAmi(ctx, e.acteur || "arthur", 0, 0, e.t, 1, 0, 0, 0.85, "joie");
      for (const d of [-10, 10]) rrect(ctx, -50 + d, -4 + d * 0.3, 100, 7, 3, [230, 80, 60], 2); ctx.restore();
      for (let k = 0; k < 4; k++) rond(ctx, px - 50 - k * 22, py - 6 - k * 9, 6 - k, [255, 255, 255], 1);
    } },
  skate: { fr: "Faire du skate", en: "Skateboarding", decor: "skatepark", clics: 3, prendActeur: true, son: "pop",
    mots: "skate(board)?|planche a roulettes",
    modele: ["Au skatepark, {prenom} roule sur sa planche… et saute sur la rampe !", "At the skatepark, {prenom} rolls on the board… and jumps off the ramp!"],
    consigne: ["Touche la planche pour sauter !", "Tap the board to jump!"],
    cible: (sc) => [sc.cx - 160, G - 30],
    dessin(ctx, x, G, e) {
      const rx = x + 230; ctx.beginPath(); ctx.moveTo(rx - 80, G); ctx.quadraticCurveTo(rx + 40, G, rx + 60, G - 120); ctx.lineTo(rx + 80, G - 120); ctx.lineTo(rx + 80, G); ctx.closePath(); ctx.fillStyle = css([170, 170, 178]); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = css([110, 110, 120]); ctx.stroke();
      const p = prog(e), px = p === null ? x - 160 : x - 160 + 380 * p, py = p === null ? 0 : -(p < 0.6 ? 120 * Math.pow(p / 0.6, 2) : 120 + 90 * Math.sin(PI * (p - 0.6) / 0.4)) + (p > 0.9 ? (p - 0.9) * 1200 : 0);
      ctx.save(); ctx.translate(px, G + Math.min(0, py)); ctx.rotate(p === null ? 0 : -0.5 * Math.sin(PI * p));
      dessineAmi(ctx, e.acteur || "arthur", 0, -12, e.t, 1, 0, 0, 0.85, "joie");
      rrect(ctx, -44, -12, 88, 9, 4, [250, 120, 60], 2); for (const d of [-28, 28]) rond(ctx, d, -1, 6, [60, 60, 70]);
      ctx.restore(); etoilesGagnees(ctx, e, x, G - 340);
    } },
  courir: { fr: "Faire la course", en: "Run a race", decor: "athletisme", clics: 3, prendActeur: true, son: "pop",
    mots: "fai(t|re|sons|tes) (une |la )course|course a pied|\\bsprint|athletisme|run(s|ning)? a race|have a race",
    modele: ["Prêts ? Partez ! {prenom} court, court, court… jusqu'à la ligne d'arrivée !", "Ready? Go! {prenom} runs and runs and runs… to the finish line!"],
    consigne: ["Touche pour courir plus vite !", "Tap to run faster!"],
    cible(sc) { return [sc.cx - 240 + 160 * Math.min(sc.fait, sc.n), G - 80]; },
    dessin(ctx, x, G, e) {
      const ax = x + 260; for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) rrect(ctx, ax - 8 + j * 8, G - 2 + i * 8 - 60, 8, 8, 0, (i + j) % 2 ? [40, 40, 50] : [255, 255, 255]); // la ligne d'arrivée
      for (const d of [-60, 60]) trait(ctx, [ax + d, G], [ax + d, G - 220], 5, [200, 200, 210]); rrect(ctx, ax - 70, G - 240, 140, 34, 6, [230, 70, 80], 3); ecrireCentre(ctx, fr_en("ARRIVÉE", "FINISH"), ax, G - 223, 20, [255, 255, 255]);
      const u = e.k + avanceEtape(e), px = x - 240 + 160 * u, fini = e.k >= e.n;
      dessineAmi(ctx, e.acteur || "arthur", px, G, e.t, 1, fini ? 0 : e.t * 12, 0, 0.92, "joie");
      if (fini) { trait(ctx, [px - 10, G - 140], [px, G - 110], 3, [90, 140, 240]); trait(ctx, [px + 10, G - 140], [px, G - 110], 3, [230, 70, 80]); rond(ctx, px, G - 104, 10, [255, 210, 60], 2); }
      for (let k = 0; k < 3; k++) trait(ctx, [px - 50 - k * 16, G - 60 + k * 14], [px - 30 - k * 16, G - 60 + k * 14], 2, [255, 255, 255], "round");
    } },
};
for (const [id, A] of Object.entries(ACTIVITES_SPORT)) {
  A.lieuFort = true; A.sansEngin = true; A.cx = A.cx || 480;
  ACTIVITES[id] = A;
  CLICS_DEFAUT[id] = A.clics; CONSIGNES[id] = A.consigne[0]; CONSIGNES_EN[id] = A.consigne[1];
  TEXTES.fr.actions[id] = A.fr; TEXTES.en.actions[id] = A.en; MODELES[id] = A.modele;
  ALIAS_ACTION[id] = id; ALIAS_ACTION[sansAccent(A.fr)] = id; ACTIONS.push(id);
  MOTS_ACTIVITES.unshift([new RegExp(A.mots), id]);
  if (!ACTIONS_ECRITURE.includes(id)) ACTIONS_ECRITURE.push(id);
}
Object.assign(ZONES_ACTIVITES, { tirerBut: [-250, 380], essai: [-250, 360], jouerTennis: [-330, 260], panier: [-220, 330], nager: [-300, 300], roulade: [-270, 270], monterPoney: [-260, 280], skier: [-300, 300], skate: [-210, 330], courir: [-290, 340] });
CATEGORIES_ACTIONS.push(["sport", "⚽", Object.keys(ACTIVITES_SPORT).concat(["danse", "glisser", "ballon", "velo"].filter((a) => ACTIVITES[a] || ACTIONS.includes(a)))]);
NOMS_CATEGORIES.fr.sport = "Sport"; NOMS_CATEGORIES.en.sport = "Sport";
// en faisant du poney, le poney est déjà dessiné (pas un deuxième cheval à côté)
{ const avant = etapesDepuisTexte;
  etapesDepuisTexte = function (lignes, prenom) {
    const etapes = avant(lignes, prenom);
    for (const et of etapes) if (et.action === "monterPoney") et.presents = et.presents.filter((id) => id !== "cheval");
    return etapes;
  }; }

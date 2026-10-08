// Les animaux de l'appli (dessinés comme Moustache et Rexou : formes rondes, contour fin, petit sourire).
// Chaque animal : (ctx, x, sol, taille, temps, sens, marche, mange). Ils s'ajoutent aux personnages des histoires.
"use strict";

const oeilA = (pen, x, y, r = 5) => { pen.circle([255, 255, 255], x, y, r + 2, true); pen.circle(CONTOUR, x + 1, y, r * 0.6); pen.circle([255, 255, 255], x + 2, y - 1.5, 1.4); };
const joueA = (pen, x, y, r = 6) => pen.circle([255, 150, 165], x, y, r);
const sourireA = (pen, x, y, w = 14) => pen.arc(CONTOUR, x - w / 2, y - w / 3, x + w / 2, y + w / 3, 0.15 * PI, 0.85 * PI, 2.5);
function pattes4(pen, col, xs, haut, bas, ep, marche) { // quatre pattes qui marchent
  xs.forEach((lx, k) => { const sw = Math.sin(marche + k * PI) * ep * 0.6; pen.bras(fonce(col, k % 2 ? 0.8 : 0.9), [lx, haut], [lx + sw, bas], ep); });
}

const ANIMAUX = {
  chien(ctx, x, g, s, t, f, marche, mange) {
    const col = [205, 150, 95], pen = new Pen(ctx, x, g, s, f);
    pen.bras(col, [-38, -40], [-56, -64 + 5 * Math.sin(t * 9)], 8); // la queue qui remue
    pattes4(pen, col, [-28, -14, 14, 28], -28, -3, 9, marche);
    pen.ellipse(col, -44, -58, 38, -20);
    const hx = 40, hy = -62 + 8 * mange;
    pen.ellipse(fonce(col, 0.75), hx - 30, hy - 14, hx - 12, hy + 22); // l'oreille
    pen.circle(col, hx, hy, 22, true);
    pen.ellipse(clair(col, 0.45), hx + 6, hy - 2, hx + 34, hy + 16);
    pen.circle(CONTOUR, hx + 31, hy + 2, 5);
    oeilA(pen, hx + 4, hy - 8, 4.5); sourireA(pen, hx + 20, hy + 13, 12);
  },
  lapin(ctx, x, g, s, t, f, marche) {
    const col = [235, 230, 225], pen = new Pen(ctx, x, g, s, f), saut = Math.abs(Math.sin(marche * 0.5)) * 8;
    pen.circle([255, 255, 255], -34, -26 - saut, 12, true); // la queue pompon
    pen.ellipse(col, -36, -60 - saut, 30, -6 - saut);
    pen.ellipse(fonce(col, 0.9), -10, -14 - saut, 30, 0 - saut);
    const hx = 22, hy = -66 - saut;
    for (const dx of [-8, 8]) { pen.ellipse(col, hx + dx - 7, hy - 62, hx + dx + 7, hy - 12); pen.ellipse([255, 180, 190], hx + dx - 3, hy - 54, hx + dx + 3, hy - 20, false); }
    pen.circle(col, hx, hy, 22, true);
    oeilA(pen, hx + 6, hy - 6, 4.5); pen.circle([255, 130, 150], hx + 20, hy + 2, 3.5); joueA(pen, hx - 4, hy + 8, 5);
  },
  vache(ctx, x, g, s, t, f, marche, mange) {
    const col = [252, 250, 245], pen = new Pen(ctx, x, g, s, f);
    pen.bras(col, [-62, -88], [-80, -48 + 4 * Math.sin(t * 3)], 5); pen.circle(CONTOUR, -80, -46 + 4 * Math.sin(t * 3), 6);
    pattes4(pen, col, [-44, -26, 26, 44], -50, -4, 13, marche);
    pen.ellipse(col, -66, -120, 64, -44);
    pen.ellipse([60, 55, 60], -40, -112, -6, -80, false); pen.ellipse([60, 55, 60], 12, -96, 40, -64, false); // les taches
    pen.ellipse([255, 180, 195], -14, -56, 14, -38); // la mamelle
    const hx = 70, hy = -118 + 10 * mange;
    pen.poly([235, 220, 180], [[hx - 22, hy - 22], [hx - 30, hy - 44], [hx - 12, hy - 26]]); pen.poly([235, 220, 180], [[hx + 12, hy - 26], [hx + 28, hy - 44], [hx + 22, hy - 22]]);
    pen.ellipse(col, hx - 26, hy - 30, hx + 26, hy + 18);
    pen.ellipse([255, 190, 200], hx - 20, hy + 2, hx + 26, hy + 30);
    for (const dx of [-6, 10]) pen.circle(fonce([255, 190, 200], 0.7), hx + dx, hy + 16, 3);
    oeilA(pen, hx - 8, hy - 10, 5); oeilA(pen, hx + 12, hy - 10, 5);
  },
  cochon(ctx, x, g, s, t, f, marche, mange) {
    const col = [255, 175, 190], pen = new Pen(ctx, x, g, s, f);
    pen.arc(fonce(col, 0.8), -66, -66, -46, -46, 0, 1.6 * PI, 4);
    pattes4(pen, col, [-30, -14, 14, 30], -30, -3, 11, marche);
    pen.ellipse(col, -52, -84, 44, -22);
    const hx = 46, hy = -66 + 8 * mange;
    pen.poly(fonce(col, 0.92), [[hx - 16, hy - 18], [hx - 10, hy - 40], [hx, hy - 20]]);
    pen.circle(col, hx, hy, 26, true);
    pen.ellipse(fonce(col, 0.9), hx + 14, hy - 4, hx + 38, hy + 18);
    for (const dy of [3, 11]) pen.circle(fonce(col, 0.6), hx + 26, hy + dy, 2.5);
    oeilA(pen, hx + 2, hy - 8, 4.5); joueA(pen, hx - 6, hy + 10, 5);
  },
  mouton(ctx, x, g, s, t, f, marche, mange) {
    const laine = [250, 248, 240], peau = [80, 70, 75], pen = new Pen(ctx, x, g, s, f);
    pattes4(pen, peau, [-26, -12, 12, 26], -30, -3, 8, marche);
    for (const [dx, dy, r] of [[-36, -62, 22], [-12, -74, 26], [16, -70, 24], [30, -56, 20], [-20, -46, 22], [8, -44, 22]]) pen.circle(laine, dx, dy, r, true);
    const hx = 44, hy = -66 + 8 * mange;
    pen.ellipse(peau, hx - 20, hy - 8, hx - 6, hy + 4);
    pen.ellipse(peau, hx - 12, hy - 20, hx + 22, hy + 22);
    for (const dx of [-14, -2, 10]) pen.circle(laine, hx + dx, hy - 20, 8);
    oeilA(pen, hx + 4, hy - 4, 4); sourireA(pen, hx + 8, hy + 10, 10);
  },
  cheval(ctx, x, g, s, t, f, marche, mange) {
    const col = [170, 110, 70], crin = [80, 50, 35], pen = new Pen(ctx, x, g, s, f);
    pen.bras(crin, [-58, -112], [-82, -64 + 4 * Math.sin(t * 3)], 12);
    pattes4(pen, col, [-42, -26, 26, 42], -80, -4, 12, marche);
    for (const lx of [-42, -26, 26, 42]) pen.ellipse(CONTOUR, lx - 8, -10, lx + 8, 0, false);
    pen.ellipse(col, -64, -138, 60, -70);
    pen.bras(col, [36, -120], [62, -170], 30); // le cou
    const hx = 72, hy = -176 + 12 * mange;
    pen.ellipse(col, hx - 22, hy - 22, hx + 40, hy + 18);
    pen.ellipse(clair(col, 0.25), hx + 14, hy - 6, hx + 42, hy + 18);
    pen.poly(col, [[hx - 16, hy - 18], [hx - 12, hy - 40], [hx - 2, hy - 20]]);
    for (let k = 0; k < 4; k++) pen.circle(crin, 44 - k * 7, -150 + k * 16, 9);
    oeilA(pen, hx, hy - 6, 5); pen.circle(fonce(col, 0.6), hx + 34, hy + 8, 2.5);
  },
  poule(ctx, x, g, s, t, f, marche, mange) {
    const col = [255, 255, 250], pen = new Pen(ctx, x, g, s, f), pique = 10 * mange;
    for (const lx of [-8, 8]) { const sw = Math.sin(marche + (lx > 0 ? PI : 0)) * 6; pen.bras([240, 170, 40], [lx, -22], [lx + sw, -2], 4); }
    pen.poly(col, [[-36, -40], [-50, -66], [-28, -52]]);
    pen.ellipse(col, -32, -58, 30, -18);
    pen.ellipse(fonce(col, 0.92), -18, -46, 8, -28, false);
    const hx = 22, hy = -66 + pique;
    pen.poly([235, 60, 60], [[hx - 8, hy - 16], [hx - 4, hy - 26], [hx + 2, hy - 18], [hx + 6, hy - 26], [hx + 10, hy - 14]], false);
    pen.circle(col, hx, hy, 16, true);
    pen.poly([250, 180, 40], [[hx + 14, hy - 4], [hx + 28, hy + 1], [hx + 14, hy + 6]]);
    pen.ellipse([235, 60, 60], hx + 8, hy + 6, hx + 14, hy + 16, false);
    oeilA(pen, hx + 4, hy - 4, 3.5);
  },
  canard(ctx, x, g, s, t, f, marche, mange) {
    const col = [255, 220, 70], pen = new Pen(ctx, x, g, s, f), pique = 8 * mange;
    for (const lx of [-6, 8]) { const sw = Math.sin(marche + (lx > 0 ? PI : 0)) * 5; pen.bras([250, 140, 40], [lx, -16], [lx + sw, -2], 4); pen.ellipse([250, 140, 40], lx + sw - 2, -5, lx + sw + 14, 0, false); }
    pen.ellipse(col, -34, -46, 30, -12);
    pen.poly(col, [[-32, -34], [-46, -48], [-30, -44]]);
    pen.ellipse(fonce(col, 0.9), -16, -38, 10, -22, false);
    const hx = 20, hy = -60 + pique;
    pen.circle(col, hx, hy, 16, true);
    pen.ellipse([250, 140, 40], hx + 10, hy - 2, hx + 34, hy + 8);
    oeilA(pen, hx + 2, hy - 5, 3.5); joueA(pen, hx - 4, hy + 6, 4);
  },
  lion(ctx, x, g, s, t, f, marche, mange) {
    const col = [245, 190, 80], criniere = [210, 120, 50], pen = new Pen(ctx, x, g, s, f);
    pen.bras(col, [-50, -70], [-82, -56 + 6 * Math.sin(t * 3)], 7); pen.circle(criniere, -84, -56 + 6 * Math.sin(t * 3), 9);
    pattes4(pen, col, [-36, -20, 20, 36], -40, -3, 13, marche);
    pen.ellipse(col, -56, -92, 44, -30);
    const hx = 50, hy = -98 + 8 * mange;
    for (let k = 0; k < 12; k++) { const a = (k / 12) * 2 * PI; pen.circle(criniere, hx + 34 * Math.cos(a), hy + 34 * Math.sin(a), 15); }
    pen.circle(col, hx, hy, 30, true);
    pen.ellipse(clair(col, 0.5), hx + 2, hy + 2, hx + 30, hy + 24);
    pen.poly([150, 80, 60], [[hx + 12, hy + 4], [hx + 24, hy + 4], [hx + 18, hy + 11]], false);
    oeilA(pen, hx - 6, hy - 10, 5); oeilA(pen, hx + 14, hy - 10, 5); sourireA(pen, hx + 18, hy + 17, 12);
  },
  elephant(ctx, x, g, s, t, f, marche, mange) {
    const col = [165, 175, 195], pen = new Pen(ctx, x, g, s, f);
    pen.bras(col, [-74, -110], [-90, -80 + 4 * Math.sin(t * 3)], 5);
    pattes4(pen, col, [-50, -26, 26, 50], -60, -2, 24, marche);
    pen.ellipse(col, -80, -168, 70, -52);
    const hx = 72, hy = -146;
    pen.ellipse(fonce(col, 0.92), hx - 50, hy - 46, hx - 2, hy + 26); // l'oreille
    pen.circle(col, hx, hy, 40, true);
    const trompe = mange ? -20 * mange : 6 * Math.sin(t * 2);
    pen.bras(col, [hx + 30, hy + 4], [hx + 58, hy + 50], 18); pen.bras(col, [hx + 58, hy + 50], [hx + 70, hy + 74 + trompe], 14);
    pen.poly([255, 255, 245], [[hx + 22, hy + 22], [hx + 40, hy + 40], [hx + 18, hy + 32]]);
    oeilA(pen, hx + 10, hy - 12, 5); joueA(pen, hx - 6, hy + 10, 8);
  },
  girafe(ctx, x, g, s, t, f, marche, mange) {
    const col = [250, 205, 90], tache = [200, 130, 60], pen = new Pen(ctx, x, g, s, f);
    pen.bras(col, [-44, -110], [-58, -76], 4);
    pattes4(pen, col, [-32, -18, 18, 32], -100, -3, 10, marche);
    pen.ellipse(col, -50, -142, 44, -96);
    for (const [dx, dy] of [[-30, -128], [-6, -116], [18, -130], [-20, -108]]) pen.circle(tache, dx, dy, 7);
    const balance = 6 * Math.sin(t * 1.5), hx = 52 + balance, hy = -268 + 30 * mange;
    pen.bras(col, [28, -128], [hx - 6, hy + 16], 22); // le grand cou
    for (let k = 1; k < 5; k++) pen.circle(tache, 28 + (hx - 34) * (k / 5), -128 + (hy + 144) * (k / 5), 6);
    for (const dx of [-8, 6]) { pen.line(col, [hx + dx, hy - 14], [hx + dx, hy - 32], 4); pen.circle(tache, hx + dx, hy - 34, 5); }
    pen.ellipse(col, hx - 18, hy - 18, hx + 34, hy + 18);
    pen.ellipse(clair(col, 0.4), hx + 12, hy - 4, hx + 36, hy + 16);
    oeilA(pen, hx + 2, hy - 6, 4.5); sourireA(pen, hx + 22, hy + 10, 10);
  },
  singe(ctx, x, g, s, t, f, marche, mange) {
    const col = [150, 100, 65], peau = [240, 200, 160], pen = new Pen(ctx, x, g, s, f), dy = -Math.abs(Math.sin(t * 3)) * 4;
    pen.arc(col, -50, -70 + dy, -14, -30 + dy, 0.6 * PI, 1.9 * PI, 6); // la queue en boucle
    for (const lx of [-12, 12]) { const sw = Math.sin(marche + (lx > 0 ? PI : 0)) * 6; pen.bras(col, [lx, -36 + dy], [lx + sw, -3], 10); }
    pen.ellipse(col, -24, -86 + dy, 24, -30 + dy);
    pen.ellipse(peau, -12, -76 + dy, 14, -40 + dy, false);
    pen.bras(col, [16, -74 + dy], [34, -96 + dy + 8 * Math.sin(t * 4)], 8); // il fait coucou
    const hx = 4, hy = -110 + dy + 6 * mange;
    for (const ex of [-26, 26]) pen.circle(peau, hx + ex, hy, 10, true);
    pen.circle(col, hx, hy, 24, true);
    pen.ellipse(peau, hx - 18, hy - 14, hx + 18, hy + 20);
    oeilA(pen, hx - 7, hy - 4, 4); oeilA(pen, hx + 7, hy - 4, 4); sourireA(pen, hx, hy + 10, 12);
  },
  ours(ctx, x, g, s, t, f, marche, mange) {
    const col = [160, 105, 70], pen = new Pen(ctx, x, g, s, f);
    pattes4(pen, col, [-40, -22, 22, 40], -50, -3, 18, marche);
    pen.ellipse(col, -62, -120, 52, -38);
    const hx = 56, hy = -110 + 8 * mange;
    for (const ex of [-20, 20]) { pen.circle(col, hx + ex, hy - 24, 11, true); pen.circle(clair(col, 0.4), hx + ex, hy - 24, 5); }
    pen.circle(col, hx, hy, 30, true);
    pen.ellipse(clair(col, 0.45), hx + 2, hy, hx + 34, hy + 22);
    pen.circle(CONTOUR, hx + 30, hy + 6, 5);
    oeilA(pen, hx - 2, hy - 10, 4.5); oeilA(pen, hx + 16, hy - 10, 4.5); joueA(pen, hx - 14, hy + 8, 6);
  },
  pingouin(ctx, x, g, s, t, f, marche) {
    const col = [45, 50, 70], pen = new Pen(ctx, x, g, s, f), tangue = 0.12 * Math.sin(marche * 2);
    for (const lx of [-10, 10]) pen.ellipse([250, 150, 40], lx - 10, -6, lx + 12, 2);
    pen.ellipse(col, -28, -96, 28, -4);
    pen.ellipse([255, 255, 255], -18, -80, 22, -8, false);
    for (const k of [-1, 1]) pen.poly(col, [[k * 22, -70], [k * 36, -40 + 10 * tangue * k], [k * 24, -34]]);
    const hy = -96;
    pen.circle(col, 2, hy, 22, true);
    pen.ellipse([255, 255, 255], -8, hy - 8, 16, hy + 14, false);
    pen.poly([250, 150, 40], [[14, hy + 2], [30, hy + 6], [14, hy + 10]]);
    oeilA(pen, 6, hy - 2, 4); joueA(pen, -2, hy + 8, 4);
  },
};
// leur taille (pour l'ombre, la bouche des bulles et l'écran libre) : [largeur, hauteur, x de la bouche, y de la bouche]
const MESURES_ANIMAUX = {
  chien: [110, 90, 52, -50], lapin: [80, 140, 34, -60], vache: [200, 170, 80, -100], cochon: [130, 100, 60, -56],
  mouton: [120, 100, 54, -58], cheval: [180, 220, 100, -160], poule: [80, 100, 36, -60], canard: [80, 80, 36, -56],
  lion: [150, 150, 66, -88], elephant: [230, 210, 120, -130], girafe: [140, 300, 76, -258], singe: [90, 150, 6, -96],
  ours: [150, 160, 70, -96], pingouin: [80, 130, 20, -90],
};
const NOMS_ANIMAUX = {
  fr: { chien: "le chien", lapin: "le lapin", vache: "la vache", cochon: "le cochon", mouton: "le mouton", cheval: "le cheval", poule: "la poule",
    canard: "le canard", lion: "le lion", elephant: "l'éléphant", girafe: "la girafe", singe: "le singe", ours: "l'ours", pingouin: "le pingouin" },
  en: { chien: "the dog", lapin: "the bunny", vache: "the cow", cochon: "the pig", mouton: "the sheep", cheval: "the horse", poule: "the hen",
    canard: "the duck", lion: "the lion", elephant: "the elephant", girafe: "the giraffe", singe: "the monkey", ours: "the bear", pingouin: "the penguin" },
};
const MOTS_ANIMAUX = [ // pour les reconnaître dans un texte (français et anglais, singulier et pluriel)
  ["chien", "\\b(chiens?|chiots?|toutous?|dogs?|puppy|puppies)\\b"], ["lapin", "\\b(lapins?|lapereaux?|bunny|bunnies|rabbits?)\\b"],
  ["vache", "\\b(vaches?|veaux?|cows?|calf)\\b"], ["cochon", "\\b(cochons?|porcelets?|pigs?|piggy)\\b"],
  ["mouton", "\\b(moutons?|agneaux?|brebis|sheep|lambs?)\\b"], ["cheval", "\\b(chevaux|cheval|poneys?|horses?|pony|ponies)\\b"],
  ["poule", "\\b(poules?|poussins?|coqs?|hens?|chickens?|chicks?)\\b"], ["canard", "\\b(canards?|canetons?|ducks?|ducklings?)\\b"],
  ["lion", "\\b(lions?|lionnes?)\\b"], ["elephant", "\\b(elephants?|elephanteaux?)\\b"], ["girafe", "\\b(girafes?|giraffes?)\\b"],
  ["singe", "\\b(singes?|monkeys?)\\b"], ["ours", "\\b(ours|oursons?|bears?|teddy bear)\\b"], ["pingouin", "\\b(pingouins?|manchots?|penguins?)\\b"],
];

// on les ajoute aux personnages de l'appli
for (const [id, dessin] of Object.entries(ANIMAUX)) {
  AMIS_DESSIN[id] = (ctx, x, g, s, t, f, marche, mange) => dessin(ctx, x, g, s, t, f, marche, mange);
  const [w, h] = MESURES_ANIMAUX[id];
  LARGEUR_OMBRE[id] = Math.min(1, w / 230);
  TAILLE_AMI[id] = [w, h];
}
MOTS_PERSOS.push(...MOTS_ANIMAUX);
Object.assign(NOMS_PERSOS.fr, NOMS_ANIMAUX.fr); Object.assign(NOMS_PERSOS.en, NOMS_ANIMAUX.en);
ANIMAUX_ECRITURE.push(...Object.keys(ANIMAUX));
const _boucheAmi = boucheAmi;
boucheAmi = function (kind, x, g, f = 1, s = 1) { // la bulle part de la bouche de l'animal
  const m = MESURES_ANIMAUX[kind];
  return m ? [x + f * m[2] * s, g + m[3] * s] : _boucheAmi(kind, x, g, f, s);
};

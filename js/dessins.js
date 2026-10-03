// Tous les dessins : véhicules rigolos, décors, personnages, objets des histoires.
// (Version web de dessins.py — mêmes coordonnées, dessinées sur un <canvas>.)
"use strict";

const COULEURS = {
  jaune: [250, 200, 40], orange: [255, 140, 30], rouge: [225, 55, 50], bleu: [55, 125, 235],
  vert: [60, 175, 80], violet: [150, 85, 205], rose: [245, 120, 180],
};
const CONTOUR = [45, 35, 40], PNEU = [50, 50, 58], JANTE = [190, 190, 200], VITRE = [190, 230, 255], GRIS = [150, 150, 160];
const PI = Math.PI;
const COULEUR_DEFAUT = { tractopelle: "jaune", benne: "orange", toupie: "bleu", pompier: "rouge", bulldozer: "vert", grue: "violet" };

const css = (c, a) => (a === undefined ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);
const fonce = (c, k = 0.7) => c.map((v) => Math.max(0, Math.floor(v * k)));
const clair = (c, k = 0.5) => c.map((v) => Math.min(255, Math.floor(v + (255 - v) * k)));
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (a, n) => ((a % n) + n) % n;

function hasard(graine) { // générateur pseudo-aléatoire reproductible
  let a = graine >>> 0;
  const f = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.uniform = (x, y) => x + (y - x) * f();
  f.int = (x, y) => Math.floor(x + (y - x + 1) * f());
  return f;
}

// ------------------------------------------------------------ primitives (coordonnées écran)
function rrect(ctx, x, y, w, h, rad, fill, bord, colBord = CONTOUR) {
  ctx.beginPath();
  if (rad > 0) ctx.roundRect(x, y, w, h, Math.min(rad, w / 2, h / 2)); else ctx.rect(x, y, w, h);
  if (fill) { ctx.fillStyle = css(fill); ctx.fill(); }
  if (bord) { ctx.lineWidth = bord; ctx.strokeStyle = css(colBord); ctx.stroke(); }
}
function ovale(ctx, x, y, w, h, fill, bord, colBord = CONTOUR) {
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * PI);
  if (fill) { ctx.fillStyle = css(fill); ctx.fill(); }
  if (bord) { ctx.lineWidth = bord; ctx.strokeStyle = css(colBord); ctx.stroke(); }
}
function rond(ctx, x, y, r, fill, bord, colBord = CONTOUR) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, r), 0, 2 * PI);
  if (fill) { ctx.fillStyle = css(fill); ctx.fill(); }
  if (bord) { ctx.lineWidth = bord; ctx.strokeStyle = css(colBord); ctx.stroke(); }
}
function poly(ctx, pts, fill, bord, colBord = CONTOUR) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); ctx.lineJoin = "round";
  if (fill) { ctx.fillStyle = css(fill); ctx.fill(); }
  if (bord) { ctx.lineWidth = bord; ctx.strokeStyle = css(colBord); ctx.stroke(); }
}
function trait(ctx, a, b, w, col, cap = "butt") {
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
  ctx.lineWidth = w; ctx.strokeStyle = css(col); ctx.lineCap = cap; ctx.stroke(); ctx.lineCap = "butt";
}
// arc à la façon pygame : angles en sens trigonométrique (y vers le haut) dans le rectangle donné
function arcRect(ctx, x, y, w, h, a0, a1, lw, col) {
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, -a1, -a0);
  ctx.lineWidth = lw; ctx.strokeStyle = css(col); ctx.stroke();
}

class Pen {
  // (0,0) = sol sous le centre du personnage, y négatif vers le haut, x vers l'avant ; échelle + miroir
  constructor(ctx, x, g, s = 1, f = 1) { Object.assign(this, { ctx, x, g, s, f }); }
  P(dx, dy) { return [this.x + this.f * dx * this.s, this.g + dy * this.s]; }
  R(x1, y1, x2, y2) { const a = this.P(x1, y1), b = this.P(x2, y2); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]) + 1, Math.abs(b[1] - a[1]) + 1]; }
  w(w) { return w ? Math.max(1, Math.round(w * this.s)) : 0; }
  rect(c, x1, y1, x2, y2, rad = 0, contour = true) { const r = this.R(x1, y1, x2, y2); rrect(this.ctx, ...r, rad * this.s, c, contour ? this.w(3) : 0); }
  ellipse(c, x1, y1, x2, y2, contour = true) { const r = this.R(x1, y1, x2, y2); ovale(this.ctx, ...r, c, contour ? this.w(3) : 0); }
  circle(c, dx, dy, r, contour = false) { const p = this.P(dx, dy); rond(this.ctx, p[0], p[1], Math.max(1, r * this.s), c, contour ? this.w(3) : 0); }
  poly(c, pts, contour = true) { poly(this.ctx, pts.map((q) => this.P(q[0], q[1])), c, contour ? this.w(3) : 0); }
  line(c, a, b, w = 3) { trait(this.ctx, this.P(...a), this.P(...b), this.w(w), c); }
  bras(c, a, b, w) { // trait épais aux bouts arrondis, avec contour
    const pa = this.P(...a), pb = this.P(...b), ww = this.w(w);
    trait(this.ctx, pa, pb, ww + this.w(5), CONTOUR, "round");
    trait(this.ctx, pa, pb, ww, c, "round");
  }
  arc(c, x1, y1, x2, y2, a0, a1, w = 3) { const r = this.R(x1, y1, x2, y2); arcRect(this.ctx, ...r, a0, a1, this.w(w), c); }
}

// ------------------------------------------------------------ pièces des véhicules
function roue(pen, cx, r, rot) {
  pen.circle(PNEU, cx, -r, r, true);
  pen.circle(JANTE, cx, -r, r * 0.58);
  for (let k = 0; k < 4; k++) {
    const a = rot + (k * PI) / 2;
    pen.line(GRIS, [cx, -r], [cx + Math.cos(a) * r * 0.5, -r + Math.sin(a) * r * 0.5], 4);
  }
  pen.circle(fonce(JANTE), cx, -r, r * 0.2);
}

function visage(pen, cx, cy, sz, t, dort = false) {
  const cligne = mod(t, 3.7) < 0.13;
  for (const ex of [-0.45, 0.45]) {
    const x = cx + ex * sz;
    if (dort || cligne) pen.arc(CONTOUR, x - 0.25 * sz, cy - 0.15 * sz, x + 0.25 * sz, cy + 0.2 * sz, PI, 2 * PI, 3);
    else {
      pen.ellipse([255, 255, 255], x - 0.26 * sz, cy - 0.34 * sz, x + 0.26 * sz, cy + 0.34 * sz);
      pen.circle([30, 30, 40], x + 0.07 * sz, cy + 0.04 * sz, 0.14 * sz);
      pen.circle([255, 255, 255], x + 0.11 * sz, cy - 0.03 * sz, 0.05 * sz);
    }
  }
  pen.circle([255, 150, 160], cx - 0.75 * sz, cy + 0.32 * sz, 0.12 * sz);
  pen.circle([255, 150, 160], cx + 0.75 * sz, cy + 0.32 * sz, 0.12 * sz);
  if (dort) pen.circle(CONTOUR, cx, cy + 0.45 * sz, 0.09 * sz);
  else pen.arc(CONTOUR, cx - 0.32 * sz, cy + 0.05 * sz, cx + 0.32 * sz, cy + 0.55 * sz, PI, 2 * PI, 3);
}

function cabineAvant(pen, col, t, dort, x1 = 45, x2 = 105, haut = -140) {
  pen.rect(col, x1, haut, x2, -42, 12);
  pen.rect(VITRE, x1 + 9, haut + 10, x2 - 6, haut + 52, 8);
  visage(pen, (x1 + x2) / 2 + 1, haut + 31, 17, t, dort);
  pen.rect([255, 240, 150], x2 - 6, -72, x2 + 3, -58, 3);
}

const VEHICULES_DESSIN = {
  tractopelle(pen, col, t, outil, rot, dort) {
    pen.bras(fonce(col), [-78, -82], [-112, -132], 9);
    pen.bras(fonce(col), [-112, -132], [-128, -62], 8);
    pen.poly(GRIS, [[-140, -70], [-118, -70], [-120, -48], [-138, -50]]);
    pen.rect(col, -82, -88, 82, -30, 10);
    pen.rect(col, 12, -112, 80, -84, 8);
    pen.rect(GRIS, 4, -138, 12, -110, 2);
    pen.rect(col, -74, -168, -6, -84, 10);
    pen.rect(fonce(col, 0.55), -80, -176, 2, -164, 6);
    pen.rect(VITRE, -66, -158, -14, -106, 8);
    visage(pen, -40, -131, 20, t, dort);
    roue(pen, -45, 36, rot);
    roue(pen, 55, 25, rot * 1.4);
    const bx = lerp(112, 100, outil), by = lerp(-22, -150, outil);
    pen.bras(fonce(col), [35, -92], [bx - 6, by], 11);
    pen.poly(GRIS, [[bx - 20, by - 18], [bx + 22, by - 22], [bx + 28, by + 16], [bx - 14, by + 18]]);
    pen.line(CONTOUR, [bx + 24, by + 12], [bx + 32, by + 20], 4);
    return [bx + 6, by];
  },
  benne(pen, col, t, outil, rot, dort) {
    pen.rect([80, 80, 90], -100, -48, 104, -26, 4);
    const a = outil * (38 * PI / 180), px = -98, py = -50;
    const rp = (dx, dy) => [px + dx * Math.cos(a) + dy * Math.sin(a), py - dx * Math.sin(a) + dy * Math.cos(a)];
    pen.poly([150, 100, 60], [[10, -70], [40, -98], [80, -104], [118, -88], [130, -70]].map((p) => rp(...p)));
    pen.poly(col, [[0, 0], [132, 0], [138, -72], [-6, -72]].map((p) => rp(...p)));
    for (const k of [30, 66, 102]) pen.line(fonce(col), rp(k, -6), rp(k, -66), 3);
    cabineAvant(pen, col, t, dort);
    for (const cx of [-62, -8, 74]) roue(pen, cx, 27, rot);
    return rp(66, -90);
  },
  toupie(pen, col, t, outil, rot, dort) {
    pen.rect([80, 80, 90], -100, -48, 104, -26, 4);
    pen.bras(GRIS, [-100, -70], [-126, -44], 7);
    pen.ellipse(col, -108, -138, 40, -46);
    const phase = t * (1.2 + 4 * outil);
    for (let k = 0; k < 4; k++) {
      const u = mod(phase * 0.35 + k / 4, 1), x = lerp(-95, 28, u), larg = 10 * Math.sin(PI * u) + 2;
      pen.ellipse(clair(col, 0.55), x - larg, -112, x + larg, -72, false);
    }
    pen.rect(fonce(col), 10, -108, 46, -60, 6);
    cabineAvant(pen, col, t, dort);
    for (const cx of [-62, -8, 74]) roue(pen, cx, 27, rot);
    return [-126, -44];
  },
  pompier(pen, col, t, outil, rot, dort) {
    pen.rect(col, -104, -112, 110, -30, 12);
    pen.rect([255, 255, 255], -104, -58, 110, -50, 0, false);
    for (const x1 of [-94, -50]) pen.rect(fonce(col, 0.8), x1, -102, x1 + 38, -64, 6);
    pen.rect(VITRE, 64, -102, 104, -64, 8);
    visage(pen, 84, -83, 16, t, dort);
    pen.rect(Math.floor(t * 5) % 2 ? [80, 160, 255] : [210, 235, 255], 72, -126, 92, -112, 5);
    const a = (4 + outil * 26) * PI / 180, x0 = -96, y0 = -118, L = 160;
    const x1 = x0 + L * Math.cos(a), y1 = y0 - L * Math.sin(a);
    for (const off of [0, -12]) pen.line(JANTE, [x0, y0 + off], [x1, y1 + off], 5);
    for (let k = 1; k < 8; k++) { const xa = lerp(x0, x1, k / 8), ya = lerp(y0, y1, k / 8); pen.line(JANTE, [xa, ya], [xa, ya - 12], 3); }
    pen.rect([90, 90, 100], x1 - 4, y1 - 20, x1 + 14, y1 - 6, 3);
    for (const cx of [-58, 8, 76]) roue(pen, cx, 27, rot);
    return [x1 + 16, y1 - 13];
  },
  bulldozer(pen, col, t, outil, rot, dort) {
    pen.rect([70, 70, 78], -84, -52, 74, -2, 25);
    [-58, -24, 12, 48].forEach((cx, k) => {
      pen.circle(JANTE, cx, -26, 15, true);
      const a = rot + k;
      pen.line(GRIS, [cx, -26], [cx + 9 * Math.cos(a), -26 + 9 * Math.sin(a)], 3);
    });
    pen.rect(col, -72, -96, 58, -50, 8);
    pen.rect(col, -62, -164, 0, -92, 10);
    pen.rect(fonce(col, 0.55), -68, -172, 6, -160, 6);
    pen.rect(VITRE, -54, -154, -8, -104, 8);
    visage(pen, -31, -129, 18, t, dort);
    const bas = -4 - outil * 55;
    pen.bras(fonce(col), [40, -72], [98, bas - 30], 10);
    pen.rect(fonce(col, 0.8), 92, bas - 72, 116, bas, 6);
    return [118, bas - 36];
  },
  grue(pen, col, t, outil, rot, dort) {
    pen.rect(col, -104, -62, 108, -26, 6);
    pen.rect(fonce(col), -60, -96, 20, -60, 8);
    const a = PI / 4, x0 = -20, y0 = -86, L = 280, x1 = x0 + L * Math.cos(a), y1 = y0 - L * Math.sin(a);
    pen.bras(fonce(col), [x0, y0], [x1, y1], 14);
    for (let k = 1; k < 10; k++) {
      const u = (k - 0.5) / 10, v = k / 10;
      pen.line(clair(col, 0.3), [lerp(x0, x1, u), lerp(y0, y1, u)], [lerp(x0, x1, v), lerp(y0, y1, v)], 3);
    }
    pen.rect([255, 220, 120], 58, -126, 108, -60, 10);
    pen.rect(VITRE, 66, -118, 102, -84, 7);
    visage(pen, 84, -101, 14, t, dort);
    const cy = y1 + 70 + outil * 170;
    pen.line(CONTOUR, [x1, y1], [x1, cy], 3);
    pen.arc(GRIS, x1 - 10, cy - 4, x1 + 10, cy + 16, PI, 2 * PI + 1.2, 5);
    for (const cx of [-66, -6, 70]) roue(pen, cx, 27, rot);
    return [x1, cy + 10];
  },
};

function ombre(ctx, x, g, largeur, hauteur) {
  ctx.beginPath(); ctx.ellipse(x, g + 2, largeur / 2, hauteur / 2, 0, 0, 2 * PI);
  ctx.fillStyle = "rgba(0,0,0,0.27)"; ctx.fill();
}

function dessineVehicule(ctx, kind, col, x, g, t = 0, outil = 0, rot = 0, s = 1, f = 1, dort = false) {
  if (typeof col === "string") col = COULEURS[col] || COULEURS.jaune;
  const pen = new Pen(ctx, x, g, s, f);
  ombre(ctx, x, g, 230 * s, 18 * s);
  const p = (VEHICULES_DESSIN[kind] || VEHICULES_DESSIN.tractopelle)(pen, col, t, outil, rot, dort);
  return pen.P(p[0], p[1]);
}
function pointOutil(kind, col, x, g, outil) { // position de l'outil sans rien dessiner
  const pen = new Pen(NUL_CTX, x, g, 1, 1);
  const p = (VEHICULES_DESSIN[kind] || VEHICULES_DESSIN.tractopelle)(pen, COULEURS.jaune, 0, outil, 0, false);
  return pen.P(p[0], p[1]);
}
const NUL_CTX = new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });

// ------------------------------------------------------------ dinosaures gentils
function dinoLongCou(ctx, x, g, s = 1, col = [120, 200, 140], t = 0, f = 1) {
  const pen = new Pen(ctx, x, g, s, f), h = Math.sin(t * 1.5) * 6;
  pen.poly(col, [[-60, -70], [-150, -40], [-60, -50]]);
  for (const lx of [-45, -20, 20, 45]) pen.rect(fonce(col, 0.85), lx - 10, -50, lx + 10, 0, 6);
  pen.ellipse(col, -70, -105, 70, -35);
  pen.poly(col, [[30, -90], [55, -100], [95, -200 + h], [80, -205 + h], [40, -80]]);
  pen.ellipse(col, 70, -222 + h, 120, -192 + h);
  pen.circle([255, 255, 255], 100, -211 + h, 6);
  pen.circle(CONTOUR, 102, -211 + h, 3);
  pen.arc(CONTOUR, 95, -208 + h, 115, -196 + h, PI, 2 * PI, 2);
  for (let k = 0; k < 4; k++) pen.circle(clair(col, 0.4), -40 + k * 25, -80, 7);
}
function dinoStego(ctx, x, g, s = 1, col = [240, 160, 90], t = 0, f = 1) {
  const pen = new Pen(ctx, x, g, s, f);
  for (let k = 0; k < 5; k++) {
    const cx = -45 + k * 22, h = 30 + 10 * Math.sin(k);
    pen.poly(k % 2 ? clair(col, 0.2) : fonce(col, 0.85), [[cx - 12, -62], [cx, -62 - h], [cx + 12, -62]]);
  }
  pen.poly(col, [[-55, -40], [-110, -30], [-55, -25]]);
  for (const lx of [-35, -10, 20, 40]) pen.rect(fonce(col, 0.85), lx - 8, -35, lx + 8, 0, 5);
  pen.ellipse(col, -60, -80, 60, -25);
  pen.ellipse(col, 45, -62, 85, -32);
  pen.circle([255, 255, 255], 70, -52, 5);
  pen.circle(CONTOUR, 72, -52, 2.5);
  pen.arc(CONTOUR, 62, -50, 80, -38, PI, 2 * PI, 2);
}

// ------------------------------------------------------------ décors
const CIELS = {
  chantier: [[120, 190, 245], [215, 238, 255]], ville: [[110, 175, 240], [205, 232, 255]],
  campagne: [[100, 185, 250], [220, 245, 255]], dinosaures: [[250, 170, 120], [255, 230, 170]],
  plage: [[80, 190, 245], [210, 245, 255]], neige: [[160, 190, 225], [235, 242, 252]],
  ecole: [[110, 190, 250], [215, 240, 255]], vacances: [[70, 175, 245], [205, 240, 255]], jardin: [[95, 180, 245], [215, 240, 255]], pms: [[100, 175, 240], [210, 235, 255]], nuit: [[15, 20, 60], [60, 60, 120]],
};
const SOLS = {
  chantier: [[185, 140, 90], [160, 115, 70]], ville: [[110, 110, 120], [90, 90, 100]],
  campagne: [[120, 195, 90], [100, 100, 110]], dinosaures: [[215, 180, 110], [190, 150, 90]],
  plage: [[240, 215, 150], [225, 195, 130]], neige: [[245, 248, 255], [215, 225, 240]],
  ecole: [[130, 200, 100], [190, 195, 210]],
  vacances: [[135, 200, 100], [230, 215, 185]],
  jardin: [[120, 195, 90], [145, 210, 105]],
  pms: [[130, 195, 100], [175, 178, 190]],
};

function soleil(ctx, x, y, t) {
  for (let k = 0; k < 10; k++) {
    const a = (k * PI) / 5 + t * 0.3;
    trait(ctx, [x + 50 * Math.cos(a), y + 50 * Math.sin(a)], [x + 68 * Math.cos(a), y + 68 * Math.sin(a)], 6, [255, 210, 60]);
  }
  rond(ctx, x, y, 40, [255, 225, 80]);
  visage(new Pen(ctx, x, y), 0, -4, 22, t + 1.3);
}
function lune(ctx, x, y) { rond(ctx, x, y, 38, [250, 245, 200]); rond(ctx, x + 18, y - 10, 32, CIELS.nuit[0]); }
function nuage(ctx, x, y, s = 1, col = [255, 255, 255]) {
  for (const [dx, dy, r] of [[0, 0, 28], [30, -12, 34], [62, 0, 28], [30, 8, 26]]) rond(ctx, x + dx * s, y + dy * s, r * s, col);
}
function etoile(ctx, x, y, r, col, a = 0) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const rr = k % 2 === 0 ? r : r * 0.45, ang = a - PI / 2 + (k * PI) / 5;
    pts.push([x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
  }
  poly(ctx, pts, col, 0);
}
const boucle = (base, scroll, k, w, marge = 200) => mod(base - scroll * k, w + 2 * marge) - marge;

function arbre(ctx, x, g, s = 1, col = [70, 160, 70]) {
  rrect(ctx, x - 8 * s, g - 60 * s, 16 * s, 60 * s, 0, [130, 90, 50]);
  for (const [dx, dy, r] of [[0, -90, 38], [-25, -70, 28], [25, -70, 28]]) rond(ctx, x + dx * s, g + dy * s, r * s, col);
}
function sapin(ctx, x, g, s = 1) {
  rrect(ctx, x - 7 * s, g - 25 * s, 14 * s, 25 * s, 0, [120, 80, 50]);
  for (let k = 0; k < 3; k++) {
    const y = g - 25 * s - k * 30 * s, w = (60 - k * 14) * s;
    poly(ctx, [[x - w, y], [x + w, y], [x, y - 55 * s]], [40, 120, 80]);
    poly(ctx, [[x - w * 0.35, y - 36 * s], [x + w * 0.35, y - 36 * s], [x, y - 55 * s]], [255, 255, 255]);
  }
}
function palmier(ctx, x, g, s = 1) {
  for (let k = 0; k < 8; k++) rond(ctx, x + k * 3 * s, g - k * 18 * s, 9 * s, [150, 100, 60]);
  const tx = x + 24 * s, ty = g - 150 * s;
  for (const a of [-2.6, -2.0, -1.2, -0.5, 0.2]) trait(ctx, [tx, ty], [tx + 70 * s * Math.cos(a), ty + 40 * s * Math.sin(a) + 25 * s], 12 * s, [60, 160, 70]);
}

function ecrireCentre(ctx, txt, x, y, taille, col) {
  ctx.font = `700 ${taille}px Fredoka, "Comic Sans MS", sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = css(col); ctx.fillText(txt, x, y);
}

function dessineDecor(ctx, W, H, nom, scroll, t, nuit = false, G = 450) {
  if (!SOLS[nom]) nom = "chantier";
  const [haut, bas] = CIELS[nuit ? "nuit" : nom];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, css(haut)); grad.addColorStop(1, css(bas));
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  const rng = hasard(7);
  if (nuit) {
    for (let k = 0; k < 40; k++) {
      const x = rng() * W, y = rng() * G * 0.6;
      rond(ctx, x, y, Math.max(1, 2 + 1.5 * Math.sin(t * 3 + k)), [255, 255, 220]);
    }
    lune(ctx, W - 120, 90);
  } else soleil(ctx, W - 110, 90, t);
  for (let k = 0; k < 4; k++) nuage(ctx, boucle(k * 300 + t * 12, scroll, 0.15, W), 50 + (k % 2) * 45, 0.9 + 0.2 * (k % 2), nuit ? [70, 75, 125] : [255, 255, 255]);

  const horizon = G - 45;
  if (nom === "chantier") {
    ovale(ctx, -200, horizon - 120, 800, 260, [150, 200, 140]);
    ovale(ctx, 400, horizon - 90, 900, 220, [130, 190, 130]);
    for (let k = 0; k < 3; k++) {
      const x = boucle(k * 420 + 100, scroll, 0.3, W);
      rrect(ctx, x, horizon - 230, 12, 230, 0, [230, 160, 40]);
      rrect(ctx, x - 40, horizon - 230, 170, 10, 0, [230, 160, 40]);
      trait(ctx, [x + 110, horizon - 220], [x + 110, horizon - 150], 2, [80, 80, 80]);
      rrect(ctx, x + 150, horizon - 120, 80, 120, 0, [200, 200, 210]);
      for (let yy = 0; yy < 3; yy++) trait(ctx, [x + 150, horizon - 120 + yy * 40], [x + 230, horizon - 120 + yy * 40], 3, [160, 160, 170]);
    }
  } else if (nom === "ville") {
    const cols = [[250, 170, 160], [170, 210, 250], [250, 220, 140], [180, 230, 180], [220, 180, 240]];
    for (let k = 0; k < 9; k++) {
      const x = boucle(k * 150, scroll, 0.35, W), h = 110 + ((k * 53) % 120);
      rrect(ctx, x, horizon - h, 120, h, 0, cols[k % 5]);
      for (let yy = horizon - h + 15; yy < horizon - 25; yy += 32)
        for (const xx of [x + 15, x + 50, x + 85]) rrect(ctx, xx, yy, 20, 18, 0, nuit ? [255, 230, 120] : [255, 250, 210]);
    }
  } else if (nom === "campagne") {
    ovale(ctx, -300, horizon - 140, 900, 300, [110, 190, 90]);
    ovale(ctx, 350, horizon - 110, 1000, 280, [90, 175, 80]);
    for (let k = 0; k < 7; k++) arbre(ctx, boucle(k * 170 + 40, scroll, 0.4, W), horizon + 5, 0.9);
  } else if (nom === "dinosaures") {
    const x = boucle(600, scroll, 0.2, W);
    poly(ctx, [[x - 200, horizon], [x - 40, horizon - 200], [x + 40, horizon - 200], [x + 200, horizon]], [150, 110, 100]);
    poly(ctx, [[x - 40, horizon - 200], [x - 20, horizon - 185], [x, horizon - 200], [x + 20, horizon - 185], [x + 40, horizon - 200]], [240, 120, 60]);
    visage(new Pen(ctx, x, horizon - 120), 0, 0, 30, t);
    for (let k = 0; k < 3; k++) rond(ctx, x + 10 + k * 15, horizon - 230 - k * 30 - mod(t * 15, 30), 18 + k * 8 + mod(t * 10, 10), [235, 235, 240]);
    for (let k = 0; k < 4; k++) palmier(ctx, boucle(k * 260 + 80, scroll, 0.4, W), horizon + 5, 0.9);
    dinoLongCou(ctx, boucle(250, scroll, 0.45, W), horizon + 5, 0.75, undefined, t);
    dinoStego(ctx, boucle(800, scroll, 0.45, W), horizon + 5, 0.8, undefined, t, -1);
  } else if (nom === "plage") {
    rrect(ctx, 0, horizon - 70, W, 70, 0, [60, 150, 220]);
    for (let k = 0; k < 14; k++) {
      const x = mod(k * 80 + t * 30, W + 80) - 40;
      arcRect(ctx, x, horizon - 60 + (k % 3) * 18, 40, 16, 0, PI, 3, [230, 245, 255]);
    }
    const bx = boucle(300 + t * 20, scroll, 0.3, W);
    poly(ctx, [[bx - 50, horizon - 60], [bx + 50, horizon - 60], [bx + 35, horizon - 40], [bx - 35, horizon - 40]], [200, 80, 60]);
    poly(ctx, [[bx, horizon - 130], [bx, horizon - 65], [bx + 45, horizon - 65]], [255, 255, 255]);
  } else if (nom === "neige") {
    for (let k = 0; k < 3; k++) {
      const x = boucle(k * 380 + 50, scroll, 0.2, W);
      poly(ctx, [[x - 220, horizon], [x, horizon - 260], [x + 220, horizon]], [170, 180, 210]);
      poly(ctx, [[x - 70, horizon - 175], [x, horizon - 260], [x + 70, horizon - 175]], [255, 255, 255]);
    }
    for (let k = 0; k < 7; k++) sapin(ctx, boucle(k * 160 + 60, scroll, 0.4, W), horizon + 5, 0.9);
  } else if (nom === "ecole") {
    ovale(ctx, -200, horizon - 90, 700, 220, [120, 195, 100]);
    const x = boucle(560, scroll, 0.3, W, 300);
    rrect(ctx, x - 230, horizon - 200, 460, 200, 0, [250, 232, 195], 3);
    poly(ctx, [[x - 255, horizon - 200], [x + 255, horizon - 200], [x, horizon - 290]], [210, 85, 70], 3);
    rrect(ctx, x - 85, horizon - 192, 170, 40, 10, [90, 150, 230]);
    ecrireCentre(ctx, "ÉCOLE", x, horizon - 171, 30, [255, 255, 255]);
    const vitres = [[255, 210, 60], [255, 120, 150], [120, 200, 120], [160, 120, 230]];
    [-190, -120, 70, 140].forEach((wx, k) => {
      rrect(ctx, x + wx, horizon - 135, 50, 50, 4, VITRE, 3);
      rond(ctx, x + wx + 25, horizon - 110, 11, vitres[k]);
    });
    rrect(ctx, x - 35, horizon - 80, 70, 80, 8, [150, 95, 60], 3);
    for (let k = 0; k < 3; k++) arbre(ctx, boucle(k * 520 + 60, scroll, 0.4, W), horizon + 5, 0.9);
    const tx = boucle(940, scroll, 0.35, W, 300);
    trait(ctx, [tx, horizon], [tx, horizon - 110], 6, [230, 80, 80]);
    trait(ctx, [tx + 20, horizon], [tx + 20, horizon - 110], 6, [230, 80, 80]);
    trait(ctx, [tx + 20, horizon - 105], [tx + 110, horizon], 14, [250, 200, 60]);
  }

  else if (nom === "vacances") {
    ovale(ctx, -250, horizon - 130, 900, 300, [150, 200, 110]);
    ovale(ctx, 450, horizon - 100, 900, 260, [130, 190, 100]);
    const x = boucle(560, scroll, 0.3, W, 300); // la maison de vacances (x = 260 au début)
    rrect(ctx, x - 170, horizon - 170, 340, 170, 0, [252, 248, 235], 3);
    poly(ctx, [[x - 195, horizon - 170], [x + 195, horizon - 170], [x + 150, horizon - 235], [x - 150, horizon - 235]], [215, 110, 70], 3);
    for (const wx of [-125, 65]) {
      rrect(ctx, x + wx, horizon - 140, 60, 55, 4, VITRE, 3);
      rrect(ctx, x + wx - 22, horizon - 140, 20, 55, 3, [70, 140, 220], 2);
      rrect(ctx, x + wx + 62, horizon - 140, 20, 55, 3, [70, 140, 220], 2);
    }
    rrect(ctx, x - 30, horizon - 85, 60, 85, 8, [70, 140, 220], 3);
    for (let k = 0; k < 4; k++) palmier(ctx, boucle(k * 320 + 520, scroll, 0.4, W), horizon + 5, 0.85);
    rrect(ctx, x - 200, horizon - 12, 400, 12, 0, [200, 120, 90]); // bacs de fleurs
    for (let k = 0; k < 9; k++) rond(ctx, x - 185 + k * 46, horizon - 14, 8, [[255, 90, 140], [255, 210, 60], [190, 120, 240]][k % 3]);
  }
  else if (nom === "jardin") {
    const x = boucle(470, scroll, 0.3, W, 300); // la maison de la famille
    rrect(ctx, x - 150, horizon - 190, 300, 190, 0, [250, 225, 190], 3);
    poly(ctx, [[x - 175, horizon - 190], [x + 175, horizon - 190], [x, horizon - 280]], [180, 80, 70], 3);
    for (const wx of [-110, 55]) rrect(ctx, x + wx, horizon - 160, 55, 50, 4, VITRE, 3);
    rrect(ctx, x - 30, horizon - 90, 60, 90, 8, [130, 80, 55], 3);
    rond(ctx, x + 18, horizon - 45, 4, [250, 210, 80]);
    for (let k = 0; k < 3; k++) arbre(ctx, boucle(k * 420 + 120, scroll, 0.4, W), horizon + 5, 1, [80, 170, 80]);
    for (let k = 0; k < 40; k++) { // la palissade du jardin
      const px = boucle(k * 26, scroll, 0.5, W, 30);
      poly(ctx, [[px, horizon], [px, horizon - 50], [px + 9, horizon - 60], [px + 18, horizon - 50], [px + 18, horizon]], [235, 205, 160], 2, [170, 130, 90]);
    }
    trait(ctx, [0, horizon - 38], [W, horizon - 38], 4, [190, 150, 105]);
  }
  else if (nom === "pms") { // la société PMS
    const x = boucle(600, scroll, 0.3, W, 300);
    rrect(ctx, x - 260, horizon - 200, 330, 200, 0, [225, 230, 240], 3); // bureaux
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) rrect(ctx, x - 240 + c * 78, horizon - 185 + r * 55, 58, 38, 3, VITRE, 2);
    rrect(ctx, x + 70, horizon - 150, 230, 150, 0, [200, 205, 215], 3); // atelier
    poly(ctx, [[x + 60, horizon - 150], [x + 310, horizon - 150], [x + 185, horizon - 200]], [150, 160, 180], 3);
    rrect(ctx, x + 120, horizon - 105, 130, 105, 4, [170, 175, 185], 3);
    for (let k = 1; k < 5; k++) trait(ctx, [x + 120, horizon - 105 + k * 21], [x + 250, horizon - 105 + k * 21], 2, [140, 145, 155]);
    rrect(ctx, x - 200, horizon - 262, 210, 58, 12, [255, 255, 255], 4, [60, 90, 170]); // l'enseigne
    [["P", [230, 70, 70]], ["M", [60, 130, 230]], ["S", [60, 170, 90]]].forEach(([l, c], k) => ecrireCentre(ctx, l, x - 155 + k * 62, horizon - 232, 46, c));
    for (let k = 0; k < 4; k++) { // des fenêtres et des portes rangées contre le mur
      const fx = x + 330 + k * 34;
      rrect(ctx, fx, horizon - 70 + (k % 2) * 6, 28, 64, 3, k === 3 ? [150, 95, 60] : [250, 250, 250], 2);
      if (k !== 3) rrect(ctx, fx + 5, horizon - 64 + (k % 2) * 6, 18, 52, 2, VITRE);
    }
    for (let k = 0; k < 2; k++) arbre(ctx, boucle(k * 700 + 80, scroll, 0.4, W), horizon + 5, 0.9);
  }
  const [herbe, route] = SOLS[nom];
  rrect(ctx, 0, horizon, W, H - horizon, 0, herbe);
  rrect(ctx, 0, horizon + 18, W, G - horizon + 40, 0, route);
  if (nom === "ville") {
    for (let k = 0; k < 14; k++) rrect(ctx, boucle(k * 90, scroll, 1, W, 100), G + 22, 50, 8, 0, [250, 250, 250]);
  } else if (nom === "ecole") {
    const x0 = boucle(150, scroll, 1, W, 300), cols = [[255, 120, 120], [255, 200, 80], [120, 200, 255], [150, 220, 120], [220, 150, 240]];
    for (let k = 0; k < 5; k++) rrect(ctx, x0 + k * 48, G + 22, 44, 30, 4, null, 4, cols[k]);
  } else if (nom === "chantier") {
    const r2 = hasard(3);
    for (let k = 0; k < 30; k++) {
      const x = boucle(r2() * 1400, scroll, 1, W, 100);
      rond(ctx, x, horizon + 25 + r2() * (G - horizon + 30), 3 + r2.int(0, 3), [140, 100, 60]);
    }
  }
  for (let k = 0; k < 6; k++) {
    const x = boucle(k * 230 + 60, scroll, 1.25, W, 120), y = H - 8;
    if (nom === "chantier") { poly(ctx, [[x - 16, y], [x + 16, y], [x, y - 44]], [255, 130, 30]); rrect(ctx, x - 8, y - 26, 16, 7, 0, [255, 255, 255]); }
    else if (nom === "ecole") { trait(ctx, [x, y], [x, y - 40], 2, [90, 90, 100]); ovale(ctx, x - 14, y - 72, 28, 34, [[255, 90, 120], [90, 170, 250], [255, 210, 60]][k % 3]); }
    else if (nom === "campagne" || nom === "jardin") {
      for (const dx of [-12, 0, 12]) { trait(ctx, [x + dx, y], [x + dx, y - 22], 3, [60, 140, 60]); rond(ctx, x + dx, y - 24, 7, [[255, 90, 120], [255, 220, 60], [180, 120, 255]][mod(k + dx, 3)]); }
    } else if (nom === "ville") { rrect(ctx, x - 3, y - 70, 6, 70, 0, [80, 80, 90]); rond(ctx, x, y - 74, 10, [255, 240, 150]); }
    else if (nom === "dinosaures") { ovale(ctx, x - 13, y - 34, 26, 34, [250, 245, 230]); rond(ctx, x - 4, y - 20, 4, [150, 210, 150]); }
    else if (nom === "plage") rond(ctx, x, y - 8, 9, [250, 150, 160]);
    else if (nom === "vacances") for (const dx of [-10, 0, 10]) { trait(ctx, [x + dx, y], [x + dx * 1.3, y - 34], 3, [90, 150, 80]); ovale(ctx, x + dx * 1.3 - 4, y - 50, 8, 18, [170, 120, 220]); }
    else if (nom === "neige") { rond(ctx, x, y - 16, 16, [255, 255, 255]); rond(ctx, x, y - 42, 11, [255, 255, 255]); poly(ctx, [[x, y - 43], [x + 14, y - 40], [x, y - 38]], [255, 140, 30]); }
  }
  if (nom === "neige")
    for (let k = 0; k < 50; k++) rond(ctx, mod(k * 97 + t * 20 + Math.sin(t + k) * 15, W), mod(k * 53 + t * 60, H), 2 + (k % 3), [255, 255, 255]);
}

// ------------------------------------------------------------ objets des histoires
function trou(ctx, x, G, rempli) {
  const w = 190, h = 54, rx = x - w / 2, ry = G + 18 - h / 2;
  ovale(ctx, rx - 7, ry - 5, w + 14, h + 10, [120, 80, 45]);
  if (rempli < 0.999) {
    ovale(ctx, rx, ry, w, h, [55, 35, 25]);
    if (rempli > 0.02) ovale(ctx, x - (w * rempli) / 2, G + 18 - (h * rempli) / 2, w * rempli, h * rempli, [165, 115, 70]);
    for (const dx of [-125, 125]) { const cx = x + dx; poly(ctx, [[cx - 16, G + 20], [cx + 16, G + 20], [cx, G - 30]], [255, 130, 30]); rrect(ctx, cx - 8, G - 8, 16, 7, 0, [255, 255, 255]); }
  } else {
    ovale(ctx, rx, ry, w, h, [165, 115, 70]);
    for (let k = 0; k < 3; k++) { const fx = x - 50 + k * 50; trait(ctx, [fx, G + 18], [fx, G - 2], 3, [60, 140, 60]); rond(ctx, fx, G - 4, 7, [[255, 90, 120], [255, 220, 60], [180, 120, 255]][k]); }
  }
}
function maisonFeu(ctx, x, G, feu, t, sauvee) {
  const pen = new Pen(ctx, x, G);
  pen.rect([250, 230, 190], -85, -150, 85, 0, 4);
  pen.poly([200, 80, 70], [[-100, -150], [100, -150], [0, -225]]);
  pen.rect([140, 90, 60], -18, -62, 18, 0, 6);
  for (const wx of [-55, 55]) pen.rect(VITRE, wx - 18, -125, wx + 18, -90, 4);
  if (sauvee && feu < 0.05) pen.arc(CONTOUR, -30, -90, 30, -50, PI * 1.1, PI * 1.9, 4);
  if (feu > 0.02) {
    [[-55, -125, 0.8], [55, -125, 0.8], [-20, -205, 1.0], [30, -190, 0.9], [0, -150, 1.2]].forEach(([fx, fy, s], k) => {
      const h = 70 * s * feu * (0.85 + 0.25 * Math.sin(t * 13 + k * 2)), w = 28 * s * Math.max(0.4, feu), bx = x + fx, by = G + fy;
      poly(ctx, [[bx - w, by], [bx - w * 0.5, by - h * 0.6], [bx, by - h], [bx + w * 0.5, by - h * 0.55], [bx + w, by]], [255, 110, 30]);
      poly(ctx, [[bx - w * 0.5, by], [bx, by - h * 0.55], [bx + w * 0.5, by]], [255, 220, 60]);
    });
    for (let k = 0; k < 3; k++) { const u = mod(t * 0.4 + k / 3, 1); rond(ctx, x + 10 + 30 * Math.sin(u * 6 + k), G - 240 - u * 160, (12 + 30 * u) * feu, [170, 170, 175]); }
  }
}
function tas(ctx, x, G, taille, couleur = [225, 190, 120]) {
  if (taille <= 0.02) return;
  const w = 250 * (0.35 + 0.65 * taille), h = 170 * taille;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 4000, G + 12); ctx.clip();
  ovale(ctx, x - w / 2, G + 10 - h, w, h * 2, couleur, 4, fonce(couleur, 0.8));
  ctx.restore();
  const r = hasard(5);
  for (let k = 0; k < Math.floor(12 * taille) + 2; k++) rond(ctx, x + r.uniform(-w * 0.3, w * 0.3), G + 5 - r.uniform(0, h * 0.7), r.int(5, 11), [140, 130, 120]);
}
const BRIQUES = [[230, 90, 80], [250, 190, 60], [90, 160, 230], [110, 200, 110], [200, 120, 220]];
function construction(ctx, x, G, etages, total, t) {
  const murs = Math.max(1, total - 1), hb = 38;
  for (let k = 0; k < Math.min(etages, murs); k++) {
    const c = BRIQUES[k % BRIQUES.length];
    rrect(ctx, x - 75, G - (k + 1) * hb, 150, hb, 6, c, 3);
    trait(ctx, [x, G - (k + 1) * hb + 4], [x, G - k * hb - 4], 3, fonce(c));
  }
  if (etages >= total) {
    const top = G - murs * hb;
    poly(ctx, [[x - 95, top], [x + 95, top], [x, top - 80]], [200, 70, 60], 3);
    rrect(ctx, x - 16, G - 46, 32, 46, 6, [140, 90, 60]);
    etoile(ctx, x, top - 100 + 6 * Math.sin(t * 4), 18, [255, 225, 60], t);
  }
}
function piece(ctx, x, y, toit, k) {
  if (toit) poly(ctx, [[x - 95, y + 19], [x + 95, y + 19], [x, y - 61]], [200, 70, 60], 3);
  else rrect(ctx, x - 75, y - 19, 150, 38, 6, BRIQUES[k % BRIQUES.length], 3);
}
function mainQuiClique(ctx, x, y, t) {
  const p = (Math.sin(t * 6) + 1) / 2;
  for (let k = 0; k < 3; k++) rond(ctx, x, y, 30 + k * 18 + p * 12, null, 5 - k, [255, 255, 255]);
  rond(ctx, x, y, 22 + p * 6, [255, 220, 60]);
  const hx = x + 26, hy = y + 30 + p * 10;
  rrect(ctx, hx - 6, hy - 34, 14, 40, 7, [255, 225, 195], 3);
  rrect(ctx, hx - 12, hy - 2, 40, 34, 12, [255, 225, 195], 3);
}

// ------------------------------------------------------------ amis (personnages)
function trex(ctx, x, g, s = 1, t = 0, f = 1, marche = 0, mange = 0) {
  const col = [110, 200, 110], pen = new Pen(ctx, x, g, s, f);
  pen.poly(col, [[-40, -95], [-150, -60 + 6 * Math.sin(t * 3)], [-35, -60]]);
  [-22, 12].forEach((lx, k) => {
    const sw = Math.sin(marche + k * PI) * 14;
    pen.bras(fonce(col, 0.85), [lx, -62], [lx + sw, -12], 20);
    pen.ellipse(fonce(col, 0.85), lx + sw - 16, -16, lx + sw + 22, 0);
  });
  for (let k = 0; k < 4; k++) { const cx = -40 + k * 20; pen.poly(clair(col, 0.35), [[cx - 9, -122 + k * 4], [cx, -142 + k * 6], [cx + 9, -124 + k * 4]]); }
  pen.ellipse(col, -58, -135, 48, -48);
  pen.ellipse(clair(col, 0.45), -18, -118, 38, -58, false);
  pen.bras(fonce(col, 0.85), [26, -100], [44, -88], 7);
  const dy = 10 * mange;
  pen.ellipse(col, 8, -192 + dy, 100, -132 + dy);
  pen.circle([255, 255, 255], 52, -170 + dy, 10, true);
  pen.circle(CONTOUR, 55, -169 + dy, 5);
  pen.circle([255, 255, 255], 57, -172 + dy, 2);
  pen.circle(fonce(col, 0.6), 90, -170 + dy, 3);
  pen.arc(CONTOUR, 44, -168 + dy, 96, -140 + dy, PI, 2 * PI, 3);
  pen.poly([255, 255, 255], [[66, -143 + dy], [71, -134 + dy], [76, -143 + dy]], false);
  pen.circle([255, 150, 160], 36, -150 + dy, 7);
}
function chat(ctx, x, g, s = 1, t = 0, f = 1, marche = 0, mange = 0) {
  const col = [250, 165, 70], pen = new Pen(ctx, x, g, s, f);
  pen.bras(col, [-36, -38], [-58, -78 + 6 * Math.sin(t * 4)], 8);
  [-26, -12, 14, 28].forEach((lx, k) => { const sw = Math.sin(marche + k * PI) * 6; pen.bras(fonce(col, 0.85), [lx, -26], [lx + sw, -3], 8); });
  pen.ellipse(col, -42, -56, 36, -18);
  for (let k = 0; k < 3; k++) pen.line(fonce(col, 0.75), [-26 + k * 14, -54], [-22 + k * 14, -42], 4);
  const hx = 40, hy = -62 + 8 * mange;
  pen.poly(col, [[hx - 20, hy - 10], [hx - 14, hy - 38], [hx - 2, hy - 18]]);
  pen.poly(col, [[hx + 2, hy - 18], [hx + 14, hy - 38], [hx + 20, hy - 10]]);
  pen.circle(col, hx, hy, 22, true);
  pen.poly([255, 170, 180], [[hx - 16, hy - 14], [hx - 13, hy - 30], [hx - 6, hy - 18]], false);
  pen.poly([255, 170, 180], [[hx + 6, hy - 18], [hx + 13, hy - 30], [hx + 16, hy - 14]], false);
  for (const ex of [-8, 8]) pen.ellipse(CONTOUR, hx + ex - 3, hy - 9, hx + ex + 3, hy + 1, false);
  pen.circle([255, 130, 150], hx, hy + 5, 3);
  for (const k of [-1, 1]) { pen.line(CONTOUR, [hx + 4, hy + 6], [hx + 26, hy + 2 + 5 * k], 2); pen.line(CONTOUR, [hx - 4, hy + 6], [hx - 26, hy + 2 + 5 * k], 2); }
}

const PEAU = [[250, 214, 180], [205, 150, 105], [140, 95, 65]], BLOND_FONCE = [175, 130, 65];
const STYLES = {
  arthur: { L: 40, T: 42, R: 25, W: 34, peau: PEAU[0], cheveux: BLOND_FONCE, coiffure: "court", yeux: [70, 150, 80], haut: [90, 160, 230], bas: [70, 80, 120], dessin: "tractopelle" },
  papa: { L: 95, T: 78, R: 24, W: 62, peau: PEAU[0], cheveux: BLOND_FONCE, coiffure: "court", yeux: [70, 130, 220], haut: [240, 240, 245], bas: [60, 90, 150], muscle: true },
  maman: { L: 92, T: 70, R: 23, W: 44, peau: PEAU[0], cheveux: [110, 65, 35], coiffure: "long", yeux: [120, 75, 40], haut: [230, 90, 140], bas: null, robe: true, couronne: true, cils: true },
  enfant1: { L: 38, T: 40, R: 24, W: 32, peau: PEAU[1], cheveux: [60, 35, 20], coiffure: "couettes", yeux: [80, 50, 30], haut: [250, 130, 180], bas: [120, 70, 160], robe: true, cils: true },
  enfant2: { L: 41, T: 42, R: 24, W: 34, peau: PEAU[2], cheveux: [30, 25, 25], coiffure: "court", yeux: [60, 40, 30], haut: [90, 190, 110], bas: [60, 60, 80] },
  papi: { L: 90, T: 76, R: 24, W: 56, peau: PEAU[0], cheveux: [225, 225, 230], coiffure: "papi", yeux: [90, 120, 160], haut: [110, 180, 140], bas: [200, 180, 140], lunettes: true, moustache: true },
  mamie: { L: 86, T: 68, R: 23, W: 44, peau: PEAU[0], cheveux: [215, 215, 222], coiffure: "chignon", yeux: [110, 140, 90], haut: [170, 140, 220], bas: null, robe: true, cils: true, lunettes: true },
  enfant3: { L: 37, T: 40, R: 24, W: 32, peau: PEAU[0], cheveux: [210, 100, 40], coiffure: "court", yeux: [70, 120, 200], haut: [255, 160, 50], bas: [70, 110, 170] },
};

function personne(ctx, x, g, s, t, f, marche, mange, humeur, style) {
  const st = STYLES[style], pen = new Pen(ctx, x, g, s, f);
  const { L, T, R, W } = st, hanche = -L, epaule = -L - T, tx = 0, ty = epaule - R + 6;
  if (st.coiffure === "long") pen.ellipse(st.cheveux, -R * 1.15, ty - R * 1.05, R * 1.15, epaule + T * 0.35);
  [-W * 0.22, W * 0.22].forEach((lx, k) => {
    const sw = Math.sin(marche + k * PI) * L * 0.3;
    pen.bras(st.bas || st.peau, [lx, hanche], [lx + sw, -7], W * 0.26);
    pen.ellipse([60, 50, 60], lx + sw - W * 0.2, -11, lx + sw + W * 0.32, 1);
  });
  const joie = humeur === "joie";
  [-1, 1].forEach((sx, k) => {
    const sw = Math.sin(marche + k * PI) * 10;
    const main = joie ? [sx * (W / 2 + 22), epaule - 32 - 6 * Math.sin(t * 8 + k)] : [sx * (W / 2 + 8) + sw * 0.3, hanche - 6 + sw * 0.4];
    const larg = W * (st.muscle ? 0.3 : 0.22);
    pen.bras(st.peau, [sx * W * 0.42, epaule + 8], main, larg);
    if (st.muscle) pen.circle(st.peau, sx * W * 0.5, epaule + 26, larg * 0.75, true);
    pen.circle(st.peau, main[0], main[1], larg * 0.6, true);
  });
  if (st.robe) {
    pen.poly(st.haut, [[-W * 0.45, epaule], [W * 0.45, epaule], [W * 0.95, hanche + L * 0.4], [-W * 0.95, hanche + L * 0.4]]);
    pen.poly(clair(st.haut, 0.4), [[-W * 0.3, hanche - 4], [W * 0.3, hanche - 4], [W * 0.36, hanche + 4], [-W * 0.36, hanche + 4]], false);
  } else pen.rect(st.haut, -W / 2, epaule, W / 2, hanche + 6, W * 0.25);
  if (st.dessin) { const c = pen.P(0, epaule + T * 0.62); dessineVehicule(ctx, st.dessin, "jaune", c[0], c[1], t, 0.3, 0, 0.13 * s, f); }
  pen.circle(st.peau, tx, ty, R, true);
  if (st.coiffure === "papi") { // cheveux blancs sur les côtés, une petite mèche dessus
    for (const sx of [-1, 1]) pen.ellipse(st.cheveux, sx * R * 0.75 - R * 0.35, ty - R * 0.55, sx * R * 0.75 + R * 0.35, ty + R * 0.15);
    pen.ellipse(st.cheveux, -R * 0.25, ty - R * 1.08, R * 0.3, ty - R * 0.82);
  } else pen.poly(st.cheveux, [[-R * 1.02, ty - R * 0.05], [-R * 0.85, ty - R * 0.8], [-R * 0.2, ty - R * 1.12], [R * 0.6, ty - R], [R * 1.02, ty - R * 0.35], [R * 0.9, ty - R * 0.45], [R * 0.3, ty - R * 0.62], [-R * 0.2, ty - R * 0.45], [-R * 0.6, ty - R * 0.5], [-R * 0.8, ty]]);
  if (st.coiffure === "chignon") pen.circle(st.cheveux, R * 0.1, ty - R * 1.15, R * 0.42, true);
  if (st.coiffure === "couettes") for (const sx of [-1, 1]) { pen.circle(st.cheveux, sx * R * 1.15, ty - R * 0.2, R * 0.38, true); pen.circle([250, 90, 120], sx * R * 0.98, ty - R * 0.35, R * 0.13); }
  if (st.couronne) {
    const y0 = ty - R * 0.95;
    pen.poly([255, 205, 50], [[-R * 0.6, y0], [-R * 0.7, y0 - R * 0.7], [-R * 0.3, y0 - R * 0.35], [0, y0 - R * 0.85], [R * 0.3, y0 - R * 0.35], [R * 0.7, y0 - R * 0.7], [R * 0.6, y0]]);
    for (const jx of [-0.45, 0, 0.45]) pen.circle([230, 60, 110], jx * R, y0 - R * 0.15, R * 0.09);
  }
  const ey = ty - R * 0.05;
  for (const ex of [-0.36, 0.36]) {
    const cxe = tx + R * (ex + 0.12);
    pen.ellipse([255, 255, 255], cxe - R * 0.16, ey - R * 0.2, cxe + R * 0.16, ey + R * 0.2);
    pen.circle(st.yeux, cxe + R * 0.03, ey + R * 0.02, R * 0.12);
    pen.circle([20, 20, 30], cxe + R * 0.04, ey + R * 0.03, R * 0.06);
    pen.circle([255, 255, 255], cxe + R * 0.07, ey - R * 0.04, R * 0.035);
    if (st.cils) pen.line(CONTOUR, [cxe + R * 0.12, ey - R * 0.18], [cxe + R * 0.2, ey - R * 0.28], 2);
    if (humeur === "peur") { const hi = ex > 0 ? R * 0.08 : 0; pen.line(CONTOUR, [cxe - R * 0.15, ey - R * 0.25 - hi], [cxe + R * 0.15, ey - R * 0.25 - (R * 0.08 - hi)], 2); }
  }
  if (st.lunettes) {
    for (const ex of [-0.36, 0.36]) pen.circle([255, 255, 255], tx + R * (ex + 0.12), ey, R * 0.27, true);
    for (const ex of [-0.36, 0.36]) { const cxe = tx + R * (ex + 0.12); pen.circle(st.yeux, cxe + R * 0.03, ey + R * 0.02, R * 0.11); pen.circle([20, 20, 30], cxe + R * 0.04, ey + R * 0.03, R * 0.05); }
    pen.line(CONTOUR, [tx - R * 0.03, ey], [tx + R * 0.21, ey], 2);
  }
  pen.circle([255, 150, 160], tx - R * 0.45, ty + R * 0.38, R * 0.13);
  pen.circle([255, 150, 160], tx + R * 0.65, ty + R * 0.38, R * 0.13);
  const mx = tx + R * 0.12, my = ty + R * 0.42;
  if (st.moustache) pen.poly([200, 200, 205], [[mx - R * 0.42, my - R * 0.02], [mx, my - R * 0.2], [mx + R * 0.42, my - R * 0.02], [mx, my - R * 0.06]]);
  if (humeur === "peur") pen.ellipse([150, 60, 70], mx - R * 0.1, my - R * 0.06, mx + R * 0.1, my + R * 0.14, false);
  else if (joie || mange > 0.3) pen.poly([170, 60, 70], [[mx - R * 0.3, my - R * 0.08], [mx + R * 0.3, my - R * 0.08], [mx, my + R * 0.3]]);
  else pen.arc(st.cils ? [200, 70, 90] : CONTOUR, mx - R * 0.28, my - R * 0.25, mx + R * 0.28, my + R * 0.15, PI, 2 * PI, 3);
}

const AMIS_DESSIN = {
  trex, chat,
  dino: (ctx, x, g, s, t, f, marche) => dinoLongCou(ctx, x, g + Math.sin(marche) * 2, 0.62 * s, undefined, t, f),
  stego: (ctx, x, g, s, t, f, marche) => dinoStego(ctx, x, g + Math.sin(marche) * 2, 0.95 * s, undefined, t, f),
};
for (const k of Object.keys(STYLES)) AMIS_DESSIN[k] = (ctx, x, g, s, t, f, marche, mange, humeur) => personne(ctx, x, g, s, t, f, marche, mange, humeur, k);
const LARGEUR_OMBRE = { dino: 0.8, stego: 0.6, papa: 0.45, maman: 0.45, papi: 0.45, mamie: 0.45 };

function boucheAmi(kind, x, g, f = 1, s = 1) {
  if (kind === "dino") return [x + f * 112 * 0.62 * s, g - 207 * 0.62 * s];
  if (kind === "stego") return [x + f * 85 * 0.95 * s, g - 47 * 0.95 * s];
  if (kind === "trex") return [x + f * 95 * s, g - 150 * s];
  if (STYLES[kind]) { const st = STYLES[kind]; return [x + f * st.R * 0.4 * s, g - (st.L + st.T + st.R * 0.5) * s]; }
  return [x, g - 60 * s];
}
function dessineAmi(ctx, kind, x, g, t = 0, f = 1, marche = 0, mange = 0, s = 1, humeur = null) {
  const k = LARGEUR_OMBRE[kind] ?? (STYLES[kind] ? 0.3 : 0.7);
  ombre(ctx, x, g, 230 * s * k, 16 * s);
  (AMIS_DESSIN[kind] || chat)(ctx, x, g, s, t, f, marche, mange, humeur);
}

function nourriture(ctx, kind, x, g, qte) {
  if (qte <= 0.02) return;
  if (kind === "chat") {
    ovale(ctx, x - 24 * qte, g - 24 - 8 * qte, 48 * qte, 22 * qte, [150, 90, 50]);
    poly(ctx, [[x - 32, g - 20], [x + 32, g - 20], [x + 22, g], [x - 22, g]], [80, 140, 230], 3);
  } else if (kind === "trex") {
    for (let k = 0; k < 9; k++) { const dx = (k - 4) * 9; trait(ctx, [x + dx, g], [x + dx * 1.5, g - (30 + 12 * (k % 3)) * qte], 6, k % 2 ? [60, 170, 60] : [90, 200, 80]); }
  } else {
    const r = hasard(11);
    for (let k = 0; k < Math.floor(7 * qte + 0.99); k++) { const px = x + r.uniform(-30, 30), py = g - 8 - Math.floor(k / 3) * 14 - r.uniform(0, 4); rond(ctx, px, py, r.int(9, 13), [150, 150, 160], 2); }
  }
}
// ------------------------------------------------------------ piscine & mûres
function piscineFond(ctx, cx, G, t) { // margelle + eau, derrière les personnages
  rrect(ctx, cx - 165, G - 14, 330, 68, 14, [245, 240, 225], 3);
  rrect(ctx, cx - 150, G - 4, 300, 50, 10, [60, 160, 225]);
  for (let k = 0; k < 5; k++) trait(ctx, [cx - 140 + k * 60, G + 22 + 5 * Math.sin(t * 2 + k)], [cx - 110 + k * 60, G + 22 + 5 * Math.sin(t * 2 + k + 1)], 3, [140, 210, 250]);
}
function piscineDevant(ctx, cx, G, t) { // l'eau devant : cache le bas de ceux qui sont dedans
  ctx.save(); ctx.beginPath(); ctx.roundRect(cx - 150, G + 4, 300, 42, 10); ctx.clip();
  ctx.fillStyle = "rgba(70,170,235,0.85)"; ctx.fillRect(cx - 150, G + 4, 300, 42);
  ctx.restore();
  for (let k = 0; k < 6; k++) {
    const x = cx - 145 + k * 50, y = G + 6 + 3 * Math.sin(t * 3 + k);
    arcRect(ctx, x, y - 6, 50, 12, PI, 2 * PI, 3, [220, 245, 255]);
  }
}
function buisson(ctx, x, G, qte) { // buisson de mûres
  for (const [dx, dy, r] of [[-60, -40, 42], [0, -62, 52], [60, -40, 42], [-25, -25, 40], [30, -25, 40]]) rond(ctx, x + dx, G + dy, r, [60, 140, 70], 3, [40, 100, 50]);
  const r = hasard(21), n = Math.round(16 * qte);
  for (let k = 0; k < 16; k++) {
    const px = x + r.uniform(-85, 85), py = G + r.uniform(-100, -15);
    if (k < n) { rond(ctx, px, py, 7, [80, 30, 90]); rond(ctx, px - 2, py - 2, 2, [190, 140, 210]); }
  }
}
function muresDansBenne(ctx, x, G, f, rempli) { // mûres sur la benne d'un camion (échelle 1)
  if (rempli <= 0.02) return;
  const bx = x - f * 32, by = G - 128, r = hasard(33), n = Math.round(30 * rempli);
  for (let k = 0; k < n; k++) rond(ctx, bx + r.uniform(-55, 55), by - r.uniform(0, 24 * rempli), 7, [80, 30, 90], 1, [50, 15, 60]);
}
// ------------------------------------------------------------ jardin : bac à sable, route, vol
function bacASable(ctx, cx, G, chateaux, total, t) {
  rrect(ctx, cx - 165, G - 18, 330, 62, 10, [180, 120, 70], 3);
  rrect(ctx, cx - 150, G - 10, 300, 46, 8, [245, 215, 140]);
  const n = Math.max(1, total);
  for (let k = 0; k < Math.min(chateaux, n); k++) { // un château par clic
    const x = cx - 100 + (200 * (k + 0.5)) / n, y = G + 8;
    const h = 46 + (k % 2) * 14;
    rrect(ctx, x - 26, y - h, 52, h, 3, [235, 195, 120], 2, [190, 145, 80]);
    for (const dx of [-26, -9, 8]) rrect(ctx, x + dx, y - h - 10, 14, 12, 2, [235, 195, 120], 2, [190, 145, 80]);
    rrect(ctx, x - 8, y - 22, 16, 22, 8, [200, 155, 90]);
    trait(ctx, [x, y - h - 10], [x, y - h - 36], 2, [120, 90, 60]);
    poly(ctx, [[x, y - h - 36], [x + 18, y - h - 30 + 3 * Math.sin(t * 4 + k)], [x, y - h - 24]], [[230, 70, 80], [70, 140, 230], [250, 200, 50]][k % 3]);
  }
  trait(ctx, [cx + 120, G + 12], [cx + 150, G - 35], 4, [230, 80, 80]); // la pelle
  ovale(ctx, cx + 140, G - 50, 22, 18, [230, 80, 80], 2);
}
function routePavee(ctx, x0, G, morceaux) { // route construite pierre après pierre
  for (let k = 0; k < morceaux; k++) {
    const x = x0 + k * 80;
    rrect(ctx, x, G - 6, 78, 34, 4, [150, 150, 158], 2, [100, 100, 110]);
    for (const [dx, dy] of [[12, 4], [40, 10], [62, 3], [25, 20], [55, 22]]) rond(ctx, x + dx, G - 6 + dy, 5, [175, 175, 182]);
    rrect(ctx, x + 22, G + 8, 34, 5, 0, [250, 250, 250]);
  }
}
function cailloux(ctx, x, G) {
  const r = hasard(41);
  for (let k = 0; k < 9; k++) rond(ctx, x + r.uniform(-60, 60), G + 10 - r.uniform(0, 25), r.int(8, 15), [140, 140, 150], 2);
}
function ailes(ctx, x, g, t) { // petites ailes magiques pour le vol du tractopelle
  const b = Math.sin(t * 14) * 18;
  for (const s of [-1, 1]) poly(ctx, [[x - 10, g - 110], [x - 70 - 10 * s, g - 160 - b], [x - 110, g - 130 - b * 0.5], [x - 60, g - 100]], [255, 255, 255], 3, [170, 200, 240]);
}
// ------------------------------------------------------------ portes & fenêtres, cadeau, vélo
const OUVERTURES = [[-62, -150, "f"], [62, -150, "f"], [-62, -70, "f"], [58, -58, "p"]]; // fenêtres puis la porte
function fenetrePiece(ctx, x, y, type) { // centre (x, y)
  if (type === "p") { rrect(ctx, x - 24, y - 42, 48, 84, 6, [150, 95, 60], 3); rond(ctx, x + 14, y + 4, 4, [250, 210, 80]); return; }
  rrect(ctx, x - 30, y - 26, 60, 52, 4, [250, 250, 250], 3);
  rrect(ctx, x - 24, y - 20, 48, 40, 2, VITRE);
  trait(ctx, [x, y - 20], [x, y + 20], 3, [250, 250, 250]);
  trait(ctx, [x - 24, y], [x + 24, y], 3, [250, 250, 250]);
}
function maisonAOuvrir(ctx, cx, G, poses, total, t) { // maison en construction : les trous se remplissent
  rrect(ctx, cx - 120, G - 200, 240, 200, 0, [240, 215, 180], 3);
  poly(ctx, [[cx - 140, G - 200], [cx + 140, G - 200], [cx, G - 280]], [200, 85, 70], 3);
  const n = Math.min(total, OUVERTURES.length);
  OUVERTURES.slice(0, n).forEach(([dx, dy, type], k) => {
    if (k < poses) fenetrePiece(ctx, cx + dx, G + dy, type);
    else if (type === "p") rrect(ctx, cx + dx - 24, G + dy - 42, 48, 84, 4, [70, 55, 50]);
    else rrect(ctx, cx + dx - 30, G + dy - 26, 60, 52, 4, [70, 55, 50]);
  });
  if (poses >= n) etoile(ctx, cx, G - 300 + 6 * Math.sin(t * 4), 18, [255, 225, 60], t);
}
function cadeau(ctx, cx, G, ouvert, t) {
  if (ouvert < 1) {
    const sau = Math.abs(Math.sin(t * 5)) * 6 * (1 - ouvert), lev = ouvert * 120;
    rrect(ctx, cx - 70, G - 110 - sau, 140, 110, 6, [230, 70, 90], 3);
    rrect(ctx, cx - 12, G - 110 - sau, 24, 110, 0, [255, 220, 80]);
    rrect(ctx, cx - 80, G - 136 - sau - lev, 160, 30, 6, [230, 70, 90], 3); // couvercle
    rrect(ctx, cx - 12, G - 136 - sau - lev, 24, 30, 0, [255, 220, 80]);
    for (const s of [-1, 1]) ovale(ctx, cx + s * 30 - 26, G - 160 - sau - lev, 52, 28, [255, 220, 80], 3);
  }
  if (ouvert > 0.3) velo(ctx, cx, G, 1, t, 0);
}
function velo(ctx, x, g, s, t, rot) { // le vélo jaune
  const P = (dx, dy) => [x + dx * s, g + dy * s];
  for (const cx of [-48, 48]) {
    rond(ctx, ...P(cx, -30), 30 * s, null, 6 * s, [50, 50, 58]);
    for (let k = 0; k < 3; k++) { const a = rot + (k * PI) / 3; trait(ctx, P(cx - 26 * Math.cos(a), -30 - 26 * Math.sin(a)), P(cx + 26 * Math.cos(a), -30 + 26 * Math.sin(a)), 2 * s, [180, 180, 190]); }
  }
  const J = [250, 200, 40];
  for (const [a, b] of [[[-48, -30], [-5, -30]], [[-5, -30], [30, -78]], [[-20, -82], [30, -78]], [[-48, -30], [-20, -82]], [[30, -78], [48, -30]], [[-5, -30], [-20, -82]]]) trait(ctx, P(...a), P(...b), 7 * s, J, "round");
  trait(ctx, P(30, -78), P(36, -100), 5 * s, [80, 80, 90], "round");
  trait(ctx, P(26, -100), P(48, -102), 6 * s, [80, 80, 90], "round");
  rrect(ctx, ...P(-36, -92), 32 * s, 10 * s, 5 * s, [60, 60, 70]);
  rond(ctx, ...P(-5, -30), 7 * s, [90, 90, 100]);
}
function coeur(ctx, x, y, r, col) {
  rond(ctx, x - r * 0.5, y - r * 0.2, r * 0.55, col);
  rond(ctx, x + r * 0.5, y - r * 0.2, r * 0.55, col);
  poly(ctx, [[x - r * 1.02, y], [x + r * 1.02, y], [x, y + r * 1.1]], col);
}
function bulle(ctx, x, y, r) {
  rond(ctx, x, y, r, null, 3, [210, 235, 255]);
  rond(ctx, x - r * 0.35, y - r * 0.35, Math.max(2, r * 0.22), [255, 255, 255]);
  arcRect(ctx, x - r + 3, y - r + 3, 2 * r - 6, 2 * r - 6, 3.6, 4.6, 2, [255, 190, 230]);
}

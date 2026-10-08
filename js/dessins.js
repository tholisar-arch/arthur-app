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
// Style dessin animé avec un peu de volume : contours fins dans une teinte plus foncée de l'objet (pas de trait noir),
// et chaque forme éclairée doucement d'en haut à gauche (dégradé clair -> couleur -> un peu plus foncé).
// Les ronds et les ovales ont un reflet arrondi, comme une balle. RELIEF.on = false : retour au dessin tout plat.
const TRAIT = 0.62;
const RELIEF = { on: true, fort: 1 };
function teinte(ctx, fill, x, y, w, h, arrondi = false) { // le remplissage : couleur unie, ou dégradé de lumière
  if (!RELIEF.on || w < 7 || h < 7 || w * h > 600000 || !ctx.createLinearGradient) return css(fill);
  const lum = (fill[0] * 0.3 + fill[1] * 0.59 + fill[2] * 0.11) / 255, k = RELIEF.fort;
  const haut = clair(fill, 0.24 * k), bas = fonce(fill, 1 - (lum > 0.9 ? 0.06 : 0.15) * k);
  const g = arrondi ? ctx.createRadialGradient(x + w * 0.36, y + h * 0.3, Math.min(w, h) * 0.04, x + w * 0.46, y + h * 0.46, Math.max(w, h) * 0.62)
    : ctx.createLinearGradient(0, y, 0, y + h);
  if (!g || !g.addColorStop) return css(fill);
  g.addColorStop(0, css(haut)); g.addColorStop(arrondi ? 0.5 : 0.45, css(fill)); g.addColorStop(1, css(bas));
  return g;
}
function bordure(ctx, fill, bord, colBord) {
  ctx.lineWidth = Math.max(1, bord * TRAIT);
  ctx.strokeStyle = css(colBord === CONTOUR && fill ? fonce(fill, 0.7) : colBord);
  ctx.stroke();
}
const estVitre = (c) => c && c[0] === VITRE[0] && c[1] === VITRE[1] && c[2] === VITRE[2];
function refletVitre(ctx, chemin, x, y, w, h) { // deux bandes de lumière en biais sur le verre
  if (!RELIEF.on || w < 12 || h < 12) return;
  ctx.save(); ctx.beginPath(); chemin(); ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  const b = Math.min(w, h);
  ctx.beginPath(); ctx.moveTo(x + w * 0.18, y + h); ctx.lineTo(x + w * 0.18 + b * 0.32, y + h); ctx.lineTo(x + w * 0.62 + b * 0.32, y); ctx.lineTo(x + w * 0.62, y); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h); ctx.lineTo(x + w * 0.5 + b * 0.12, y + h); ctx.lineTo(x + w * 0.94 + b * 0.12, y); ctx.lineTo(x + w * 0.94, y); ctx.fill();
  ctx.restore();
}
function rrect(ctx, x, y, w, h, rad, fill, bord, colBord = CONTOUR) {
  const chemin = () => { if (rad > 0) ctx.roundRect(x, y, w, h, Math.min(rad, w / 2, h / 2)); else ctx.rect(x, y, w, h); };
  ctx.beginPath(); chemin();
  if (fill) { ctx.fillStyle = teinte(ctx, fill, x, y, w, h); ctx.fill(); }
  if (bord) bordure(ctx, fill, bord, colBord);
  if (estVitre(fill)) refletVitre(ctx, chemin, x, y, w, h);
}
function ovale(ctx, x, y, w, h, fill, bord, colBord = CONTOUR) {
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * PI);
  if (fill) { ctx.fillStyle = teinte(ctx, fill, Math.min(x, x + w), Math.min(y, y + h), Math.abs(w), Math.abs(h), true); ctx.fill(); }
  if (bord) bordure(ctx, fill, bord, colBord);
}
function rond(ctx, x, y, r, fill, bord, colBord = CONTOUR) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, r), 0, 2 * PI);
  if (fill) { ctx.fillStyle = teinte(ctx, fill, x - r, y - r, 2 * r, 2 * r, true); ctx.fill(); }
  if (bord) bordure(ctx, fill, bord, colBord);
}
function poly(ctx, pts, fill, bord, colBord = CONTOUR) {
  const chemin = () => { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };
  ctx.beginPath(); chemin(); ctx.lineJoin = "round";
  let y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity;
  for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; }
  if (fill) { ctx.fillStyle = teinte(ctx, fill, x0, y0, x1 - x0, y1 - y0); ctx.fill(); }
  if (bord) bordure(ctx, fill, bord, colBord);
  if (estVitre(fill)) refletVitre(ctx, chemin, x0, y0, x1 - x0, y1 - y0);
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
    trait(this.ctx, pa, pb, ww + this.w(2.5), fonce(c, 0.7), "round");
    trait(this.ctx, pa, pb, ww, c, "round");
    if (RELIEF.on && ww >= 4) trait(this.ctx, [pa[0] - ww * 0.18, pa[1] - ww * 0.12], [pb[0] - ww * 0.18, pb[1] - ww * 0.12], ww * 0.35, clair(c, 0.3), "round");
  }
  arc(c, x1, y1, x2, y2, a0, a1, w = 3) { const r = this.R(x1, y1, x2, y2); arcRect(this.ctx, ...r, a0, a1, this.w(w), c); }
  forme(c, cmds, contour = true, cote = false) { // forme en courbes ; cote : le côté du fond un peu dans l'ombre : [["M", x, y], ["L", x, y], ["Q", cx, cy, x, y], ["C", c1x, c1y, c2x, c2y, x, y], ["Z"]]
    const ctx = this.ctx; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const P = (u, v) => { const p = this.P(u, v); if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; return p; };
    ctx.beginPath(); ctx.lineJoin = "round";
    for (const [op, ...a] of cmds) {
      if (op === "M") ctx.moveTo(...P(a[0], a[1]));
      else if (op === "L") ctx.lineTo(...P(a[0], a[1]));
      else if (op === "Q") { const q = P(a[0], a[1]), p = P(a[2], a[3]); ctx.quadraticCurveTo(q[0], q[1], p[0], p[1]); }
      else if (op === "C") { const c1 = P(a[0], a[1]), c2 = P(a[2], a[3]), p = P(a[4], a[5]); ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p[0], p[1]); }
      else if (op === "Z") ctx.closePath();
    }
    if (c) { ctx.fillStyle = teinte(ctx, c, x0, y0, x1 - x0, y1 - y0); ctx.fill(); }
    if (c && cote && RELIEF.on && x1 - x0 > 6) {
      const xa = this.f > 0 ? x0 : x1, gr = ctx.createLinearGradient(xa, 0, xa + (x1 - x0) * 0.55 * this.f, 0);
      if (gr && gr.addColorStop) {
        gr.addColorStop(0, "rgba(60,30,50,0.2)"); gr.addColorStop(1, "rgba(60,30,50,0)");
        ctx.save(); ctx.clip(); ctx.fillStyle = gr; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
      }
    }
    if (contour) bordure(ctx, c, this.w(3), CONTOUR);
  }
  chemin(cmds) { // le chemin seul (pour découper ou tracer)
    const ctx = this.ctx; ctx.beginPath();
    for (const [op, ...a] of cmds) {
      if (op === "M") ctx.moveTo(...this.P(a[0], a[1])); else if (op === "L") ctx.lineTo(...this.P(a[0], a[1]));
      else if (op === "Q") { const q = this.P(a[0], a[1]), p = this.P(a[2], a[3]); ctx.quadraticCurveTo(q[0], q[1], p[0], p[1]); }
      else if (op === "C") { const c1 = this.P(a[0], a[1]), c2 = this.P(a[2], a[3]), p = this.P(a[4], a[5]); ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p[0], p[1]); }
      else if (op === "Z") ctx.closePath();
    }
  }
  trace(c, cmds, w = 2) { this.chemin(cmds); const ctx = this.ctx; ctx.lineWidth = Math.max(1, w * this.s); ctx.strokeStyle = css(c); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); ctx.lineCap = "butt"; }
  courbe(c, [a, q, b], w = 2) { // trait courbe aux bouts ronds (sourcils, sourire…)
    const ctx = this.ctx, pa = this.P(...a), pq = this.P(...q), pb = this.P(...b);
    ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.quadraticCurveTo(pq[0], pq[1], pb[0], pb[1]);
    ctx.lineWidth = Math.max(1, w * this.s); ctx.strokeStyle = css(c); ctx.lineCap = "round"; ctx.stroke(); ctx.lineCap = "butt";
  }
}

// ------------------------------------------------------------ pièces des véhicules
function roue(pen, cx, r, rot) {
  pen.circle(PNEU, cx, -r, r, true);
  if (RELIEF.on) { const c = pen.P(cx, -r), ctx = pen.ctx; ctx.beginPath(); ctx.arc(c[0], c[1], r * pen.s * 0.8, PI * 1.08, PI * 1.62); ctx.lineWidth = Math.max(1, r * pen.s * 0.13); ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineCap = "round"; ctx.stroke(); ctx.lineCap = "butt"; }
  pen.circle(JANTE, cx, -r, r * 0.58);
  for (let k = 0; k < 4; k++) {
    const a = rot + (k * PI) / 2;
    pen.line(GRIS, [cx, -r], [cx + Math.cos(a) * r * 0.5, -r + Math.sin(a) * r * 0.5], 4);
  }
  pen.circle(fonce(JANTE), cx, -r, r * 0.2);
}

function visage(pen, cx, cy, sz, t, dort = false) { // petit visage sobre dans la vitre
  const cligne = mod(t, 3.7) < 0.13;
  for (const ex of [-0.34, 0.34]) {
    const x = cx + ex * sz;
    if (dort || cligne) pen.arc(CONTOUR, x - 0.18 * sz, cy - 0.12 * sz, x + 0.18 * sz, cy + 0.14 * sz, PI, 2 * PI, 2);
    else {
      pen.circle([255, 255, 255], x, cy - 0.04 * sz, 0.2 * sz, true);
      pen.circle([30, 30, 40], x + 0.05 * sz, cy - 0.02 * sz, 0.1 * sz);
    }
  }
  if (dort) pen.circle(CONTOUR, cx, cy + 0.4 * sz, 0.07 * sz);
  else pen.arc(CONTOUR, cx - 0.2 * sz, cy + 0.12 * sz, cx + 0.2 * sz, cy + 0.42 * sz, PI * 1.1, PI * 1.9, 2);
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

function ombre(ctx, x, g, largeur, hauteur) { // ombre douce au sol (plus foncée au centre)
  ctx.beginPath(); ctx.ellipse(x, g + 2, largeur / 2, hauteur / 2, 0, 0, 2 * PI);
  if (RELIEF.on && ctx.createRadialGradient && largeur > 4) {
    ctx.save(); ctx.translate(x, g + 2); ctx.scale(1, Math.max(0.05, hauteur / largeur));
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, largeur / 2);
    ctx.restore();
    if (gr && gr.addColorStop) {
      gr.addColorStop(0, "rgba(20,25,40,0.36)"); gr.addColorStop(0.65, "rgba(20,25,40,0.22)"); gr.addColorStop(1, "rgba(20,25,40,0)");
      ctx.save(); ctx.translate(x, g + 2); ctx.scale(1, Math.max(0.05, hauteur / largeur));
      ctx.beginPath(); ctx.arc(0, 0, largeur / 2, 0, 2 * PI); ctx.fillStyle = gr; ctx.fill(); ctx.restore();
      return;
    }
  }
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
  ecole: [[110, 190, 250], [215, 240, 255]], vacances: [[70, 175, 245], [205, 240, 255]], jardin: [[95, 180, 245], [215, 240, 255]], pms: [[100, 175, 240], [210, 235, 255]],
  foret: [[110, 185, 235], [215, 240, 250]], montagne: [[115, 180, 240], [225, 240, 255]], ferme: [[100, 185, 250], [225, 245, 255]], port: [[90, 180, 240], [215, 240, 255]], nuit: [[15, 20, 60], [60, 60, 120]],
};
const SOLS = {
  chantier: [[140, 200, 90], [205, 170, 125]], ville: [[110, 110, 120], [90, 90, 100]],
  campagne: [[130, 200, 85], [215, 195, 150]], dinosaures: [[215, 180, 110], [190, 150, 90]],
  plage: [[240, 215, 150], [225, 195, 130]], neige: [[245, 248, 255], [215, 225, 240]],
  ecole: [[130, 200, 100], [190, 195, 210]],
  vacances: [[130, 200, 85], [232, 218, 188]],
  jardin: [[130, 200, 85], [150, 210, 100]],
  pms: [[130, 195, 100], [175, 178, 190]],
  foret: [[95, 165, 80], [190, 155, 110]], montagne: [[140, 195, 110], [185, 178, 168]],
  ferme: [[140, 205, 90], [215, 185, 135]], port: [[205, 195, 175], [175, 165, 155]],
};

function soleil(ctx, x, y, t) { // soleil simple, sans visage, avec un halo de lumière
  if (RELIEF.on && ctx.createRadialGradient) {
    const h = ctx.createRadialGradient(x, y, 30, x, y, 150 + 4 * Math.sin(t * 1.5));
    if (h && h.addColorStop) {
      h.addColorStop(0, "rgba(255,240,170,0.55)"); h.addColorStop(0.4, "rgba(255,240,180,0.2)"); h.addColorStop(1, "rgba(255,245,200,0)");
      ctx.fillStyle = h; ctx.beginPath(); ctx.arc(x, y, 155, 0, 2 * PI); ctx.fill();
    }
  } else {
    ctx.fillStyle = "rgba(255,235,140,0.35)";
    ctx.beginPath(); ctx.arc(x, y, 54 + 2 * Math.sin(t * 1.5), 0, 2 * PI); ctx.fill();
  }
  rond(ctx, x, y, 38, [255, 222, 70], 3);
}
function lune(ctx, x, y) { // un vrai croissant (découpé, donc joli sur n'importe quel ciel) et un halo doux
  if (RELIEF.on && ctx.createRadialGradient) {
    const h = ctx.createRadialGradient(x, y, 30, x, y, 110);
    if (h && h.addColorStop) { h.addColorStop(0, "rgba(255,250,210,0.22)"); h.addColorStop(1, "rgba(255,250,210,0)"); ctx.fillStyle = h; ctx.beginPath(); ctx.arc(x, y, 110, 0, 2 * PI); ctx.fill(); }
  }
  ctx.save(); ctx.beginPath(); ctx.rect(x - 60, y - 60, 120, 120); ctx.arc(x + 18, y - 10, 32, 0, 2 * PI); ctx.clip("evenodd");
  rond(ctx, x, y, 38, [250, 245, 200]);
  ctx.restore();
}
function nuage(ctx, x, y, s = 1, col = [255, 255, 255]) {
  if (RELIEF.on) for (const [dx, dy, r] of [[2, 6, 27], [32, 14, 25], [62, 6, 27]]) rond(ctx, x + dx * s, y + dy * s, r * s, fonce(col, 0.9));
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

function arbre(ctx, x, g, s = 1, col = [95, 175, 70]) { // arbre : tronc et bouquet de feuillage
  if (!RELIEF.on) { rrect(ctx, x - 5 * s, g - 72 * s, 10 * s, 72 * s, 3 * s, [150, 105, 65], 3); rond(ctx, x, g - 98 * s, 40 * s, col, 4); return; }
  poly(ctx, [[x - 7 * s, g], [x + 7 * s, g], [x + 4 * s, g - 74 * s], [x - 4 * s, g - 74 * s]], [150, 105, 65], 3);
  trait(ctx, [x, g - 62 * s], [x + 14 * s, g - 80 * s], Math.max(1, 4 * s), [140, 98, 60], "round");
  const touffes = [[-24, -84, 26], [24, -86, 25], [0, -78, 26], [-14, -108, 27], [16, -110, 26], [0, -124, 22]];
  for (const [dx, dy, r] of touffes) rond(ctx, x + dx * s, g + dy * s, r * s, col, 4); // le contour du bouquet
  for (const [dx, dy, r] of touffes) rond(ctx, x + dx * s, g + dy * s, (r - 1.5) * s, col);   // puis l'intérieur, sans traits
  for (const [dx, dy] of [[-16, -100], [12, -118], [6, -92]]) rond(ctx, x + dx * s, g + dy * s, 7 * s, clair(col, 0.22)); // des reflets de lumière
}
function collines(ctx, W, horizon, scroll, claire = [150, 210, 95], foncee = [120, 190, 80], maison = true) {
  // collines toutes rondes, cernées d'un fin trait, avec une petite maison et des arbres au sommet
  const x1 = boucle(200, scroll, 0.12, W, 700), x2 = boucle(820, scroll, 0.12, W, 700), x3 = boucle(450, scroll, 0.18, W, 700);
  ovale(ctx, x1 - 450, horizon - 150, 900, 340, foncee, 4);
  if (maison) { // la petite maison jaune sur la colline du fond
    const hx = x1 + 60, hy = horizon - 150 + 6;
    rrect(ctx, hx - 22, hy - 30, 44, 30, 0, [250, 220, 120], 3);
    poly(ctx, [[hx - 28, hy - 30], [hx + 28, hy - 30], [hx, hy - 52]], [215, 85, 70], 3);
    rrect(ctx, hx - 6, hy - 16, 12, 16, 2, [150, 100, 60]);
    rrect(ctx, hx + 9, hy - 25, 9, 9, 1, VITRE);
  }
  ovale(ctx, x2 - 500, horizon - 120, 1000, 300, claire, 4);
  for (const dx of [-150, 170]) arbre(ctx, x2 + dx, horizon - 112 + Math.abs(dx) * 0.06, 0.38);
  ovale(ctx, x3 - 400, horizon - 75, 800, 230, foncee, 4);
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
  if (RELIEF.on) { // le ciel : plus profond en haut, plus clair vers l'horizon
    const ciel = ctx.createLinearGradient(0, 0, 0, G);
    ciel.addColorStop(0, css(haut.map((v, i) => lerp(v, bas[i], 0.1)))); ciel.addColorStop(1, css(bas));
    ctx.fillStyle = ciel;
  } else ctx.fillStyle = css(haut.map((v, i) => lerp(v, bas[i], 0.45))); // ciel uni
  ctx.fillRect(0, 0, W, H);
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
    collines(ctx, W, horizon, scroll, [165, 210, 130], [140, 195, 115]);
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
    collines(ctx, W, horizon, scroll);
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
    collines(ctx, W, horizon, scroll);
    const x = boucle(560, scroll, 0.3, W, 300);
    rrect(ctx, x - 230, horizon - 200, 460, 200, 0, [250, 232, 195], 3);
    poly(ctx, [[x - 255, horizon - 200], [x + 255, horizon - 200], [x, horizon - 290]], [210, 85, 70], 3);
    rrect(ctx, x - 85, horizon - 192, 170, 40, 10, [90, 150, 230]);
    ecrireCentre(ctx, tr("ecole"), x, horizon - 171, 30, [255, 255, 255]);
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
    collines(ctx, W, horizon, scroll);
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
    collines(ctx, W, horizon, scroll);
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
  else if (nom === "foret") {
    collines(ctx, W, horizon, scroll, [110, 180, 90], [85, 155, 75], false);
    for (let k = 0; k < 6; k++) sapinVert(ctx, boucle(k * 210 + 30, scroll, 0.3, W), horizon - 10, 0.75);
    for (let k = 0; k < 7; k++) arbre(ctx, boucle(k * 180 + 120, scroll, 0.42, W), horizon + 5, 1.15 + 0.2 * (k % 2), [[70, 150, 70], [95, 170, 70], [60, 135, 80]][k % 3]);
  }
  else if (nom === "montagne") {
    for (let k = 0; k < 3; k++) {
      const x = boucle(k * 420 + 120, scroll, 0.15, W, 300), h = 280 + (k % 2) * 60;
      poly(ctx, [[x - 260, horizon], [x, horizon - h], [x + 260, horizon]], [[150, 160, 185], [130, 145, 170]][k % 2], 3);
      poly(ctx, [[x - 62, horizon - h + 66], [x, horizon - h], [x + 62, horizon - h + 66], [x + 25, horizon - h + 52], [x, horizon - h + 70], [x - 25, horizon - h + 52]], [255, 255, 255]);
    }
    collines(ctx, W, horizon, scroll, [150, 205, 110], [125, 185, 95], false);
    const cx = boucle(700, scroll, 0.3, W, 300); // une petite cascade
    rrect(ctx, cx - 14, horizon - 150, 28, 150, 10, [150, 205, 245], 3);
    for (let k = 0; k < 4; k++) trait(ctx, [cx - 6 + k * 4, horizon - 140 + mod(t * 90 + k * 30, 120)], [cx - 6 + k * 4, horizon - 125 + mod(t * 90 + k * 30, 120)], 2, [255, 255, 255]);
    for (let k = 0; k < 5; k++) sapinVert(ctx, boucle(k * 260 + 60, scroll, 0.4, W), horizon + 5, 0.6);
  }
  else if (nom === "ferme") {
    collines(ctx, W, horizon, scroll, [170, 215, 100], [145, 200, 85], false);
    const x = boucle(560, scroll, 0.3, W, 300); // la grange rouge et le silo
    rrect(ctx, x - 140, horizon - 170, 280, 170, 0, [210, 70, 60], 3);
    poly(ctx, [[x - 160, horizon - 170], [x + 160, horizon - 170], [x + 110, horizon - 235], [x - 110, horizon - 235]], [150, 60, 55], 3);
    rrect(ctx, x - 50, horizon - 110, 100, 110, 4, [245, 235, 220], 3);
    trait(ctx, [x - 46, horizon - 106], [x + 46, horizon - 4], 6, [210, 70, 60]); trait(ctx, [x + 46, horizon - 106], [x - 46, horizon - 4], 6, [210, 70, 60]);
    rrect(ctx, x - 25, horizon - 160, 50, 34, 4, [245, 235, 220], 3);
    rrect(ctx, x + 160, horizon - 230, 70, 230, 0, [200, 205, 215], 3);
    ovale(ctx, x + 160, horizon - 262, 70, 64, [170, 175, 190], 3);
    for (const bx of [x - 260, x - 200, x + 290]) { rond(ctx, bx, horizon - 26, 28, [240, 205, 90], 3); rond(ctx, bx, horizon - 26, 14, null, 2, [210, 170, 70]); }
    for (let k = 0; k < 30; k++) { // la barrière en bois
      const px = boucle(k * 44, scroll, 0.5, W, 50);
      rrect(ctx, px, horizon - 40, 8, 40, 2, [190, 140, 90], 2);
    }
    trait(ctx, [0, horizon - 30], [W, horizon - 30], 5, [190, 140, 90]); trait(ctx, [0, horizon - 14], [W, horizon - 14], 5, [190, 140, 90]);
  }
  else if (nom === "port") {
    rrect(ctx, 0, horizon - 90, W, 90, 0, [70, 155, 220]); // la mer
    for (let k = 0; k < 16; k++) { const x = mod(k * 80 + t * 25, W + 80) - 40; arcRect(ctx, x, horizon - 80 + (k % 4) * 18, 40, 14, 0, PI, 3, [220, 240, 255]); }
    [[200, [240, 90, 80]], [620, [90, 150, 230]], [930, [250, 200, 60]]].forEach(([bx0, c], k) => { // les bateaux
      const bx = boucle(bx0 + t * 6, scroll, 0.25, W), by = horizon - 72 + 4 * Math.sin(t * 2 + k);
      poly(ctx, [[bx - 60, by], [bx + 60, by], [bx + 45, by + 26], [bx - 45, by + 26]], c, 3);
      trait(ctx, [bx, by], [bx, by - 90], 4, [120, 90, 60]);
      poly(ctx, [[bx + 4, by - 86], [bx + 4, by - 8], [bx + 52, by - 8]], [255, 255, 255], 3);
    });
    const px = boucle(1080, scroll, 0.3, W, 300); // le phare
    poly(ctx, [[px - 30, horizon], [px + 30, horizon], [px + 18, horizon - 200], [px - 18, horizon - 200]], [255, 255, 255], 3);
    for (let k = 0; k < 3; k++) { const y = horizon - 40 - k * 60; poly(ctx, [[px - 28 + k * 4, y], [px + 28 - k * 4, y], [px + 26 - k * 4, y - 26], [px - 26 + k * 4, y - 26]], [220, 70, 70]); }
    rrect(ctx, px - 22, horizon - 232, 44, 32, 6, [255, 230, 120], 3);
    poly(ctx, [[px - 28, horizon - 232], [px + 28, horizon - 232], [px, horizon - 262]], [220, 70, 70], 3);
    for (let k = 0; k < 3; k++) { const cx = boucle(k * 380 + 380, scroll, 0.6, W); rrect(ctx, cx, horizon - 34, 46, 40, 3, [200, 150, 90], 3); trait(ctx, [cx, horizon - 14], [cx + 46, horizon - 14], 2, [150, 105, 60]); }
  }
  else if (DECORS_EXTRA[nom]) DECORS_EXTRA[nom].fond(ctx, W, H, horizon, scroll, t, nuit); // parc, zoo, maison, gare, espace…
  const [herbe, route] = SOLS[nom];
  if (RELIEF.on) { // un voile de brume sur le fond : les choses lointaines paraissent plus claires
    const brume = ctx.createLinearGradient(0, horizon - 160, 0, horizon);
    brume.addColorStop(0, css(bas, 0)); brume.addColorStop(1, css(bas, nuit ? 0.12 : 0.28));
    ctx.fillStyle = brume; ctx.fillRect(0, horizon - 160, W, 160);
  }
  rrect(ctx, 0, horizon, W, H - horizon, 0, herbe);
  rrect(ctx, 0, horizon + 18, W, G - horizon + 40, 0, route);
  if (RELIEF.on) { // brins d'herbe au bord, petits cailloux sur le chemin, ombre douce au bord de la route
    const r3 = hasard(11), vert = herbe[1] > herbe[0] + 25 && herbe[1] > herbe[2] + 25;
    ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(0, horizon + 18, W, 5);
    for (let k = 0; k < 70; k++) {
      const x = boucle(r3() * (W + 200), scroll, 1, W, 100), y = horizon + 3 + r3() * 13, h = 5 + r3() * 6;
      if (vert) trait(ctx, [x, y + h * 0.5], [x + (r3() - 0.5) * 5, y - h * 0.5], 2, k % 2 ? fonce(herbe, 0.82) : clair(herbe, 0.25), "round");
      else rond(ctx, x, y, 1.5 + r3() * 1.5, fonce(herbe, 0.88));
    }
    for (let k = 0; k < 26; k++) {
      const x = boucle(r3() * (W + 200), scroll, 1, W, 100), y = horizon + 28 + r3() * (G - horizon + 25);
      ovale(ctx, x, y, 5 + r3() * 7, 3 + r3() * 3, k % 3 ? fonce(route, 0.88) : clair(route, 0.2));
    }
  }
  if (nom === "ville") {
    for (let k = 0; k < 14; k++) rrect(ctx, boucle(k * 90, scroll, 1, W, 100), G + 22, 50, 8, 0, [250, 250, 250]);
  } else if (nom === "ecole") {
    const x0 = boucle(150, scroll, 1, W, 300), cols = [[255, 120, 120], [255, 200, 80], [120, 200, 255], [150, 220, 120], [220, 150, 240]];
    for (let k = 0; k < 5; k++) rrect(ctx, x0 + k * 48, G + 22, 44, 30, 4, null, 4, cols[k]);
  } else if (nom === "chantier") {
    const r2 = hasard(3);
    for (let k = 0; k < 30; k++) {
      const x = boucle(r2() * 1400, scroll, 1, W, 100);
      if (k % 3 === 0) rond(ctx, x, horizon + 25 + r2() * (G - horizon + 30), 3 + r2.int(0, 3), [180, 145, 105]);
    }
  }
  if (DECORS_EXTRA[nom] && DECORS_EXTRA[nom].devant) DECORS_EXTRA[nom].devant(ctx, W, H, horizon, scroll, t, nuit, G);
  for (let k = 0; k < 6; k++) {
    const x = boucle(k * 230 + 60, scroll, 1.25, W, 120), y = H - 8;
    if (nom === "chantier") { poly(ctx, [[x - 16, y], [x + 16, y], [x, y - 44]], [255, 130, 30]); rrect(ctx, x - 8, y - 26, 16, 7, 0, [255, 255, 255]); }
    else if (nom === "ecole") { trait(ctx, [x, y], [x, y - 40], 2, [90, 90, 100]); ovale(ctx, x - 14, y - 72, 28, 34, [[255, 90, 120], [90, 170, 250], [255, 210, 60]][k % 3]); }
    else if (nom === "campagne" || nom === "jardin") {
      for (const dx of [-12, 0, 12]) { trait(ctx, [x + dx, y], [x + dx, y - 22], 3, [60, 140, 60]); rond(ctx, x + dx, y - 24, 7, [[255, 90, 120], [255, 220, 60], [180, 120, 255]][mod(k + dx, 3)]); }
    } else if (nom === "ville") { rrect(ctx, x - 3, y - 70, 6, 70, 0, [80, 80, 90]); rond(ctx, x, y - 74, 10, [255, 240, 150]); }
    else if (nom === "dinosaures") { ovale(ctx, x - 13, y - 34, 26, 34, [250, 245, 230]); rond(ctx, x - 4, y - 20, 4, [150, 210, 150]); }
    else if (nom === "plage") rond(ctx, x, y - 8, 9, [250, 150, 160]);
    else if (nom === "foret") champignon(ctx, x, y, 1 + 0.3 * (k % 2));
    else if (nom === "montagne") { ovale(ctx, x - 24, y - 26, 48, 30, [160, 160, 170], 3); ovale(ctx, x + 6, y - 18, 30, 20, [180, 180, 190], 3); }
    else if (nom === "ferme") for (const dx of [-12, -4, 4, 12]) { trait(ctx, [x + dx, y], [x + dx * 1.4, y - 40], 3, [200, 170, 60]); ovale(ctx, x + dx * 1.4 - 4, y - 54, 8, 18, [235, 200, 80]); }
    else if (nom === "port") { rrect(ctx, x - 9, y - 30, 18, 30, 5, [90, 95, 110], 2); trait(ctx, [x + 9, y - 18], [x + 60, y - 8], 3, [210, 180, 120]); }
    else if (nom === "vacances") for (const dx of [-10, 0, 10]) { trait(ctx, [x + dx, y], [x + dx * 1.3, y - 34], 3, [90, 150, 80]); ovale(ctx, x + dx * 1.3 - 4, y - 50, 8, 18, [170, 120, 220]); }
    else if (nom === "neige") { rond(ctx, x, y - 16, 16, [255, 255, 255]); rond(ctx, x, y - 42, 11, [255, 255, 255]); poly(ctx, [[x, y - 43], [x + 14, y - 40], [x, y - 38]], [255, 140, 30]); }
  }
  if (nuit && RELIEF.on) { // la nuit tombe aussi sur le paysage (moins sur le fond, pour garder les fenêtres allumées)
    ctx.fillStyle = "rgba(25,30,80,0.18)"; ctx.fillRect(0, horizon - 260, W, 260);
    ctx.fillStyle = "rgba(25,30,80,0.36)"; ctx.fillRect(0, horizon, W, H - horizon);
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

// ------------------------------------------------------------ les personnages (configurables)
// Chaque personnage est un petit « modèle » (voir personnages.json) : couleurs par nom, coiffure, accessoires.
const PALETTES = {
  peau: { tres_clair: [255, 228, 205], clair: [250, 214, 180], beige: [235, 192, 152], mat: [212, 163, 118], cuivre: [190, 135, 95], brun: [160, 110, 75], fonce: [125, 85, 60], tres_fonce: [92, 62, 44] },
  cheveux: { noir: [30, 25, 25], brun_fonce: [60, 35, 20], brun: [110, 65, 35], chatain: [150, 100, 55], blond_fonce: [175, 130, 65], blond: [228, 188, 98], blond_clair: [245, 222, 155], roux: [210, 100, 40], gris: [170, 170, 178], blanc: [228, 228, 234] },
  yeux: { marron_fonce: [70, 45, 25], marron: [120, 75, 40], noisette: [150, 110, 50], vert: [70, 150, 80], vert_clair: [120, 195, 130], bleu: [70, 130, 220], bleu_clair: [130, 190, 240], gris: [130, 140, 150] },
  habits: { bleu: [90, 160, 230], marine: [60, 90, 150], rouge: [215, 60, 60], rose: [235, 110, 160], orange: [240, 130, 50], jaune: [250, 200, 40], vert: [90, 190, 110], lilas: [170, 140, 220], blanc: [240, 240, 245], noir: [60, 60, 75], beige: [200, 180, 140], jean: [70, 80, 120] },
  chaussures: { noir: [60, 50, 60], marron: [120, 75, 45], blanc: [245, 245, 248], rouge: [215, 60, 60], bleu: [70, 120, 210], rose: [240, 130, 180], jaune: [250, 200, 40], vert: [80, 170, 90] },
};
const COIFFURES = ["court", "herisse", "boucle", "milong", "long", "couettes", "chignon", "chauve"];
const CORPULENCES = ["mince", "moyen", "costaud", "rond"];
const HAUTS = ["teeshirt", "pull", "chemise", "debardeur", "salopette", "robe"];
const BAS = ["pantalon", "short", "jupe"];
const DESSINS_TSHIRT = [null, "tractopelle", "dino", "etoile", "coeur"];
const PERSONNAGES_DEFAUT = {
  arthur: { nom: "Arthur", age: "enfant", peau: "clair", cheveux: "blond_fonce", coiffure: "court", yeux: "vert", haut: "bleu", bas: "jean", dessin: "tractopelle" },
  papa: { nom: "Papa", age: "adulte", taille: "grand", muscle: true, peau: "clair", cheveux: "blond_fonce", coiffure: "court", yeux: "bleu", haut: "blanc", bas: "marine" },
  maman: { nom: "Maman", age: "adulte", peau: "clair", cheveux: "brun", coiffure: "long", yeux: "marron", haut: "rose", bas: "peau", robe: true, couronne: true, cils: true },
  papi: { nom: "Papy", age: "adulte", peau: "clair", cheveux: "blanc", coiffure: "chauve", yeux: "gris", haut: "vert", bas: "beige", lunettes: true, moustache: true },
  mamie: { nom: "Mamie", age: "adulte", taille: "petit", peau: "clair", cheveux: "gris", coiffure: "chignon", yeux: "noisette", haut: "lilas", bas: "peau", robe: true, cils: true, lunettes: true },
  enfant1: { nom: "Copine", age: "enfant", peau: "cuivre", cheveux: "brun_fonce", coiffure: "couettes", yeux: "marron_fonce", haut: "rose", bas: "lilas", robe: true, cils: true },
  enfant2: { nom: "Copain", age: "enfant", peau: "fonce", cheveux: "noir", coiffure: "court", yeux: "marron_fonce", haut: "vert", bas: "noir" },
  enfant3: { nom: "Copain roux", age: "enfant", taille: "petit", peau: "clair", cheveux: "roux", coiffure: "court", yeux: "bleu", haut: "orange", bas: "jean" },
};
function couleurDe(pal, v, defaut) {
  if (Array.isArray(v)) return v;
  if (pal === "habits" && v === "peau") return null; // jambes nues (robe)
  return PALETTES[pal][v] || PALETTES[pal][defaut];
}
function styleDe(p) { // modèle -> mesures et couleurs pour le dessin
  const adulte = p.age === "adulte", k = { petit: 0.92, moyen: 1, grand: 1.07 }[p.taille] || 1;
  const corp = CORPULENCES.includes(p.corpulence) ? p.corpulence : p.muscle ? "costaud" : "moyen";
  const kW = { mince: 0.86, moyen: 1, costaud: 1.25, rond: 1.25 }[corp];
  const b = adulte ? { L: 94, T: 70, R: 24.5, W: 46 } : { L: 45, T: 42, R: 23, W: 32 }; // proportions proches du vrai (tête un peu grosse quand même)
  const typeHaut = HAUTS.includes(p.haut_type) ? p.haut_type : p.robe ? "robe" : "teeshirt";
  const typeBas = typeHaut === "salopette" ? "pantalon" : BAS.includes(p.bas_type) ? p.bas_type : "pantalon";
  return {
    L: b.L * k, T: b.T * k, R: b.R * 1.06, W: b.W * kW, corpulence: corp, typeHaut, typeBas,
    peau: couleurDe("peau", p.peau, "clair"), cheveux: couleurDe("cheveux", p.cheveux, "brun"),
    coiffure: COIFFURES.includes(p.coiffure) ? p.coiffure : "court", yeux: couleurDe("yeux", p.yeux, "marron"),
    haut: couleurDe("habits", p.haut, "bleu"), bas: couleurDe("habits", p.bas, "jean"),
    chaussures: couleurDe("chaussures", p.chaussures, "noir"),
    robe: typeHaut === "robe", cils: !!p.cils, lunettes: !!p.lunettes, couronne: !!p.couronne, moustache: !!p.moustache,
    barbe: !!p.barbe, muscle: corp === "costaud", rond: corp === "rond", dessin: DESSINS_TSHIRT.includes(p.dessin) ? p.dessin : null,
  };
}
let PERSONNAGES = {};
const STYLES = {};

// Style « dessin animé presque réel » : proportions proches du vrai (cou, longues jambes), visage ovale de trois quarts
// tourné vers l'avant (profil avec nez, lèvres et menton), yeux en amande avec iris et paupière, oreille, joues rosées
// fondues ; bras et jambes qui s'affinent (épaule -> poignet, cuisse -> cheville) avec coude et genou, mains avec
// pouce et doigts, vêtements avec col et plis. Lumière : le côté du fond de chaque forme est un peu dans l'ombre.
function personne(ctx, x, g, s, t, f, marche, mange, humeur, style) {
  const st = STYLES[style], pen = new Pen(ctx, x, g, s, f);
  const { L, T, R, W } = st, hanche = -L, epaule = -L - T;
  const adulte = L > 70, cou = adulte ? 0.42 : 0.26, ty = epaule - (1.08 + cou) * R + 3, tx = 0;
  const joie = humeur === "joie", peur = humeur === "peur", peau = st.peau, cheveux = st.cheveux;
  const pts = (l) => l.map(([u, v]) => [tx + u * R, ty + v * R]);
  const tete = (cmds) => cmds.map(([op, ...a]) => [op, ...a.map((n, i) => (i % 2 ? ty + n * R : tx + n * R))]);
  const fond = (c) => fonce(c, 0.84);
  const jupe = st.typeBas === "jupe" && !st.robe, jambeNue = !st.bas || jupe;
  const manche = { teeshirt: 0.45, pull: 0.96, chemise: 0.96, debardeur: 0, salopette: 0.45, robe: 0.3 }[st.typeHaut];
  const k_ = adulte ? 0 : 1; // les enfants : visage plus rond, nez plus petit, yeux plus grands
  const vers = (a, b, q) => [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
  const fondu = (u, v, r, col, a) => { // tache de couleur fondue (joues, ombre sous le menton)
    const p = pen.P(tx + u * R, ty + v * R), rr = r * R * s, gr = ctx.createRadialGradient ? ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr) : null;
    if (!gr || !gr.addColorStop) return;
    gr.addColorStop(0, css(col, a)); gr.addColorStop(1, css(col, 0)); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, 2 * PI); ctx.fill();
  };
  const couette = (sx) => {
    pen.forme(sx > 0 ? cheveux : fond(cheveux), tete([["M", sx * 0.72, -0.7], ["C", sx * 1.38, -0.86, sx * 1.62, 0.0, sx * 1.3, 0.62], ["C", sx * 1.2, 0.22, sx * 1.0, -0.06, sx * 0.8, -0.14], ["Z"]]), true, true);
    const n = pen.P(tx + sx * 0.84 * R, ty - 0.56 * R); rond(ctx, n[0], n[1], 0.12 * R * s, [250, 90, 130], 2);
  };

  // --- derrière : cheveux longs, couette du fond
  if (st.coiffure === "long") {
    const yl = (epaule + T * 0.5 - ty) / R;
    pen.forme(fond(cheveux), tete([["M", 0.1, -1.18], ["C", 0.9, -1.18, 1.1, -0.5, 1.02, 0.3], ["C", 1.0, yl - 0.4, 0.85, yl, 0.5, yl], ["L", -0.75, yl + 0.06],
      ["C", -1.12, yl, -1.24, yl - 0.5, -1.16, 0.2], ["C", -1.14, -0.7, -0.75, -1.18, 0.1, -1.18], ["Z"]]), true, true);
  }
  if (st.coiffure === "couettes") couette(-1);

  // --- bras : épaule -> coude -> poignet, qui s'affine ; main avec pouce et doigts
  const unBras = (k) => {
    const sx = k ? 1 : -1, sw = Math.sin(marche + k * PI) * 10, derriere = !k;
    const larg = (adulte ? 6 : 4.8) * (st.muscle ? 1.35 : 1);
    const demi = st.rond ? W * 0.6 : st.robe ? W * 0.48 : W * 0.52;
    const ep = [sx * (demi - larg * 0.8), epaule + larg * 1.1];
    const main = joie ? [sx * (demi + 16), epaule - 34 - 6 * Math.sin(t * 8 + k)] : [sx * (demi + 3) + sw * 0.35, hanche + 4 + Math.abs(sw) * 0.15];
    const coude = [(ep[0] + main[0]) / 2 + sx * larg * (joie ? 1.8 : 0.7) - (joie ? 0 : larg * 0.3), (ep[1] + main[1]) / 2];
    const cP = derriere ? fond(peau) : peau, cH = derriere ? fond(st.haut) : st.haut;
    pen.bras(cP, ep, coude, larg * 1.1); pen.bras(cP, coude, main, larg * 0.9);
    if (manche > 0.5) {
      pen.bras(cH, ep, coude, larg * 1.55); pen.bras(cH, coude, vers(coude, main, 0.82), larg * 1.35);
      pen.bras(fonce(cH, 0.88), vers(coude, main, 0.74), vers(coude, main, 0.82), larg * 1.45); // le poignet
      pen.courbe(fonce(cH, 0.78), [vers(ep, coude, 0.75), [coude[0] - sx * larg * 0.3, coude[1] + larg * 0.4], vers(coude, main, 0.2)], 1.2); // pli du coude
    } else if (manche > 0) pen.bras(cH, ep, vers(ep, coude, manche * 1.5), larg * 1.85);
    // la main, dans le prolongement de l'avant-bras
    const d = [main[0] - coude[0], main[1] - coude[1]], n = Math.hypot(d[0], d[1]) || 1, ax = [d[0] / n, d[1] / n], pp = [-ax[1] * f * f, ax[0]];
    const lm = larg * 2.3, wm = larg * 1.0, M = (a, b) => [main[0] + ax[0] * a + pp[0] * b, main[1] + ax[1] * a + pp[1] * b];
    const devant = ax[0] >= 0 ? 1 : -1; // le pouce du côté du regard
    pen.forme(cP, [["M", ...M(-wm * 0.3, -wm)], ["C", ...M(lm * 0.6, -wm * 1.15), ...M(lm, -wm * 0.6), ...M(lm, 0)], ["C", ...M(lm, wm * 0.7), ...M(lm * 0.55, wm * 1.1), ...M(-wm * 0.3, wm)], ["Z"]]);
    const pouce = (b) => pen.forme(cP, [["M", ...M(lm * 0.05, b * wm * 0.7)], ["C", ...M(lm * 0.25, b * wm * 1.8), ...M(lm * 0.6, b * wm * 1.6), ...M(lm * 0.55, b * wm * 0.8)], ["Z"]]);
    pouce(-devant * sx);
    pen.line(fonce(cP, 0.8), M(lm * 0.62, -wm * 0.25), M(lm * 0.95, -wm * 0.25), 1);
    pen.line(fonce(cP, 0.8), M(lm * 0.62, wm * 0.28), M(lm * 0.95, wm * 0.28), 1);
  };
  unBras(0);

  // --- jambes : cuisse -> genou -> cheville, qui s'affine ; chaussures avec semelle
  const largJ = adulte ? 7.5 : 5.8;
  [0, 1].forEach((k) => {
    const lx = (k ? 1 : -1) * W * 0.21, sw = Math.sin(marche + k * PI) * L * 0.26, derriere = !k, td = (c) => (derriere ? fond(c) : c);
    const pied = [lx + sw, -largJ * 1.6], genou = [lx + sw * 0.5 + largJ * 0.35, hanche + L * 0.5];
    const habille = !(jambeNue || st.typeBas === "short");
    const c1 = habille ? td(st.bas) : td(peau), e = habille ? 1.3 : 1;
    pen.bras(c1, [lx, hanche], genou, largJ * 1.3 * e); pen.bras(c1, genou, pied, largJ * (habille ? 1.15 : 0.85));
    if (habille) { pen.courbe(fonce(c1, 0.8), [[genou[0] - largJ * 0.6, genou[1] - 3], [genou[0], genou[1] + 2], [genou[0] + largJ * 0.6, genou[1] - 3]], 1.2); pen.bras(fonce(c1, 0.9), vers(genou, pied, 0.9), pied, largJ * 1.2); }
    if (st.typeBas === "short" && st.bas && !st.robe) pen.bras(td(st.bas), [lx, hanche], vers([lx, hanche], genou, 0.75), largJ * 1.7);
    const w = largJ, cx = pied[0], c = td(st.chaussures);
    pen.forme(c, [["M", cx - w * 1.1, -w * 0.3], ["L", cx + w * 2.3, -w * 0.3], ["C", cx + w * 3.0, -w * 0.3, cx + w * 2.9, -w * 1.6, cx + w * 1.5, -w * 1.8],
      ["L", cx - w * 0.5, -w * 2.1], ["C", cx - w * 1.3, -w * 2.1, cx - w * 1.5, -w * 0.3, cx - w * 1.1, -w * 0.3], ["Z"]], true, true);
    pen.forme(fonce(c, 0.62), [["M", cx - w * 1.2, -w * 0.35], ["L", cx + w * 2.5, -w * 0.35], ["Q", cx + w * 2.9, 0, cx + w * 2.2, 0], ["L", cx - w * 1.0, 0], ["Q", cx - w * 1.4, 0, cx - w * 1.2, -w * 0.35], ["Z"]], false);
    if (adulte) for (const dx of [0.5, 1.0]) pen.circle(clair(c, 0.5), cx + dx * w, -w * 1.5, Math.max(0.8, w * 0.14)); // les lacets
  });

  // --- le corps : cou, buste aux épaules arrondies (taille marquée pour les dames), col, plis
  pen.forme(fonce(peau, 0.9), [["M", -0.34 * R, ty + 0.62 * R], ["L", 0.3 * R, ty + 0.75 * R], ["L", 0.3 * R, epaule + 6], ["L", -0.36 * R, epaule + 6], ["Z"]], false, true);
  if (jupe) pen.forme(st.bas, [["M", -0.48 * W, hanche - 6], ["L", 0.48 * W, hanche - 6], ["C", 0.68 * W, hanche + 0.15 * L, 0.8 * W, hanche + 0.3 * L, 0.84 * W, hanche + 0.4 * L],
    ["Q", 0, hanche + 0.48 * L, -0.84 * W, hanche + 0.4 * L], ["C", -0.8 * W, hanche + 0.3 * L, -0.68 * W, hanche + 0.15 * L, -0.48 * W, hanche - 6], ["Z"]], true, true);
  const taille = st.cils && adulte && !st.rond ? 0.4 : st.rond ? 0.66 : 0.5; // demi-largeur à la taille
  if (st.robe) {
    pen.forme(st.haut, [["M", -0.24 * W, epaule], ["Q", 0, epaule + 9, 0.24 * W, epaule], ["C", 0.46 * W, epaule, 0.54 * W, epaule + 0.08 * T, 0.54 * W, epaule + 0.28 * T],
      ["C", 0.52 * W, epaule + 0.5 * T, taille * W, epaule + 0.6 * T, taille * W, epaule + 0.72 * T], ["C", 0.8 * W, hanche + 0.05 * L, 0.98 * W, hanche + 0.3 * L, 1.02 * W, hanche + 0.44 * L],
      ["Q", 0, hanche + 0.54 * L, -1.02 * W, hanche + 0.44 * L], ["C", -0.98 * W, hanche + 0.3 * L, -0.8 * W, hanche + 0.05 * L, -taille * W, epaule + 0.72 * T],
      ["C", -taille * W, epaule + 0.6 * T, -0.52 * W, epaule + 0.5 * T, -0.54 * W, epaule + 0.28 * T], ["C", -0.54 * W, epaule + 0.08 * T, -0.46 * W, epaule, -0.24 * W, epaule], ["Z"]], true, true);
    pen.forme(fonce(st.haut, 0.88), [["M", -taille * W, epaule + 0.68 * T], ["Q", 0, epaule + 0.74 * T, taille * W, epaule + 0.68 * T], ["L", taille * W * 1.05, epaule + 0.78 * T], ["Q", 0, epaule + 0.84 * T, -taille * W * 1.05, epaule + 0.78 * T], ["Z"]], false);
    for (const u of [-0.45, 0.1, 0.6]) pen.courbe(fonce(st.haut, 0.82), [[u * W * 0.6, hanche - 4], [u * W * 0.85, hanche + 0.2 * L], [u * W, hanche + 0.4 * L]], 1.3); // plis de la jupe
  } else {
    const d = st.rond ? 0.64 : 0.56;
    pen.forme(st.haut, [["M", -0.24 * W, epaule], ["Q", 0, epaule + 9, 0.24 * W, epaule], ["C", 0.46 * W, epaule, 0.55 * W, epaule + 0.08 * T, 0.55 * W, epaule + 0.28 * T],
      st.rond ? ["C", 0.76 * W, epaule + 0.55 * T, 0.76 * W, hanche, d * W, hanche + 6] : ["C", 0.54 * W, epaule + 0.55 * T, taille * W, epaule + 0.75 * T, d * W, hanche + 6],
      ["Q", 0, hanche + 12, -d * W, hanche + 6],
      st.rond ? ["C", -0.76 * W, hanche, -0.76 * W, epaule + 0.55 * T, -0.55 * W, epaule + 0.28 * T] : ["C", -taille * W, epaule + 0.75 * T, -0.54 * W, epaule + 0.55 * T, -0.55 * W, epaule + 0.28 * T],
      ["C", -0.55 * W, epaule + 0.08 * T, -0.46 * W, epaule, -0.24 * W, epaule], ["Z"]], true, true);
    pen.courbe(fonce(st.haut, 0.8), [[-0.42 * W, epaule + 0.3 * T], [-0.3 * W, epaule + 0.45 * T], [-0.36 * W, epaule + 0.6 * T]], 1.2); // plis sous les bras
    pen.courbe(fonce(st.haut, 0.8), [[0.42 * W, epaule + 0.3 * T], [0.32 * W, epaule + 0.45 * T], [0.38 * W, epaule + 0.6 * T]], 1.2);
    if (st.typeHaut === "pull") {
      pen.forme(fonce(st.haut, 0.86), [["M", -d * W, hanche], ["Q", 0, hanche + 6, d * W, hanche], ["L", d * W, hanche + 6], ["Q", 0, hanche + 12, -d * W, hanche + 6], ["Z"]], false);
      pen.forme(fonce(st.haut, 0.86), [["M", -0.26 * W, epaule - 1], ["Q", 0, epaule + 11, 0.26 * W, epaule - 1], ["Q", 0, epaule + 6, -0.26 * W, epaule - 1], ["Z"]], false); // col roulé
    } else if (st.typeHaut === "chemise") {
      pen.forme(clair(st.haut, 0.5), [["M", -0.3 * W, epaule - 1], ["L", 0, epaule + 12], ["L", -0.08 * W, epaule + 2], ["Z"]]);
      pen.forme(clair(st.haut, 0.5), [["M", 0.3 * W, epaule - 1], ["L", 0, epaule + 12], ["L", 0.08 * W, epaule + 2], ["Z"]]);
      pen.line(fonce(st.haut, 0.8), [0, epaule + 12], [0, hanche + 8], 1.2);
      for (let b2 = 0; b2 < 3; b2++) pen.circle(fonce(st.haut, 0.6), 2, epaule + 18 + b2 * T * 0.22, Math.max(1.3, W * 0.04));
    } else pen.courbe(fonce(st.haut, 0.75), [[-0.24 * W, epaule + 0.5], [0, epaule + 10], [0.24 * W, epaule + 0.5]], 1.6); // l'encolure
    if (st.typeHaut === "salopette") {
      const bv = st.bas || [70, 80, 120];
      pen.forme(bv, [["M", -d * W, hanche - 4], ["L", d * W, hanche - 4], ["L", d * W, hanche + 6], ["Q", 0, hanche + 12, -d * W, hanche + 6], ["Z"]], true, true);
      pen.forme(bv, [["M", -0.32 * W, epaule + T * 0.38], ["L", 0.32 * W, epaule + T * 0.38], ["L", 0.36 * W, hanche], ["L", -0.36 * W, hanche], ["Z"]], true, true);
      pen.forme(fonce(bv, 0.85), [["M", -0.14 * W, epaule + T * 0.5], ["L", 0.14 * W, epaule + T * 0.5], ["L", 0.14 * W, epaule + T * 0.7], ["L", -0.14 * W, epaule + T * 0.7], ["Z"]], false); // la poche
      for (const sx of [-1, 1]) {
        pen.line(bv, [sx * W * 0.3, epaule + T * 0.4], [sx * W * 0.38, epaule + 2], Math.max(3, W * 0.12));
        pen.circle([250, 210, 80], sx * W * 0.24, epaule + T * 0.45, Math.max(1.5, W * 0.055));
      }
    }
  }
  if (st.dessin) {
    const c = pen.P(0, epaule + T * 0.6);
    if (st.dessin === "tractopelle") dessineVehicule(ctx, "tractopelle", "jaune", c[0], c[1], t, 0.3, 0, 0.12 * s, f);
    else if (st.dessin === "dino") dinoLongCou(ctx, c[0] - 2 * s * f, c[1] + 10 * s, 0.09 * s, undefined, t, f);
    else if (st.dessin === "etoile") etoile(ctx, c[0], c[1] - 4 * s, 9 * s, [255, 215, 60], 0);
    else if (st.dessin === "coeur") coeur(ctx, c[0], c[1] - 6 * s, 7 * s, [230, 60, 90]);
  }
  unBras(1);

  if (st.coiffure === "milong" || st.coiffure === "long") // le carré encadre le visage : dessiné derrière lui
    pen.forme(cheveux, tete([["M", -0.98, 0.78], ["C", -1.12, -0.66, -0.52, -1.22, 0.14, -1.17], ["C", 0.8, -1.12, 1.08, -0.66, 1.02, 0.5], ["Q", 0.95, 0.62, 0.7, 0.62],
      ["L", -0.2, 0.7], ["C", -0.44, 0.75, -0.4, 0.8, -0.42, 0.78], ["Z"]]), true, true);
  // --- la tête : visage ovale de trois quarts (front, nez, lèvres, menton), oreille
  const nz = 1 - 0.45 * k_; // le nez des enfants dépasse moins
  pen.forme(peau, tete([["M", 0.02, -1.06], ["C", 0.58, -1.06, 0.88, -0.72, 0.88, -0.28], ["C", 0.88, -0.14, 0.84, -0.08, 0.86, -0.02],
    ["C", 0.86 + 0.12 * nz, 0.08, 0.86 + 0.2 * nz, 0.24, 0.86 + 0.08 * nz, 0.31], ["C", 0.86, 0.36, 0.86, 0.4, 0.86, 0.44], ["C", 0.89, 0.5, 0.86, 0.56, 0.82, 0.6],
    ["C", 0.82 + 0.02 * k_, 0.86, 0.58, 1.08 - 0.04 * k_, 0.22, 1.08 - 0.04 * k_], ["C", -0.22, 1.08, -0.62 - 0.1 * k_, 0.86, -0.78 - 0.08 * k_, 0.42], ["C", -0.95, 0.0, -0.95, -0.62, -0.6, -0.9],
    ["C", -0.42, -1.02, -0.2, -1.06, 0.02, -1.06], ["Z"]]), true, true);
  fondu(0.25, 0.95, 0.5, fonce(peau, 0.6), 0.25); // ombre douce sous le menton
  pen.forme(fonce(peau, 0.94), tete([["M", -0.42, -0.14], ["C", -0.72, -0.24, -0.78, 0.32, -0.46, 0.34], ["C", -0.5, 0.2, -0.5, 0.0, -0.42, -0.14], ["Z"]]));
  pen.courbe(fonce(peau, 0.75), pts([[-0.5, -0.05], [-0.64, 0.08], [-0.52, 0.22]]), 1.4);
  // --- les cheveux
  const frange = [["Q", 0.8, -0.36, 0.52, -0.42], ["Q", 0.14, -0.46, -0.06, -0.72], ["Q", -0.24, -0.5, -0.36, -0.4]];
  const calotte = (bas = 0.02) => pen.forme(cheveux, tete([["M", -0.92, bas + 0.1], ["C", -1.04, -0.78, -0.48, -1.2, 0.1, -1.16], ["C", 0.68, -1.12, 0.98, -0.76, 0.92, -0.42],
    ...frange, ["C", -0.4, -0.25, -0.42, -0.12, -0.4, bas], ["Q", -0.7, 0.05, -0.92, bas + 0.1], ["Z"]]), true, true);
  const co = st.coiffure;
  if (co === "chauve" || co === "papi") {
    pen.forme(cheveux, tete([["M", -0.5, -0.74], ["C", -0.98, -0.7, -1.0, -0.06, -0.78, 0.02], ["C", -0.62, -0.1, -0.58, -0.4, -0.5, -0.74], ["Z"]]), true, true);
    pen.forme(cheveux, tete([["M", 0.62, -0.74], ["C", 0.84, -0.66, 0.9, -0.46, 0.88, -0.34], ["C", 0.8, -0.42, 0.72, -0.56, 0.62, -0.74], ["Z"]]));
    pen.courbe(clair(peau, 0.55), pts([[-0.28, -0.88], [0.05, -1.0], [0.36, -0.9]]), 3);
  } else if (co === "herisse") {
    const c = [["M", -0.92, 0.12], ["L", -0.98, -0.42]];
    for (let k = 0; k <= 8; k++) { const a = PI * 1.06 + (k / 8) * PI * 0.86, r = k % 2 ? 1.3 : 1.0; c.push(["L", r * Math.cos(a) * 0.95, -0.08 + r * Math.sin(a)]); }
    c.push(["L", 0.92, -0.42], ...frange, ["C", -0.4, -0.25, -0.42, -0.12, -0.4, 0.02], ["Q", -0.7, 0.05, -0.92, 0.12], ["Z"]);
    pen.forme(cheveux, tete(c), true, true);
  } else if (co === "boucle") {
    const c = [["M", -0.94, 0.25]]; const n = 10; let a0 = PI * 0.93;
    for (let k = 1; k <= n; k++) { const a1 = PI * 0.93 + (k / n) * PI * 1.16, am = (a0 + a1) / 2; c.push(["Q", 1.24 * Math.cos(am), -0.1 + 1.26 * Math.sin(am), 1.0 * Math.cos(a1), -0.1 + 1.04 * Math.sin(a1)]); a0 = a1; }
    c.push(["Q", 0.82, -0.48, 0.6, -0.52], ["Q", 0.5, -0.7, 0.32, -0.54], ["Q", 0.16, -0.72, -0.02, -0.54], ["Q", -0.2, -0.7, -0.36, -0.48], ["Q", -0.5, -0.2, -0.42, 0.05], ["Q", -0.7, 0.2, -0.94, 0.25], ["Z"]);
    pen.forme(cheveux, tete(c), true, true);
  } else if (co === "milong" || co === "long") { // par-dessus le visage : le haut, la frange et la mèche derrière l'oreille
    pen.forme(cheveux, tete([["M", -0.98, 0.78], ["C", -1.12, -0.66, -0.52, -1.22, 0.14, -1.17], ["C", 0.74, -1.12, 0.98, -0.76, 0.92, -0.42],
      ...frange, ["C", -0.44, -0.2, -0.36, 0.4, -0.42, 0.78], ["Z"]]), true, true);
  } else calotte();
  if (co === "chignon") { calotte(); const p = pen.P(tx - 0.3 * R, ty - 1.14 * R); rond(ctx, p[0], p[1], 0.4 * R * s, cheveux, 3); pen.courbe(fonce(cheveux, 0.8), pts([[-0.54, -1.12], [-0.3, -1.32], [-0.06, -1.12]]), 1.5); }
  if (co === "couettes") couette(1);
  if (co !== "chauve" && co !== "papi") { // reflet et mèches : des cheveux qui brillent
    pen.courbe(clair(cheveux, 0.35), pts([[-0.55, -0.82], [-0.1, -1.08], [0.38, -0.96]]), Math.max(1.5, R * 0.07));
    for (const [a, b] of [[[-0.2, -0.95], [-0.45, -0.55]], [[0.2, -0.98], [0.1, -0.6]], [[0.55, -0.88], [0.62, -0.55]]]) pen.courbe(fonce(cheveux, 0.78), pts([a, vers(a, b, 0.5).map((v, i) => v + (i ? 0 : 0.04)), b]), 1.1);
  }
  if (st.couronne) {
    const y0 = ty - R * 1.02;
    pen.poly([255, 205, 50], [[-R * 0.55, y0], [-R * 0.65, y0 - R * 0.6], [-R * 0.28, y0 - R * 0.3], [0, y0 - R * 0.75], [R * 0.28, y0 - R * 0.3], [R * 0.65, y0 - R * 0.6], [R * 0.55, y0]]);
    for (const jx of [-0.42, 0, 0.42]) pen.circle([230, 60, 110], jx * R, y0 - R * 0.13, R * 0.08);
  }

  // --- le visage : yeux en amande (le plus proche un peu plus grand), sourcils, nez, joues, bouche
  const ey = -0.08 + 0.07 * k_, hy = 0.15 + 0.05 * k_, cligne = mod(t + (style.length % 5) * 0.7, 4.2) < 0.12 && !peur;
  for (const [u, wE, k] of [[0.2, 0.17 + 0.02 * k_, 0], [0.62, 0.2 + 0.02 * k_, 1]]) {
    if (cligne) pen.courbe(fonce(peau, 0.5), pts([[u - wE, ey], [u, ey + 0.08], [u + wE, ey]]), 1.8);
    else {
      const haut = [["M", u - wE, ey], ["C", u - wE * 0.55, ey - hy * 1.45, u + wE * 0.55, ey - hy * 1.4, u + wE, ey - hy * 0.2]];
      const amande = [...haut, ["C", u + wE * 0.55, ey + hy * 1.15, u - wE * 0.6, ey + hy * 1.1, u - wE, ey], ["Z"]];
      pen.forme([252, 252, 250], tete(amande), false);
      const ir = (0.1 + 0.025 * k_) * (k ? 1 : 0.92), ix = u + wE * 0.18;
      ctx.save(); pen.chemin(tete(amande)); ctx.clip();
      pen.circle(fonce(st.yeux, 0.65), tx + ix * R, ty + (ey + 0.01) * R, ir * R);
      pen.circle(st.yeux, tx + ix * R, ty + (ey + 0.01) * R, ir * R * 0.84);
      pen.circle([20, 15, 25], tx + (ix + 0.01) * R, ty + (ey + 0.01) * R, ir * R * 0.48);
      pen.circle([255, 255, 255], tx + (ix + 0.035) * R, ty + (ey - 0.03) * R, ir * R * 0.27);
      ctx.restore();
      pen.trace(fonce(peau, 0.45), tete(haut), st.cils ? 1.8 : 1.2); // la ligne des cils
      if (adulte) pen.courbe(fonce(peau, 0.8), pts([[u - wE * 0.75, ey - hy * 1.3], [u, ey - hy * 1.8], [u + wE * 0.85, ey - hy * 1.05]]), 1); // le pli de la paupière
      if (st.cils) pen.courbe(fonce(peau, 0.35), pts([[u + wE * 0.9, ey - hy * 0.3], [u + wE * 1.15, ey - hy * 0.6], [u + wE * 1.28, ey - hy * 1.0]]), 1.4);
    }
    const lev = peur ? (k ? -0.08 : -0.03) : joie ? -0.04 : 0;
    const sy = ey - hy - 0.14; // les sourcils, bien au-dessus de l'œil : un air doux
    pen.courbe(cheveux, pts([[u - wE * 0.85, sy + 0.06 + lev + (peur && k ? 0.04 : 0)], [u, sy - 0.04 + lev], [u + wE * 1.0, sy + 0.04 + lev - (peur && !k ? 0.04 : 0)]]), adulte ? 1.9 : 1.4);
  }
  if (st.lunettes) {
    for (const [u, r] of [[0.2, 0.24], [0.62, 0.27]]) { const p = pen.P(tx + u * R, ty + ey * R); ctx.beginPath(); ctx.ellipse(p[0], p[1], r * R * s, r * 0.82 * R * s, 0, 0, 2 * PI); ctx.fillStyle = "rgba(230,245,255,0.22)"; ctx.fill(); ctx.lineWidth = Math.max(1, 2 * s); ctx.strokeStyle = css([70, 60, 70]); ctx.stroke(); }
    pen.courbe([70, 60, 70], pts([[0.44, ey - 0.02], [0.41, ey - 0.07], [0.35, ey - 0.02]]), 1.8);
    pen.line([70, 60, 70], [tx - 0.04 * R, ty + ey * R], [tx - 0.46 * R, ty - 0.04 * R], 1.8);
  }
  pen.courbe(fonce(peau, 0.66), pts([[0.74 + 0.04 * nz, 0.26], [0.82, 0.31], [0.9 + 0.04 * nz, 0.27]]), 1.4); // la narine
  const rose = [235, 110, 120];
  fondu(0.5, 0.36, 0.26, rose, 0.38); fondu(-0.18, 0.4, 0.2, rose, 0.25);
  if (st.barbe) pen.forme(cheveux, tete([["M", -0.74, 0.1], ["C", -0.7, 0.72, -0.25, 1.14, 0.22, 1.12], ["C", 0.66, 1.1, 0.88, 0.75, 0.86, 0.44], ["L", 0.76, 0.5],
    ["Q", 0.6, 0.72, 0.44, 0.66], ["Q", 0.2, 0.62, -0.1, 0.5], ["Q", -0.4, 0.4, -0.5, 0.1], ["Z"]]), true, true);
  if (st.moustache || st.barbe) pen.forme(cheveux, tete([["M", 0.42, 0.48], ["Q", 0.6, 0.36, 0.86, 0.42], ["Q", 0.9, 0.52, 0.76, 0.52], ["Q", 0.6, 0.48, 0.42, 0.56], ["Z"]]));
  const levres = st.cils ? [200, 80, 95] : peau.map((v, i) => Math.round(lerp(v, [150, 60, 65][i], 0.55)));
  if (peur) pen.ellipse([140, 50, 60], tx + 0.54 * R, ty + 0.54 * R, tx + 0.7 * R, ty + 0.74 * R);
  else if (joie || mange > 0.3) {
    pen.forme([140, 45, 58], tete([["M", 0.4, 0.55], ["Q", 0.62, 0.6, 0.84, 0.52], ["Q", 0.72, 0.9, 0.4, 0.55], ["Z"]]));
    pen.forme([250, 250, 248], tete([["M", 0.44, 0.565], ["Q", 0.62, 0.61, 0.8, 0.54], ["L", 0.79, 0.6], ["Q", 0.62, 0.66, 0.46, 0.61], ["Z"]]), false); // les dents
    pen.forme([235, 120, 130], tete([["M", 0.52, 0.74], ["Q", 0.62, 0.68, 0.72, 0.72], ["Q", 0.62, 0.8, 0.52, 0.74], ["Z"]]), false);
  } else {
    pen.courbe(levres, pts([[0.42, 0.57], [0.62, 0.7], [0.84, 0.54]]), adulte ? 2.4 : 2);
    if (st.cils) pen.forme(levres, tete([["M", 0.46, 0.6], ["Q", 0.64, 0.8, 0.82, 0.58], ["Q", 0.64, 0.7, 0.46, 0.6], ["Z"]]), false); // la lèvre du bas
  }
}

const AMIS_DESSIN = {
  trex, chat, dragon: (...a) => dragon(...a),
  dino: (ctx, x, g, s, t, f, marche) => dinoLongCou(ctx, x, g + Math.sin(marche) * 2, 0.62 * s, undefined, t, f),
  stego: (ctx, x, g, s, t, f, marche) => dinoStego(ctx, x, g + Math.sin(marche) * 2, 0.95 * s, undefined, t, f),
};
function definitPersonnages(liste) { // (re)construit les styles de dessin à partir des modèles
  for (const k of Object.keys(STYLES)) if (!liste[k]) { delete STYLES[k]; delete AMIS_DESSIN[k]; }
  PERSONNAGES = liste;
  for (const [id, p] of Object.entries(liste)) {
    STYLES[id] = styleDe(p);
    AMIS_DESSIN[id] = (ctx, x, g, s, t, f, marche, mange, humeur) => personne(ctx, x, g, s, t, f, marche, mange, humeur, id);
  }
}
definitPersonnages(PERSONNAGES_DEFAUT);
const LARGEUR_OMBRE = { dino: 0.8, stego: 0.6 };

function boucheAmi(kind, x, g, f = 1, s = 1) {
  if (kind === "dino") return [x + f * 112 * 0.62 * s, g - 207 * 0.62 * s];
  if (kind === "stego") return [x + f * 85 * 0.95 * s, g - 47 * 0.95 * s];
  if (kind === "trex") return [x + f * 95 * s, g - 150 * s];
  if (kind === "dragon") return [x + f * 70 * s, g - 135 * s];
  if (STYLES[kind]) { const st = STYLES[kind]; return [x + f * st.R * 0.4 * s, g - (st.L + st.T + st.R * 0.5) * s]; }
  return [x, g - 60 * s];
}
function dessineAmi(ctx, kind, x, g, t = 0, f = 1, marche = 0, mange = 0, s = 1, humeur = null) {
  const k = LARGEUR_OMBRE[kind] ?? (STYLES[kind] ? (STYLES[kind].L > 70 ? 0.45 : 0.3) : 0.7);
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

// ------------------------------------------------------------ bulle de dialogue, arc-en-ciel
function bulleDialogue(ctx, x, y, texte, largeurMax = 300) { // (x, y) = la tête de celui qui parle
  ctx.font = `700 19px Fredoka, "Comic Sans MS", sans-serif`;
  const lignes = [];
  let cour = "";
  for (const mot of texte.split(/\s+/)) {
    const essai = (cour + " " + mot).trim();
    if (ctx.measureText(essai).width > largeurMax && cour) { lignes.push(cour); cour = mot; } else cour = essai;
  }
  if (cour) lignes.push(cour);
  const l = Math.min(largeurMax, Math.max(...lignes.map((s) => ctx.measureText(s).width))) + 28, h = lignes.length * 24 + 18;
  const bx = Math.max(8, Math.min(980 - l - 8, x - l / 2)), by = Math.max(8, y - h - 30);
  poly(ctx, [[x - 10, by + h - 2], [x + 12, by + h - 2], [x + 2, Math.min(y - 6, by + h + 22)]], [255, 255, 255], 3, [120, 120, 130]);
  rrect(ctx, bx, by, l, h, 16, [255, 255, 255], 3, [120, 120, 130]);
  rrect(ctx, x - 9, by + h - 6, 20, 8, 0, [255, 255, 255]);
  ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = css(CONTOUR);
  lignes.forEach((s, i) => ctx.fillText(s, bx + 14, by + 10 + i * 24));
}
function arcEnCiel(ctx, cx, cy, r) {
  const cols = [[235, 80, 80], [245, 150, 60], [250, 215, 70], [110, 195, 90], [80, 150, 230], [140, 100, 200]];
  ctx.globalAlpha = 0.75;
  cols.forEach((c, i) => { ctx.beginPath(); ctx.arc(cx, cy, r - i * 13, Math.PI, 2 * Math.PI); ctx.lineWidth = 13; ctx.strokeStyle = css(c); ctx.stroke(); });
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ pour les longues histoires : décors et péripéties
function sapinVert(ctx, x, g, s = 1) { // sapin sans neige
  rrect(ctx, x - 7 * s, g - 25 * s, 14 * s, 25 * s, 0, [120, 80, 50]);
  for (let k = 0; k < 3; k++) {
    const y = g - 25 * s - k * 30 * s, w = (60 - k * 14) * s;
    poly(ctx, [[x - w, y], [x + w, y], [x, y - 55 * s]], [[45, 125, 75], [55, 140, 80], [65, 150, 85]][k], 3);
  }
}
function champignon(ctx, x, y, s = 1) {
  rrect(ctx, x - 6 * s, y - 20 * s, 12 * s, 20 * s, 4, [250, 240, 220], 2);
  ctx.beginPath(); ctx.arc(x, y - 18 * s, 18 * s, PI, 2 * PI); ctx.closePath();
  ctx.fillStyle = css([225, 70, 60]); ctx.fill(); bordure(ctx, [225, 70, 60], 2, CONTOUR);
  for (const [dx, dy] of [[-8, -24], [5, -30], [9, -21]]) rond(ctx, x + dx * s, y + dy * s, 3 * s, [255, 255, 255]);
}
function riviere(ctx, cx, G, H, t) { // une rivière coupe la route
  const w = 280, x0 = cx - w / 2, haut = G - 70;
  rrect(ctx, x0 - 10, haut, w + 20, H - haut, 0, [150, 110, 70]);
  rrect(ctx, x0, haut, w, H - haut, 0, [80, 160, 225]);
  for (let k = 0; k < 9; k++) { const y = haut + 18 + k * 22, dx = mod(t * 40 + k * 37, w - 40); arcRect(ctx, x0 + dx, y, 30, 10, 0, PI, 3, [210, 235, 255]); }
}
function planche(ctx, x, y, w = 70) { rrect(ctx, x - w / 2, y - 9, w, 18, 4, [190, 130, 75], 3); trait(ctx, [x - w / 2 + 8, y], [x + w / 2 - 8, y], 2, [150, 100, 55]); }
function pont(ctx, cx, G, poses, total) { // les planches posées une à une
  const w = 280, pas = w / total;
  for (let k = 0; k < Math.min(poses, total); k++) planche(ctx, cx - w / 2 + (k + 0.5) * pas, G + 6, pas + 4);
  if (poses >= total) {
    for (const dx of [-w / 2 - 6, w / 2 + 6]) rrect(ctx, cx + dx - 6, G - 50, 12, 56, 3, [170, 115, 65], 3);
    trait(ctx, [cx - w / 2 - 6, G - 44], [cx + w / 2 + 6, G - 44], 5, [170, 115, 65]);
  }
}
function arbreTombe(ctx, x, G, reste) { // un arbre tombé en travers de la route
  if (reste <= 0.02) return;
  const L = 60 + 230 * reste;
  rrect(ctx, x - L / 2, G - 30, L, 34, 14, [150, 100, 60], 3);
  for (let k = 1; k < 4; k++) trait(ctx, [x - L / 2 + (L * k) / 4, G - 22], [x - L / 2 + (L * k) / 4 + 10, G - 6], 2, [115, 75, 45]);
  ovale(ctx, x - L / 2 - 14, G - 32, 22, 38, [215, 175, 120], 3);
  const r = 34 + 40 * reste;
  for (const [dx, dy, k] of [[0, -20, 1], [-30, 6, 0.8], [26, 10, 0.85]]) rond(ctx, x + L / 2 + dx, G - 14 + dy, r * k, [85, 160, 70], 3);
}
function vehiculeEnPanne(ctx, kind, col, x, G, fumee, t, repare) {
  dessineVehicule(ctx, kind, col, x, G, t, 0, 0, 1, -1, false);
  if (repare) return;
  for (let k = 0; k < 4; k++) {
    const u = mod(t * 0.5 + k / 4, 1);
    ctx.globalAlpha = Math.max(0, (1 - u) * fumee);
    rond(ctx, x - 70 + 20 * Math.sin(u * 5 + k), G - 150 - u * 130, 14 + 26 * u, [150, 150, 158]);
  }
  ctx.globalAlpha = 1;
  poly(ctx, [[x + 150, G], [x + 190, G], [x + 170, G - 36]], [255, 210, 60], 3); // le triangle
  ecrireCentre(ctx, "!", x + 170, G - 12, 22, [200, 60, 40]);
}
function cleAMolette(ctx, x, y, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  rrect(ctx, -6, -6, 50, 12, 5, [170, 175, 190], 2); rond(ctx, -12, 0, 15, [170, 175, 190], 2); rrect(ctx, -30, -4, 16, 8, 0, [246, 239, 224]);
  ctx.restore();
}
function buissonCachette(ctx, x, G, secoue = 0) {
  const d = 7 * Math.sin(secoue * 40) * secoue;
  for (const [dx, dy, r] of [[-40, -30, 36], [0, -54, 44], [40, -30, 36], [0, -22, 40]]) rond(ctx, x + dx + d, G + dy, r, [80, 165, 75], 3);
  for (const [dx, dy] of [[-30, -42], [16, -70], [32, -26]]) rond(ctx, x + dx + d, G + dy, 5, [255, 230, 120]);
}
function objetPerdu(ctx, objet, x, g, t) {
  if (objet === "doudou") { // un petit ours
    const y = g - 34;
    for (const dx of [-18, 18]) rond(ctx, x + dx, y - 34, 11, [190, 130, 80], 3);
    ovale(ctx, x - 26, y - 6, 52, 46, [190, 130, 80], 3);
    rond(ctx, x, y - 20, 24, [190, 130, 80], 3);
    rond(ctx, x - 8, y - 24, 3, CONTOUR); rond(ctx, x + 8, y - 24, 3, CONTOUR); ovale(ctx, x - 8, y - 16, 16, 11, [235, 200, 160]);
  } else if (objet === "cle") cleAMolette(ctx, x - 20, g - 20, -0.3);
  else { // un ballon
    const y = g - 32 - 4 * Math.abs(Math.sin(t * 4));
    rond(ctx, x, y, 30, [235, 70, 70], 3);
    trait(ctx, [x - 29, y], [x + 29, y], 4, [255, 255, 255]);
  }
}
function eclair(ctx, x, y, h) {
  const pts = [[x, y], [x - 22, y + h * 0.45], [x + 8, y + h * 0.45], [x - 16, y + h]];
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p);
  ctx.lineWidth = 8; ctx.strokeStyle = "rgba(255,245,170,0.95)"; ctx.lineJoin = "round"; ctx.stroke();
}
function carteChapitre(ctx, W, H, n, titre, t, mot) { // la page de titre d'un chapitre
  ctx.fillStyle = "rgba(255,250,235,0.82)"; ctx.fillRect(0, 0, W, H);
  const r = [W / 2 - 330, H / 2 - 120, 660, 240];
  rrect(ctx, r[0], r[1] + 8, r[2], r[3], 30, [225, 205, 170]);
  rrect(ctx, ...r, 30, [255, 255, 255], 4, [255, 170, 60]);
  for (let k = 0; k < 5; k++) etoile(ctx, r[0] + 60 + k * 135, r[1] + 4 + 6 * Math.sin(t * 3 + k), 16, [[255, 200, 50], [255, 120, 150], [100, 180, 250]][k % 3], t + k);
  ecrireCentre(ctx, mot + " " + n, W / 2, H / 2 - 50, 34, [235, 130, 40]);
  ctx.font = `700 46px Fredoka, "Comic Sans MS", sans-serif`;
  const lignes = [], mots = String(titre).split(/\s+/);
  let cour = "";
  for (const m of mots) { const e = (cour + " " + m).trim(); if (ctx.measureText(e).width < 600 || !cour) cour = e; else { lignes.push(cour); cour = m; } }
  if (cour) lignes.push(cour);
  lignes.slice(0, 2).forEach((l, i) => ecrireCentre(ctx, l, W / 2, H / 2 + 15 + i * 52 - (lignes.length > 1 ? 20 : 0), 46, [70, 60, 50]));
}

// ------------------------------------------------------------ « écran libre » : des images posées où l'on veut
// Chaque élément : {type: "perso" | "engin" | "heros" | "objet", id, x, y (le sol sous l'image), s (taille), f (1 ou -1), col, toucher}
const OBJETS_DECOR = {
  maison: [210, 235, (ctx, t) => maisonFeu(ctx, 0, 0, 0, t, false)],
  maisonFeu: [210, 380, (ctx, t) => maisonFeu(ctx, 0, 0, 1, t, false)],
  arbre: [90, 150, (ctx) => arbre(ctx, 0, 0, 1.1)],
  sapin: [120, 150, (ctx) => sapinVert(ctx, 0, 0, 0.9)],
  buisson: [130, 100, (ctx) => buissonCachette(ctx, 0, 0)],
  fleurs: [70, 40, (ctx) => { for (const [dx, c] of [[-20, [255, 90, 120]], [0, [255, 220, 60]], [20, [180, 120, 255]]]) { trait(ctx, [dx, 0], [dx, -26], 3, [60, 140, 60]); rond(ctx, dx, -28, 9, c); } }],
  champignon: [60, 55, (ctx) => champignon(ctx, 0, 0, 1.6)],
  rocher: [100, 60, (ctx) => { ovale(ctx, -48, -50, 96, 56, [160, 160, 170], 3); ovale(ctx, 6, -34, 46, 36, [180, 180, 190], 3); }],
  cadeau: [150, 150, (ctx, t) => cadeau(ctx, 0, 0, 0, t)],
  velo: [200, 110, (ctx, t) => velo(ctx, 0, 0, 1, t, 0)],
  ballon: [70, 70, (ctx, t) => objetPerdu(ctx, "ballon", 0, 0, t)],
  doudou: [60, 80, (ctx, t) => objetPerdu(ctx, "doudou", 0, 0, t)],
  cle: [70, 40, (ctx, t) => objetPerdu(ctx, "cle", 0, 0, t)],
  coeur: [70, 80, (ctx) => coeur(ctx, 0, -45, 30, [240, 80, 110])],
  etoile: [80, 80, (ctx, t) => etoile(ctx, 0, -40, 36, [255, 210, 50], t * 0.3)],
  nuage: [160, 90, (ctx) => nuage(ctx, -45, -40, 1.3)],
  soleil: [120, 120, (ctx, t) => soleil(ctx, 0, -60, t)],
  lune: [90, 90, (ctx) => lune(ctx, 0, -45)],
  arcenciel: [420, 220, (ctx) => arcEnCiel(ctx, 0, 0, 200)],
  tas: [250, 170, (ctx) => tas(ctx, 0, 0, 1)],
  trou: [200, 60, (ctx) => trou(ctx, 0, -18, 0)],
  piscine: [330, 70, (ctx, t) => { piscineFond(ctx, 0, -50, t); piscineDevant(ctx, 0, -50, t); }],
  bateau: [130, 130, (ctx) => {
    poly(ctx, [[-60, -26], [60, -26], [45, 0], [-45, 0]], [240, 90, 80], 3);
    trait(ctx, [0, -26], [0, -116], 4, [120, 90, 60]);
    poly(ctx, [[4, -112], [4, -34], [52, -34]], [255, 255, 255], 3);
  }],
};
const TAILLE_AMI = { dragon: [260, 210], trex: [230, 230], chat: [90, 80], dino: [300, 330], stego: [260, 170] };
function tailleElement(el) { // largeur et hauteur à la taille 1 (pour toucher l'image)
  if (el.type === "objet") return (OBJETS_DECOR[el.id] || [80, 80]).slice(0, 2);
  if (el.type === "engin" || el.type === "heros") return [300, 200];
  if (TAILLE_AMI[el.id]) return TAILLE_AMI[el.id];
  return STYLES[el.id] && STYLES[el.id].L > 70 ? [90, 235] : [80, 165];
}
function boiteElement(el) { const [w, h] = tailleElement(el), s = el.s || 1; return [el.x - (w * s) / 2, el.y - h * s, w * s, h * s + 12]; }
function dessineElement(ctx, el, t, heros, saut = 0) {
  ctx.save();
  ctx.translate(el.x, el.y - saut);
  ctx.scale((el.f || 1) * (el.s || 1), el.s || 1);
  if (el.type === "objet") { const o = OBJETS_DECOR[el.id]; if (o) o[2](ctx, t); }
  else if (el.type === "heros") dessineVehicule(ctx, heros.kind, heros.col, 0, 0, t);
  else if (el.type === "engin") dessineVehicule(ctx, el.id, COULEURS[el.col] || COULEURS[COULEUR_DEFAUT[el.id]], 0, 0, t);
  else if (el.id in AMIS_DESSIN) dessineAmi(ctx, el.id, 0, 0, t, 1, 0, 0, 1, el.humeur || null);
  ctx.restore();
}

// ------------------------------------------------------------ un petit dragon gentil (violet, petites ailes)
function dragon(ctx, x, g, s = 1, t = 0, f = 1, marche = 0, mange = 0) {
  const col = [175, 125, 225], ventre = [255, 225, 160], pen = new Pen(ctx, x, g, s, f), bat = 12 * Math.sin(t * 5);
  pen.poly(col, [[-28, -58], [-125, -36 + 6 * Math.sin(t * 3)], [-112, -52], [-24, -82]]); // la queue
  pen.poly([255, 160, 90], [[-125, -36 + 6 * Math.sin(t * 3)], [-148, -50], [-122, -22]]);
  pen.poly(clair(col, 0.35), [[-12, -112], [-78, -178 - bat], [-46, -126], [-92, -140 - bat], [-28, -98]]); // l'aile
  [-18, 16].forEach((lx, k) => {
    const sw = Math.sin(marche + k * PI) * 12;
    pen.bras(fonce(col, 0.85), [lx, -50], [lx + sw, -12], 18);
    pen.ellipse(fonce(col, 0.85), lx + sw - 15, -15, lx + sw + 19, 0);
  });
  pen.ellipse(col, -46, -122, 42, -34);
  pen.ellipse(ventre, -14, -106, 33, -44, false);
  for (let k = 0; k < 3; k++) pen.poly([255, 160, 90], [[-44 + k * 17, -114 + k * 3], [-36 + k * 17, -132 + k * 3], [-28 + k * 17, -116 + k * 3]]);
  pen.bras(fonce(col, 0.85), [24, -92], [40, -80], 7);
  const dy = 8 * mange;
  pen.poly([255, 232, 150], [[4, -168 + dy], [-2, -196 + dy], [16, -172 + dy]]); // les petites cornes
  pen.poly([255, 232, 150], [[26, -172 + dy], [28, -200 + dy], [40, -170 + dy]]);
  pen.ellipse(col, -8, -178 + dy, 74, -116 + dy);
  pen.ellipse(clair(col, 0.25), 40, -150 + dy, 80, -122 + dy);
  pen.circle([255, 255, 255], 26, -154 + dy, 10, true);
  pen.circle(CONTOUR, 29, -153 + dy, 5);
  pen.circle([255, 255, 255], 31, -155 + dy, 2);
  pen.circle(fonce(col, 0.55), 70, -142 + dy, 3);
  pen.arc(CONTOUR, 38, -146 + dy, 72, -126 + dy, 0, PI, 3); // le sourire
  pen.circle([255, 150, 170], 14, -134 + dy, 7);
}

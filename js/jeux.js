// Petits jeux pour apprendre en jouant, adaptés à l'âge de l'enfant :
//  - « chiffres » : toucher 1, 2, 3… dans l'ordre (à partir de 6 ans : de petites additions)
//  - « lettres »  : toucher les lettres d'un mot dans l'ordre (le prénom de l'enfant par défaut)
"use strict";

function ageEnfant() { // d'après la date de naissance d'Arthur (atelier des personnages), sinon 3 ans
  const p = PERSONNAGES.arthur, n = p && p.naissance ? new Date(p.naissance) : null;
  if (!n || isNaN(n)) return 3;
  return Math.max(1, Math.floor((Date.now() - n.getTime()) / (365.25 * 24 * 3600 * 1000)));
}
const COULEURS_JEU = [[255, 120, 120], [255, 190, 60], [110, 190, 250], [120, 210, 120], [200, 140, 240], [255, 150, 200]];
const ALPHABET = "ABCDEFGHIJKLMNOPRSTUVZ";

class Jeu {
  constructor(type, mot, age) {
    this.type = type; this.age = age; this.dernier = 0;
    if (type === "lettres") {
      const longueur = age < 4 ? 3 : age < 6 ? 5 : 8;
      this.mot = (sansAccent(mot).toUpperCase().replace(/[^A-Z]/g, "") || "TRACTO").slice(0, longueur);
      const intrus = [...ALPHABET].filter((l) => !this.mot.includes(l)).sort(() => Math.random() - 0.5).slice(0, age < 4 ? 2 : 3);
      this.bulles = this.place([...this.mot].map((l, k) => ({ label: l, ord: k })).concat(intrus.map((l) => ({ label: l, ord: -1 }))));
      this.n = this.mot.length;
    } else if (age >= 6) { // les grands : 3 additions
      this.mode = "addition"; this.n = 3; this.question();
    } else {
      this.n = age < 4 ? 3 : age < 5 ? 5 : 7;
      this.bulles = this.place(Array.from({ length: this.n }, (_, k) => ({ label: String(k + 1), ord: k })));
    }
    this.fait = 0;
  }
  question() { // une addition et trois réponses possibles
    const a = 1 + Math.floor(Math.random() * 5), b = 1 + Math.floor(Math.random() * 5), s = a + b;
    const autres = [s - 2, s - 1, s + 1, s + 2].filter((x) => x > 0).sort(() => Math.random() - 0.5).slice(0, 2);
    this.enonce = `${a} + ${b} = ?`;
    this.bulles = this.place([{ label: String(s), ord: 0 }].concat(autres.map((x) => ({ label: String(x), ord: -1 }))));
  }
  place(liste) { // des bulles dans le ciel, sans se chevaucher
    liste.sort(() => Math.random() - 0.5);
    const m = liste.length, parLigne = m > 5 ? Math.ceil(m / 2) : m;
    return liste.map((b, i) => {
      const col = i % parLigne, ligne = Math.floor(i / parLigne);
      return { ...b, x: 130 + ((VW - 260) * (col + 0.5)) / parLigne + (Math.random() - 0.5) * 30, y: (m > 5 ? 130 + ligne * 120 : 190) + (Math.random() - 0.5) * 40,
        r: m > 7 ? 40 : 48, col: COULEURS_JEU[i % COULEURS_JEU.length], trouve: false, phase: Math.random() * 6 };
    });
  }
  ordreAttendu() { return this.mode === "addition" ? 0 : this.fait; }
  cibleBulle() { return this.bulles.find((b) => !b.trouve && b.ord === this.ordreAttendu()); }
  pos(b, t) { return [b.x, b.y + 6 * Math.sin(t * 2 + b.phase)]; }
  accepte(p, t) { // l'enfant a-t-il touché la bonne bulle ? (une lettre en double compte aussi)
    const c = this.cibleBulle();
    if (!c) return false;
    const b = this.bulles.find((x) => !x.trouve && Math.hypot(p[0] - this.pos(x, t)[0], p[1] - this.pos(x, t)[1]) < x.r + 22);
    if (!b) return false;
    if (b === c) return true;
    if (b.label === c.label) { [b.ord, c.ord] = [c.ord, b.ord]; return true; }
    return false;
  }
  reussit(t) { const b = this.cibleBulle(); if (b) b.trouve = true; this.fait++; this.dernier = t; return b; }
  suivant() { if (this.mode === "addition" && this.fait < this.n) this.question(); }
  dessine(ctx, t, attend) {
    if (this.type === "lettres") { // le mot en haut : les lettres trouvées s'allument
      const w = 64, x0 = VW / 2 - (this.mot.length * w) / 2;
      [...this.mot].forEach((l, k) => {
        const ok = k < this.fait;
        rrect(ctx, x0 + k * w + 4, 14, w - 8, 60, 12, ok ? [255, 255, 255] : [250, 246, 238], 3, ok ? [235, 130, 40] : [220, 210, 195]);
        ecrireCentre(ctx, ok ? l : "_", x0 + k * w + w / 2, 46, 38, ok ? [235, 110, 30] : [190, 180, 170]);
      });
    }
    if (this.mode === "addition") {
      rrect(ctx, VW / 2 - 160, 14, 320, 70, 18, [255, 255, 255], 4, [110, 140, 220]);
      ecrireCentre(ctx, this.enonce, VW / 2, 50, 48, [70, 90, 170]);
    }
    const c = this.cibleBulle();
    for (const b of this.bulles) {
      if (b.trouve) continue;
      const [x, y] = this.pos(b, t);
      if (attend && b === c && t - this.dernier > 7) { // un petit coup de pouce si l'enfant cherche longtemps
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 6); rond(ctx, x, y, b.r + 16, null, 6, [255, 255, 255]); ctx.globalAlpha = 1;
      }
      rond(ctx, x, y + 4, b.r, fonce(b.col, 0.75));
      rond(ctx, x, y, b.r, b.col, 3);
      rond(ctx, x - b.r * 0.35, y - b.r * 0.4, b.r * 0.22, [255, 255, 255]);
      ctx.font = `700 ${Math.round(b.r * 1.1)}px Fredoka, "Comic Sans MS", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 6; ctx.strokeStyle = css(fonce(b.col, 0.55)); ctx.strokeText(b.label, x, y + 2);
      ctx.fillStyle = "#fff"; ctx.fillText(b.label, x, y + 2);
    }
  }
}

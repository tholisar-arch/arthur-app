// Façon « Bluey » : une palette chaude et douce pour tous les décors (ciel bleu lumineux, herbe vert-jaune,
// terre sable), des arbres en grosses touffes rondes à deux tons, sans contour. Le reste du style (liserés doux,
// ombres plates, yeux pleins) est dans dessins.js (STYLE_DESSIN.bluey).
"use strict";

if (STYLE_DESSIN.bluey) {
  const mele = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  // le ciel : un bleu clair et chaud qui pâlit vers l'horizon (seulement pour les ciels bleus de jour)
  for (const [nom, c] of Object.entries(CIELS)) {
    const [haut, bas] = c;
    const bleu = haut[2] > haut[0] + 60 && haut[0] > 60 && haut[2] > 180 && !(haut[0] === bas[0] && haut[1] === bas[1]);
    if (bleu) CIELS[nom] = [mele(haut, [118, 192, 236], 0.75), mele(bas, [214, 238, 246], 0.7)];
  }
  // le sol : une herbe vert-jaune ensoleillée, une terre couleur sable
  for (const [nom, s] of Object.entries(SOLS)) {
    const [herbe, route] = s, vert = (c) => c[1] > c[0] + 25 && c[1] > c[2] + 25, sable = (c) => c[0] > 170 && c[0] > c[2] + 30;
    SOLS[nom] = [vert(herbe) ? mele(herbe, [168, 204, 98], 0.65) : herbe, vert(route) ? mele(route, [158, 196, 92], 0.6) : sable(route) ? mele(route, [230, 198, 150], 0.45) : route];
  }
  // les arbres : un tronc doux et un feuillage en grosses touffes, clair en haut, plus sombre en bas
  const arbreAvant = arbre;
  arbre = function (ctx, x, g, s = 1, col = [95, 175, 70]) {
    const base = mele(col, [116, 172, 84], 0.5), clairT = mele(base, [190, 220, 120], 0.35), sombre = mele(base, [60, 110, 70], 0.3), tronc = [160, 128, 100];
    if (RELIEF.on) { ctx.beginPath(); ctx.ellipse(x + 14 * s, g + 2, 62 * s, 11 * s, 0, 0, 2 * PI); ctx.fillStyle = "rgba(40,70,30,0.2)"; ctx.fill(); } // son ombre par terre
    poly(ctx, [[x - 8 * s, g], [x + 8 * s, g], [x + 4 * s, g - 78 * s], [x - 4 * s, g - 78 * s]], tronc, 2);
    trait(ctx, [x + 1 * s, g - 56 * s], [x + 16 * s, g - 76 * s], Math.max(1, 5 * s), tronc, "round");
    for (const [dx, dy, r] of [[-26, -86, 28], [24, -84, 27], [0, -80, 30]]) rond(ctx, x + dx * s, g + dy * s, r * s, sombre);
    for (const [dx, dy, r] of [[-18, -110, 30], [18, -112, 29], [0, -128, 25], [-30, -96, 20], [30, -96, 20]]) rond(ctx, x + dx * s, g + dy * s, r * s, base);
    for (const [dx, dy, r] of [[-12, -122, 14], [10, -132, 11]]) rond(ctx, x + dx * s, g + dy * s, r * s, clairT);
  };
  arbre.avant = arbreAvant;
}

// Les miniatures des histoires (les cartes de l'accueil) : chaque famille peut les personnaliser.
// Une miniature = un fond (photo, lieu ou couleur), des images posées où l'on veut, la couleur du bandeau.
// Réglages gardés sur l'appareil (localStorage ; la photo dans IndexedDB), pour toutes les histoires.
"use strict";

const CLE_MINIATURES = "tracto.miniatures.v1";
const COULEURS_BANDE = { ...COULEURS, turquoise: [60, 190, 190], marron: [150, 105, 70], gris: [150, 150, 165] };
const FONDS_COULEUR = [[255, 240, 200], [205, 232, 255], [212, 244, 210], [255, 222, 232], [236, 222, 255], [255, 255, 255]];
const LIEUX_MINI = ["chantier", "ville", "campagne", "jardin", "ecole", "vacances", "plage", "neige", "dinosaures", "foret", "montagne", "ferme", "port", "pms"];

function litMiniatures() { try { return JSON.parse(localStorage.getItem(CLE_MINIATURES) || "{}"); } catch (e) { return {}; } }
function normaliseMini(m) {
  if (!m) return null;
  if (m.type) return { fond: null, bande: null, elements: [{ ...m, x: 0.52, y: 0.88, s: 0.8, f: 1, auto: true }] }; // ancien format : une seule image
  return { fond: m.fond || null, bande: m.bande || null, elements: Array.isArray(m.elements) ? m.elements : [] };
}
function miniatureDe(h) { return normaliseMini(litMiniatures()[h.fichier] || h.miniature); }
function sauveMiniature(h, mini) {
  const toutes = litMiniatures();
  if (mini) toutes[h.fichier] = mini; else delete toutes[h.fichier];
  try { localStorage.setItem(CLE_MINIATURES, JSON.stringify(toutes)); } catch (e) { /* stockage indisponible */ }
  if (h.perso) { // une histoire écrite dans l'appli : la miniature voyage avec elle (envoi à la famille)
    const liste = litHistoiresPerso(), e = liste.find((x) => x.id === h.perso);
    if (e) { e.miniature = mini; try { localStorage.setItem(CLE_HISTOIRES, JSON.stringify(liste)); } catch (err) { /* stockage indisponible */ } }
  }
}

// --- les fonds : lieux dessinés une fois, photos chargées depuis l'appareil
const FONDS_DECOR = new Map(), PHOTOS_MINI = new Map();
function fondDecor(nom) {
  if (!FONDS_DECOR.has(nom)) {
    const c = document.createElement("canvas"); c.width = VW; c.height = VH;
    dessineDecor(c.getContext("2d"), VW, VH, nom, 0, 0, false, G);
    FONDS_DECOR.set(nom, c);
  }
  return FONDS_DECOR.get(nom);
}
function photoMini(fichier) {
  if (PHOTOS_MINI.has(fichier)) return PHOTOS_MINI.get(fichier);
  PHOTOS_MINI.set(fichier, null);
  Memoire.lit("mini:" + fichier).then((blob) => {
    if (!blob) return;
    const img = new Image();
    img.onload = () => PHOTOS_MINI.set(fichier, img);
    img.src = URL.createObjectURL(blob);
  });
  return null;
}
function dessineCouverture(ctx, img, x, y, w, h) { // l'image remplit le cadre (recadrée au centre)
  const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight, k = Math.max(w / iw, h / ih);
  ctx.drawImage(img, x + (w - iw * k) / 2, y + (h - ih * k) / 2, iw * k, ih * k);
}

// --- le dessin d'une carte (accueil et aperçu de l'éditeur)
const ZONE_MINI = [0, 22, 165, 178]; // la partie image de la carte (sous le bandeau), pour une carte de 350 × 200
function dessineZoneMiniature(ctx, h, mini, zx, zy, zw, zh, t, colHeros, kind = camionDe(h).veh) {
  if (!mini) return dessineVehicule(ctx, kind, colHeros, zx + 85, zy + zh - 22, t, 0, 0, 0.5); // le dernier camion choisi
  ctx.save(); ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip();
  const f = mini.fond;
  if (f && f.type === "decor") { const sw = (VH * zw) / zh; ctx.drawImage(fondDecor(f.id), (VW - sw) / 2, 0, sw, VH, zx, zy, zw, zh); }
  else if (f && f.type === "couleur") rrect(ctx, zx, zy, zw, zh, 0, f.col);
  else if (f && f.type === "photo") { const img = photoMini(h.fichier); if (img) dessineCouverture(ctx, img, zx, zy, zw, zh); }
  for (const el of mini.elements) {
    const [w, hg] = tailleElement(el);
    let sc = (el.s * zh) / hg;
    if (el.auto) sc = Math.min(sc, (0.95 * zw) / w);
    dessineElement(ctx, { ...el, x: zx + el.x * zw, y: zy + el.y * zh, s: sc }, t, { kind, col: colHeros });
  }
  ctx.restore();
}
function dessineCarte(ctx, h, x, y, w, hh, t, options = {}) {
  const erreur = !!h.erreur, mini = erreur ? null : options.mini !== undefined ? options.mini : miniatureDe(h);
  rrect(ctx, x, y + 8, w, hh, 24, [200, 170, 110]);
  rrect(ctx, x, y, w, hh, 24, erreur ? [255, 235, 235] : [255, 255, 255]);
  const camion = camionDe(h), colHeros = erreur ? [220, 90, 90] : COULEURS[camion.col];
  const col = (mini && mini.bande && COULEURS_BANDE[mini.bande]) || colHeros;
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, hh, 24); ctx.clip();
  if (!erreur) dessineZoneMiniature(ctx, h, mini, x + ZONE_MINI[0], y + ZONE_MINI[1], ZONE_MINI[2], hh - ZONE_MINI[1], t, colHeros);
  rrect(ctx, x, y, w, 22, 0, col);
  ctx.restore();
  rrect(ctx, x, y, w, hh, 24, null, 4);
  const lignes = coupe(ctx, titreDe(h), 26, w - 190).slice(0, 4), y0 = y + 40 + (4 - lignes.length) * 16;
  lignes.forEach((l, i) => ecrit(ctx, l, 26, CONTOUR, [x + 165, y0 + i * 34], null, true));
  if (erreur) ecrit(ctx, tr("illisible"), 20, [200, 40, 40], [x + 165, y + hh - 36], null, true);
  else {
    const duree = dureeHistoire(h), info = h.chapitres.length > 1 ? tr("chapitresN", { n: h.chapitres.length }) : tr("images", { n: h.scenes.length });
    ecrit(ctx, info + (duree >= 3 ? " · " + tr("minutes", { n: duree }) : "") + (traduite(h) ? "" : "  (FR)"), 18, [150, 140, 130], [x + 165, y + hh - 32], null, true);
  }
  if (h.perso) { rrect(ctx, x + 10, y + 30, 64, 24, 8, [235, 130, 70]); ecrit(ctx, "✎ " + tr("moi"), 14, [255, 255, 255], [x + 42, y + 42]); }
  if (options.suppr) { rond(ctx, x + w - 8, y + 8, 22, [220, 70, 70], 4); ecrit(ctx, "✕", 24, [255, 255, 255], [x + w - 8, y + 8]); }
  else if (options.nouveau && !erreur && estNouvelle(h)) { etoile(ctx, x + w - 4, y - 2, 34, [255, 210, 50], 0.2); ecrit(ctx, tr("nouveau"), 15, CONTOUR, [x + w - 4, y]); }
}

// --- l'éditeur de miniature
const K_MINI = 2.2, PX_MINI = 40, PY_MINI = 104; // l'aperçu : la carte agrandie
class EditeurMiniature {
  constructor(app) { this.app = app; this.zones = []; this.onglet = "images"; this.cat = "perso"; this.choix = -1; this.drag = null; }
  ouvre(h, retour = "config") {
    this.h = h; this.retour = retour; this.choix = -1; this.drag = null;
    this.mini = JSON.parse(JSON.stringify(miniatureDe(h) || { fond: null, bande: null, elements: [{ type: "heros", id: "", x: 0.52, y: 0.88, s: 0.55, f: 1 }] }));
    for (const el of this.mini.elements) delete el.auto;
    this.app.etat = "miniature";
  }
  sauve() { sauveMiniature(this.h, this.mini); }
  ferme() { this.sauve(); this.app.etat = this.retour; }
  zone() { return [PX_MINI + ZONE_MINI[0] * K_MINI, PY_MINI + ZONE_MINI[1] * K_MINI, ZONE_MINI[2] * K_MINI, (200 - ZONE_MINI[1]) * K_MINI]; }
  boite(el) { // la boîte d'une image, en coordonnées d'écran
    const [zx, zy, zw, zh] = this.zone(), [w, hg] = tailleElement(el), sc = (el.s * zh) / hg;
    return [zx + el.x * zw - (w * sc) / 2, zy + el.y * zh - hg * sc, w * sc, hg * sc + 10];
  }
  ajoute(type, id) {
    const el = { type, id, x: 0.3 + Math.random() * 0.4, y: type === "objet" && ["nuage", "soleil", "lune", "etoile", "arcenciel", "coeur"].includes(id) ? 0.35 : 0.88, s: type === "perso" ? 0.6 : 0.45, f: 1 };
    if (type === "engin") el.col = COULEUR_DEFAUT[id];
    if (type === "objet") { this.mini.elements.unshift(el); this.choix = 0; } else { this.mini.elements.push(el); this.choix = this.mini.elements.length - 1; }
    this.sauve(); joue(type === "engin" || type === "heros" ? "klaxon" : "pop");
  }
  outil(nom) {
    const els = this.mini.elements, el = els[this.choix];
    if (!el) return;
    if (nom === "plus") el.s = Math.min(2.5, +(el.s * 1.2).toFixed(3));
    if (nom === "moins") el.s = Math.max(0.12, +(el.s / 1.2).toFixed(3));
    if (nom === "miroir") el.f = -(el.f || 1);
    if (nom === "couleur") { const c = Object.keys(COULEURS); el.col = c[(c.indexOf(el.col) + 1) % c.length]; }
    if (nom === "devant") { els.splice(this.choix, 1); if (this.choix === els.length) { els.unshift(el); this.choix = 0; } else { els.push(el); this.choix = els.length - 1; } }
    if (nom === "efface") { els.splice(this.choix, 1); this.choix = -1; }
    this.sauve(); joue("pop");
  }
  choisitPhoto() { // une photo de l'appareil (ou prise sur le moment), réduite et gardée sur l'appareil
    const entree = document.createElement("input");
    entree.type = "file"; entree.accept = "image/*";
    entree.onchange = async () => {
      const f = entree.files && entree.files[0];
      if (!f) return;
      const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = URL.createObjectURL(f); }).catch(() => null);
      if (!img) return;
      const k = Math.min(1, 700 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.85));
      await Memoire.met("mini:" + this.h.fichier, blob);
      PHOTOS_MINI.delete(this.h.fichier);
      this.mini.fond = { type: "photo" }; this.sauve(); joue("magie");
    };
    entree.click();
  }
  parDefaut() {
    this.mini = { fond: null, bande: null, elements: [{ type: "heros", id: "", x: 0.52, y: 0.88, s: 0.55, f: 1 }] };
    sauveMiniature(this.h, null); Memoire.efface("mini:" + this.h.fichier); PHOTOS_MINI.delete(this.h.fichier);
    this.choix = -1; joue("clic");
  }
  touche(p) {
    for (const z of this.zones) if (dans(z.r, p)) { if (z.cadre) return this.prend(p); z.action(); return; }
  }
  prend(p) {
    const els = this.mini.elements;
    for (let k = els.length - 1; k >= 0; k--) {
      if (dans(this.boite(els[k]), p)) { this.choix = k; const [zx, zy, zw, zh] = this.zone(); this.drag = { k, dx: (p[0] - zx) / zw - els[k].x, dy: (p[1] - zy) / zh - els[k].y, bouge: false }; return; }
    }
    this.choix = -1;
  }
  glisse(p) {
    const d = this.drag, el = d && this.mini.elements[d.k];
    if (!el) return;
    const [zx, zy, zw, zh] = this.zone();
    el.x = +borne((p[0] - zx) / zw - d.dx, -0.2, 1.2).toFixed(3); el.y = +borne((p[1] - zy) / zh - d.dy, 0.05, 1.3).toFixed(3); d.bouge = true;
  }
  lache() { if (this.drag && this.drag.bouge) this.sauve(); this.drag = null; }

  dessine(ctx, t) {
    const z = (this.zones = []), h = this.h, cam = camionDe(h), heros = { kind: cam.veh, col: COULEURS[cam.col] };
    const bouton = (r, texte, col, action, taille = 20, actif = true) => {
      rrect(ctx, r[0], r[1] + 4, r[2], r[3], 14, fonce(actif ? col : [190, 190, 190], 0.65));
      rrect(ctx, ...r, 14, actif ? col : [205, 205, 205], 3);
      ecrit(ctx, texte, taille, [255, 255, 255], [r[0] + r[2] / 2, r[1] + r[3] / 2], fonce(actif ? col : [170, 170, 170], 0.5));
      if (actif) z.push({ r, action });
    };
    const puce = (r, texte, on, action, col = [255, 200, 60]) => {
      rrect(ctx, ...r, 12, on ? col : [255, 255, 255], on ? 4 : 2, on ? fonce(col, 0.75) : [200, 190, 175]);
      ecrit(ctx, texte, 18, CONTOUR, [r[0] + r[2] / 2, r[1] + r[3] / 2]);
      z.push({ r, action });
    };
    ecrit(ctx, tr("miniEditeur"), 34, [255, 200, 40], [W / 2, 40], [200, 80, 40]);
    // l'aperçu : la vraie carte, en grand
    ctx.save(); ctx.translate(PX_MINI, PY_MINI); ctx.scale(K_MINI, K_MINI);
    dessineCarte(ctx, h, 0, 0, 350, 200, t, { mini: this.mini });
    ctx.restore();
    const el = this.mini.elements[this.choix];
    if (el) { const b = this.boite(el); rrect(ctx, b[0] - 6, b[1] - 6, b[2] + 12, b[3] + 12, 14, null, 5, [255, 150, 30]); }
    const zn = this.zone();
    rrect(ctx, zn[0], zn[1], zn[2], zn[3], 0, null, 2, [235, 150, 60]);
    z.push({ r: zn, cadre: true });
    ecrit(ctx, tr("miniAide"), 17, [150, 140, 130], [PX_MINI, PY_MINI + 200 * K_MINI + 22], null, true);
    // à droite : fond, images, bandeau
    const X = 830;
    [["fond", tr("ongFond")], ["images", tr("ongImages")], ["bande", tr("ongBande")]].forEach(([o, nom], k) =>
      puce([X + k * 146, 104, 140, 44], nom, this.onglet === o, () => { this.onglet = o; joue("clic"); }, [255, 200, 60]));
    const f = this.mini.fond;
    if (this.onglet === "fond") {
      puce([X, 162, 130, 46], tr("fondAucun"), !f, () => { this.mini.fond = null; this.sauve(); });
      bouton([X + 140, 162, 150, 46], tr("fondPhoto"), [220, 90, 120], () => this.choisitPhoto(), 19);
      if (f && f.type === "photo") rrect(ctx, X + 136, 158, 158, 54, 14, null, 4, [255, 150, 30]);
      LIEUX_MINI.forEach((nom, k) => { // les lieux
        const r = [X + (k % 4) * 108, 222 + Math.floor(k / 4) * 76, 102, 70], on = f && f.type === "decor" && f.id === nom;
        ctx.save(); ctx.beginPath(); ctx.roundRect(...r, 10); ctx.clip();
        ctx.drawImage(fondDecor(nom), 120, 0, VW - 240, VH, r[0], r[1], r[2], r[3] + 30);
        ctx.restore();
        rrect(ctx, ...r, 10, null, on ? 5 : 2, on ? [255, 150, 30] : [205, 195, 180]);
        ecrit(ctx, tr("lieux")[nom] || nom, 13, [255, 255, 255], [r[0] + r[2] / 2, r[1] + r[3] - 11], [70, 70, 70]);
        z.push({ r, action: () => { this.mini.fond = { type: "decor", id: nom }; this.sauve(); joue("pop"); } });
      });
      FONDS_COULEUR.forEach((c, k) => { // ou une couleur douce
        const x = X + 30 + k * 72, y = 560, on = f && f.type === "couleur" && String(f.col) === String(c);
        if (on) rond(ctx, x, y, 30, [255, 150, 30]);
        rond(ctx, x, y, 25, c, 3);
        z.push({ r: [x - 30, y - 30, 60, 60], action: () => { this.mini.fond = { type: "couleur", col: c }; this.sauve(); joue("pop"); } });
      });
    } else if (this.onglet === "images") {
      [["perso", tr("catPerso")], ["engin", tr("catEngins")], ["objet", tr("catObjets")]].forEach(([c, nom], k) =>
        puce([X + k * 146, 158, 140, 40], nom, this.cat === c, () => { this.cat = c; }, [140, 200, 240]));
      const items = this.cat === "perso" ? Object.keys(PERSONNAGES).concat(ANIMAUX_ECRITURE).filter((id) => id in AMIS_DESSIN).map((id) => ({ type: "perso", id }))
        : this.cat === "engin" ? [{ type: "heros", id: "" }].concat(VEHICULES.map((id) => ({ type: "engin", id, col: COULEUR_DEFAUT[id] })))
        : Object.keys(OBJETS_DECOR).map((id) => ({ type: "objet", id }));
      items.slice(0, 30).forEach((it, k) => {
        const r = [X + (k % 6) * 72, 210 + Math.floor(k / 6) * 64, 66, 58];
        rrect(ctx, ...r, 10, it.type === "objet" ? [225, 240, 252] : [255, 255, 255], 2, [205, 195, 180]);
        const [w, hg] = tailleElement(it), ech = Math.min(56 / w, 48 / hg);
        ctx.save(); ctx.beginPath(); ctx.rect(r[0] + 2, r[1] + 2, r[2] - 4, r[3] - 4); ctx.clip();
        dessineElement(ctx, { ...it, x: r[0] + r[2] / 2, y: r[1] + r[3] - 4, s: ech, f: 1 }, t, heros);
        ctx.restore();
        z.push({ r, action: () => this.ajoute(it.type, it.id) });
      });
      [["moins", "−"], ["plus", "+"], ["miroir", "↔"], [el && el.type === "engin" ? "couleur" : "devant", el && el.type === "engin" ? "🎨" : "⬆"], ["efface", "🗑"]].forEach(([nom, txt], k) =>
        bouton([X + k * 87, 540, 80, 50], txt, nom === "efface" ? [210, 90, 80] : [110, 140, 220], () => this.outil(nom), 24, !!el));
    } else {
      puce([X, 162, 130, 46], tr("bandeAuto"), !this.mini.bande, () => { this.mini.bande = null; this.sauve(); });
      Object.entries(COULEURS_BANDE).forEach(([nom, c], k) => {
        const x = X + 34 + (k % 5) * 84, y = 260 + Math.floor(k / 5) * 84, on = this.mini.bande === nom;
        if (on) rond(ctx, x, y, 36, [255, 255, 255], 4, [255, 150, 30]);
        rond(ctx, x, y, 29, c, 3);
        z.push({ r: [x - 36, y - 36, 72, 72], action: () => { this.mini.bande = nom; this.sauve(); joue("pop"); } });
      });
    }
    bouton([40, 640, 260, 60], tr("miniDefaut"), [150, 160, 175], () => this.parDefaut(), 22);
    bouton([W - 300, 640, 260, 60], tr("miniFini"), [70, 185, 90], () => this.ferme(), 24);
  }
}

// le dernier camion (et sa couleur) choisi pour chaque histoire : la miniature le montre, l'écran de départ le propose
const CLE_CAMIONS = "tracto.camions.v1";
function litCamions() { try { return JSON.parse(localStorage.getItem(CLE_CAMIONS) || "{}"); } catch (e) { return {}; } }
function camionDe(h) {
  const c = (h && h.fichier && litCamions()[h.fichier]) || {};
  const veh = VEHICULES.includes(c.veh) ? c.veh : h.heros, col = COULEURS[c.col] ? c.col : COULEURS[h.couleur] ? h.couleur : COULEUR_DEFAUT[veh];
  return { veh, col };
}
function retientCamion(h, veh, col) {
  const tous = litCamions(); tous[h.fichier] = { veh, col };
  try { localStorage.setItem(CLE_CAMIONS, JSON.stringify(tous)); } catch (e) { /* stockage indisponible */ }
}

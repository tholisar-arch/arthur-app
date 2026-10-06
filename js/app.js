// Les aventures de Tracto — version web (iPad / navigateur). Portage de main.py.
"use strict";

const W = 1280, H_ = 720, VX = 150, VY = 72, VW = 980, VH = 510, G = 450;
const FOND = [246, 239, 224];
const SLOTS_COPAINS = [140, 840, 290, 690, 520];
const rnd = (a, b) => a + Math.random() * (b - a);
const choix = (l) => l[Math.floor(Math.random() * l.length)];
const borne = (v, a, b) => Math.max(a, Math.min(b, v));
const dans = (r, p) => p[0] >= r[0] && p[0] <= r[0] + r[2] && p[1] >= r[1] && p[1] <= r[1] + r[3];

function police(taille) { return `700 ${taille}px Fredoka, "Comic Sans MS", sans-serif`; }
function ecrit(ctx, txt, taille, col, pos, contour = null, gauche = false) {
  ctx.font = police(taille);
  ctx.textAlign = gauche ? "left" : "center";
  ctx.textBaseline = gauche ? "top" : "middle";
  if (contour) { ctx.lineWidth = 7; ctx.lineJoin = "round"; ctx.strokeStyle = css(contour); ctx.strokeText(txt, pos[0], pos[1]); }
  ctx.fillStyle = css(col);
  ctx.fillText(txt, pos[0], pos[1]);
}
function coupe(ctx, txt, taille, largeur) {
  ctx.font = police(taille);
  const lignes = [];
  let cour = "";
  for (const mot of txt.split(/\s+/).filter(Boolean)) {
    const essai = (cour + " " + mot).trim();
    if (ctx.measureText(essai).width <= largeur || !cour) cour = essai;
    else { lignes.push(cour); cour = mot; }
  }
  if (cour) lignes.push(cour);
  return lignes;
}

class Bouton {
  constructor(r, texte, col, taille = 30) { Object.assign(this, { r, texte, col, taille }); }
  dessine(ctx, t = 0, pulse = false) {
    let [x, y, w, h] = this.r;
    if (pulse) { const k = 0.04 * Math.sin(t * 5); x -= (w * k) / 2; y -= (h * k) / 2; w *= 1 + k; h *= 1 + k; }
    rrect(ctx, x, y + 6, w, h, 22, fonce(this.col, 0.6));
    rrect(ctx, x, y, w, h, 22, this.col, 4);
    ecrit(ctx, typeof this.texte === "function" ? this.texte() : this.texte, this.taille, [255, 255, 255], [x + w / 2, y + h / 2], fonce(this.col, 0.5));
  }
  touche(p) { return dans(this.r, p); }
}

// ================================================================= monde & scènes
const nouveauVehicule = (kind, col, x, cible, f = 1) => ({ kind, col, x, cible, rot: 0, outil: 0, dx: 0, dy: 0, f });
const DOUCEUR = 3.2; // plus c'est grand, plus l'arrivée est rapide
function avance(v, dt, vitesse = 260) { // pleine vitesse au loin, puis ralentit en douceur en arrivant
  const ecart = v.cible - v.x, pas = borne(ecart * Math.min(1, dt * DOUCEUR) + Math.sign(ecart) * Math.min(Math.abs(ecart), 12 * dt), -vitesse * dt, vitesse * dt);
  v.x += pas; v.rot += pas / 30;
}

class Monde { // ce qui reste d'une scène à l'autre
  constructor(heros, couleur, decor) {
    this.hero = nouveauVehicule(heros, COULEURS[couleur], -260, 330);
    this.copains = []; this.amis = []; this.decor = decor;
    this.scroll = 0; this.nuit = false; this.parts = []; this.t = 0;
  }
  ajouteCopain(kind) {
    if (this.copains.some((c) => c.kind === kind) && this.copains.length >= 5) return null;
    let col = COULEUR_DEFAUT[kind] || "orange";
    if (COULEURS[col] === this.hero.col) col = Object.keys(COULEURS).find((c) => COULEURS[c] !== this.hero.col && c !== col);
    const slot = SLOTS_COPAINS[this.copains.length % SLOTS_COPAINS.length], gauche = slot < VW / 2;
    const c = nouveauVehicule(kind, COULEURS[col], gauche ? -220 : VW + 220, slot, gauche ? 1 : -1);
    this.copains.push(c);
    return c;
  }
  ajouteAmi(kind) {
    const deja = this.amis.find((a) => a.kind === kind);
    if (deja) { delete deja.part; return null; } // il revient
    const a = { kind, x: VW + 150, cible: VW - 150, f: -1, marche: 0, mange: 0, dy: 0, humeur: null };
    this.amis.push(a);
    joue({ trex: "rugir", chat: "miaou" }[kind] || "pop");
    return a;
  }
  jet(x0, y0, x1, y1, col, n = 20, r = [5, 9], duree = [0.55, 0.8], etale = 25, type = "rond") {
    for (let i = 0; i < n; i++) {
      const T = rnd(...duree), tx = x1 + rnd(-etale, etale), ty = y1 + rnd(-etale / 2, etale / 2);
      this.parts.push({ x: x0, y: y0, vx: (tx - x0) / T, vy: (ty - y0) / T - 0.5 * 900 * T, g: 900, vie: T, max: T, col, r: rnd(...r), type, a: rnd(0, 6), va: rnd(-6, 6) });
    }
  }
  eclat(x, y, n = 30, cols = null, vit = 320, type = "etoile", vie = 1, g = 200) {
    cols = cols || [[255, 220, 60], [255, 120, 160], [120, 200, 255], [140, 230, 120], [255, 160, 60]];
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 2 * PI), v = rnd(vit * 0.3, vit);
      this.parts.push({ x, y, vx: v * Math.cos(a), vy: v * Math.sin(a), g, vie: vie * rnd(0.6, 1), max: vie, col: choix(cols), r: rnd(5, 11), type, a, va: rnd(-5, 5) });
    }
  }
  majParticules(dt) {
    const explosions = [];
    for (const p of this.parts) {
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; p.vie -= dt;
      if (p.type === "fusee" && p.vie <= 0) explosions.push([p.x, p.y]);
    }
    this.parts = this.parts.filter((p) => p.vie > 0);
    for (const [x, y] of explosions) {
      joue("boum");
      this.eclat(x, y, 45, choix([[[255, 90, 90], [255, 200, 80]], [[120, 200, 255], [200, 140, 255]], [[140, 240, 120], [255, 255, 160]]]), 280, "rond", 1.3, 120);
    }
  }
  dessineParticules(ctx) {
    for (const p of this.parts) {
      const k = Math.max(0, p.vie / p.max);
      if (p.type === "rond") rond(ctx, p.x, p.y, Math.max(1, p.r * (0.4 + 0.6 * k)), p.col);
      else if (p.type === "etoile") etoile(ctx, p.x, p.y, p.r * (0.5 + 0.5 * k) + 2, p.col, p.a);
      else if (p.type === "confetti") { const h = 6 * Math.abs(Math.cos(p.a)) + 2; rrect(ctx, p.x - 5, p.y - h / 2, 10, h, 0, p.col); }
      else if (p.type === "fusee") { rond(ctx, p.x, p.y, 5, [255, 240, 200]); trait(ctx, [p.x, p.y], [p.x - p.vx * 0.05, p.y - p.vy * 0.05], 3, [255, 180, 80]); }
      else if (p.type === "bulle") bulle(ctx, p.x + 6 * Math.sin(p.a), p.y, p.r);
      else if (p.type === "coeur") coeur(ctx, p.x, p.y, p.r * (0.6 + 0.4 * k) + 4, p.col);
      else if (p.type === "goutte") trait(ctx, [p.x, p.y], [p.x - p.vx * 0.03, p.y - p.vy * 0.03], 2, p.col, "round");
      else if (p.type === "flocon") rond(ctx, p.x + 8 * Math.sin(p.a), p.y, p.r, p.col);
      else if (p.type === "filante") { ctx.globalAlpha = k; trait(ctx, [p.x, p.y], [p.x - p.vx * 0.14, p.y - p.vy * 0.14], 3, p.col, "round"); rond(ctx, p.x, p.y, 4, [255, 255, 255]); ctx.globalAlpha = 1; }
      else if (p.type === "anneau") { ctx.globalAlpha = k; rond(ctx, p.x, p.y, 10 + (1 - k) * 26, null, 5, [255, 255, 255]); ctx.globalAlpha = 1; }
      else if (p.type === "note" || p.type === "zzz") {
        ctx.globalAlpha = Math.min(1, k * 2);
        ecrit(ctx, p.type === "zzz" ? "Z" : "♪", 18 + p.r * 2, p.col, [p.x, p.y]);
        ctx.globalAlpha = 1;
      }
    }
  }
}

const DUREE_FONDU = 0.75; // fondu entre deux scènes (secondes)
const RAYON_CIBLE = 100; // taille de la zone à toucher autour de la cible (en pixels de l'image)
const estimeDuree = (texte) => texte.length / 11 + 1;

class Scene {
  constructor(app, monde, d, valeurs) {
    Object.assign(this, { app, m: monde, d, valeurs });
    this.act = d.action; this.inter = d.interactif;
    this.langue = langueDe(d); // la langue choisie, ou le français si l'histoire n'est pas traduite
    if (this.langue !== LANGUE) valeurs = textes(app.choixVeh, app.choixCol, app.prenom, this.langue);
    this.texte = rendu(texteDe(d), valeurs);
    this.consigne = this.inter ? rendu(consigneDe(d), valeurs) : "";
    this.t = 0; this.fait = 0; this.p = null; this.attente = false; this.evt = false; this.fini_t = null;
    this.duree = estimeDuree(this.texte + " " + this.consigne);
    this.acteur = null; this.vol = null; this.etoiles = []; this.artiste = null; this.niveauCible = null;
    const m = monde, hero = m.hero;
    if (d.decor !== m.decor) m.scroll = 0;
    m.decor = d.decor; m.nuit = this.act === "dormir" || !!d.nuit;
    for (const v of [hero, ...m.copains]) v.outil = v.dx = v.dy = 0;
    const aFaire = this.inter || ["trou", "feu", "deblayer", "construire", "copains", "fete", "manger", "spectacle", "bulles", "calin", "piscine", "cueillir", "chateau", "route", "voler", "fenetres", "cadeau", "velo"].includes(this.act);
    this.n = aFaire ? d.clics : 0;
    const poste = { rouler: 330, parler: 430, trou: 540, feu: 440, deblayer: 470, construire: hero.kind === "grue" ? 592 : 520, copains: 470, fete: 470, dormir: 470, manger: 470, spectacle: 480, bulles: 480, calin: 480, piscine: 200, cueillir: 430, chateau: 470, route: 380, voler: 420, fenetres: 470, cadeau: 430, velo: 420 }[this.act];
    this.altitude = 0; this.ouvert = 0; this.veloX = 440; this.pedale = 0;
    this.cacheHeros = !!d.cache_heros;
    let kindActeur = d.vehicule;
    if (this.act === "feu" && hero.kind !== "pompier" && !kindActeur) kindActeur = "pompier";
    if (kindActeur && kindActeur !== hero.kind) {
      let col = COULEURS[COULEUR_DEFAUT[kindActeur]];
      if (col === hero.col) col = COULEURS.orange;
      this.acteur = nouveauVehicule(kindActeur, col, -260, poste);
      hero.cible = 150;
    } else hero.cible = poste;
    if (this.cacheHeros) hero.cible = -320; // la scène est pour les personnages
    this.cx = { trou: 720, feu: 770, deblayer: 730, construire: 770, piscine: 610, cueillir: 640, chateau: 680, route: 560, fenetres: 760, cadeau: 640 }[this.act] || 0;
    this.niveau = 0; this.etages = 0;
    if (this.act === "cueillir") { // le camion benne vient se garer pour recevoir les mûres
      const col = hero.col === COULEURS.orange ? COULEURS.bleu : COULEURS.orange;
      this.benne = nouveauVehicule("benne", col, VW + 260, 850, -1);
    }
    if (this.act === "copains") {
      const presents = new Set(m.copains.map((c) => c.kind));
      this.aVenir = d.copains.filter((k) => !presents.has(k));
      if (!d.copains.length) this.aVenir = ["benne", "toupie", "bulldozer", "grue", "pompier"].filter((k) => k !== hero.kind && !presents.has(k)).slice(0, 2);
      if (this.aVenir.length) this.n = this.aVenir.length; else if (!this.inter) this.n = 0;
    } else for (const k of d.copains) if (!m.copains.some((c) => c.kind === k)) m.ajouteCopain(k);
    const nouveaux = d.amis.map((k) => m.ajouteAmi(k)).filter(Boolean);
    for (const a of m.amis) if (d.partent.includes(a.kind)) { a.part = true; a.cible = a.x < VW / 2 ? -200 : VW + 200; }
    const ecarts = this.act === "manger" ? [-280, 300, -430, 440] : [-250, 250, -420, 420];
    m.amis.filter((a) => !a.part).forEach((a, i) => {
      a.cible = borne(d.positions[a.kind] ?? poste + ecarts[i % 4], 70, VW - 70);
      if (nouveaux.includes(a) && a.cible < VW / 2) a.x = -150; // arrive par le côté où il va se placer
    });
    for (const a of m.amis) { a.mange = a.dy = 0; a.humeur = d.humeur[a.kind] || null; }
    if (this.act === "manger") { this.mangeurs = [hero, ...m.amis]; this.n = this.mangeurs.length; this.qte = this.mangeurs.map(() => 1); }
    this.espacement = Math.max(1.3, (this.duree - 2) / Math.max(1, this.n));
    this.prochainAuto = 1.4;
    // bulle de dialogue : un personnage « dit » une phrase (affichée au-dessus de lui et lue à voix haute)
    const b = d.bulle, texteBulle = b && ((this.langue === "en" && b.texte_en) || b.texte);
    this.bulle = texteBulle ? { qui: b.qui, texte: rendu(texteBulle, valeurs) } : null;
    let parole = this.texte;
    if (this.bulle) {
      const qui = b.qui === "heros" ? valeurs.nom : nomPerso(b.qui, this.langue).replace("{prenom}", valeurs.prenom);
      parole += " " + (this.langue === "en" ? `${qui} says: ` : `${qui} dit : `) + this.bulle.texte;
    }
    const enregistree = d.voixPerso && app.voixPerso.get(d.voixPerso);
    if (enregistree) app.voix.joueBuffer(enregistree); // la voix de la famille, enregistrée au micro
    else app.voix.dire((parole + " " + this.consigne).trim(), this.langue);
  }
  faiseur() { return this.acteur || this.m.hero; }
  pret() { if (this.cacheHeros && !this.acteur) return true; const f = this.faiseur(); return Math.abs(f.x - f.cible) < 6; }
  posRepas(i) {
    const v = this.mangeurs[i];
    if (v === this.m.hero) return [v.x + 150, "engin"];
    return [v.x + (v.kind === "trex" ? 105 : 75) * v.f, v.kind];
  }
  sauteurs() { // à la piscine : une fois Arthur, une fois le véhicule
    const l = this.m.amis.filter((a) => a.kind === "arthur" && !a.part);
    if (!this.cacheHeros) l.push(this.m.hero);
    return l.length ? l : this.m.amis.filter((a) => a.kind !== "papi" && !a.part);
  }
  cyclistes() { return this.m.amis.filter((a) => (a.kind === "arthur" || a.kind === "mamie") && !a.part); }
  souffleurs() {
    const dinos = this.m.amis.filter((a) => ["dino", "stego", "trex"].includes(a.kind) && !a.part);
    return dinos.length ? dinos : this.m.amis.filter((a) => !a.part);
  }
  cible() {
    const m = this.m;
    if (this.act === "bulles" && this.souffleurs().length) { const s = this.souffleurs(), a = s[this.fait % s.length]; return boucheAmi(a.kind, a.x, G, a.f); }
    if (this.act === "calin") {
      const gens = m.amis.filter((a) => a.kind === "arthur").concat(m.amis);
      if (gens.length) { const [x, y] = boucheAmi(gens[0].kind, gens[0].x, G, gens[0].f); return [x, y - 40]; }
      return [VW / 2, G - 150];
    }
    if (this.act === "spectacle") return this.cacheHeros ? [VW / 2, G - 150] : [m.hero.x, G - 120];
    if (this.act === "piscine") { const s = this.sauteurs(); return s.length ? [s[this.fait % s.length].x, G - 150] : [this.cx, G - 40]; }
    if (this.act === "cueillir") return [this.cx, G - 70];
    if (this.act === "chateau") return [this.cx - 100 + (200 * (Math.min(this.fait, this.n - 1) + 0.5)) / Math.max(1, this.n), G - 40];
    if (this.act === "route") return [this.cx + Math.min(this.fait, this.n - 1) * 80 + 40, G - 10];
    if (this.act === "voler") return [m.hero.x + 190, G + m.hero.dy - 50]; // à côté, pour ne pas cacher les passagers
    if (this.act === "fenetres") { const o = OUVERTURES[Math.min(this.fait, OUVERTURES.length - 1)]; return [this.cx + o[0], G + o[1]]; }
    if (this.act === "cadeau") return [this.cx, G - 80];
    if (this.act === "velo") return [this.veloX + 190, G + this.altitude - 50];
    if (this.act === "manger") return this.fait < this.n ? [this.posRepas(this.fait)[0], G - 45] : [m.hero.x, G - 110];
    if (this.act === "trou") return [this.cx, G + 10];
    if (this.act === "feu") return [this.cx, G - 160];
    if (this.act === "deblayer") return [this.cx, G - 70];
    if (this.act === "construire") return [this.cx, G - 80];
    if (this.act === "copains") return [VW - 120, G - 120];
    if (this.act === "fete" || this.act === "dormir") return [VW / 2, 150];
    const v = this.faiseur();
    return [v.x, G - 110];
  }
  pointOutil() { const v = this.faiseur(); return pointOutil(v.kind, v.col, v.x + v.dx, G + v.dy, v.outil); }

  clic(pos) { // pos = endroit touché dans l'image ; il faut toucher la cible (le rond jaune avec la main)
    if (!this.inter || this.fait >= this.n) return;
    if (pos) {
      const [cx, cy] = this.cible();
      if (Math.hypot(pos[0] - cx, pos[1] - cy) > RAYON_CIBLE) return this.rate(pos);
    }
    if (this.p === null && this.pret()) this.debutEtape(); else this.attente = true;
  }
  rate(pos) { // touché à côté : un petit rond et un petit son, rien ne se passe
    joue("clic");
    this.m.parts.push({ x: pos[0], y: pos[1], vx: 0, vy: 0, g: 0, vie: 0.45, max: 0.45, col: [255, 255, 255], r: 0, type: "anneau", a: 0, va: 0 });
  }
  debutEtape() {
    this.p = 0; this.evt = false; this.evt2 = false; this.attente = false;
    this.dureeEtape = { feu: 1.3, copains: 0.9, fete: 0.6, dormir: 0.6, rouler: 0.7, parler: 0.7 }[this.act] || 1.1;
    const m = this.m;
    if (this.act === "feu") joue("splash");
    else if (this.act === "piscine") { const s = this.sauteurs(); this.sauteur = s.length ? s[this.fait % s.length] : null; this.dureeEtape = 1.7; this.evt2 = false; joue("pop"); }
    else if (this.act === "cueillir") joue("pop");
    else if (this.act === "chateau") joue("terre");
    else if (this.act === "route") joue("pop");
    else if (this.act === "voler" || this.act === "velo") { joue("fusee"); joue("magie"); }
    else if (this.act === "cadeau") { this.dureeEtape = 1.4; joue("magie"); }
    else if (this.act === "fenetres") joue("pop");
    else if (this.act === "spectacle") {
      const artistes = (this.cacheHeros ? [] : [m.hero]).concat(m.copains);
      this.artiste = artistes.length ? artistes[this.fait % artistes.length] : null;
      joue("klaxon");
      if (this.artiste) m.eclat(this.artiste.x, G - 200, 20, null, 300);
    } else if (this.act === "bulles") { joue("magie"); for (const a of this.souffleurs().slice(0, 3)) this.souffle(a, 12, 1); }
    else if (this.act === "calin") { joue("pop"); const [x, y] = this.cible(); m.eclat(x, y + 20, 10, [[255, 100, 140], [255, 150, 180]], 180, "coeur", 1.4, -40); }
    else if (this.act === "manger") joue("croque");
    else if (this.act === "copains" && this.aVenir.length) { m.ajouteCopain(this.aVenir.shift()); joue("klaxon"); }
    else if (this.act === "fete") {
      m.parts.push({ x: rnd(150, VW - 150), y: G, vx: rnd(-60, 60), vy: -rnd(520, 640), g: 250, vie: 1, max: 1, col: [255, 255, 255], r: 5, type: "fusee", a: 0, va: 0 });
      joue("fusee");
    } else if (this.act === "dormir") {
      const pos = [rnd(80, VW - 260), rnd(40, 220)];
      this.etoiles.push(pos);
      m.eclat(pos[0], pos[1], 14, [[255, 250, 200]], 160, "etoile", 0.7, 0);
      joue("magie");
    } else {
      joue("klaxon");
      const v = this.faiseur();
      for (let i = 0; i < 3; i++) m.parts.push({ x: v.x + rnd(-40, 40), y: G - 180, vx: rnd(-40, 40), vy: -120, g: 0, vie: 1, max: 1, col: [90, 60, 160], r: rnd(4, 8), type: "note", a: 0, va: 0 });
    }
  }
  pendantEtape(dt) {
    const p = this.p, v = this.faiseur(), m = this.m, n = Math.max(1, this.n), q = Math.min(1, p);
    if (["trou", "construire", "feu"].includes(this.act)) v.outil = Math.sin(PI * q);
    if (this.act === "deblayer") { v.dx = 70 * Math.sin(PI * q); v.outil = 0.25; }
    if (this.act === "rouler" || this.act === "parler" || (this.act === "copains" && !this.aVenir.length && this.inter)) v.dy = -Math.abs(Math.sin(PI * q)) * 35;
    if (this.act === "trou" && p >= 0.5 && !this.evt) {
      this.evt = true;
      const [x0, y0] = this.pointOutil();
      m.jet(x0, y0, this.cx, G + 15, { toupie: [170, 170, 175], pompier: [90, 160, 240] }[v.kind] || [150, 100, 60], 28, undefined, undefined, 60);
      joue("terre");
    }
    if (this.act === "feu" && p > 0.15 && p < 0.95) { const [x0, y0] = this.pointOutil(); m.jet(x0, y0, this.cx + rnd(-50, 50), G - 150, [90, 170, 250], 3, [4, 7], undefined, 40); }
    if (this.act === "deblayer" && p >= 0.45 && !this.evt) { this.evt = true; joue("terre"); m.jet(this.cx - 40, G - 60, this.cx + 260, G - 20, [225, 190, 120], 30, undefined, [0.5, 0.9], 90); }
    if (this.act === "construire" && p >= 0.5 && !this.evt) {
      this.evt = true;
      const [x0, y0] = this.pointOutil(), murs = Math.max(1, this.n - 1), k = this.fait;
      this.vol = { x0, y0, x1: this.cx, y1: G - Math.min(k, murs) * 38 - 19, u: 0, toit: k >= this.n - 1, k, haut: v.kind === "grue" ? 30 : 140 };
    }
    if (this.act === "spectacle" && this.artiste) { this.artiste.dy = -Math.abs(Math.sin(PI * q)) * 90; this.artiste.outil = Math.sin(PI * q); }
    if (this.act === "spectacle" || this.act === "calin") m.amis.forEach((a, i) => { a.dy = -Math.abs(Math.sin(PI * q * 2 + i)) * 16; });
    if (this.act === "manger") {
      const i = Math.min(this.fait, this.n - 1), qui = this.mangeurs[i];
      this.qte[i] = Math.max(0, 1 - p * 1.15);
      if (qui === m.hero) qui.outil = Math.abs(Math.sin(PI * p * 2)) * 0.45; else qui.mange = Math.abs(Math.sin(PI * p * 3));
      if (Math.random() < dt * 25) { const [x, k] = this.posRepas(i); m.jet(x, G - 20, x + rnd(-40, 40), G - 30, { chat: [150, 90, 50], trex: [80, 190, 80] }[k] || [150, 150, 160], 2, [3, 6], [0.4, 0.6], 20); }
    }
    if (this.act === "piscine" && this.sauteur) {
      const s = this.sauteur, cible = this.cx - 40 - s.x;
      let dx, dy;
      if (p < 0.45) { const k = p / 0.45; dx = cible * k; dy = -150 * Math.sin(PI * k); }
      else if (p < 0.8) { dx = cible; dy = 40; }
      else { const k = (p - 0.8) / 0.2; dx = cible * (1 - k); dy = 40 * (1 - k) - 70 * Math.sin(PI * k); }
      s.dx = dx; s.dy = dy;
      if (p >= 0.45 && !this.evt) { // plouf !
        this.evt = true; joue("splash"); joue("boum");
        m.eclat(this.cx - 40, G + 5, 40, [[120, 200, 250], [200, 235, 255], [80, 170, 240]], 420, "rond", 0.9, 900);
      }
      if (p >= 0.6 && !this.evt2) { // Papi l'attrape
        this.evt2 = true;
        const papi = m.amis.find((a) => a.kind === "papi");
        m.eclat(papi ? papi.x : this.cx, G - 120, 8, [[255, 100, 140], [255, 150, 180]], 160, "coeur", 1.2, -50);
      }
    }
    if (this.act === "cueillir") {
      v.outil = Math.sin(PI * q);
      m.amis.forEach((a, i) => { a.dy = -Math.abs(Math.sin(PI * q * 2 + i)) * 14; });
      if (p >= 0.5 && !this.evt) {
        this.evt = true;
        m.jet(this.cx, G - 70, this.benne.x + 32, G - 135, [80, 30, 90], 16, [5, 8], [0.6, 0.8], 30);
        joue("croque");
      }
    }
    if (this.act === "chateau") {
      m.amis.forEach((a, i) => { a.dy = -Math.abs(Math.sin(PI * q * 2 + i)) * 14; });
      if (p >= 0.5 && !this.evt) {
        this.evt = true; this.etages++; joue("pop");
        const [x, y] = this.cible();
        m.eclat(x, y, 14, [[235, 195, 120], [245, 215, 140]], 200, "rond", 0.6, 500);
      }
    }
    if (this.act === "route") {
      v.outil = Math.sin(PI * q);
      if (p >= 0.45 && !this.evt) {
        this.evt = true;
        const [x0, y0] = this.pointOutil();
        m.jet(x0, y0, this.cx + this.fait * 80 + 40, G + 8, [150, 150, 158], 10, [6, 10], [0.4, 0.55], 30);
        joue("terre");
      }
      if (p >= 0.75 && !this.evt2) { this.evt2 = true; this.etages++; m.eclat(this.cx + (this.etages - 0.5) * 80, G, 8, null, 180); }
    }
    if (this.act === "fenetres") {
      v.outil = Math.sin(PI * q);
      if (p >= 0.5 && !this.evt && this.fait < OUVERTURES.length) {
        this.evt = true;
        const [x0, y0] = this.pointOutil(), [dx, dy, type] = OUVERTURES[this.fait];
        this.vol = { x0, y0, x1: this.cx + dx, y1: G + dy - 19, u: 0, fenetre: type, k: this.fait, haut: 90 };
      }
    }
    if (this.act === "cadeau") {
      this.ouvert = Math.min(1, p * 1.5);
      if (p >= 0.4 && !this.evt) { this.evt = true; joue("bravo"); m.eclat(this.cx, G - 90, 40, null, 380); }
    }
    if (this.act === "velo") this.boost = -70 * Math.sin(PI * q);
    if (this.act === "voler") { // un clic = un grand coup d'ailes vers le haut
      this.boost = -70 * Math.sin(PI * q);
      if (Math.random() < 0.5) m.eclat(m.hero.x - 120, G + m.hero.dy - 90, 2, [[255, 240, 150], [255, 255, 255]], 120, "etoile", 0.8, 0);
    }
    if (["trou", "feu", "deblayer", "cueillir"].includes(this.act)) this.niveauCible = (this.fait + (p >= 0.5 ? 1 : 0)) / n;
  }
  finEtape() {
    if (this.act === "manger" && this.fait < this.n) {
      const qui = this.mangeurs[this.fait];
      this.qte[this.fait] = 0; qui.mange = 0;
      this.m.eclat(qui.x, G - (qui === this.m.hero || qui.kind === "trex" ? 190 : 100), 8, [[255, 110, 150], [255, 160, 190]], 140, "coeur", 1.2, -60);
      joue(qui.kind === "chat" ? "miaou" : "pop");
    }
    this.fait++;
    const v = this.faiseur(); v.outil = v.dx = v.dy = 0;
    for (const c of this.m.copains) c.dy = c.outil = 0;
    for (const a of this.m.amis) a.dx = 0;
    if (this.sauteur) { this.sauteur.dx = this.sauteur.dy = 0; }
    if (this.fait >= this.n) this.termine(); else if (this.attente) this.debutEtape();
  }
  souffle(a, n, force) {
    const [x, y] = boucheAmi(a.kind, a.x, G, a.f);
    for (let i = 0; i < n; i++) this.m.parts.push({ x, y, vx: a.f * rnd(30, 160) * force, vy: -rnd(10, 80) * force, g: -25, vie: 4.5, max: 4.5, col: [0, 0, 0], r: rnd(8, 20), type: "bulle", a: rnd(0, 6), va: rnd(2, 4) });
  }
  termine() {
    const m = this.m;
    if (this.act === "calin") for (const a of m.amis) if (a.humeur === "peur") a.humeur = "joie"; // les câlins, ça rassure
    if (["trou", "feu", "deblayer", "construire", "cueillir", "chateau", "route", "fenetres"].includes(this.act)) { joue("magie"); const [x, y] = this.cible(); m.eclat(x, y - 40, 25); }
    if (this.inter) { joue("bravo"); m.eclat(VW / 2, 200, 40, null, 420); this.app.voix.dire(rendu(choix(tr("bravos")), this.valeurs)); }
  }
  maj(dt) {
    const m = this.m;
    this.t += dt; m.t += dt;
    avance(m.hero, dt);
    if (this.acteur) avance(this.acteur, dt);
    if (this.benne) avance(this.benne, dt, 300);
    for (const c of m.copains) avance(c, dt, 300);
    const defile = this.act === "rouler" && Math.abs(m.hero.x - m.hero.cible) < 6;
    if (defile) { m.scroll += 150 * dt; for (const v of [m.hero, ...m.copains]) v.rot += (150 * dt) / 30; }
    if (this.act === "velo") { // Arthur et Mamie s'envolent sur le vélo jaune
      this.altitude += (-180 - this.altitude) * Math.min(1, dt * 1.2);
      if (this.p === null) this.boost = 0;
      this.pedale += dt * 8;
      m.scroll += 240 * dt * Math.min(1, -this.altitude / 150);
      if (Math.random() < dt * 12) m.eclat(this.veloX - 90, G + this.altitude - 40, 1, [[255, 240, 150], [255, 255, 255]], 60, "etoile", 0.9, 0);
    }
    if (this.act === "voler") { // tout le monde est monté sur le véhicule, qui s'envole
      this.altitude += (-190 - this.altitude) * Math.min(1, dt * 1.2);
      if (this.p === null) this.boost = 0;
      m.hero.dy = this.altitude + 12 * Math.sin(m.t * 2) + (this.boost || 0);
      if (Math.abs(m.hero.x - m.hero.cible) < 6) m.scroll += 260 * dt * Math.min(1, -this.altitude / 150);
      if (Math.random() < dt * 12) m.eclat(m.hero.x - 130, G + m.hero.dy - 60, 1, [[255, 240, 150], [255, 255, 255]], 60, "etoile", 0.9, 0);
    }
    m.amis.forEach((a, i) => {
      const ecart = a.cible - a.x, pas = borne(ecart * Math.min(1, dt * DOUCEUR) + Math.sign(ecart) * Math.min(Math.abs(ecart), 12 * dt), -230 * dt, 230 * dt);
      a.x += pas;
      if (Math.abs(ecart) > 4) { a.f = ecart > 0 ? 1 : -1; a.marche += Math.abs(pas) / 12; }
      else if (defile) { a.f = 1; a.marche += dt * 9; }
      else { const centre = this.cacheHeros ? VW / 2 : m.hero.x; a.f = a.x < centre ? 1 : -1; }
      a.dy = this.act === "fete" ? -Math.abs(Math.sin(m.t * 5 + i + 2)) * 16 : 0;
    });
    m.amis = m.amis.filter((a) => !(a.part && Math.abs(a.cible - a.x) < 5));
    if (this.act === "piscine") for (const a of m.amis) if (Math.abs(a.cible - a.x) <= 4) a.f = a.x < this.cx ? 1 : -1; // tout le monde regarde la piscine
    if (this.act === "voler") m.amis.forEach((a) => { a.x = a.cible = m.hero.x; a.f = 1; }); // passagers
    if (this.act === "velo") for (const a of this.cyclistes()) { a.x = a.cible = this.veloX; a.f = 1; }
    if (this.act === "bulles" && Math.random() < dt * 3) { const s = this.souffleurs(); if (s.length) this.souffle(choix(s), 1, 0.6); }

    if (this.p !== null) {
      this.p += dt / this.dureeEtape;
      this.pendantEtape(dt);
      if (this.p >= 1) { this.p = null; this.finEtape(); }
    } else if (this.fait < this.n && !this.inter && this.t >= this.prochainAuto && this.pret()) {
      this.debutEtape(); this.prochainAuto = this.t + this.espacement;
    } else if (this.fait < this.n && this.inter && this.attente && this.pret()) this.debutEtape();
    if ((this.n === 0 || (this.fait >= this.n && this.p === null)) && this.fini_t === null) this.fini_t = this.t;
    if (this.niveauCible !== null) this.niveau += (this.niveauCible - this.niveau) * Math.min(1, dt * 3);
    if (this.vol) {
      this.vol.u += dt / 0.6;
      if (this.vol.u >= 1) { this.etages++; joue("pop"); m.eclat(this.vol.x1, this.vol.y1 + 19, 10, [[200, 180, 150]], 150, "rond", 0.5, 300); this.vol = null; }
    }
    if (this.act === "fete" && Math.random() < dt * 25)
      m.parts.push({ x: rnd(0, VW), y: -10, vx: rnd(-30, 30), vy: 80, g: 40, vie: 5, max: 5, type: "confetti", r: 5, a: rnd(0, 6), va: rnd(-8, 8), col: choix([[255, 90, 90], [255, 210, 60], [90, 170, 250], [120, 220, 120], [220, 130, 240]]) });
    const meteo = this.d.meteo;
    if (meteo === "pluie") for (let k = 0; k < 2; k++) if (Math.random() < dt * 45) m.parts.push({ x: rnd(-40, VW + 60), y: -10, vx: -60, vy: 650, g: 0, vie: 1, max: 1, col: [120, 165, 225], r: 2, type: "goutte", a: 0, va: 0 });
    if (meteo === "neige" && Math.random() < dt * 25) m.parts.push({ x: rnd(0, VW), y: -10, vx: rnd(-15, 15), vy: rnd(40, 80), g: 0, vie: 8, max: 8, col: [255, 255, 255], r: rnd(2, 5), type: "flocon", a: rnd(0, 6), va: 2 });
    if (meteo === "etoiles" && Math.random() < dt * 0.9) m.parts.push({ x: rnd(250, VW + 100), y: rnd(10, 140), vx: -430, vy: 160, g: 0, vie: 0.9, max: 0.9, col: [255, 250, 210], r: 3, type: "filante", a: 0, va: 0 });
    if (this.act === "dormir" && Math.random() < dt * 1.2)
      m.parts.push({ x: m.hero.x - 30, y: G - 170, vx: 25, vy: -45, g: 0, vie: 2.5, max: 2.5, col: [255, 255, 255], r: rnd(4, 9), type: "zzz", a: 0, va: 0 });
    m.majParticules(dt);
  }
  terminee() {
    if (this.fini_t === null) return false;
    // avec la voix : on enchaîne dès qu'elle a fini sa phrase ; sans voix : on attend le temps de lecture estimé
    const vocal = this.app.voix.actif && Audio_.ctx;
    if (vocal ? this.t < 1 : this.t < this.duree) return false;
    if (this.app.voix.parle()) return false; // on laisse la voix finir sa phrase
    return this.t - this.fini_t >= (this.inter ? 1.3 : 0.3);
  }
  attendClic() { return this.inter && this.fait < this.n && this.p === null && this.pret(); }
  dessine(ctx) {
    const m = this.m, fete = this.act === "fete";
    dessineDecor(ctx, VW, VH, m.decor, m.scroll, m.t, m.nuit, G);
    for (const [x, y] of this.etoiles) etoile(ctx, x, y, 16 + 3 * Math.sin(m.t * 4 + x), [255, 240, 150], m.t * 0.5);
    if (this.d.meteo === "pluie") { ctx.fillStyle = "rgba(70,85,110,0.18)"; ctx.fillRect(0, 0, VW, VH); }
    if (this.d.meteo === "arcenciel") arcEnCiel(ctx, VW * 0.62, G - 40, 330);
    if (this.act !== "velo") m.copains.forEach((c, i) => {
      const dy = fete ? -Math.abs(Math.sin(m.t * 5 + i)) * 14 : 0;
      dessineVehicule(ctx, c.kind, c.col, c.x, G - 32 + dy + c.dy, m.t + i, c.outil, c.rot, 0.72, c.f, m.nuit);
    });
    if (this.act === "trou") trou(ctx, this.cx, G, this.niveau);
    else if (this.act === "feu") maisonFeu(ctx, this.cx, G, 1 - this.niveau, m.t, this.fait >= this.n);
    else if (this.act === "deblayer") tas(ctx, this.cx, G, 1 - this.niveau);
    else if (this.act === "construire") construction(ctx, this.cx, G, this.etages, Math.max(2, this.n), m.t);
    else if (this.act === "piscine") piscineFond(ctx, this.cx, G, m.t);
    else if (this.act === "chateau") bacASable(ctx, this.cx, G, this.etages, this.n, m.t);
    else if (this.act === "route") { cailloux(ctx, 250, G); routePavee(ctx, this.cx, G, this.etages); }
    else if (this.act === "fenetres") maisonAOuvrir(ctx, this.cx, G, this.etages, this.n, m.t);
    else if (this.act === "cadeau") cadeau(ctx, this.cx, G, this.ouvert, m.t);
    else if (this.act === "cueillir") {
      buisson(ctx, this.cx, G, 1 - this.niveau);
      dessineVehicule(ctx, "benne", this.benne.col, this.benne.x, G, m.t + 2, 0, this.benne.rot, 1, -1);
      muresDansBenne(ctx, this.benne.x, G, -1, this.niveau);
    }
    for (const a of m.amis) {
      if (this.act === "voler") break; // ils sont sur le véhicule (dessinés plus bas)
      if (this.act === "velo" && this.cyclistes().includes(a)) continue; // sur le vélo (dessinés plus bas)
      const dansLEau = this.act === "piscine" && a.kind === "papi" ? 44 : 0; // Papi est dans la piscine
      dessineAmi(ctx, a.kind, a.x + (a.dx || 0), G + a.dy + dansLEau, m.t, a.f, a.marche, a.mange, 1, a.humeur);
    }
    if (this.act === "manger") for (let i = 0; i < this.n; i++) { const [x, k] = this.posRepas(i); nourriture(ctx, k, x, G, this.qte[i]); }
    for (const v of [m.hero].concat(this.acteur ? [this.acteur] : [])) {
      const roule = Math.abs(v.x - v.cible) > 6 || this.act === "rouler";
      let dy = v.dy + (roule ? Math.sin(m.t * 14) * 1.5 : 0);
      if (fete) dy -= Math.abs(Math.sin(m.t * 5)) * 18;
      if (this.act === "voler" && v === m.hero) ailes(ctx, v.x, G + dy, m.t);
      dessineVehicule(ctx, v.kind, v.col, v.x + v.dx, G + dy, m.t, v.outil, v.rot, 1, 1, this.act === "dormir");
      if (this.act === "voler" && v === m.hero) // les passagers, debout sur le capot
        m.amis.forEach((a, i) => dessineAmi(ctx, a.kind, v.x + 2 + i * 32, G + dy - 108, m.t, 1, 0, 0, 0.62, "joie"));
    }
    if (this.act === "piscine") piscineDevant(ctx, this.cx, G, m.t);
    if (this.act === "velo") { // le vélo jaune qui vole, avec Arthur devant et Mamie derrière
      const g = G + this.altitude + 8 * Math.sin(m.t * 2) + (this.boost || 0), x = this.veloX;
      ailes(ctx, x + 40, g + 30, m.t);
      const cyc = this.cyclistes(), mamie = cyc.find((a) => a.kind === "mamie"), arthur = cyc.find((a) => a.kind === "arthur");
      if (mamie) dessineAmi(ctx, "mamie", x - 34, g - 44, m.t, 1, 0, 0, 0.62, "joie");
      if (arthur) dessineAmi(ctx, "arthur", x + 14, g - 44, m.t, 1, 0, 0, 0.85, "joie");
      velo(ctx, x, g, 1, m.t, this.pedale);
    }
    if (this.vol) {
      const u = this.vol.u, x = lerp(this.vol.x0, this.vol.x1, u), y = lerp(this.vol.y0, this.vol.y1, u) - this.vol.haut * Math.sin(PI * u);
      if (this.vol.fenetre) fenetrePiece(ctx, x, y + 19, this.vol.fenetre);
      else piece(ctx, x, y, this.vol.toit, this.vol.k);
    }
    m.dessineParticules(ctx);
    if (this.bulle && this.t > 0.6) { // bulle de dialogue au-dessus de celui qui parle
      const a = m.amis.find((x) => x.kind === this.bulle.qui);
      if (this.bulle.qui === "heros" && !this.cacheHeros) bulleDialogue(ctx, m.hero.x - 20, G - 185, this.bulle.texte);
      else if (a) { const [bx, by] = boucheAmi(a.kind, a.x + (a.dx || 0), G + a.dy, a.f); bulleDialogue(ctx, bx, by - 30, this.bulle.texte); }
    }
    if (fete && this.t > 0.5) ecrit(ctx, tr("bravoBandeau", { prenom: this.valeurs.prenom }), 64, [255, 230, 80], [VW / 2, 70 + 6 * Math.sin(m.t * 3)], [200, 60, 80]);
    if (this.attendClic()) { const [x, y] = this.cible(); mainQuiClique(ctx, x, y, m.t); }
  }
}

// ================================================================= application
class App {
  constructor(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.video = document.createElement("canvas");
    this.video.width = VW; this.video.height = VH;
    this.vctx = this.video.getContext("2d");
    this.cfg = cfg;
    this.prenom = cfg.prenom || "Arthur";
    this.voix = new Voix(cfg);
    this.t = 0; this.etat = "menu"; this.page = 0;
    this.histoires = []; this.charge = false;
    this.choixVeh = "tractopelle"; this.choixCol = "jaune";
    this.histoire = null; this.fin = false; this.i = 0;
    this.bRetour = new Bouton([14, 12, 150, 50], () => tr("histoires"), [110, 140, 220], 24);
    this.bGo = new Bouton([910, 575, 330, 110], () => tr("cestParti"), [70, 185, 90], 40);
    this.bEncore = new Bouton([VX + VW / 2 - 330, VY + 330, 300, 100], () => tr("encore"), [70, 185, 90], 38);
    this.bAutres = new Bouton([VX + VW / 2 + 30, VY + 330, 300, 100], () => tr("histoires"), [110, 140, 220], 38);
    this.bPerso = new Bouton([W - 240, 16, 222, 54], () => tr("personnages"), [150, 100, 210], 24);
    this.bLangue = new Bouton([18, 16, 170, 54], () => tr("langue"), [60, 160, 160], 24);
    this.bEcrire = new Bouton([198, 16, 150, 54], () => "✎ " + tr("ecrire"), [235, 130, 70], 24);
    this.ecriture = new Ecriture(this);
    this.modeSuppr = false; // mode « supprimer des histoires » de l'accueil
    this.bSuppr = new Bouton([W - 350, 626, 210, 48], () => (this.modeSuppr ? tr("termine") : tr("supprimerBouton")), [200, 90, 80], 20);
    this.bRemettre = new Bouton([130, 626, 330, 48], () => tr("remettre", { n: histoiresCachees().length }), [110, 140, 220], 17);
    this.atelier = new Atelier(this);
    this.voixPerso = new Map(); // voix enregistrées au micro, prêtes à jouer
    this.ancienne = document.createElement("canvas"); // image de la scène précédente, pour le fondu
    this.ancienne.width = VW; this.ancienne.height = VH;
    this.fondu = 0; this.ouverture = 0;
    this.rechargeHistoires();
  }
  async rechargeHistoires() {
    this.atelier.local = await chargePersonnages(); // avant les histoires : elles peuvent citer Jean-Eudes, Célestin…
    try { this.histoires = await chargeTout(); } catch (e) { this.histoires = []; this.erreurChargement = String(e); }
    this.charge = true;
    this.prechargeMenu();
  }
  phraseTitre(h) { // une histoire pas encore traduite s'annonce en français, avec la voix française
    return traduite(h) ? [tr("phraseTitre", { titre: titreDe(h) }), LANGUE] : [TEXTES.fr.phraseTitre.replace("{titre}", h.titre), "fr"];
  }
  prechargeMenu() { for (const h of this.histoires.filter((x) => !x.erreur)) this.voix.precharge([this.phraseTitre(h)[0]], this.phraseTitre(h)[1]); }
  prechargeConfig() {
    this.voix.precharge(VEHICULES.map((k) => textes(k, this.choixCol, this.prenom).Vehicule));
    this.voix.precharge(Object.keys(COULEURS).map((c) => textes(this.choixVeh, c, this.prenom).couleur));
  }
  prechargeHistoire() {
    const v = this.valeurs;
    for (const d of this.histoire.scenes) this.voix.precharge([(rendu(texteDe(d), v) + " " + (d.interactif ? rendu(consigneDe(d), v) : "")).trim()], langueDe(d));
    this.voix.precharge(tr("bravos").map((b) => rendu(b, v)).concat([tr("finHistoire", { prenom: this.prenom })]));
  }
  prechargeVoixPerso(h) { // les voix enregistrées au micro pour cette histoire
    for (const d of h.scenes) {
      if (!d.voixPerso || this.voixPerso.has(d.voixPerso)) continue;
      Memoire.lit(d.voixPerso).then((blob) => blob && blob.arrayBuffer())
        .then((ab) => ab && Audio_.ctx && new Promise((ok, ko) => Audio_.ctx.decodeAudioData(ab, ok, ko)))
        .then((buf) => { if (buf) this.voixPerso.set(d.voixPerso, buf); }).catch(() => {});
    }
  }
  ouvreConfig(h) {
    this.prechargeVoixPerso(h);
    this.histoire = h;
    this.choixVeh = h.heros;
    this.choixCol = COULEURS[h.couleur] ? h.couleur : COULEUR_DEFAUT[h.heros];
    this.etat = "config";
    this.voix.dire(...this.phraseTitre(h));
    this.prechargeConfig();
    this.valeurs = textes(this.choixVeh, this.choixCol, this.prenom);
    this.prechargeHistoire(); // pendant que l'enfant choisit, les phrases se préparent
  }
  lance() {
    const h = this.histoire;
    this.valeurs = textes(this.choixVeh, this.choixCol, this.prenom);
    this.monde = new Monde(this.choixVeh, this.choixCol, h.scenes[0].decor);
    for (const k of h.copains) if (k !== this.choixVeh) { const c = this.monde.ajouteCopain(k); if (c) c.x = c.cible; }
    this.i = 0; this.fin = false;
    this.prechargeHistoire();
    this.scene = new Scene(this, this.monde, h.scenes[0], this.valeurs);
    this.etat = "histoire";
    this.fondu = 0; this.ouverture = 0.6; // l'image apparaît en douceur
  }
  photoPourFondu() { // garde l'image actuelle : elle s'efface en douceur sur la scène suivante
    const c = this.ancienne.getContext("2d");
    c.clearRect(0, 0, VW, VH); c.drawImage(this.video, 0, 0);
    this.fondu = DUREE_FONDU;
  }
  sceneSuivante() {
    this.photoPourFondu();
    this.i++;
    if (this.i >= this.histoire.scenes.length) { this.fin = true; joue("bravo"); this.voix.dire(tr("finHistoire", { prenom: this.prenom })); }
    else this.scene = new Scene(this, this.monde, this.histoire.scenes[this.i], this.valeurs);
  }
  supprimeHistoire(h) { // depuis l'accueil, en mode suppression (avec confirmation)
    const titre = titreDe(h);
    if (h.perso) { if (!window.confirm(tr("confirmePerso", { titre }))) return; supprimeHistoirePerso(h.perso); }
    else { if (!window.confirm(tr("confirmeCachee", { titre }))) return; cacheHistoire(h.fichier); }
    joue("pop");
    this.histoires = this.histoires.filter((x) => x !== h);
    this.page = Math.min(this.page, Math.max(0, Math.ceil(this.histoires.length / 6) - 1));
  }
  menu() {
    this.modeSuppr = false;
    this.ecriture.ferme(); this.voix.stop(); this.etat = "menu"; this.rechargeHistoires(); }

  // ------------------------------------------------ événements
  cartes() { const r = []; for (let k = 0; k < 6; k++) r.push([75 + (k % 3) * 390, 125 + Math.floor(k / 3) * 225, 350, 200]); return r; }
  boitesVehicules() { return VEHICULES.map((_, k) => [70 + k * 193, 118, 175, 145]); }
  rondsCouleurs() { return Object.keys(COULEURS).map((_, k) => [355 + k * 95, 352]); }
  touche(p) {
    if (this.etat === "perso") return this.atelier.touche(p);
    if (this.etat === "ecrire") return this.ecriture.touche(p);
    if (this.etat === "menu") {
      if (this.bPerso.touche(p)) { joue("pop"); return this.atelier.ouvre(); }
      if (this.bEcrire.touche(p)) { joue("pop"); return this.ecriture.ouvre(); }
      if (this.bLangue.touche(p)) { // français <-> anglais
        changeLangue(LANGUE === "fr" ? "en" : "fr"); joue("pop"); this.voix.stop();
        this.voix.dire(tr("titreAccueil", { prenom: this.prenom }));
        return this.prechargeMenu();
      }
      if (this.bSuppr.touche(p)) { this.modeSuppr = !this.modeSuppr; joue("clic"); return; }
      if (this.modeSuppr && histoiresCachees().length && this.bRemettre.touche(p)) { remetHistoires(); joue("magie"); return this.rechargeHistoires(); }
      const pages = Math.max(1, Math.ceil(this.histoires.length / 6));
      if (pages > 1 && dans([20, 610, 90, 90], p)) { this.page = mod(this.page - 1, pages); joue("clic"); }
      if (pages > 1 && dans([W - 110, 610, 90, 90], p)) { this.page = mod(this.page + 1, pages); joue("clic"); }
      const liste = this.histoires.slice(this.page * 6, this.page * 6 + 6);
      this.cartes().forEach((r, k) => {
        const h = liste[k];
        if (!h || !dans(r, p)) return;
        if (this.modeSuppr) return this.supprimeHistoire(h);
        if (h.erreur) this.voix.dire(tr("oups"));
        else { joue("pop"); this.ouvreConfig(h); }
      });
    } else if (this.etat === "config") {
      if (this.bRetour.touche(p)) return this.menu();
      if (this.bGo.touche(p)) { joue("klaxon"); return this.lance(); }
      this.boitesVehicules().forEach((r, k) => {
        if (dans(r, p)) { this.choixVeh = VEHICULES[k]; joue("klaxon"); this.voix.dire(textes(VEHICULES[k], this.choixCol, this.prenom).Vehicule); }
      });
      this.rondsCouleurs().forEach(([x, y], k) => {
        if (Math.hypot(p[0] - x, p[1] - y) < 42) { const c = Object.keys(COULEURS)[k]; this.choixCol = c; joue("pop"); this.voix.dire(textes(this.choixVeh, c, this.prenom).couleur); }
      });
    } else {
      if (this.bRetour.touche(p)) this.menu();
      else if (this.fin) { if (this.bEncore.touche(p)) this.lance(); else if (this.bAutres.touche(p)) this.menu(); }
      else this.scene.clic([p[0] - VX, p[1] - VY]); // position dans l'image
    }
  }
  clavier(e) {
    if (this.etat === "histoire") {
      if (e.key === "Escape") this.menu();
      else if (e.key === "ArrowRight" && !this.fin) this.sceneSuivante();
    } else if (["config", "perso", "ecrire"].includes(this.etat) && e.key === "Escape") this.menu();
  }

  // ------------------------------------------------ boucle
  maj(dt) {
    this.t += dt;
    this.fondu = Math.max(0, this.fondu - dt); this.ouverture = Math.max(0, this.ouverture - dt);
    this.atelier.messageT -= dt;
    if (this.etat === "histoire") {
      if (!this.fin) { this.scene.maj(dt); if (this.scene.terminee()) this.sceneSuivante(); }
      else {
        this.monde.t += dt; this.monde.majParticules(dt);
        if (Math.random() < dt * 1.5) this.monde.eclat(rnd(100, VW - 100), rnd(60, 200), 25, null, 250);
      }
    }
  }
  fond(ctx) {
    rrect(ctx, 0, 0, W, H_, 0, FOND); // fond uni, plus sobre
  }
  dessine() {
    const ctx = this.ctx;
    this.fond(ctx);
    if (this.etat === "menu") this.dessineMenu(ctx);
    else if (this.etat === "config") this.dessineConfig(ctx);
    else if (this.etat === "perso") this.atelier.dessine(ctx, this.t);
    else if (this.etat === "ecrire") this.ecriture.dessine(ctx, this.t);
    else this.dessineHistoire(ctx);
  }
  dessineMenu(ctx) {
    ecrit(ctx, tr("titreAccueil", { prenom: this.prenom }), 46, [255, 200, 40], [W / 2 + 70, 52], [200, 80, 40]);
    this.bPerso.dessine(ctx);
    this.bLangue.dessine(ctx);
    this.bEcrire.dessine(ctx);
    const liste = this.histoires.slice(this.page * 6, this.page * 6 + 6);
    this.cartes().forEach((r, k) => {
      const h = liste[k];
      if (!h) return;
      const [x, y, w, hh] = r, erreur = !!h.erreur;
      rrect(ctx, x, y + 8, w, hh, 24, [200, 170, 110]);
      rrect(ctx, x, y, w, hh, 24, erreur ? [255, 235, 235] : [255, 255, 255]);
      const col = erreur ? [220, 90, 90] : COULEURS[h.couleur] || COULEURS[COULEUR_DEFAUT[h.heros]];
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, hh, 24); ctx.clip(); rrect(ctx, x, y, w, 22, 0, col); ctx.restore();
      rrect(ctx, x, y, w, hh, 24, null, 4);
      dessineVehicule(ctx, h.heros, col, x + 85, y + hh - 22, this.t, 0, 0, 0.5);
      const lignes = coupe(ctx, titreDe(h), 26, w - 190).slice(0, 4), y0 = y + 40 + (4 - lignes.length) * 16;
      lignes.forEach((l, i) => ecrit(ctx, l, 26, CONTOUR, [x + 165, y0 + i * 34], null, true));
      if (erreur) ecrit(ctx, tr("illisible"), 20, [200, 40, 40], [x + 165, y + hh - 36], null, true);
      else ecrit(ctx, tr("images", { n: h.scenes.length }) + (traduite(h) ? "" : "  (FR)"), 18, [150, 140, 130], [x + 165, y + hh - 32], null, true);
      if (h.perso) { rrect(ctx, x + 10, y + 30, 64, 24, 8, [235, 130, 70]); ecrit(ctx, "✎ " + tr("moi"), 14, [255, 255, 255], [x + 42, y + 42]); }
      if (this.modeSuppr) { rond(ctx, x + w - 8, y + 8, 22, [220, 70, 70], 4); ecrit(ctx, "✕", 24, [255, 255, 255], [x + w - 8, y + 8]); }
      else if (!erreur && estNouvelle(h)) { etoile(ctx, x + w - 4, y - 2, 34, [255, 210, 50], 0.2); ecrit(ctx, tr("nouveau"), 15, CONTOUR, [x + w - 4, y]); }
    });
    if (this.charge && !this.histoires.length) ecrit(ctx, tr("aucune"), 30, CONTOUR, [W / 2, 330]);
    if (!this.charge) ecrit(ctx, tr("chargement"), 30, CONTOUR, [W / 2, 330]);
    const pages = Math.max(1, Math.ceil(this.histoires.length / 6));
    ovale(ctx, -200, 590, W + 400, 260, [150, 210, 95], 4); // une colline verte et un chemin beige
    rrect(ctx, 0, 662, W, 34, 0, [228, 210, 165]);
    VEHICULES.forEach((kind, k) => dessineVehicule(ctx, kind, COULEUR_DEFAUT[kind], mod(k * 230 + this.t * 70, W + 300) - 150, 680, this.t + k, 0, this.t * 3, 0.38));
    if (pages > 1) {
      for (const [x, d] of [[65, -1], [W - 65, 1]]) poly(ctx, [[x - 28 * d, 625], [x + 28 * d, 655], [x - 28 * d, 685]], [110, 140, 220], 4);
      ecrit(ctx, `Page ${this.page + 1}/${pages}`, 22, [110, 90, 60], [W / 2, 680]);
    }
    if (this.modeSuppr) {
      ecrit(ctx, tr("toucheCroix"), 18, [170, 60, 50], [W / 2, 608]);
      if (histoiresCachees().length) this.bRemettre.dessine(ctx);
    } else ecrit(ctx, tr("astuce"), 18, [70, 110, 50], [W / 2, 608]);
    this.bSuppr.dessine(ctx);
  }
  dessineConfig(ctx) {
    this.bRetour.dessine(ctx);
    ecrit(ctx, titreDe(this.histoire), 36, [255, 200, 40], [W / 2, 40], [200, 80, 40]);
    ecrit(ctx, tr("choisisVehicule"), 26, CONTOUR, [W / 2, 96]);
    const col = COULEURS[this.choixCol];
    this.boitesVehicules().forEach(([x, y, w, h], k) => {
      const kind = VEHICULES[k], choisi = kind === this.choixVeh, yy = choisi ? y - 8 * Math.abs(Math.sin(this.t * 4)) : y;
      rrect(ctx, x, yy, w, h, 20, choisi ? [255, 250, 220] : [255, 255, 255], choisi ? 7 : 3, choisi ? [255, 140, 30] : CONTOUR);
      dessineVehicule(ctx, kind, choisi ? col : COULEUR_DEFAUT[kind], x + w / 2, yy + h - 10, this.t, 0, 0, 0.42);
    });
    ecrit(ctx, tr("choisisCouleur"), 26, CONTOUR, [W / 2, 284]);
    this.rondsCouleurs().forEach(([x, y], k) => {
      const c = Object.keys(COULEURS)[k], choisi = c === this.choixCol, r = 34 + (choisi ? 5 * Math.sin(this.t * 6) : 0);
      if (choisi) rond(ctx, x, y, r + 10, [255, 255, 255]);
      rond(ctx, x, y, r, COULEURS[c], 4);
    });
    rrect(ctx, 0, 640, W, 80, 0, [200, 170, 120]);
    dessineVehicule(ctx, this.choixVeh, col, 470, 645 + Math.sin(this.t * 12) * 1.5, this.t, 0, this.t * 4, 0.8);
    const v = textes(this.choixVeh, this.choixCol, this.prenom);
    ecrit(ctx, `${v.nom}, ${v.heros}`, 28, CONTOUR, [1075, 535]);
    this.bGo.dessine(ctx, this.t, true);
  }
  dessineHistoire(ctx) {
    const t = this.t, vc = this.vctx;
    if (!this.fin) this.scene.dessine(vc);
    else {
      const m = this.monde;
      dessineDecor(vc, VW, VH, m.decor, m.scroll, m.t, false, G);
      m.copains.forEach((c, i) => dessineVehicule(vc, c.kind, c.col, c.x, G - 32 - Math.abs(Math.sin(t * 5 + i)) * 14, t, 0, c.rot, 0.72, c.f));
      m.amis.forEach((a, i) => dessineAmi(vc, a.kind, a.x, G - Math.abs(Math.sin(t * 5 + i + 2)) * 16, t, a.f, a.marche, 0, 1, "joie"));
      dessineVehicule(vc, m.hero.kind, m.hero.col, VW / 2, G - Math.abs(Math.sin(t * 5)) * 18, t, 0, m.hero.rot);
      vc.fillStyle = "rgba(255,255,255,0.35)"; vc.fillRect(0, 0, VW, VH);
      m.dessineParticules(vc);
      ecrit(vc, tr("fin"), 110, [255, 220, 60], [VW / 2, 120], [200, 70, 60]);
    }
    rrect(ctx, VX - 8, VY - 2, VW + 16, VH + 16, 22, [225, 210, 185]); // ombre douce
    rrect(ctx, VX - 6, VY - 6, VW + 12, VH + 12, 20, [255, 255, 255]); // cadre blanc tout simple
    ctx.drawImage(this.video, VX, VY);
    if (this.fondu > 0) { // l'ancienne scène s'efface en douceur
      const k = this.fondu / DUREE_FONDU;
      ctx.globalAlpha = k * k * (3 - 2 * k); ctx.drawImage(this.ancienne, VX, VY); ctx.globalAlpha = 1;
    }
    if (this.ouverture > 0) { ctx.globalAlpha = this.ouverture / 0.6; rrect(ctx, VX, VY, VW, VH, 0, [255, 255, 255]); ctx.globalAlpha = 1; }
    if (this.fin) { this.bEncore.dessine(ctx, t, true); this.bAutres.dessine(ctx); }
    this.bRetour.dessine(ctx);
    ecrit(ctx, titreDe(this.histoire), 32, [255, 200, 40], [W / 2, 34], [200, 80, 40]);
    const n = this.histoire.scenes.length;
    for (let k = 0; k < n; k++) {
      const x = W - 30 - (n - 1 - k) * 22, plein = k < this.i || this.fin || k === this.i;
      rond(ctx, x, 36, 8, plein && k === this.i && !this.fin ? [255, 140, 30] : plein ? [120, 190, 90] : [255, 255, 255], 2);
    }
    const bx = VX, by = VY + VH + 16, bw = VW, bh = H_ - VY - VH - 26;
    rrect(ctx, bx, by, bw, bh, 18, [255, 255, 255], 3);
    if (this.fin) return ecrit(ctx, tr("recommence", { prenom: this.prenom }), 26, CONTOUR, [bx + bw / 2, by + bh / 2]);
    const sc = this.scene, consigne = (sc.attendClic() || sc.p !== null) && sc.fait < sc.n ? sc.consigne : "";
    let taille = 24, pas = 31, lignes = coupe(ctx, sc.texte, taille, VW - 40);
    if (lignes.length + (consigne ? 1 : 0) > 3) { taille = 20; pas = 25; lignes = coupe(ctx, sc.texte, taille, VW - 40); }
    let y = by + 8;
    ctx.globalAlpha = 1 - this.fondu / DUREE_FONDU;
    for (const l of lignes.slice(0, 4 - (consigne ? 1 : 0))) { ecrit(ctx, l, taille, CONTOUR, [bx + 20, y], null, true); y += pas; }
    if (consigne) ecrit(ctx, consigne, taille + 2, [235, 110, 20], [bx + 20, y], null, true);
    ctx.globalAlpha = 1;
  }
}

// ================================================================= démarrage
async function demarre() {
  const canvas = document.getElementById("ecran");
  let cfg = {};
  try { cfg = await (await fetch("config.json", { cache: "no-store" })).json(); } catch (e) { /* valeurs par défaut */ }
  try { if (!localStorage.getItem("tracto.langue") && LANGUES.includes(cfg.langue)) LANGUE = cfg.langue; } catch (e) { /* pas de stockage */ }
  try { await document.fonts.load(police(30)); } catch (e) { /* police de secours */ }
  const app = new App(canvas, cfg);
  window.app = app;

  const ajuste = () => { // garde le 1280×720 et le met à l'échelle de l'écran (net sur Retina)
    const r = Math.min(window.innerWidth / W, window.innerHeight / H_), dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${W * r}px`; canvas.style.height = `${H_ * r}px`;
    canvas.width = Math.round(W * r * dpr); canvas.height = Math.round(H_ * r * dpr);
    app.ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H_, 0, 0);
    app.vctx.setTransform(1, 0, 0, 1, 0, 0);
  };
  window.addEventListener("resize", ajuste);
  ajuste();

  let premier = true;
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    Audio_.debloque();
    if (premier) { premier = false; app.prechargeMenu(); }
    const b = canvas.getBoundingClientRect();
    app.touche([((e.clientX - b.left) / b.width) * W, ((e.clientY - b.top) / b.height) * H_]);
    app.dessine(); // redessine tout de suite : les zones à toucher sont à jour pour le toucher suivant
  });
  window.addEventListener("keydown", (e) => { Audio_.debloque(); app.clavier(e); });
  // iPhone : selon la version d'iOS, le son n'est autorisé qu'au lever du doigt ou au « clic »
  for (const ev of ["touchend", "click"]) document.addEventListener(ev, () => Audio_.debloque(), { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && app.etat === "menu") app.rechargeHistoires(); });

  let avant = performance.now();
  const boucle = (maintenant) => {
    const dt = Math.min(0.05, (maintenant - avant) / 1000);
    avant = maintenant;
    app.maj(dt);
    app.dessine();
    requestAnimationFrame(boucle);
  };
  requestAnimationFrame(boucle);
}
demarre();

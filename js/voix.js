// Narration à voix haute.
// Voix principale : une voix « neuronale » Microsoft fabriquée par la fonction /api/voix et gardée en
// cache par Vercel — une voix 100 % française (Denise) et une 100 % anglaise (Ava) : les voix
// « multilingues » changent parfois d'accent toutes seules sur les prénoms. Secours : la voix de l'iPad.
"use strict";

// Les conteurs : chacun avec un débit posé et une voix un peu plus grave (plus chaleureuse pour une histoire du soir)
const CONTEURS = {
  fr: [
    { id: "douce", fr: "Conteuse douce", en: "Gentle storyteller", v: "fr-FR-DeniseNeural", r: "-12%", p: "-3Hz" },
    { id: "calin", fr: "Conteuse câline", en: "Cuddly storyteller", v: "fr-FR-VivienneMultilingualNeural", r: "-12%", p: "-2Hz" },
    { id: "papi", fr: "Conteur tout doux", en: "Soft storyteller", v: "fr-FR-RemyMultilingualNeural", r: "-12%", p: "-2Hz" },
    { id: "henri", fr: "Conteur", en: "Storyteller", v: "fr-FR-HenriNeural", r: "-10%", p: "-1Hz" },
  ],
  en: [
    { id: "ava", fr: "Conteuse douce", en: "Gentle storyteller", v: "en-US-AvaNeural", r: "-12%", p: "-3Hz" },
    { id: "emma", fr: "Conteuse câline", en: "Cuddly storyteller", v: "en-US-EmmaNeural", r: "-12%", p: "-2Hz" },
    { id: "andrew", fr: "Conteur tout doux", en: "Soft storyteller", v: "en-US-AndrewNeural", r: "-12%", p: "-2Hz" },
    { id: "libby", fr: "Conteuse anglaise", en: "British storyteller", v: "en-GB-LibbyNeural", r: "-10%", p: "-1Hz" },
  ],
};
const CLE_CONTEUR = "tracto.conteur.v1";

class Voix {
  constructor(cfg) {
    this.actif = cfg.voix !== false;
    this.noms = { fr: cfg.voix_fr || "fr-FR-DeniseNeural", en: cfg.voix_en || "en-US-AvaNeural" };
    this.debit = cfg.vitesse_neuronale || "-6%";
    this.choix = { fr: 0, en: 0 }; // le conteur choisi dans chaque langue (gardé sur l'appareil)
    try { Object.assign(this.choix, JSON.parse(localStorage.getItem(CLE_CONTEUR) || "{}")); } catch (e) { /* rien */ }
    this.chaine = null; // le petit traitement qui rend la voix plus chaude
    this.cache = new Map();   // texte -> Promise<AudioBuffer|null>
    this.source = null;       // son en cours
    this.attente = null;      // texte demandé, pas encore prêt
    this.jeton = 0;
    this.secoursParle = false;
    this.file = [];
    this.enCours = 0;
  }
  conteur(langue = LANGUE) { const l = CONTEURS[langue] || CONTEURS.fr; return l[(this.choix[langue] || 0) % l.length]; }
  conteurSuivant(langue = LANGUE) { // on change de conteur (et on l'écoute tout de suite)
    this.choix[langue] = ((this.choix[langue] || 0) + 1) % (CONTEURS[langue] || CONTEURS.fr).length;
    try { localStorage.setItem(CLE_CONTEUR, JSON.stringify(this.choix)); } catch (e) { /* rien */ }
    return this.conteur(langue);
  }
  url(texte, langue) {
    const c = this.conteur(langue);
    return `/api/voix?v=${encodeURIComponent(c.v)}&r=${encodeURIComponent(c.r)}&p=${encodeURIComponent(c.p)}&t=${encodeURIComponent(texte)}`;
  }
  sortie() { // grave un peu plus rond, aigus adoucis, et un petit écho de pièce : comme quelqu'un qui lit à côté de toi
    const ctx = Audio_.ctx;
    if (this.chaine && this.chaine.ctx === ctx) return this.chaine.entree;
    try {
      const grave = ctx.createBiquadFilter(); grave.type = "lowshelf"; grave.frequency.value = 220; grave.gain.value = 3.5;
      const medium = ctx.createBiquadFilter(); medium.type = "peaking"; medium.frequency.value = 3200; medium.Q.value = 0.9; medium.gain.value = -2;
      const aigu = ctx.createBiquadFilter(); aigu.type = "highshelf"; aigu.frequency.value = 7500; aigu.gain.value = -4;
      grave.connect(medium); medium.connect(aigu); aigu.connect(ctx.destination);
      const salle = ctx.createConvolver(), n = Math.floor(ctx.sampleRate * 0.5), ir = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
      salle.buffer = ir;
      const mouille = ctx.createGain(); mouille.gain.value = 0.1;
      aigu.connect(salle); salle.connect(mouille); mouille.connect(ctx.destination);
      this.chaine = { ctx, entree: grave };
      return grave;
    } catch (e) { return ctx.destination; }
  }
  charge(texte, langue = LANGUE) {
    const cle = this.conteur(langue).v + "|" + langue + "|" + texte;
    if (!this.cache.has(cle)) {
      const p = fetch(this.url(texte, langue))
        .then((r) => { if (!r.ok) throw new Error("voix " + r.status); return r.arrayBuffer(); })
        .then((b) => new Promise((ok, ko) => Audio_.ctx.decodeAudioData(b, ok, ko)))
        .catch(() => { this.cache.delete(cle); return null; });
      this.cache.set(cle, p);
    }
    return this.cache.get(cle);
  }
  precharge(textes, langue = LANGUE) { // prépare les phrases à l'avance, 2 à la fois
    if (!this.actif || !Audio_.ctx) return;
    for (const t of textes) if (t && t.trim()) this.file.push([t.trim(), langue]);
    const suivant = () => {
      while (this.enCours < 2 && this.file.length) {
        const [t, l] = this.file.shift();
        if (this.cache.has(this.conteur(l).v + "|" + l + "|" + t)) continue;
        this.enCours++;
        this.charge(t, l).finally(() => { this.enCours--; suivant(); });
      }
    };
    suivant();
  }
  dire(texte, langue = LANGUE) {
    texte = (texte || "").trim();
    if (!texte || !this.actif) return;
    this.stop();
    if (!Audio_.ctx) return this.secours(texte, langue);
    const jeton = ++this.jeton;
    this.attente = texte;
    const minuteur = setTimeout(() => { if (this.jeton === jeton && this.attente) { this.attente = null; this.secours(texte, langue); } }, 8000);
    this.charge(texte, langue).then((buf) => {
      if (this.jeton !== jeton) return;
      clearTimeout(minuteur);
      if (!this.attente) return; // le secours a déjà parlé
      this.attente = null;
      if (!buf) return this.secours(texte, langue);
      const s = Audio_.ctx.createBufferSource();
      s.buffer = buf;
      s.connect(this.sortie());
      s.onended = () => { if (this.source === s) this.source = null; };
      this.source = s;
      s.start();
    });
  }
  secours(texte, langue = LANGUE) { // voix de l'appareil, dans la bonne langue
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(texte);
    const voix = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.startsWith(langue));
    const pref = langue === "en" ? ["Samantha", "Ava", "Karen", "Daniel", "Serena"] : ["Audrey", "Amélie", "Marie", "Aurélie", "Thomas"];
    u.voice = voix.find((v) => /premium|enhanced|amélior/i.test(v.name)) || pref.map((p) => voix.find((v) => v.name.includes(p))).find(Boolean) || voix[0] || null;
    u.lang = langue === "en" ? "en-US" : "fr-FR";
    u.rate = 0.86; u.pitch = 0.95; // plus posé, plus doux
    const jeton = this.jeton;
    u.onend = () => { this.secoursParle = false; };
    this.secoursParle = true;
    // filet de sécurité : sur certains iPad « onend » n'arrive jamais
    setTimeout(() => { if (this.jeton === jeton) this.secoursParle = false; }, (texte.length / 9 + 3) * 1000);
    speechSynthesis.speak(u);
  }
  joueBuffer(buf) { // joue une voix enregistrée au micro (à la place de la voix de synthèse)
    this.stop();
    if (!Audio_.ctx || !buf) return;
    const s = Audio_.ctx.createBufferSource();
    s.buffer = buf; s.connect(Audio_.ctx.destination);
    s.onended = () => { if (this.source === s) this.source = null; };
    this.source = s; s.start();
  }
  parle() { return !!(this.attente || this.source || this.secoursParle); }
  stop() {
    this.jeton++;
    this.attente = null;
    if (this.source) { try { this.source.stop(); } catch (e) { /* déjà fini */ } this.source = null; }
    if ("speechSynthesis" in window && this.secoursParle) speechSynthesis.cancel();
    this.secoursParle = false;
  }
}

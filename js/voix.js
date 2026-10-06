// Narration à voix haute.
// Voix principale : une voix « neuronale » Microsoft fabriquée par la fonction /api/voix et gardée en
// cache par Vercel — une voix 100 % française (Denise) et une 100 % anglaise (Ava) : les voix
// « multilingues » changent parfois d'accent toutes seules sur les prénoms. Secours : la voix de l'iPad.
"use strict";

class Voix {
  constructor(cfg) {
    this.actif = cfg.voix !== false;
    this.noms = { fr: cfg.voix_fr || "fr-FR-DeniseNeural", en: cfg.voix_en || "en-US-AvaNeural" };
    this.debit = cfg.vitesse_neuronale || "-6%";
    this.cache = new Map();   // texte -> Promise<AudioBuffer|null>
    this.source = null;       // son en cours
    this.attente = null;      // texte demandé, pas encore prêt
    this.jeton = 0;
    this.secoursParle = false;
    this.file = [];
    this.enCours = 0;
  }
  url(texte, langue) {
    return `/api/voix?v=${encodeURIComponent(this.noms[langue] || this.noms.fr)}&r=${encodeURIComponent(this.debit)}&t=${encodeURIComponent(texte)}`;
  }
  charge(texte, langue = LANGUE) {
    const cle = langue + "|" + texte;
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
        if (this.cache.has(l + "|" + t)) continue;
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
      s.connect(Audio_.ctx.destination);
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
    u.rate = 0.92;
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

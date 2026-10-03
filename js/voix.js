// Narration à voix haute.
// Voix principale : la voix « neuronale » Microsoft (Vivienne), fabriquée par la fonction /api/voix
// et gardée en cache par Vercel. Secours : la voix française de l'iPad (synthèse du navigateur).
"use strict";

class Voix {
  constructor(cfg) {
    this.actif = cfg.voix !== false;
    this.nom = cfg.voix_neuronale || "fr-FR-VivienneMultilingualNeural";
    this.debit = cfg.vitesse_neuronale || "-8%";
    this.cache = new Map();   // texte -> Promise<AudioBuffer|null>
    this.source = null;       // son en cours
    this.attente = null;      // texte demandé, pas encore prêt
    this.jeton = 0;
    this.secoursParle = false;
    this.file = [];
    this.enCours = 0;
  }
  url(texte) {
    return `/api/voix?v=${encodeURIComponent(this.nom)}&r=${encodeURIComponent(this.debit)}&t=${encodeURIComponent(texte)}`;
  }
  charge(texte) {
    if (!this.cache.has(texte)) {
      const p = fetch(this.url(texte))
        .then((r) => { if (!r.ok) throw new Error("voix " + r.status); return r.arrayBuffer(); })
        .then((b) => new Promise((ok, ko) => Audio_.ctx.decodeAudioData(b, ok, ko)))
        .catch(() => { this.cache.delete(texte); return null; });
      this.cache.set(texte, p);
    }
    return this.cache.get(texte);
  }
  precharge(textes) { // prépare les phrases à l'avance, 2 à la fois
    if (!this.actif || !Audio_.ctx) return;
    for (const t of textes) if (t && t.trim()) this.file.push(t.trim());
    const suivant = () => {
      while (this.enCours < 2 && this.file.length) {
        const t = this.file.shift();
        if (this.cache.has(t)) continue;
        this.enCours++;
        this.charge(t).finally(() => { this.enCours--; suivant(); });
      }
    };
    suivant();
  }
  dire(texte) {
    texte = (texte || "").trim();
    if (!texte || !this.actif) return;
    this.stop();
    if (!Audio_.ctx) return this.secours(texte);
    const jeton = ++this.jeton;
    this.attente = texte;
    const minuteur = setTimeout(() => { if (this.jeton === jeton && this.attente) { this.attente = null; this.secours(texte); } }, 8000);
    this.charge(texte).then((buf) => {
      if (this.jeton !== jeton) return;
      clearTimeout(minuteur);
      if (!this.attente) return; // le secours a déjà parlé
      this.attente = null;
      if (!buf) return this.secours(texte);
      const s = Audio_.ctx.createBufferSource();
      s.buffer = buf;
      s.connect(Audio_.ctx.destination);
      s.onended = () => { if (this.source === s) this.source = null; };
      this.source = s;
      s.start();
    });
  }
  secours(texte) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(texte);
    const voix = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.startsWith("fr"));
    const pref = ["Audrey", "Amélie", "Marie", "Aurélie", "Thomas"];
    u.voice = voix.find((v) => /premium|enhanced|amélior/i.test(v.name)) || pref.map((p) => voix.find((v) => v.name.includes(p))).find(Boolean) || voix[0] || null;
    u.lang = "fr-FR";
    u.rate = 0.92;
    const jeton = this.jeton;
    u.onend = () => { this.secoursParle = false; };
    this.secoursParle = true;
    // filet de sécurité : sur certains iPad « onend » n'arrive jamais
    setTimeout(() => { if (this.jeton === jeton) this.secoursParle = false; }, (texte.length / 9 + 3) * 1000);
    speechSynthesis.speak(u);
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

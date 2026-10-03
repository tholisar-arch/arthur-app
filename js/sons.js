// Bruitages fabriqués par calcul (Web Audio) + lecture de la narration.
"use strict";

const Audio_ = {
  ctx: null,
  sons: {},
  // Safari (iPad) n'autorise le son qu'après un premier toucher : on démarre ici.
  debloque() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.fabrique();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  fabrique() {
    const R = this.ctx.sampleRate;
    const ton = (freq, dur, vol = 0.35, forme = "sin", f2 = null) => {
      const n = Math.floor(R * dur), out = new Float32Array(n);
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const u = i / n, f = f2 === null ? freq : freq + (f2 - freq) * u;
        ph += (2 * Math.PI * f) / R;
        let v = Math.sin(ph);
        if (forme === "carre") v = v > 0 ? 0.6 : -0.6;
        else if (forme === "tri") v = (2 / Math.PI) * Math.asin(Math.sin(ph));
        const env = Math.min(1, i / (R * 0.01)) * Math.min(1, (n - i) / (R * 0.04));
        out[i] = v * vol * env;
      }
      return out;
    };
    const bruit = (dur, vol = 0.35, lisse = 0.7) => {
      const n = Math.floor(R * dur), out = new Float32Array(n);
      let prev = 0;
      for (let i = 0; i < n; i++) { prev = prev * lisse + (Math.random() * 2 - 1) * (1 - lisse); out[i] = prev * vol * 3 * (1 - i / n) ** 2; }
      return out;
    };
    const mix = (...p) => { const n = Math.max(...p.map((x) => x.length)), o = new Float32Array(n); for (const x of p) for (let i = 0; i < x.length; i++) o[i] += x[i]; return o; };
    const suite = (...p) => { const n = p.reduce((s, x) => s + x.length, 0), o = new Float32Array(n); let k = 0; for (const x of p) { o.set(x, k); k += x.length; } return o; };
    const silence = (d) => new Float32Array(Math.floor(R * d));
    const buf = (data) => { const b = this.ctx.createBuffer(1, data.length, R); b.copyToChannel(data, 0); return b; };
    const k1 = mix(ton(370, 0.16, 0.25, "carre"), ton(466, 0.16, 0.2, "carre"));
    this.sons.klaxon = buf(suite(k1, silence(0.05), k1));
    this.sons.pop = buf(ton(500, 0.09, 0.4, "sin", 1100));
    this.sons.bravo = buf(suite(ton(523, 0.11, 0.35, "tri"), ton(659, 0.11, 0.35, "tri"), ton(784, 0.11, 0.35, "tri"), ton(1047, 0.35, 0.35, "tri")));
    this.sons.splash = buf(bruit(0.45, 0.4, 0.55));
    this.sons.terre = buf(mix(bruit(0.35, 0.45, 0.85), ton(90, 0.3, 0.3, "sin", 50)));
    this.sons.boum = buf(mix(bruit(0.6, 0.5, 0.8), ton(120, 0.5, 0.3, "sin", 40)));
    this.sons.fusee = buf(ton(300, 0.45, 0.15, "sin", 1600));
    this.sons.magie = buf(suite(...[1047, 1319, 1568, 2093].map((f) => ton(f, 0.07, 0.22))));
    this.sons.clic = buf(ton(900, 0.04, 0.3, "tri"));
    this.sons.miaou = buf(suite(ton(650, 0.18, 0.3, "tri", 1000), ton(1000, 0.25, 0.3, "tri", 600)));
    this.sons.rugir = buf(mix(bruit(0.6, 0.35, 0.9), ton(110, 0.6, 0.35, "carre", 70)));
    this.sons.croque = buf(suite(...[0, 1, 2].flatMap(() => [bruit(0.07, 0.5, 0.5), silence(0.06)])));
  },
  joue(nom) {
    if (!this.ctx || !this.sons[nom]) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.sons[nom];
    s.connect(this.ctx.destination);
    s.start();
  },
};
const joue = (nom) => Audio_.joue(nom);

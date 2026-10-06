// Mémoire de l'appareil pour les gros fichiers : les voix enregistrées au micro (IndexedDB).
// Rien ne part sur internet : tout reste sur l'iPad / le téléphone.
"use strict";

const Memoire = {
  _db: null,
  base() {
    if (!this._db) this._db = new Promise((ok, ko) => {
      const r = indexedDB.open("tracto", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("voix");
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ko(r.error);
    });
    return this._db;
  },
  async _op(mode, f) {
    const db = await this.base();
    return new Promise((ok, ko) => {
      const tx = db.transaction("voix", mode), req = f(tx.objectStore("voix"));
      tx.oncomplete = () => ok(req && req.result);
      tx.onerror = () => ko(tx.error);
    });
  },
  met(cle, blob) { return this._op("readwrite", (s) => s.put(blob, cle)); },
  lit(cle) { return this._op("readonly", (s) => s.get(cle)).catch(() => null); },
  efface(cle) { return this._op("readwrite", (s) => s.delete(cle)).catch(() => null); },
};

// --- enregistrer au micro
const Micro = {
  rec: null, morceaux: [], debut: 0, fin: null,
  async demarre(quandFini) {
    const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
    this.rec = new MediaRecorder(flux, type ? { mimeType: type } : undefined);
    this.morceaux = []; this.debut = performance.now();
    this.rec.ondataavailable = (e) => { if (e.data.size) this.morceaux.push(e.data); };
    this.rec.onstop = () => {
      flux.getTracks().forEach((p) => p.stop());
      const blob = new Blob(this.morceaux, { type: this.rec.mimeType || "audio/mp4" });
      this.rec = null;
      quandFini(blob);
    };
    this.rec.start();
    this.fin = setTimeout(() => this.arrete(), 60000); // une minute maximum
  },
  arrete() { clearTimeout(this.fin); if (this.rec && this.rec.state !== "inactive") this.rec.stop(); },
  enCours() { return !!this.rec; },
  secondes() { return this.rec ? Math.floor((performance.now() - this.debut) / 1000) : 0; },
};

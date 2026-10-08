// Filtre « pour enfants » : tout texte écrit à la main dans l'appli passe par ici.
// On refuse : gros mots, violence, choses d'adultes, alcool/drogue, et tout ce qui permet de
// contacter quelqu'un (liens internet, e-mails, numéros de téléphone).
"use strict";

const MOTS_INTERDITS = [
  // gros mots / insultes (fr)
  "merde", "putain", "pute", "connard", "connasse", "con", "conne", "salope", "salaud", "encule", "enculer", "batard",
  "bite", "couille", "cul", "nique", "niquer", "ntm", "fdp", "pd", "chier", "chiotte", "bordel", "debile", "abruti",
  "imbecile", "cretin", "ta gueule", "tg", "ferme la", "foutre", "fous le camp", "va te faire", "emmerde", "emmerder",
  "merdique", "pouffiasse", "petasse", "trou du cul", "cul", "zizi",
  // violence / peur (fr)
  "tuer", "tue", "tuent", "meurtre", "mort", "morte", "mourir", "meurt", "sang", "saigne", "arme", "armes", "pistolet",
  "fusil", "couteau", "epee", "bombe", "guerre", "gifle",
  "torturer", "egorger", "bruler vif", "kidnapper",
  "zombie", "demon", "diable", "cauchemar", "horreur", "terrifiant", "cadavre", "squelette", "suicide",
  // adultes / alcool / drogue (fr)
  "sexe", "sexy", "nu", "nue", "nus", "nues", "porno", "baiser", "seins", "alcool", "biere", "vin", "vodka", "whisky",
  "ivre", "saoul", "drogue", "cannabis", "joint", "cocaine", "cigarette", "clope", "pari", "casino",
  // anglais
  "fuck", "fucking", "shit", "bitch", "bastard", "asshole", "ass", "dick", "cock", "pussy", "cunt", "damn", "crap",
  "shut up", "kill", "killed", "kills", "murder", "dead", "die", "dies", "death",
  "blood", "gun", "guns", "knife", "sword", "bomb", "war", "stab", "shoot", "weapon",
  "zombie", "demon", "devil", "nightmare", "horror", "corpse", "suicide", "sex", "sexy", "naked", "nude", "porn",
  "kiss on the mouth", "boobs", "beer", "wine", "alcohol", "drunk", "drug", "drugs", "weed", "cocaine", "cigarette",
];
const RACINES_INTERDITES = ["encul", "niqu", "salop", "connar", "foutr", "emmerd", "merdi", "pornogr", "masturb", "fuck", "shit", "bitch", "nazi", "hitler", "terroris"];

function normaliseFiltre(t) {
  return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[0@4]/g, (c) => ({ 0: "o", "@": "a", 4: "a" }[c])).replace(/[1!|]/g, "i").replace(/3/g, "e")
    .replace(/[5$]/g, "s").replace(/7/g, "t")
    .replace(/(.)\1{2,}/g, "$1$1"); // « meeeerde » -> « meerde »
}

// renvoie null si le texte est correct, sinon la raison (à montrer au parent)
function texteRefuse(texte, max = 400) {
  const brut = String(texte || "").trim();
  if (!brut) return null;
  if (brut.length > max) return tr("filtreLong", { n: max });
  if (/https?:|www\.|\.(com|fr|net|org|io|be|ch)\b/i.test(brut)) return tr("filtreLien");
  if (/\S+@\S+/.test(brut)) return tr("filtreEmail");
  if ((brut.match(/\d/g) || []).length >= 6) return tr("filtreNumero");
  const n = normaliseFiltre(brut), mots = n.split(/[^a-z]+/).filter(Boolean), sansRepet = (m) => m.replace(/(.)\1+/g, "$1");
  const texteMots = " " + mots.join(" ") + " ";
  for (const interdit of MOTS_INTERDITS) {
    const i = " " + normaliseFiltre(interdit) + " ";
    if (texteMots.includes(i) || mots.some((m) => sansRepet(m) === sansRepet(i.trim()))) return tr("filtreMot", { mot: interdit });
  }
  for (const r of RACINES_INTERDITES) if (mots.some((m) => m.includes(r))) return tr("filtreMot", { mot: r + "…" });
  return null;
}

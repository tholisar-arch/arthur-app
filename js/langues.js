// Les langues de l'appli : français et anglais. Tous les textes affichés ou dits passent par tr().
"use strict";

const LANGUES = ["fr", "en"];
let LANGUE = "fr";
try { if (LANGUES.includes(localStorage.getItem("tracto.langue"))) LANGUE = localStorage.getItem("tracto.langue"); } catch (e) { /* pas de stockage */ }

const TEXTES = {
  fr: {
    titreAccueil: "Les aventures de {prenom}", aucune: "Aucune histoire pour l'instant : raconte-en une à Claude !",
    chargement: "Chargement des histoires…", astuce: "Nouvelle histoire ? Raconte-la à Claude, elle apparaîtra ici toute seule.",
    images: "{n} images", illisible: "Histoire illisible", nouveau: "Nouveau", histoires: "Histoires", personnages: "Personnages",
    cestParti: "C'est parti !", encore: "Encore !", choisisVehicule: "Choisis ton véhicule", choisisCouleur: "Choisis ta couleur",
    phraseTitre: "{titre}. Choisis ton véhicule et sa couleur !", bravoBandeau: "Bravo {prenom} !",
    finHistoire: "C'est la fin de l'histoire. Bravo {prenom} !", recommence: "Bravo {prenom} ! On recommence ?", fin: "Fin !",
    oups: "Oups, cette histoire est mal écrite. Demande à Claude de la réparer.", langue: "English",
    bravos: ["Bravo {prenom} !", "Super, {prenom} !", "Génial, tu as réussi !", "Trop fort, {prenom} !"],
    ecole: "ÉCOLE",
    // atelier
    atelier: "L'atelier des personnages", auHasard: "Au hasard !", nouveauPerso: "+ Nouveau", renommer: "Renommer", supprimer: "Supprimer",
    atelierBienvenue: "L'atelier des personnages ! Choisis qui tu veux habiller.", promptPrenom: "Prénom du nouveau personnage ?",
    promptRenommer: "Nouveau prénom ?", confirmeSupprimer: "Supprimer {nom} ?", bonjour: "Bonjour {nom} !",
    ongletVisage: "Visage", ongletCorps: "Corps", ongletHaut: "Haut", ongletBas: "Bas", ongletPlus: "Plus",
    peau: "Peau", yeux: "Yeux", cheveux: "Cheveux", coiffure: "Coiffure : {x}", age: "Âge", enfant: "Enfant", adulte: "Adulte",
    taille: "Taille", petit: "Petit", moyen: "Moyen", grand: "Grand", corpulence: "Corpulence",
    mince: "Mince", costaud: "Costaud", rond: "Rond", haut: "Haut : {x}", couleurHaut: "Couleur du haut",
    dessinHaut: "Dessin sur le haut : {x}", aucun: "aucun", aucunMaj: "Aucun", bas: "Bas", basAvec: "Bas : avec une {x}, la couleur suffit",
    pantalon: "Pantalon", short: "Short", jupe: "Jupe", collant: "Collant (ou jambes nues)", couleurBas: "Couleur du bas",
    chaussures: "Chaussures", accessoires: "Accessoires", lunettes: "Lunettes", couronne: "Couronne", cils: "Cils",
    moustache: "Moustache", barbe: "Barbe", nu: "nu", enregistre: "✓ Enregistré sur cet appareil",
    gardes: "Les changements sont gardés sur cet appareil",
    coiffures: { court: "Court", herisse: "En pics", boucle: "Bouclés", milong: "Mi-longs", long: "Longs", couettes: "Couettes", chignon: "Chignon", chauve: "Dégarni" },
    dessins: { tractopelle: "Tractopelle", dino: "Dinosaure", etoile: "Étoile", coeur: "Cœur" },
    hauts: { teeshirt: "Tee-shirt", pull: "Pull", chemise: "Chemise", debardeur: "Débardeur", salopette: "Salopette", robe: "Robe" },
    // véhicules et couleurs (pour {heros}, {vehicule}, {couleur})
    vehicules: { tractopelle: ["le tractopelle", "m"], benne: ["le camion benne", "m"], toupie: ["le camion toupie", "m"], pompier: ["le camion de pompiers", "m"], bulldozer: ["le bulldozer", "m"], grue: ["la grue", "f"] },
    couleurs: { jaune: "jaune", orange: "orange", rouge: "rouge", bleu: "bleu", vert: "vert", violet: "violet", rose: "rose" },
    couleursF: { bleu: "bleue", vert: "verte", violet: "violette" },
  },
  en: {
    titreAccueil: "{prenom}'s adventures", aucune: "No stories yet: tell one to Claude!",
    chargement: "Loading stories…", astuce: "A new story? Tell it to Claude and it will show up here by itself.",
    images: "{n} pictures", illisible: "Unreadable story", nouveau: "New", histoires: "Stories", personnages: "Characters",
    cestParti: "Let's go!", encore: "Again!", choisisVehicule: "Choose your vehicle", choisisCouleur: "Choose your color",
    phraseTitre: "{titre}. Choose your vehicle and its color!", bravoBandeau: "Well done {prenom}!",
    finHistoire: "That's the end of the story. Well done, {prenom}!", recommence: "Well done {prenom}! Shall we play again?", fin: "The End!",
    oups: "Oops, this story has a mistake in it. Ask Claude to fix it.", langue: "Français",
    bravos: ["Well done, {prenom}!", "Super, {prenom}!", "Great, you did it!", "Amazing, {prenom}!"],
    ecole: "SCHOOL",
    atelier: "The character workshop", auHasard: "Surprise me!", nouveauPerso: "+ New", renommer: "Rename", supprimer: "Delete",
    atelierBienvenue: "The character workshop! Choose who you want to dress up.", promptPrenom: "New character's first name?",
    promptRenommer: "New first name?", confirmeSupprimer: "Delete {nom}?", bonjour: "Hello {nom}!",
    ongletVisage: "Face", ongletCorps: "Body", ongletHaut: "Top", ongletBas: "Bottom", ongletPlus: "More",
    peau: "Skin", yeux: "Eyes", cheveux: "Hair", coiffure: "Hairstyle: {x}", age: "Age", enfant: "Child", adulte: "Adult",
    taille: "Height", petit: "Short", moyen: "Medium", grand: "Tall", corpulence: "Build",
    mince: "Slim", costaud: "Strong", rond: "Round", haut: "Top: {x}", couleurHaut: "Top color",
    dessinHaut: "Picture on the top: {x}", aucun: "none", aucunMaj: "None", bas: "Bottom", basAvec: "Bottom: with a {x}, just pick the color",
    pantalon: "Pants", short: "Shorts", jupe: "Skirt", collant: "Tights (or bare legs)", couleurBas: "Bottom color",
    chaussures: "Shoes", accessoires: "Accessories", lunettes: "Glasses", couronne: "Crown", cils: "Lashes",
    moustache: "Moustache", barbe: "Beard", nu: "bare", enregistre: "✓ Saved on this device",
    gardes: "Changes are saved on this device",
    coiffures: { court: "Short", herisse: "Spiky", boucle: "Curly", milong: "Mid-length", long: "Long", couettes: "Pigtails", chignon: "Bun", chauve: "Balding" },
    dessins: { tractopelle: "Backhoe", dino: "Dinosaur", etoile: "Star", coeur: "Heart" },
    hauts: { teeshirt: "T-shirt", pull: "Sweater", chemise: "Shirt", debardeur: "Tank top", salopette: "Overalls", robe: "Dress" },
    vehicules: { tractopelle: ["the backhoe", "m"], benne: ["the dump truck", "m"], toupie: ["the cement mixer", "m"], pompier: ["the fire truck", "m"], bulldozer: ["the bulldozer", "m"], grue: ["the crane", "f"] },
    couleurs: { jaune: "yellow", orange: "orange", rouge: "red", bleu: "blue", vert: "green", violet: "purple", rose: "pink" },
    couleursF: {},
  },
};
const CONSIGNES_EN = {
  trou: "Tap to fill the hole!", feu: "Tap to spray the fire!", deblayer: "Tap to push the sand!",
  construire: "Tap to build the house!", copains: "Tap to call your friends!", manger: "Tap to feed them!",
  spectacle: "Tap to make the trucks jump!", bulles: "Tap to blow bubbles!", calin: "Tap for a big hug!",
  piscine: "Tap to jump in the pool!", cueillir: "Tap to pick the blackberries!", chateau: "Tap to build a sandcastle!",
  route: "Tap to lay the stones!", voler: "Tap to fly higher!", fenetres: "Tap to fit the windows!",
  cadeau: "Tap to open the present!", velo: "Tap to pedal higher!", fete: "Tap to launch the fireworks!",
  dormir: "Tap to light up the stars!", rouler: "Tap to honk!", parler: "Tap to honk!",
};

function tr(cle, vars = {}) { // texte dans la langue choisie (repli : français)
  const v = TEXTES[LANGUE][cle] ?? TEXTES.fr[cle] ?? cle;
  return typeof v === "string" ? v.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : v;
}
function changeLangue(l) {
  LANGUE = l;
  try { localStorage.setItem("tracto.langue", l); } catch (e) { /* pas de stockage */ }
}

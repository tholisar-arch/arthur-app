# Les aventures de Tracto — version web (Vercel, projet `arthur-app`)

Appli web pour Arthur (~3 ans, fan d'engins de chantier), utilisée sur l'iPad.
Les parents racontent une histoire (souvent sur **Plaud**) puis demandent à Claude,
depuis l'iPad, de « l'ajouter ». Le travail de Claude :

1. Retrouver l'enregistrement Plaud (`list_files`, puis `get_transcript` avec
   `transaction_polish`, + `get_note`). Les heures Plaud sont en UTC (Paris = UTC+2 l'été).
2. Écrire `histoires/NN-titre-court.json` (numéro suivant), UTF-8 — format ci-dessous.
3. Lancer `python outils/maj_index.py` (met à jour `histoires/index.json`, sinon
   l'histoire n'apparaît pas).
4. Vérifier le JSON : `python -c "import json; json.load(open('histoires/NN-....json', encoding='utf-8'))"`.
5. Commit + push sur la branche principale → Vercel redéploie tout seul (~1 min).
   L'appli recharge la liste des histoires à chaque retour à l'accueil.

## Jeux pour apprendre (adaptés à l'âge)
- `"action": "chiffres"` : des bulles 1, 2, 3… à toucher dans l'ordre (3 ans : 1-3, 4 ans : 1-5, 5 ans : 1-7 ;
  6 ans et plus : 3 petites additions « 2 + 3 = ? »). Pas de main qui montre la réponse (un petit halo après 7 s).
- `"action": "lettres"` + `"mot": "{prenom}"` (par défaut le prénom) : toucher les lettres du mot dans l'ordre
  (3 ans : 3 premières lettres, 4-5 ans : 5, 6 ans et plus : 8), avec quelques lettres « intruses ».
- L'âge vient de la date de naissance d'Arthur (Personnages → Plus → 🎂), sinon 3 ans.
- Ces jeux vont bien dans les « défis » d'une histoire (ex. `histoires/12-le-dinosaure-de-la-piscine.json`).

## Voix de la famille, dictée, miniature, partage
- « 🎙 Raconter avec ma voix » (écran de départ d'une histoire) : on enregistre chaque écran au micro,
  pour TOUTES les histoires (clé IndexedDB `fichier#numéro`, ou `idHistoire:vid` pour celles de l'appli).
- « 🎤 Raconter » (accueil) : dictée du navigateur → `decoupeRecit()` (coupe aux points, à « chapitre »,
  « et puis », « ensuite »…) → `etapesDepuisTexte()` → l'histoire se lance directement, sans l'éditeur.
- `"miniature": {"type": "perso", "id": "trex"}` (même format qu'un élément) : l'image de la carte d'accueil.
- « 📤 Envoyer / 📥 Recevoir » (éditeur) : fichier `.tracto.json` avec les voix ; à la réception, tous
  les textes repassent par le filtre pour enfants.

## Écrans composés à la main (`"action": "libre"` + `elements`)
Chaque écran peut être composé librement : décor + images posées où l'on veut. Avec l'action
`libre`, l'écran ne montre QUE ses `elements` (le véhicule n'apparaît que si on pose `"heros"`) ;
avec une autre action, les `elements` s'ajoutent au décor.
```json
{"texte": "Le chat se cache derrière la maison !", "action": "libre", "decor": "jardin", "interactif": true,
 "consigne": "Touche le chat !",
 "elements": [
   {"type": "objet", "id": "maison", "x": 500, "y": 450},
   {"type": "heros", "x": 220, "y": 450},
   {"type": "perso", "id": "chat", "x": 700, "y": 450, "f": -1, "toucher": true},
   {"type": "engin", "id": "grue", "col": "rouge", "x": 880, "y": 450, "s": 0.7}
 ]}
```
- `type` : `perso` (un personnage ou un animal), `engin` (`id` = un véhicule, `col` = couleur), `heros`
  (le véhicule choisi par l'enfant), `objet` (`id` : maison, maisonFeu, arbre, sapin, buisson, fleurs,
  champignon, rocher, cadeau, velo, ballon, doudou, cle, coeur, etoile, nuage, soleil, lune, arcenciel,
  tas, trou, piscine, bateau).
- `x` 0–980, `y` = le sol sous l'image (450 = la route ; plus petit = plus haut), `s` taille (0.3–3),
  `f` : -1 = retourné. Ordre de la liste = ordre de dessin (le premier est derrière).
- `"toucher": true` : l'enfant doit toucher cette image (elle saute, étoiles) ; une par une, dans l'ordre.
- Dans l'appli : onglet « 🎨 Écran » (palette Personnages / Engins / Objets, glisser au doigt,
  − + ↔ ⭐ ⬆ 🗑) ; boutons ⧉ Dupliquer et ◀ ▶ pour réordonner les écrans ; « ▶ Essayer » part de
  l'écran en cours. Pendant une histoire, les boutons ‹ › sur les côtés passent/reviennent d'un écran.

## Longues histoires en chapitres (10 minutes et plus)
Pour une vraie aventure, découper en **parties** (chapitres) : chacune a une page de titre lue à
voix haute, l'enfant peut commencer à n'importe quel chapitre, et l'appli retient le dernier
chapitre atteint (`localStorage` `tracto.progression.v1`). Compter **~50 scènes pour ~10-12 min**,
avec des péripéties variées (orage, arbre tombé, pont cassé, panne, cache-cache) et des décors
différents par chapitre. **Mettre `decor` sur chaque scène** (les devinettes par mots-clés se
trompent sur un long texte). Exemple complet : `histoires/11-la-grande-aventure.json`.
```json
{"titre": "…", "titre_en": "…", "heros": "tractopelle", "couleur": "jaune", "decor": "jardin",
 "parties": [
   {"titre": "Le grand départ", "titre_en": "Off We Go", "scenes": [ … ]},
   {"titre": "L'orage dans la forêt", "titre_en": "The Storm in the Forest", "scenes": [ … ]}
 ]}
```
(On peut aussi mettre `"partie": "Titre"` / `"partie_en"` sur la 1re scène d'un chapitre dans `scenes`.)
`"clics": 0` sur une scène non interactive = on montre le problème sans le résoudre (ex. le pont
cassé), la scène suivante le fait résoudre à l'enfant.

Règles d'écriture (histoire courte) : 3 à 8 scènes, phrases courtes, ton doux, **aucun méchant**,
des problèmes qu'on résout ensemble. Chaque fois que le parent dit
**« configuration »**, la scène devient interactive (`"interactif": true`).
Toujours mettre `decor` sur la 1re scène si le texte cite un autre lieu.

## Deux langues : français ET anglais (obligatoire)
L'appli est bilingue (bouton Français/English sur l'accueil). **Chaque nouvelle histoire doit
avoir sa version anglaise** (anglais américain : Mommy, Daddy, Grandpa, Grandma, color…) :
`"titre_en"` à côté de `"titre"`, et dans chaque scène `"texte_en"` (et `"consigne_en"` si la scène
a une `"consigne"` française personnalisée). Mêmes variables `{nom}`, `{heros}`, `{Vehicule}`, `{prenom}`
(en anglais elles donnent « the yellow backhoe », « The backhoe »…). Sans traduction, l'histoire
reste jouable en français (marquée « (FR) » sur l'accueil en anglais).
Textes de l'interface : `js/langues.js` (`TEXTES.fr` / `TEXTES.en`, consignes par défaut `CONSIGNES_EN`).

## Voix
Une voix **d'une seule langue** par langue : `fr-FR-DeniseNeural` et `en-US-AvaNeural` (config.json :
`voix_fr`, `voix_en`, `vitesse_neuronale`). Ne pas remettre de voix « Multilingual » : elles prennent
un accent anglais ou allemand sur les prénoms (Jean-Eudes, Tracto, PMS…).

## Histoires écrites dans l'appli (sans Claude)
Bouton « ✎ Écrire » de l'accueil (`js/ecriture.js`) : les parents composent une histoire par
choix guidés (lieu, action, qui est là, l'enfant touche ou non) ; le texte est généré en FR + EN
(`MODELES`), ou écrit à la main et alors filtré par `texteRefuse()` (`js/filtre.js` : gros mots,
violence, adultes, alcool/drogue, liens, e-mails, numéros de téléphone). Ces histoires sont gardées
dans le `localStorage` de l'appareil (clé `tracto.histoires.v1`), pas dans le dépôt ; elles sont
transformées en histoires jouables par `compileHistoire()` et ajoutées à l'accueil (badge « Moi »).
Pour en faire une histoire du dépôt (visible partout), le parent peut la recopier à Claude.
Champs d'une étape de l'éditeur : `action`, `decor`, `presents`, `interactif`, `texteLibre` ({fr, en}),
`nuit`, `humeur` (auto | joie | calme | peur), `copains` (engins), `clics`, `consigne` ({fr, en}).
Autres champs : `meteo` (aucune | pluie | neige | arcenciel | etoiles), `bulle` ({qui, fr, en} :
`qui` = un personnage présent ou `"heros"`), `positions` (placés à la main, onglet « Placer »),
`vid` + `voix` (voix des parents enregistrée au micro, gardée dans IndexedDB par `js/memoire.js`,
clé `idHistoire:vid` ; jouée à la place de la voix de synthèse). Jusqu'à 30 scènes, textes de 400 caractères.
Mode « 📝 Texte libre » : une ligne = une scène, analysée sur place par `etapesDepuisTexte()`
(lieux, actions, personnages, météo, « touche »/« configuration » = interactif, nuit), puis éditable.
Une ligne « Papa : On y va ! » devient une bulle de dialogue sur la scène précédente.
Chapitres : bouton « 📖 Nouveau chapitre » du texte libre (insère une ligne « 📖 Titre » ; « # Titre »
marche aussi), et dans l'éditeur la barre des chapitres (aller à un chapitre, le renommer en le
touchant à nouveau, « + 📖 Nouveau chapitre », « ✂ Chapitre ici », ✕). Champ d'étape `partie` {fr, en}. Jusqu'à 120 scènes ; durée estimée affichée.

Ces champs marchent aussi dans les histoires du dépôt : `"meteo": "pluie"`,
`"bulle": {"qui": "papa", "texte": "On y va !", "texte_en": "Let's go!"}` (`qui` : un personnage ou `"heros"`).

## Format d'une histoire
```json
{
  "titre": "Le grand trou",
  "titre_en": "The Big Hole",
  "heros": "tractopelle",
  "couleur": "jaune",
  "decor": "chantier",
  "copains": [],
  "scenes": [
    {"texte": "{nom}, {heros}, part au chantier.", "texte_en": "{nom}, {heros}, is off to the building site.", "action": "rouler"},
    {"texte": "Un gros trou !", "texte_en": "A big hole!", "action": "trou", "interactif": true, "clics": 4,
     "consigne": "Clique pour remplir le trou !", "consigne_en": "Tap to fill the hole!"}
  ]
}
```
- `heros` : tractopelle | benne | toupie | pompier | bulldozer | grue (l'enfant peut changer avant de lancer)
- `couleur` : jaune | orange | rouge | bleu | vert | violet | rose
- `decor` : chantier | ville | campagne | dinosaures | plage | neige | ecole | vacances (maison de vacances) | jardin (maison de la famille) | pms (la société PMS de Papi et Mamie) | foret | montagne (cascade) | ferme (grange, silo) | port (bateaux, phare)
- `meteo` (par scène) : pluie | orage (éclairs) | neige | arcenciel | etoiles (filantes)

Champs d'une scène : `texte` (lu à voix haute), `action`, `decor`, `interactif`,
`clics` (1–10), `consigne`, `copains` (engins qui arrivent), `vehicule` (un autre
engin fait l'action), `amis` (personnages qui arrivent à pied et restent),
`partent`, `positions` (`{"arthur": 480}`, x de 70 à 910), `humeur`
(`{"arthur": "peur"}` ou `"joie"`), `cache_heros` (`true` : le véhicule sort,
la scène est pour les personnages). Mettre `"amis": []` quand on ne veut pas que
des personnages soient ajoutés par mots-clés (papa, maman, chat…).

Personnages (`amis`) : les animaux `trex` (Rexou), `chat` (Moustache), `dino` (long cou),
`stego`, plus **tous les personnages de `personnages.json`** (par leur identifiant) :
`arthur`, `papa`, `maman`, `papi`, `mamie`, `jean-eudes`, `celestin`, `enfant1`/`enfant2`/`enfant3`…
Un prénom de `personnages.json` cité dans un texte (« Jean-Eudes ») ajoute le personnage tout seul.

### Créer ou décrire un personnage (`personnages.json`)
Quand un parent décrit quelqu'un (« Jean-Eudes est blond aux yeux bleus »), ajouter/modifier
son entrée dans `personnages.json` (identifiant = prénom sans accents, minuscules, tirets) :
```json
"jean-eudes": {"nom": "Jean-Eudes", "age": "enfant", "taille": "moyen", "peau": "clair",
  "cheveux": "blond", "coiffure": "boucle", "yeux": "bleu", "haut": "rouge", "bas": "marine",
  "corpulence": "moyen", "haut_type": "teeshirt", "bas_type": "pantalon", "chaussures": "noir",
  "cils": false, "lunettes": false, "couronne": false, "moustache": false, "barbe": false, "dessin": null}
```
- `age` : enfant | adulte — `taille` : petit | moyen | grand — `corpulence` : mince | moyen | costaud | rond
- `peau` : tres_clair | clair | beige | mat | cuivre | brun | fonce | tres_fonce
- `cheveux` : noir | brun_fonce | brun | chatain | blond_fonce | blond | blond_clair | roux | gris | blanc
- `coiffure` : court | herisse | boucle | milong | long | couettes | chignon | chauve
- `yeux` : marron_fonce | marron | noisette | vert | vert_clair | bleu | bleu_clair | gris
- `haut_type` : teeshirt | pull | chemise | debardeur | salopette | robe — `bas_type` : pantalon | short | jupe
- `chaussures` : noir | marron | blanc | rouge | bleu | rose | jaune | vert
- `haut` / `bas` (couleurs) : bleu | marine | rouge | rose | orange | jaune | vert | lilas | blanc | noir | beige | jean (`bas: "peau"` = jambes nues ; avec une robe, `bas` = la couleur du collant)
- `dessin` (sur le haut) : null | tractopelle | dino | etoile | coeur
Les parents peuvent aussi tout régler dans l'appli (bouton **Personnages** de l'accueil) ;
ces réglages-là restent sur l'appareil (localStorage) et passent avant `personnages.json`.

| action | ce qu'on voit | un clic = |
|---|---|---|
| `rouler` | le héros roule, le décor défile (les personnages marchent) | klaxon |
| `parler` | le héros attend au milieu | klaxon |
| `trou` | un trou dans la route | une pelletée |
| `feu` | maison en feu (les pompiers viennent si besoin) | un jet d'eau |
| `deblayer` | montagne de sable sur la route | le héros pousse |
| `construire` | maison brique par brique (dernier clic = toit) | une brique |
| `copains` | des engins arrivent un par un | un copain arrive |
| `manger` | repas : pierres (engin), herbe (Rexou), pâtée (Moustache) | quelqu'un mange |
| `spectacle` | les engins font un show (avec `"copains": ["benne"]`) | un engin saute |
| `bulles` | les dinos soufflent des bulles | une volée de bulles |
| `calin` | cœurs entre les personnages (la peur devient joie) | des cœurs |
| `piscine` | piscine ; Papi (s'il est là) est dans l'eau, Arthur et le véhicule sautent à tour de rôle | un plouf |
| `cueillir` | buisson de mûres + camion benne qui se gare à droite | des mûres vont dans la benne |
| `chateau` | bac à sable dans le jardin | un château de sable |
| `route` | route pavée posée pierre par pierre | une pierre |
| `voler` | le véhicule s'envole avec des ailes, les personnages debout dessus | un coup d'ailes |
| `fenetres` | maison en chantier : on pose 3 fenêtres puis la porte | une fenêtre/porte |
| `cadeau` | paquet cadeau qui s'ouvre sur un vélo jaune (`clics`: 1) | ouvre |
| `velo` | Arthur et Mamie s'envolent sur le vélo jaune (avec `cache_heros`) | coup de pédale |
| `fete` | confettis, « Bravo Arthur ! » | un feu d'artifice |
| `dormir` | la nuit, le héros dort | une étoile |
| `pont` | une rivière coupe la route, pont cassé ; à la fin on traverse | une planche |
| `arbre` | un arbre tombé bloque la route | le héros pousse |
| `panne` | un copain en panne qui fume (`"vehicule": "toupie"`) ; réparé, il devient un copain | un coup de clé |
| `chercher` | 2 à 5 buissons ; derrière le dernier, l'objet (`"objet"`: ballon, doudou, cle, ou un personnage comme `chat`) | on fouille un buisson |

Variables dans les textes (ne pas écrire « le tractopelle » en dur) : `{nom}`
(Tracto, Benny, Toupie, Pimpon, Bouldo, Grutty), `{vehicule}`/`{Vehicule}`,
`{heros}`/`{Heros}` (avec la couleur), `{couleur}`, `{prenom}` (config.json).

Un simple `.txt` marche aussi (voir `histoires/05-exemple-histoire-texte.txt`).

## Code
- `index.html` + `js/` : appli (canvas 1280×720 mis à l'échelle). `dessins.js`,
  `histoires.js` (lecture/normalisation), `sons.js` (Web Audio), `voix.js`, `app.js` (moteur).
- `api/voix.py` : fonction Vercel Python, voix neuronale Microsoft via `edge-tts`
  (mise en cache CDN). Secours : synthèse vocale du navigateur.
- `config.json` : prénom, voix (`voix_neuronale`, `vitesse_neuronale`).
- Test sur PC : `python outils/serveur_local.py` puis http://localhost:8765.
  Dans la console : `app.voix.actif=false; app.ouvreConfig(app.histoires[0]); app.lance()`.
- Le dossier voisin `../TractoAventures/` est l'ancienne version PC (pygame), même moteur.

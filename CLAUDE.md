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

Règles d'écriture : 3 à 8 scènes, phrases courtes, ton doux, **aucun méchant**,
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
Mode « 📝 Texte libre » : une ligne = une scène, analysée sur place par `etapesDepuisTexte()`
(lieux, actions, personnages, « touche »/« configuration » = interactif, nuit), puis éditable.

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
- `decor` : chantier | ville | campagne | dinosaures | plage | neige | ecole | vacances (maison de vacances) | jardin (maison de la famille) | pms (la société PMS de Papi et Mamie)

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

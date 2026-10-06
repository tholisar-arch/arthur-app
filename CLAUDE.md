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

## Format d'une histoire
```json
{
  "titre": "Le grand trou",
  "heros": "tractopelle",
  "couleur": "jaune",
  "decor": "chantier",
  "copains": [],
  "scenes": [
    {"texte": "{nom}, {heros}, part au chantier.", "action": "rouler"},
    {"texte": "Un gros trou !", "action": "trou", "interactif": true, "clics": 4,
     "consigne": "Clique pour remplir le trou !"}
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
  "robe": false, "cils": false, "lunettes": false, "couronne": false, "moustache": false,
  "barbe": false, "muscle": false, "dessin": null}
```
- `age` : enfant | adulte — `taille` : petit | moyen | grand
- `peau` : tres_clair | clair | beige | mat | cuivre | brun | fonce | tres_fonce
- `cheveux` : noir | brun_fonce | brun | chatain | blond_fonce | blond | blond_clair | roux | gris | blanc
- `coiffure` : court | herisse | boucle | milong | long | couettes | chignon | chauve
- `yeux` : marron_fonce | marron | noisette | vert | vert_clair | bleu | bleu_clair | gris
- `haut` / `bas` : bleu | marine | rouge | rose | orange | jaune | vert | lilas | blanc | noir | beige | jean (`bas: "peau"` = jambes nues, pour une robe)
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

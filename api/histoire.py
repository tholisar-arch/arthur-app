"""Fonction Vercel : « Raconte-la à Claude » — les parents racontent (texte ou dictée) dans l'appli,
Claude en fait une histoire jouable (français + anglais), au format des histoires de l'appli.

POST /api/histoire  {"action": "connexion", "code": "..."}                -> {"ok": true}
POST /api/histoire  {"code": "...", "texte": "...", "titre": "...", "prenom": "Arthur",
                     "personnages": [{"id": "papa", "nom": "Papa"}, ...], "longue": false} -> l'histoire (JSON)

Réglages Vercel (Settings → Environment Variables), jamais dans le code :
  ANTHROPIC_API_KEY  la clé de l'API Claude
  FAMILLE_CODE       le code de la famille (le « login » demandé dans l'appli)
  CLAUDE_MODELE      (facultatif) le modèle, par défaut claude-sonnet-5-5
"""
import hmac
import json
import os
import re
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

MODELE = os.environ.get("CLAUDE_MODELE", "claude-sonnet-5-5")

CONSIGNES = """Tu écris des histoires interactives pour un petit garçon de 3 ans, fan d'engins de chantier,
à partir de ce que ses parents racontent. L'histoire est jouée dans une appli : des images animées, une voix qui lit,
et l'enfant touche l'écran à certains moments.

Règles :
- Reste fidèle à ce que racontent les parents (personnages, lieux, événements), en l'enrichissant avec douceur.
- Phrases courtes et simples, ton doux et joyeux. AUCUN méchant, aucune violence, rien d'effrayant : les « combats »
  deviennent des défis ou des jeux, les problèmes se résolvent ensemble.
- Chaque fois que les parents disent « configuration » (ou « touche »), la scène devient interactive.
  Sinon, rends interactive environ une scène sur deux ou trois.
- Histoire normale : 8 à 15 scènes. Si "longue" est vrai (ou si les parents le demandent) : 40 à 55 scènes en 4 à 6
  chapitres ("parties"), avec des lieux et des péripéties variés (environ 10-12 minutes).
- Bilingue OBLIGATOIRE : "titre_en", et dans chaque scène "texte_en" (anglais américain : Mommy, Daddy, Grandpa, Grandma),
  "consigne_en" si "consigne", "texte_en" dans les bulles, "titre_en" pour chaque chapitre.
- Variables dans les textes : {nom} (le prénom du véhicule, ex. Tracto), {heros} (« le tractopelle jaune »),
  {Vehicule}, {prenom} (le prénom de l'enfant). N'écris jamais « le tractopelle » en dur.
- Mets "decor" sur CHAQUE scène.

Format : réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{"titre": "...", "titre_en": "...", "heros": "tractopelle", "couleur": "jaune", "decor": "...",
 "scenes": [ ... ]}            (ou, pour une histoire longue : "parties": [{"titre": "...", "titre_en": "...", "scenes": [...]}])

Une scène : {"texte": "...", "texte_en": "...", "action": "...", "decor": "...", "interactif": true/false, "clics": 1-8,
 "consigne": "Touche ...", "consigne_en": "Tap ...", "amis": ["..."], "partent": ["..."], "humeur": {"id": "joie|peur|calme"},
 "bulle": {"qui": "id ou heros", "texte": "...", "texte_en": "..."}, "meteo": "pluie|orage|neige|arcenciel|etoiles",
 "nuit": true, "copains": ["grue"], "vehicule": "toupie", "objet": "ballon|doudou|cle|chat", "mot": "{prenom}"}
(seuls "texte", "texte_en", "action" et "decor" sont obligatoires ; "amis" = ceux qui ARRIVENT dans cette scène, ils restent
ensuite jusqu'à ce qu'ils soient dans "partent". Mets "amis": [] quand personne n'arrive.)

heros : tractopelle | benne | toupie | pompier | bulldozer | grue — couleur : jaune | orange | rouge | bleu | vert | violet | rose
decor : chantier | ville | campagne | dinosaures | plage | neige | ecole | vacances (maison de vacances avec piscine) |
  jardin (maison de la famille) | pms (l'entreprise de Papy et Mamie) | foret | montagne | ferme | port
action :
  rouler (on roule, le décor défile) | parler (on discute) | trou (remplir un trou) | feu (éteindre un feu) |
  deblayer (pousser un tas de sable) | construire (une maison brique par brique) | copains (des engins arrivent, avec "copains") |
  manger (goûter) | spectacle (les engins font un show) | bulles | calin (câlins, la peur devient joie) |
  piscine (on saute dans la piscine) | cueillir (des mûres) | chateau (château de sable) | route (poser des pierres) |
  voler (le véhicule s'envole) | fenetres (poser fenêtres et porte) | cadeau (un cadeau s'ouvre, "clics": 1) |
  velo (l'enfant s'envole sur un vélo) | fete (feux d'artifice) | dormir (la nuit) |
  pont (réparer un pont cassé sur une rivière) | arbre (pousser un arbre tombé) | panne (réparer un engin en panne, "vehicule")
  | chercher (chercher derrière des buissons, "objet") | chiffres (toucher 1, 2, 3 dans l'ordre — jeu pour apprendre) |
  lettres (toucher les lettres d'un mot, "mot")
  Pour montrer un problème avant de le faire résoudre, mets une scène non interactive avec "clics": 0, puis la même action
  interactive à la scène suivante.
Personnages ("amis", "partent", "humeur", "bulle.qui") : utilise UNIQUEMENT ces identifiants :
  trex (Rexou, un T-rex gentil), dino (diplodocus), stego (stégosaure), dragon (petit dragon gentil), chat (Moustache),
  et les personnages de la famille donnés ci-dessous (par leur identifiant). L'enfant est "arthur".
"""


def appelle_claude(cle, demande):
    corps = json.dumps({
        "model": MODELE,
        "max_tokens": 16000,
        "system": CONSIGNES,
        "messages": [{"role": "user", "content": demande}],
    }).encode("utf-8")
    req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=corps, method="POST", headers={
        "x-api-key": cle, "anthropic-version": "2023-06-01", "content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=280) as rep:
        reponse = json.loads(rep.read().decode("utf-8"))
    texte = "".join(b.get("text", "") for b in reponse.get("content", []) if b.get("type") == "text")
    texte = re.sub(r"^```(?:json)?\s*|\s*```$", "", texte.strip())
    debut, fin = texte.find("{"), texte.rfind("}")
    if debut < 0 or fin < 0:
        raise ValueError("réponse sans histoire")
    histoire = json.loads(texte[debut:fin + 1])
    if not (histoire.get("scenes") or histoire.get("parties")):
        raise ValueError("histoire vide")
    return histoire


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            taille = min(int(self.headers.get("Content-Length") or 0), 100_000)
            q = json.loads(self.rfile.read(taille).decode("utf-8") or "{}")
        except Exception:
            return self._json(400, {"erreur": "demande illisible"})
        code_attendu, cle = os.environ.get("FAMILLE_CODE", ""), os.environ.get("ANTHROPIC_API_KEY", "")
        if not code_attendu or not cle:
            return self._json(503, {"erreur": "non_configure"})
        if not hmac.compare_digest(str(q.get("code", "")).strip().encode(), code_attendu.strip().encode()):
            time.sleep(1.5)  # ralentit ceux qui essaient de deviner le code
            return self._json(401, {"erreur": "code"})
        if q.get("action") == "connexion":
            return self._json(200, {"ok": True})
        texte = str(q.get("texte", "")).strip()[:8000]
        if len(texte) < 10:
            return self._json(400, {"erreur": "texte trop court"})
        persos = [f'{p.get("id")} = {p.get("nom")}' for p in (q.get("personnages") or [])[:40] if isinstance(p, dict)]
        demande = (f"Prénom de l'enfant : {str(q.get('prenom') or 'Arthur')[:40]}\n"
                   f"Personnages de la famille (identifiant = nom) : {', '.join(persos) or 'arthur = Arthur'}\n"
                   f"Titre souhaité : {str(q.get('titre') or '')[:80] or '(à toi de choisir)'}\n"
                   f"Histoire longue en chapitres : {'oui' if q.get('longue') else 'non'}\n\n"
                   f"Ce que racontent les parents :\n{texte}")
        try:
            histoire = appelle_claude(cle, demande)
        except urllib.error.HTTPError as e:
            return self._json(502, {"erreur": f"Claude indisponible ({e.code})"})
        except Exception as e:
            return self._json(502, {"erreur": f"Claude n'a pas pu écrire l'histoire : {e}"})
        return self._json(200, histoire)

    def _json(self, code, donnees):
        corps = json.dumps(donnees, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)

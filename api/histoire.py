"""Fonction Vercel : l'IA GRATUITE écrit l'histoire que les parents racontent dans l'appli (texte ou dictée).

POST /api/histoire  {"texte": "...", "titre": "...", "prenom": "Arthur", "personnages": [{"id": "papa", "nom": "Papa"}],
                     "longue": false}  ->  l'histoire au format de l'appli (JSON, français + anglais)
GET  /api/histoire  ->  {"pret": true/false}  (l'IA est-elle branchée ?)

IA gratuites utilisées (clé gratuite à mettre une fois dans Vercel → Settings → Environment Variables) :
  GEMINI_API_KEY   Google Gemini, palier gratuit (clé sur https://aistudio.google.com/apikey) — essayée en premier
  GROQ_API_KEY     Groq, palier gratuit (clé sur https://console.groq.com/keys) — en secours (facultatif)
  GEMINI_MODELE / GROQ_MODELE (facultatifs) pour changer de modèle
L'appli ne fabrique pas la demande : seul le récit des parents est envoyé, les consignes sont ici (pas de « proxy » libre).
"""
import json
import os
import re
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

GEMINI_MODELE = os.environ.get("GEMINI_MODELE", "gemini-2.5-flash")
GROQ_MODELE = os.environ.get("GROQ_MODELE", "llama-3.3-70b-versatile")

CONSIGNES = """Tu écris des histoires interactives pour un petit garçon de 3 ans, fan d'engins de chantier,
à partir de ce que ses parents racontent. L'histoire est jouée dans une appli : des images animées, une voix qui lit,
et l'enfant touche l'écran à certains moments.

Règles :
- Reste fidèle à ce que racontent les parents (personnages, lieux, événements), en l'enrichissant avec douceur.
- Le récit est souvent DICTÉ à voix haute : ignore les hésitations (euh, bah, du coup, tu vois…), les répétitions et les
  phrases coupées, et écris des phrases jolies, fluides et faciles à lire à voix haute (jamais « le chat il dort »).
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
Réponds UNIQUEMENT avec l'objet JSON, complet, sans rien couper.

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


def poste_json(url, corps, entetes, delai=270):
    req = urllib.request.Request(url, data=json.dumps(corps).encode("utf-8"), method="POST",
                                 headers={"content-type": "application/json", **entetes})
    with urllib.request.urlopen(req, timeout=delai) as rep:
        return json.loads(rep.read().decode("utf-8"))


def lis_histoire(texte):
    texte = re.sub(r"```(?:json)?", "", texte or "")
    debut, fin = texte.find("{"), texte.rfind("}")
    if debut < 0 or fin <= debut:
        raise ValueError("réponse sans histoire")
    morceau = texte[debut:fin + 1]
    try:
        histoire = json.loads(morceau)
    except json.JSONDecodeError:
        histoire = json.loads(re.sub(r",\s*([}\]])", r"\1", morceau))  # une virgule en trop
    if not (histoire.get("scenes") or histoire.get("parties")):
        raise ValueError("histoire vide")
    return histoire


def avec_gemini(cle, demande):
    modele = GEMINI_MODELE
    url = lambda m: f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent"
    corps = {"systemInstruction": {"parts": [{"text": CONSIGNES}]},
             "contents": [{"role": "user", "parts": [{"text": demande}]}],
             "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": 32000, "temperature": 0.9}}
    try:
        rep = poste_json(url(modele), corps, {"x-goog-api-key": cle})
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
        # le modèle n'existe plus : on prend le « flash » le plus récent proposé par Google
        req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", headers={"x-goog-api-key": cle})
        with urllib.request.urlopen(req, timeout=20) as r:
            noms = [m["name"].split("/")[-1] for m in json.loads(r.read()).get("models", [])
                    if "generateContent" in m.get("supportedGenerationMethods", [])]
        flash = sorted([n for n in noms if "flash" in n and "lite" not in n and "image" not in n and "tts" not in n], reverse=True)
        if not flash:
            raise
        rep = poste_json(url(flash[0]), corps, {"x-goog-api-key": cle})
    parties = rep.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    return lis_histoire("".join(p.get("text", "") for p in parties if not p.get("thought")))


def avec_groq(cle, demande):
    rep = poste_json("https://api.groq.com/openai/v1/chat/completions", {
        "model": GROQ_MODELE, "temperature": 0.9, "max_tokens": 16000, "response_format": {"type": "json_object"},
        "messages": [{"role": "system", "content": CONSIGNES}, {"role": "user", "content": demande}]},
        {"authorization": f"Bearer {cle}"})
    return lis_histoire(rep["choices"][0]["message"]["content"])


def ecrit_histoire(demande):
    essais = [(f, os.environ.get(k, "").strip()) for f, k in ((avec_gemini, "GEMINI_API_KEY"), (avec_groq, "GROQ_API_KEY"))]
    essais = [(f, cle) for f, cle in essais if cle]
    if not essais:
        raise LookupError("non_configure")
    erreurs = []
    for fonction, cle in essais:  # Gemini d'abord, Groq en secours
        try:
            return fonction(cle, demande)
        except urllib.error.HTTPError as e:
            erreurs.append(f"{fonction.__name__[5:]} {e.code}")
        except Exception as e:
            erreurs.append(f"{fonction.__name__[5:]} : {e}")
    raise RuntimeError(" ; ".join(erreurs))


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        pret = bool(os.environ.get("GEMINI_API_KEY", "").strip() or os.environ.get("GROQ_API_KEY", "").strip())
        self._json(200, {"pret": pret})

    def do_POST(self):
        try:
            taille = min(int(self.headers.get("Content-Length") or 0), 100_000)
            q = json.loads(self.rfile.read(taille).decode("utf-8") or "{}")
        except Exception:
            return self._json(400, {"erreur": "demande illisible"})
        texte = str(q.get("texte", "")).strip()[:8000]
        if len(texte) < 10:
            return self._json(400, {"erreur": "texte trop court"})
        persos = [f'{p.get("id")} = {p.get("nom")}' for p in (q.get("personnages") or [])[:40] if isinstance(p, dict)]
        cat = q.get("catalogue") if isinstance(q.get("catalogue"), dict) else {}
        def liste(cle, avec_lieu=False):  # seulement des identifiants simples et des noms courts (pas de consignes cachées)
            out = []
            for e in (cat.get(cle) or [])[:80]:
                if isinstance(e, dict) and re.fullmatch(r"[a-z_]{2,20}", str(e.get("id", ""))):
                    nom = re.sub(r"[^\w '’-]", "", str(e.get("nom", "")), flags=re.UNICODE)[:30]
                    lieu = f", lieu habituel {e.get('lieu')}" if avec_lieu and re.fullmatch(r"[a-z_]{2,20}", str(e.get("lieu", ""))) else ""
                    out.append(f"{e['id']} ({nom}{lieu})")
            return ", ".join(out)
        en_plus = "".join(f"\n{titre} : {txt}" for titre, txt in (
            ("Actions en plus (le moment où l'enfant touche fait avancer l'activité)", liste("actions", True)),
            ("Lieux en plus (decor)", liste("lieux")), ("Animaux en plus (amis)", liste("animaux"))) if txt)
        demande = (f"Prénom de l'enfant : {str(q.get('prenom') or 'Arthur')[:40]}\n"
                   f"Personnages de la famille (identifiant = nom) : {', '.join(persos) or 'arthur = Arthur'}\n"
                   f"Titre souhaité : {str(q.get('titre') or '')[:80] or '(à toi de choisir)'}\n"
                   f"Histoire longue en chapitres : {'oui' if q.get('longue') else 'non'}{en_plus}\n"
                   "Utilise volontiers ces actions, lieux et animaux en plus quand ils correspondent au récit.\n\n"
                   f"Ce que racontent les parents :\n{texte}")
        try:
            histoire = ecrit_histoire(demande)
        except LookupError:
            return self._json(503, {"erreur": "non_configure"})
        except Exception as e:
            return self._json(502, {"erreur": f"L'IA n'a pas pu écrire l'histoire ({e})"})
        return self._json(200, histoire)

    def _json(self, code, donnees):
        corps = json.dumps(donnees, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)

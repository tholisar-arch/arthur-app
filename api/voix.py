"""Fonction Vercel : transforme une phrase en voix naturelle (mp3).

GET /api/voix?t=<texte>&v=<voix>&r=<débit>&p=<hauteur, ex. -2Hz>
La réponse est gardée en cache par Vercel : chaque phrase n'est fabriquée qu'une fois.

1. Voix neuronale Microsoft (edge-tts) : la plus belle.
2. Si Microsoft refuse (le service a changé en octobre 2026 et renvoie 403) : voix naturelle de Google
   (celle de Google Traduction), découpée en morceaux de 190 caractères et recollée.
Jamais de voix robotique : si tout échoue, l'appli affiche le texte sans parler.
L'en-tête « X-Voix » dit quelle voix a parlé (« edge » ou « google ») : l'appli adapte la lecture.
"""
import asyncio
import re
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

import edge_tts

VOIX_PERMISES = {
    # voix d'une seule langue : pas de changement d'accent sur les prénoms
    "fr-FR-DeniseNeural", "fr-FR-EloiseNeural", "fr-FR-HenriNeural",
    "en-US-AvaNeural", "en-US-JennyNeural", "en-US-EmmaNeural", "en-US-AnaNeural", "en-US-AndrewNeural",
    "en-GB-SoniaNeural", "en-GB-LibbyNeural", "en-GB-MaisieNeural", "en-GB-RyanNeural",
    # anciennes voix multilingues (gardées pour compatibilité)
    "fr-FR-VivienneMultilingualNeural", "fr-FR-RemyMultilingualNeural",
}
DEFAUT = "fr-FR-DeniseNeural"
EDGE_EN_PANNE_JUSQUA = 0.0  # après un refus de Microsoft, on ne le réessaie pas avant quelques minutes


async def fabrique(texte, voix, debit, hauteur):
    morceaux = []
    async for bout in edge_tts.Communicate(texte, voix, rate=debit, pitch=hauteur).stream():
        if bout["type"] == "audio":
            morceaux.append(bout["data"])
    return b"".join(morceaux)


def morceaux_de(texte, taille=190):
    """Découpe le texte en morceaux de moins de 190 caractères, de préférence entre deux phrases."""
    out, reste = [], texte.strip()
    while len(reste) > taille:
        coupe = max(reste.rfind(c, 0, taille) for c in ".!?…;:,")
        if coupe < 40:
            coupe = reste.rfind(" ", 0, taille)
        if coupe < 1:
            coupe = taille
        out.append(reste[: coupe + 1].strip())
        reste = reste[coupe + 1:].strip()
    if reste:
        out.append(reste)
    return out


def google(texte, langue):
    """La voix de Google Traduction (naturelle) : un mp3 par morceau, recollés (les mp3 se mettent bout à bout)."""
    audio = b""
    for bout in morceaux_de(texte):
        q = urllib.parse.urlencode({"ie": "UTF-8", "client": "tw-ob", "tl": langue, "q": bout})
        for essai in range(3):
            try:
                req = urllib.request.Request("https://translate.google.com/translate_tts?" + q,
                                             headers={"User-Agent": "Mozilla/5.0", "Referer": "https://translate.google.com/"})
                with urllib.request.urlopen(req, timeout=10) as r:
                    audio += r.read()
                break
            except Exception:
                if essai == 2:
                    raise
                time.sleep(0.4 * (essai + 1))
    return audio


def mp3(texte, voix=DEFAUT, debit="-8%", hauteur="+0Hz"):
    global EDGE_EN_PANNE_JUSQUA
    texte = (texte or "").strip()[:500]
    if not texte:
        raise ValueError("texte vide")
    if voix not in VOIX_PERMISES:
        voix = DEFAUT
    if not re.fullmatch(r"[+-]\d{1,2}%", debit or ""):
        debit = "-8%"
    if not re.fullmatch(r"[+-]\d{1,2}Hz", hauteur or ""):
        hauteur = "+0Hz"
    if time.time() >= EDGE_EN_PANNE_JUSQUA:
        try:
            audio = asyncio.run(fabrique(texte, voix, debit, hauteur))
            if audio:
                return audio, "edge"
        except Exception:
            EDGE_EN_PANNE_JUSQUA = time.time() + 300
    return google(texte, "en" if voix.startswith("en-") else "fr"), "google"


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        try:
            audio, source = mp3(q.get("t", [""])[0], q.get("v", [DEFAUT])[0], q.get("r", ["-8%"])[0], q.get("p", ["+0Hz"])[0])
        except ValueError as e:
            self._erreur(400, str(e))
            return
        except Exception as e:  # aucune voix naturelle disponible : l'appli affichera le texte
            self._erreur(502, f"voix indisponible : {e}")
            return
        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("X-Voix", source)
        self.send_header("Access-Control-Expose-Headers", "X-Voix")
        # une voix de secours se garde moins longtemps : quand Microsoft reviendra, on retrouvera sa voix
        self.send_header("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable" if source == "edge" else "public, max-age=86400, s-maxage=86400")
        self.end_headers()
        self.wfile.write(audio)

    def _erreur(self, code, message):
        corps = message.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)

"""Fonction Vercel : transforme une phrase en voix naturelle (mp3).

GET /api/voix?t=<texte>&v=<voix>&r=<débit>
La réponse est gardée en cache par Vercel : chaque phrase n'est fabriquée qu'une fois.
"""
import asyncio
import re
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

import edge_tts

VOIX_PERMISES = {
    "fr-FR-VivienneMultilingualNeural", "fr-FR-DeniseNeural", "fr-FR-EloiseNeural",
    "fr-FR-RemyMultilingualNeural", "fr-FR-HenriNeural",
}
DEFAUT = "fr-FR-VivienneMultilingualNeural"


async def fabrique(texte, voix, debit):
    morceaux = []
    async for bout in edge_tts.Communicate(texte, voix, rate=debit).stream():
        if bout["type"] == "audio":
            morceaux.append(bout["data"])
    return b"".join(morceaux)


def mp3(texte, voix=DEFAUT, debit="-8%"):
    texte = (texte or "").strip()[:500]
    if not texte:
        raise ValueError("texte vide")
    if voix not in VOIX_PERMISES:
        voix = DEFAUT
    if not re.fullmatch(r"[+-]\d{1,2}%", debit or ""):
        debit = "-8%"
    return asyncio.run(fabrique(texte, voix, debit))


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        try:
            audio = mp3(q.get("t", [""])[0], q.get("v", [DEFAUT])[0], q.get("r", ["-8%"])[0])
        except ValueError as e:
            self._erreur(400, str(e))
            return
        except Exception as e:  # service de voix indisponible : l'appli passera à la voix de l'iPad
            self._erreur(502, f"voix indisponible : {e}")
            return
        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable")
        self.end_headers()
        self.wfile.write(audio)

    def _erreur(self, code, message):
        corps = message.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)

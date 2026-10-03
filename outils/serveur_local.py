"""Serveur de test sur le PC : http://localhost:8765 (mêmes fichiers + /api/voix que sur Vercel)."""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ICI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ICI, "api"))
import voix  # noqa: E402


class Gestion(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ICI, **kw)

    def do_GET(self):
        if self.path.startswith("/api/voix"):
            q = parse_qs(urlparse(self.path).query)
            try:
                audio = voix.mp3(q.get("t", [""])[0], q.get("v", [voix.DEFAUT])[0], q.get("r", ["-8%"])[0])
            except Exception as e:
                self.send_error(502, str(e))
                return
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Content-Length", str(len(audio)))
            self.end_headers()
            self.wfile.write(audio)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8765))
    print(f"http://localhost:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Gestion).serve_forever()

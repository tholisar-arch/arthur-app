"""Met à jour histoires/index.json (la liste des histoires que l'appli affiche).

À lancer après avoir ajouté, modifié ou supprimé une histoire :
    python outils/maj_index.py
Les dates déjà connues sont gardées ; une histoire nouvelle ou modifiée prend la date du jour,
ce qui la fait apparaître en premier avec l'étoile « Nouveau ».
"""
import hashlib
import json
import os
from datetime import datetime, timezone

ICI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER = os.path.join(ICI, "histoires")
INDEX = os.path.join(DOSSIER, "index.json")


def empreinte(chemin):
    with open(chemin, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:12]


def main():
    anciens = {}
    if os.path.exists(INDEX):
        with open(INDEX, encoding="utf-8") as f:
            anciens = {h["fichier"]: h for h in json.load(f).get("histoires", [])}
    maintenant = datetime.now(timezone.utc).isoformat(timespec="seconds")
    liste = []
    for nom in sorted(os.listdir(DOSSIER)):
        if nom == "index.json" or nom.startswith(("_", ".")) or not nom.lower().endswith((".json", ".txt")):
            continue
        e = empreinte(os.path.join(DOSSIER, nom))
        ancien = anciens.get(nom)
        date = ancien["date"] if ancien and ancien.get("empreinte") == e else maintenant
        liste.append({"fichier": nom, "date": date, "empreinte": e})
    with open(INDEX, "w", encoding="utf-8") as f:
        json.dump({"histoires": liste}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{len(liste)} histoires dans l'index :")
    for h in liste:
        print(f"  {h['date'][:10]}  {h['fichier']}")


if __name__ == "__main__":
    main()

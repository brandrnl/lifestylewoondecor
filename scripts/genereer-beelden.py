"""Genereert sfeerbeelden voor de website via de OpenAI Images API.

Gebruik:
    python scripts/genereer-beelden.py                  # alle ontbrekende beelden
    python scripts/genereer-beelden.py akupanelen-woonkamer behang-natuurvezel-detail
    python scripts/genereer-beelden.py --opnieuw <id>   # bestaand beeld overschrijven

De API-sleutel wordt gelezen uit de omgevingsvariabele OPENAI_API_KEY.
Beelden komen als WebP in assets/img/sfeer/<id>.webp.
"""
import base64, json, os, pathlib, sys, urllib.request, urllib.error

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "scripts" / "beelden.json").read_text(encoding="utf-8"))
OUT = ROOT / "assets" / "img" / "sfeer"


def genereer(beeld, key):
    prompt = f'{beeld["prompt"]}\n\nWhat must be technically correct: {beeld["techniek"]}\n\nStyle: {CONFIG["stijl"]}'
    body = json.dumps({
        "model": CONFIG["model"],
        "prompt": prompt,
        "size": beeld["size"],
        "quality": CONFIG["quality"],
        "output_format": "webp",
        "n": 1,
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations", data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        data = json.load(r)
    return base64.b64decode(data["data"][0]["b64_json"])


def comprimeer(pad):
    """Hercodeert de WebP lichter voor het web (vereist Pillow; anders blijft het origineel staan)."""
    try:
        from PIL import Image
    except ImportError:
        return
    with Image.open(pad) as im:
        im.load()
        im.save(pad, "WEBP", quality=82, method=6)


def main(args):
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        sys.exit("OPENAI_API_KEY is niet gezet.")
    opnieuw = "--opnieuw" in args
    ids = [a for a in args if not a.startswith("--")]
    OUT.mkdir(parents=True, exist_ok=True)
    for beeld in CONFIG["beelden"]:
        if ids and beeld["id"] not in ids:
            continue
        dest = OUT / f'{beeld["id"]}.webp'
        if dest.exists() and not opnieuw:
            print("bestaat al:", dest.name)
            continue
        print("genereren:", beeld["id"], beeld["size"], flush=True)
        try:
            dest.write_bytes(genereer(beeld, key))
            comprimeer(dest)
        except urllib.error.HTTPError as e:
            sys.exit(f'API-fout bij {beeld["id"]}: {e.code} {e.read().decode(errors="replace")[:500]}')
        print("opgeslagen:", dest.relative_to(ROOT))


if __name__ == "__main__":
    main(sys.argv[1:])

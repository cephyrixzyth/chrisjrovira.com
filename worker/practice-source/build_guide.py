"""Build the standalone reader and optional host bridge using only reviewed local files."""
import argparse
import base64
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

FIELDS = {"id", "group", "title", "aliases", "principle", "practice", "example", "check", "ref"}
REFERENCE_HOSTS = {"www.rfc-editor.org", "www.w3.org", "sre.google", "www.dublincore.org",
                   "developer.mozilla.org", "arxiv.org", "www.elastic.co", "ffmpeg.org",
                   "tech.ebu.ch", "filmanalysis.yale.edu"}

def sha(text):
    return base64.b64encode(hashlib.sha256(text.encode()).digest()).decode()

def validate(data):
    if set(data) != {"version", "references", "cards"} or data["version"] != 1:
        raise ValueError("Unrecognized publication schema")
    ids = set()
    refs = data["references"]
    for key, pair in refs.items():
        if not re.fullmatch(r"[a-z][a-z0-9-]*", key) or not isinstance(pair, list) or len(pair) != 2:
            raise ValueError("Invalid reference")
        label, raw = pair
        url = urlsplit(raw)
        if not label or url.scheme != "https" or url.netloc not in REFERENCE_HOSTS or url.query or url.fragment:
            raise ValueError("Review reference origin and path")
    for card in data["cards"]:
        if set(card) != FIELDS or card["ref"] not in refs:
            raise ValueError("Unexpected lesson fields or reference")
        if not re.fullmatch(r"[a-z][a-z0-9-]*", card["id"]) or card["id"] in ids:
            raise ValueError("Invalid or duplicate lesson ID")
        for key in FIELDS - {"aliases"}:
            if not isinstance(card[key], str) or not card[key].strip():
                raise ValueError("Missing lesson text")
        terms = card["aliases"]
        if not isinstance(terms, list) or not terms or not all(isinstance(t, str) and t.strip() for t in terms):
            raise ValueError("Missing search terms")
        if any(re.search(r"(?:https?://|[\w.+-]+@[\w.-]+\.\w+)", x, re.I) for x in [*terms, *[card[k] for k in FIELDS - {"aliases"}]]):
            raise ValueError("Keep contacts and URLs out of the lesson")
        ids.add(card["id"])
    if not ids:
        raise ValueError("A publication needs at least one lesson")

def fingerprint(data):
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()

def render(source, library):
    data = json.loads(library.read_text(encoding="utf8"))
    validate(data)
    if fingerprint(data) != (source / "reviewed-library.sha256").read_text().strip():
        raise ValueError("Review the changed public lesson text and update its approved fingerprint")
    cards = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", r"\u003c")
    js = (source / "reader.js").read_text()
    css = (source / "reader.css").read_text()
    page = (source / "reader.html").read_text()
    for key, value in {"STYLEHASH":sha(css), "JSHASH":sha(js), "STYLE":css, "JS":js, "CARDS":cards}.items():
        page = page.replace("@@" + key + "@@", value)
    bridge = (source / "bridge.js").read_text().replace("@@IDS@@", json.dumps([c["id"] for c in data["cards"]]))
    packet_fields = ("id", "title", "practice", "example", "check")
    packets = [{key:card[key] for key in packet_fields} for card in data["cards"]]
    return page, bridge, json.dumps(packets, ensure_ascii=False, indent=2) + "\n"

if __name__ == "__main__":
    source = Path(__file__).resolve().parent
    root = source.parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--fingerprint", action="store_true")
    args = parser.parse_args()
    library = root / "assistant-knowledge.json"
    if args.fingerprint:
        data = json.loads(library.read_text())
        validate(data)
        print(fingerprint(data))
    else:
        page, bridge, packets = render(source, library)
        outputs = {root / "practice-guide.html":page, root / "assistant.js":bridge,
                   source / "coach-library.json":packets}
        for dest, text in outputs.items():
            if args.check:
                if not dest.is_file() or dest.read_text() != text: raise SystemExit("Rebuild " + dest.name)
            else: dest.write_text(text)
        if args.check: print("Reviewed corpus and all three build products agree")

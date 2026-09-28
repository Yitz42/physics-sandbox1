# checks.py — which rules apply to a file, and the CODED rules.
#
# The coded rules are exact, so they're plain Python: asking an AI whether a file
# imports from subjects/ would be slower, cost money, and sometimes be wrong.
# Each returns a list of findings: {"file", "rule", "source", "detail"}.

import re
from fnmatch import fnmatch

from rules import JUDGED

MAX_LINES = 220  # CLAUDE.md: "split any file growing past ~200 lines" (a little slack for the ~)


def judged_rules_for(path):
    """The JUDGED rules whose `files` patterns match this path (and whose `skip` don't)."""
    return [r for r in JUDGED
            if any(fnmatch(path, p) for p in r["files"])
            and not any(fnmatch(path, p) for p in r.get("skip", []))]


def _finding(path, rule, source, detail):
    return {"file": path, "rule": rule, "source": source, "detail": detail}


# An import line's source: from "…" or import "…".
IMPORT_FROM = re.compile(r"""^\s*(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]""", re.M)


def _imports(text):
    return [a or b for a, b in IMPORT_FROM.findall(text)]


def check_file(path, text, lines_before, lines_after):
    """The coded rules for one changed file. `text` is its contents now."""
    found = []
    if not path.endswith(".js"):
        return found
    imports = _imports(text)

    # Shared code never imports a subject (CLAUDE.md, Rules that keep it extensible).
    if re.match(r"src/(core|challenges|render)/", path):
        for src in imports:
            if "subjects/" in src:
                found.append(_finding(path, "Shared code never imports from a subject",
                                      "CLAUDE.md (Rules that keep it extensible)",
                                      f'it imports "{src}". The subject should register what it needs with the core instead.'))

    # Libraries load from a CDN in index.html only (CLAUDE.md, Tech rules): so every
    # import in the game's own code is a relative path to one of its own files.
    if path.startswith(("src/", "content/")):
        for src in imports:
            if not src.startswith("."):
                found.append(_finding(path, "Libraries load from a CDN in index.html only",
                                      "CLAUDE.md (Tech rules)",
                                      f'it imports "{src}". Game code imports only its own files by relative path.'))

    # Small, single-purpose files (CLAUDE.md, Tech rules). Only flagged when this
    # turn made the file longer, so an old long file isn't nagged about for a typo fix.
    if path.startswith("src/") and lines_after > MAX_LINES and lines_after > lines_before:
        found.append(_finding(path, "Split any file growing past ~200 lines", "CLAUDE.md (Tech rules)",
                              f"it grew from {lines_before} to {lines_after} lines. Split it into smaller single-purpose files, "
                              "or tell the owner why it should stay whole."))
    return found


def check_turn(paths):
    """Coded rules about the turn as a whole (several files together)."""
    found = []
    # Every solver feature gets tests (CLAUDE.md, Testing). Drawing and layout
    # files (*-scene.js, *-layout.js) are pictures, checked by the picture test.
    solver = [p for p in paths if re.match(r"src/subjects/.+\.js$", p) and not re.search(r"-(scene|layout)\.js$", p)]
    if solver and not any(p.startswith("tests/") for p in paths):
        found.append(_finding(", ".join(solver[:3]) + (" …" if len(solver) > 3 else ""),
                              "Every solver feature gets tests", "CLAUDE.md (Testing)",
                              "subject code changed but nothing in tests/ did. Add a textbook-style test with a "
                              "hand-computed answer, or tell the owner why this change needs none (e.g. comments only)."))
    return found

# judge.py — asks TypeSafe's Jev model about the JUDGED rules.
#
# One request per changed file. Its `state` is the file's change; its questions
# are one yes/no ("noul") per rule that applies to that file, all asked together
# (they run in parallel inside the model, and each is answered on its own).
# Each answer is the probability that the change BREAKS the rule.
#
# Docs: https://docs.typesafe.ai/api.md and /primitives/noul.md
# The API key stays on this computer: in the TYPESAFE_API_KEY environment variable,
# or in the file ~/.typesafe_api_key. Nothing here is part of the game itself.

import json
import os
import time
import urllib.error
import urllib.request

API_URL = os.environ.get("TYPESAFE_API_URL", "https://api.typesafe.ai/v1/systemone")  # tests point this at a fake server
MODEL = "jev-latest"

# Probability that a rule is broken, at or above which the work goes back for
# another look ("needs more thought"), and the lower band that's only mentioned.
# Starting points, to be tuned once we've seen how it judges this project's code.
THINK_MORE = 0.70
WORTH_A_LOOK = 0.50

# The model reads up to 32k tokens of state per request (docs: models.md); a
# token is ~4 characters, so a very large change is cut to fit, with a note.
MAX_CHANGE_CHARS = 60_000

PROJECT = ("A browser game that teaches engineering mechanics (statics, automatic controls, "
           "mechanics of materials) to first-year engineering students. Plain JavaScript. "
           "content/ holds the lessons (courses, units, stages); src/ holds the engine.")


def api_key():
    key = os.environ.get("TYPESAFE_API_KEY", "").strip()
    if key:
        return key
    try:
        with open(os.path.expanduser("~/.typesafe_api_key")) as f:
            return f.read().strip() or None
    except OSError:
        return None


def build_request(path, diff, rules):
    """The request body for one file: its change, and one noul per rule."""
    cut = len(diff) > MAX_CHANGE_CHARS
    state = {
        "project": PROJECT,
        "file": path,
        "change": diff[:MAX_CHANGE_CHARS],
        "how_to_read_the_change": "Lines starting with + were added, lines starting with - were removed; "
                                  "the rest are unchanged context and are not part of the change."
                                  + (" The change was too long and is cut short." if cut else ""),
    }
    questions = {
        r["id"]: {
            "type": "noul",
            "instructions": {
                "task": "Does the change in `change` (to the file `file`) break this design rule of the project? "
                        "Judge only what the change adds or alters, not older code around it.",
                "rule": r["rule"],
            },
            "criteria": {"true": r["breaks"], "false": r["keeps"]},
        }
        for r in rules
    }
    return {"model": MODEL, "state": state, "questions": questions}


def ask(body, key, timeout=60, tries=3):
    """Send one request; returns {rule id: probability the rule is broken}.
    Retries, with growing waits, when the service says it's busy (429, 529)."""
    data = json.dumps(body).encode()
    for attempt in range(tries):
        req = urllib.request.Request(API_URL, data=data, method="POST", headers={
            "Authorization": f"Bearer {key}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                answers = json.load(resp)["answers"]
            return {qid: float(a["noul"]) for qid, a in answers.items()}
        except urllib.error.HTTPError as e:
            if e.code in (429, 529) and attempt < tries - 1:
                time.sleep(2 ** attempt * 2)
                continue
            raise RuntimeError(f"TypeSafe answered {e.code}: {e.read()[:200].decode(errors='replace')}")
    raise RuntimeError("TypeSafe stayed busy")


def verdicts(path, rules, probabilities):
    """Turn the probabilities into findings. Returns (think_more, worth_a_look)."""
    think, look = [], []
    for r in rules:
        p = probabilities.get(r["id"])
        if p is None:
            continue
        item = {"file": path, "rule": r["rule"], "source": r["source"], "p": p, "detail": r["breaks"]}
        if p >= THINK_MORE:
            think.append(item)
        elif p >= WORTH_A_LOOK:
            look.append(item)
    return think, look

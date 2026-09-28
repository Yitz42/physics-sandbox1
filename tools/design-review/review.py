#!/usr/bin/env python3
# review.py — the design review: checks each piece of work against the project's
# design rules before Claude calls it done, and sends it back to think more if not.
#
# It runs itself, as two Claude Code hooks (set up in .claude/settings.json):
#   review.py start   when the owner sends a request: photographs the project folder
#   review.py stop    when Claude is about to finish: compares with the photograph,
#                     checks what changed, and if a rule looks broken, hands Claude
#                     the list and makes it carry on (it gets ONE such nudge per request,
#                     so it can never loop forever; a second one is only shown to the owner)
# Or by hand, from the project folder:
#   python3 tools/design-review/review.py check              changes since the last commit
#   python3 tools/design-review/review.py check --since main changes since a branch or commit
#   … add --dry-run to see which rules would be asked about, without calling TypeSafe.
#
# The rules: rules.py (judged by TypeSafe's Jev model) and checks.py (exact, plain code).
# Tests: python3 tools/design-review/test_review.py
#
# It must never get in the way: if anything goes wrong (no API key, no internet,
# TypeSafe down), it says so quietly and lets the work finish.

import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # so the files beside this one can be imported

import changes
import checks
import judge

MAX_FILES = 15  # files sent to TypeSafe per review (keeps a huge change quick and cheap)


def review(before, after, cwd, dry_run=False):
    """Check everything that changed between two photographs of the project.
    Returns {"think": […], "look": […], "notes": […], "asked": [(file, [rule ids])]}."""
    files = changes.changed_files(before, after, cwd)
    think, look, notes, asked = [], [], [], []

    # The exact rules, file by file and then for the turn as a whole.
    for path, _ in files:
        full = os.path.join(cwd, path)
        text = open(full, encoding="utf-8", errors="replace").read() if os.path.isfile(full) else ""
        think += checks.check_file(path, text, *changes.line_counts(before, after, path, cwd))
    think += checks.check_turn([p for p, _ in files])

    # The judged rules: one TypeSafe request per file that has any.
    jobs = [(p, checks.judged_rules_for(p)) for p, _ in files]
    jobs = [(p, rules) for p, rules in jobs if rules]
    if len(jobs) > MAX_FILES:
        notes.append(f"{len(jobs)} files changed; the first {MAX_FILES} were sent for the AI review.")
        jobs = jobs[:MAX_FILES]
    asked = [(p, [r["id"] for r in rules]) for p, rules in jobs]
    if dry_run or not jobs:
        return {"think": think, "look": look, "notes": notes, "asked": asked}
    key = judge.api_key()
    if not key:
        notes.append("AI review skipped: no TypeSafe API key (set TYPESAFE_API_KEY or create ~/.typesafe_api_key).")
        return {"think": think, "look": look, "notes": notes, "asked": asked}

    def one(job):
        path, rules = job
        diff = changes.file_diff(before, after, path, cwd)
        return path, rules, judge.ask(judge.build_request(path, diff, rules), key)

    with ThreadPoolExecutor(max_workers=4) as pool:
        for fut in [pool.submit(one, j) for j in jobs]:
            try:
                path, rules, probs = fut.result()
            except Exception as e:  # a failed file is noted, never treated as a broken rule
                notes.append(f"AI review of a file failed: {e}")
                continue
            t, l = judge.verdicts(path, rules, probs)
            think += t
            look += l
    return {"think": think, "look": look, "notes": notes, "asked": asked}


def describe(item):
    """One finding, in words."""
    ai = f"; AI: {round(item['p'] * 100)}% likely broken" if "p" in item else ""
    return f"• {item['file']}: {item['rule']}\n    [{item['source']}{ai}]\n    {item['detail']}"


def message_for_claude(result):
    parts = ["Design review: before finishing, look again at the points below. They come from this "
             "project's design rules (CLAUDE.md and docs/). For each one, either fix it, or, if it doesn't "
             "really apply, tell the owner in one plain line why. Points marked AI are an automatic "
             "reviewer's judgement, not a failed test.", ""]
    parts += [describe(i) for i in result["think"]]
    if result["look"]:
        parts += ["", "Also worth a quick look (less sure):"] + [describe(i) for i in result["look"]]
    return "\n".join(parts)


def read_hook_input():
    if sys.stdin.isatty():
        return {}
    try:
        return json.load(sys.stdin)
    except ValueError:
        return {}


def run_start(cwd, hook):
    changes.save_start(cwd, hook.get("session_id"), changes.snapshot(cwd))


def run_stop(cwd, hook):
    """Returns the exit code: 2 sends the message back to Claude to keep working."""
    start = changes.load_start(cwd, hook.get("session_id"))
    if not start:
        return 0  # the hooks were switched on mid-request: nothing to compare with
    now = changes.snapshot(cwd)
    if now == start:
        return 0  # nothing changed (a question answered, not code written)
    result = review(start, now, cwd)
    if not result["think"]:
        # All clear. Anything the owner should know (a skipped AI review, a
        # less-sure point) is shown to them, not to Claude.
        extra = result["notes"] + [describe(i) for i in result["look"]]
        if extra:
            print(json.dumps({"systemMessage": "Design review: no rule looks broken.\n" + "\n".join(extra)}))
        return 0
    if hook.get("stop_hook_active"):
        # Claude has already had its one nudge this request: tell the owner instead.
        print(json.dumps({"systemMessage": "Design review still has doubts after a second look:\n"
                          + "\n".join(describe(i) for i in result["think"])}))
        return 0
    print(message_for_claude(result), file=sys.stderr)
    return 2


def run_check(cwd, args):
    since = args[args.index("--since") + 1] if "--since" in args else "HEAD"
    dry = "--dry-run" in args
    result = review(changes.tree_of(since, cwd), changes.snapshot(cwd), cwd, dry_run=dry)
    for path, ids in result["asked"]:
        print(f"{'would ask' if dry else 'asked'} about {path}: {', '.join(ids)}")
    for n in result["notes"]:
        print("note:", n)
    if result["think"]:
        print("\n" + message_for_claude(result))
        return 1
    print("\nNo rule looks broken." if not dry else "\n(dry run: exact rules checked, TypeSafe not called)")
    for i in result["look"]:
        print(describe(i))
    return 0


def main(argv):
    mode = argv[1] if len(argv) > 1 else "check"
    hook = read_hook_input() if mode in ("start", "stop") else {}
    cwd = hook.get("cwd") or os.getcwd()
    try:
        cwd = changes.git("rev-parse", "--show-toplevel", cwd=cwd).strip()
        if mode == "start":
            run_start(cwd, hook)
            return 0
        if mode == "stop":
            return run_stop(cwd, hook)
        return run_check(cwd, argv[2:])
    except Exception as e:
        if mode == "check":
            raise
        # A hook that fails must never block the owner's request or Claude's answer.
        if mode == "stop":
            print(json.dumps({"systemMessage": f"Design review couldn't run: {e}"}))
        return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

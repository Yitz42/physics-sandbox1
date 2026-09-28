# Design review

Checks Claude's work against the project's design rules **before** Claude says it's done.
If a rule looks broken, Claude is sent back once to fix it (or to tell you in one line
why the rule doesn't apply). It is a tool for building the game; students never see it.

## What it checks

- **Exact rules** (plain code, `checks.py`, free, always on): shared code never imports a
  subject; no libraries imported outside index.html; files growing past ~200 lines;
  subject code changed with no new test.
- **Judged rules** (`rules.py`, asked of TypeSafe's Jev model): comments explain why;
  wrong-answer feedback names the likely mistake; plain, short student text; hints don't
  give the answer away; explanations say why; SI units and sign conventions; new
  situations go in the lesson library; build stages can't be passed by guessing;
  shared code knows no subject. Each comes back as a probability the rule is broken:
  70% or more sends Claude back; 50–70% is mentioned to you only.

It looks only at what changed during one request, even if Claude committed along the way,
and never touches what's staged for a commit. If TypeSafe is down or there's no key, the
exact rules still run and the rest is skipped with a note — it never blocks work.

## Switching it on (once)

1. Get an API key from https://typesafe.ai and save it on this Mac (it's never put in the
   project). In Terminal, run this, paste the key when asked, and press Return:

   ```bash
   read -s "k?Paste your TypeSafe key: " && printf '%s' "$k" > ~/.typesafe_api_key && chmod 600 ~/.typesafe_api_key
   ```

2. Add the two hooks to `.claude/settings.json` in the project folder (create the file if
   it isn't there):

   ```json
   {
     "hooks": {
       "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "python3 \"$CLAUDE_PROJECT_DIR/tools/design-review/review.py\" start" }] }],
       "Stop": [{ "hooks": [{ "type": "command", "command": "python3 \"$CLAUDE_PROJECT_DIR/tools/design-review/review.py\" stop", "timeout": 120 }] }]
     }
   }
   ```

3. Start a new Claude session. It's on.

## By hand

```bash
python3 tools/design-review/review.py check --dry-run
```
lists which rules would be asked about for everything changed since the last commit
(without calling TypeSafe); drop `--dry-run` to run the full review. `--since main`
reviews everything since a branch or commit instead.

## Changing the rules

A new rule is agreed with the owner and written in its doc (CLAUDE.md or docs/) first;
then, if it's worth checking on every change, add it to `rules.py` (judged) or
`checks.py` (exact), with a test in `test_review.py`.

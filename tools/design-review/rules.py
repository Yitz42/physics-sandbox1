# rules.py — the project's design rules, as the design review checks them.
#
# Two kinds of rule:
#   JUDGED  rules that need reading and understanding ("does this hint give the
#           answer away?"). These are sent to TypeSafe's Jev model, which answers
#           each one as a probability that the change BREAKS the rule.
#   CODED   rules that are exact ("does a core file import from subjects/?").
#           These are plain Python checks in checks.py: no AI needed, never wrong.
#
# Every rule names the doc it comes from. When the owner agrees a new rule, add it
# to that doc first, then here if it's worth checking on every change.
#
# How a JUDGED rule is written (these fields go to the model word for word):
#   files   which changed files it applies to ("*" also matches "/" here, so
#           "src/*.js" means every .js file anywhere under src/)
#   skip    files it never applies to, even if they match `files`
#   rule    the rule itself, in one or two sentences
#   breaks  what a change that BREAKS the rule looks like (the model's "yes")
#   keeps   what a change that keeps it looks like — including "the rule doesn't
#           apply to this change", so that an unrelated edit is never flagged

CONTENT = ["content/*.js"]
STAGE_FILES = ["content/*/*/[1-6]-*.js"]  # one unit's stage files, e.g. content/statics/moments/3-build.js
LESSONS = STAGE_FILES + ["content/*/library/*.js", "content/*/shared/*.js"]  # where hints, answers and explanations are written
DRAWING = ["*-scene.js", "*-layout.js", "src/render/*"]  # pictures only: no student messages in them

JUDGED = [
    {
        "id": "comments-explain-why",
        "source": "CLAUDE.md (About the owner)",
        "files": ["src/*.js"],
        "rule": "The owner cannot read code, so code is commented generously, and comments explain WHY "
                "(the reason, the physics, the teaching purpose), not only WHAT the line does.",
        "breaks": "The change adds new logic (a function, a calculation, a special case, a rule) with no "
                  "comment explaining its purpose or the reason behind it.",
        "keeps": "The new logic is explained by comments, or the change is too small or self-explanatory "
                 "to need one (a renamed variable, a changed number, a text edit).",
    },
    {
        "id": "wrong-answer-feedback-explains",
        "source": "CLAUDE.md (Challenge types)",
        "files": ["src/challenges/*.js", "src/subjects/*.js"] + LESSONS,
        "skip": DRAWING,
        "rule": "Feedback on a wrong answer explains the likely mistake (a wrong sign, a missed force, the "
                "wrong moment arm, sin and cos swapped …), not just that the answer is incorrect.",
        "breaks": "The change adds a message shown to a student after a wrong answer that only says it is "
                  "wrong or to try again, without naming what was probably done wrong or what to re-check.",
        "keeps": "Every wrong-answer message the change adds names a likely mistake or exactly what to "
                 "re-check, or the change adds no wrong-answer messages at all.",
    },
    {
        "id": "plain-short-student-text",
        "source": "docs/TEACHING.md (Predict first: little reading)",
        "files": CONTENT,
        "rule": "Text shown to students (mission, instructions, hints, questions, choices, explanations) "
                "is short, plain English for a first-year engineering student.",
        "breaks": "Student-facing text the change adds is long-winded, hard to follow, or uses programmer "
                  "words a student wouldn't know (setup, solver, path, array, null, a variable name).",
        "keeps": "The student-facing text added is short and plain, or the change adds no text a student "
                 "would read.",
    },
    {
        "id": "hints-guide-not-give",
        "source": "docs/TEACHING.md (Wrong answers: Show answer is the way to see it)",
        "files": LESSONS,
        "rule": "Hints point to the method (which equation, which force, which angle, which point to take "
                "moments about) without handing over the final number the student is asked for.",
        "breaks": "A hint the change adds states the final numeric answer to the question being asked, "
                  "or works the whole calculation through to it.",
        "keeps": "The hints added guide the method but leave the final answer to the student, or the "
                 "change adds no hints.",
    },
    {
        "id": "explanation-says-why",
        "source": "docs/STAGES.md (explanation: why the answer is what it is)",
        "files": LESSONS,
        "rule": "A stage's `explanation` (shown after it is solved) says WHY the answer is what it is: "
                "the principle or reasoning behind it.",
        "breaks": "An explanation the change adds only repeats the answer or says 'well done' without "
                  "giving the reason or principle.",
        "keeps": "The explanations added give the reasoning, or the change adds no explanation.",
    },
    {
        "id": "si-units-and-signs",
        "source": "CLAUDE.md (Physics conventions)",
        "files": LESSONS + ["src/subjects/*.js"],
        "skip": DRAWING,
        "rule": "SI units (m, kg, N, N·m, Pa and their prefixes like kN, mm, MPa; g = 9.81 m/s²); +x right, "
                "+y up, counterclockwise moments positive. Agreed exceptions: distributed loads (Unit 4.6) "
                "take down as positive; truss members take tension as positive.",
        "breaks": "The change uses US units (lb, ft, in, kip, psi), a value of g other than 9.81, or a sign "
                  "convention against the rule (clockwise positive, +y down) outside the agreed exceptions.",
        "keeps": "Units and signs follow the rule or an agreed exception, or the change involves no units "
                 "or signs (for example the Automatic Controls course).",
    },
    {
        "id": "situations-in-library",
        "source": "docs/STAGES.md (The lesson library)",
        "files": STAGE_FILES,
        "rule": "New situations (a named setting with its own picture: a crate on cables, a balloon, a jib "
                "crane …) are written in the lesson library, content/<course>/library/, and stages take "
                "them with use(...) or edit(...), so other stages can reuse them.",
        "breaks": "The change adds a new entry to a stage's `situations` list with its own full setup "
                  "(bodies, forces, supports or loads) written inline in the stage file.",
        "keeps": "New situations come from the library through use(...) or edit(...), or the change adds "
                 "no new situation (editing text, numbers, hints, or a single explore setup).",
    },
    {
        "id": "build-not-guessable",
        "source": "docs/TEACHING.md (Build stages must not be passable by guessing)",
        "files": ["content/*/*/3-build*.js"],
        "rule": "A build stage must not be passable by trial and error: if a student could move the sliders "
                "until Test says yes, the stage sets goal.predict so they must work out the key numbers of "
                "their own design before Test.",
        "breaks": "The build stage the change adds or edits could be passed by moving sliders until it "
                  "works, and it has no goal.predict asking for worked-out numbers.",
        "keeps": "The stage sets goal.predict, or its goal can't be reached by nudging sliders, or the "
                 "change doesn't touch how the stage is passed.",
    },
    {
        "id": "shared-code-knows-no-subject",
        "source": "CLAUDE.md (Rules that keep it extensible)",
        "files": ["src/core/*.js", "src/challenges/*.js", "src/render/*.js"],
        "rule": "src/core, src/challenges and src/render know no specific subject: physics of one subject "
                "(statics formulas, trusses, beams, block diagrams) or a particular unit or stage belongs in "
                "src/subjects/<subject>/, which registers it with the core.",
        "breaks": "The change puts code specific to one subject, unit or stage (its physics, its ids, "
                  "special cases for it) into core, challenges or render.",
        "keeps": "The code added is general (it would work for statics, controls, materials or dynamics "
                 "alike), or it only adds a general hook that a subject fills in.",
    },
]

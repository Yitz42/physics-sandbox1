# Engineering Mechanics Sandbox — Project Guide for Claude

## What this is
A browser game that teaches engineering mechanics to intro engineering students.
Players build structures from blocks and members, attach supports, apply loads, and
press Play. The game shows free-body diagrams and the governing equations, first in
symbols, then with numbers substituted, so students see how forces become formulas.

Phase 1 goal: cover all of an intro statics course (see `docs/CURRICULUM.md`).
A second course, **Automatic Controls**, follows the owner's class textbook (Nise,
Control Systems Engineering, 7th ed.); its units are planned and listed as
"Coming soon", built the same way as statics.
Later phases add mechanics of materials (stress at a point, Mohr's circle, beam
stresses) and dynamics. The architecture must make those additions possible without
rewriting the statics code.

## About the owner
The owner (Yitz) has no coding experience. Therefore:
- Explain what you did in plain language after each step, and exactly how to test it
  (which file to open, what to click, what should appear).
- Comment code generously: explain *why*, not just *what*.
- Never leave the project in a broken state at the end of a step.
- When a decision is about physics or teaching design, ask the owner. When it is
  purely technical, decide yourself and say what you chose in one line.
- Commit to git after each working step with a clear message, so there are save points.

## Tech rules
- Plain JavaScript with ES modules. No TypeScript, no build step, no frameworks.
- Runs by opening `index.html` through VS Code's Live Server extension.
- Libraries load from a CDN in `index.html` only:
  - math.js: solving linear systems
  - KaTeX: rendering equations
  - three.js: only for 3D statics units, later
  - Matter.js or a custom integrator: only for dynamics, later
- Keep files small and single-purpose. Split any file growing past ~200 lines.
- Student progress is saved in the browser (localStorage, wrapped in try/catch).

## Architecture (in short — the full map is docs/ARCHITECTURE.md)
- `src/core/` shared tools that know no physics topic (runner, content loading,
  the lesson library, progress, the learning record, equations, vectors).
- `src/challenges/` the six challenge types; `src/render/` drawing only;
  `src/ui/` pages and controls (incl. the picture gallery, #/gallery).
- `src/subjects/<subject>/` one plug-in per subject (statics, controls …) that
  registers its solvers. `content/<course>/` the courses: one folder per unit,
  `library/` for situations shared between stages. `tests/tests.html` runs every test.

### Rules that keep it extensible
- `core/`, `challenges/`, and `render/` never import from a specific subject.
- A subject registers its solvers with the core; stages name the solver they need.
- Adding a stage or unit means adding content files only, never engine changes.
  If a stage genuinely needs new physics, add it to the subject's solver in a general
  way first, with tests.
- Adding a new subject (materials, dynamics) means adding a folder under
  `subjects/` and `content/`, not editing statics.

## Challenge types
Each unit tests one concept several ways. Stages are built from these reusable types:

| Type | What the student does | What it tests |
|---|---|---|
| explore | Free sandbox with sliders; equations update live | Intuition |
| predict | Enters a number (e.g. a reaction) before pressing Test; Test reveals the answer | Can they compute it |
| build | Meets a goal with limited parts (e.g. "support this load using 2 supports") | Can they design with it |
| debug | Given a wrong free-body diagram or equation; must find and fix the error | Can they spot mistakes |
| concept-check | Multiple choice or "which one is true", with explanation after | Do they understand why |
| solve | Full textbook-style problem, step by step: draw FBD → write equations → solve | Can they do the whole process |

Feedback on wrong answers must explain the likely mistake (wrong sign, missed
force, wrong moment arm), not just say "incorrect".

## Where the detailed rules live — read the one that fits before working
| Working on … | Read first |
|---|---|
| a stage, unit or new situation (content files) | `docs/STAGES.md`, `docs/TEACHING.md` |
| anything drawn: src/render/, a subject's *-scene.js, a new picture | `docs/PICTURES.md` |
| how the game teaches: feedback, page flow, challenge types | `docs/TEACHING.md` |
| the learning record, scoring, renaming a unit or stage | `docs/LEARNING-RECORD.md` |
| where a file belongs, or adding a subject | `docs/ARCHITECTURE.md` |
| what each unit teaches | `docs/CURRICULUM.md` |
New rules agreed with the owner go in the matching file, not here (keep this file short).
Two rules for all work: new situations go in the lesson library (`content/<course>/library/`)
so any stage can use them; every picture must pass the picture test (labels keep clear of objects).

## Physics conventions
- SI units by default: m, kg, N, N·m, g = 9.81 m/s².
- +x right, +y up, counterclockwise moments positive. For 3D, right-handed x, y, z.
- Equations are shown in symbols first, with a toggle to substitute numbers.
- Clicking an arrow highlights its term in the equation, and the reverse.
- The rigid-body solver must classify every structure:
  - fewer unknowns than equations, or improper supports → unstable (moves on Play)
  - more unknowns than equations → statically indeterminate (explain; don't fake it)
  - otherwise determinate → show the solution

## Testing
- Every solver feature gets tests in `tests/` using textbook-style problems with
  hand-computed answers written in the test.
- Run `tests/tests.html` after any engine change. Never finish a step with a failing test.
- The owner cannot review code, so tests are how correctness is verified.
  Say how many tests pass at the end of each step.

## Working style
- Build in small steps, following the phases in `docs/CURRICULUM.md`.
- At the end of each step: summary in plain language, how to test it, test results,
  git commit.

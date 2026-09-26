# Engineering Mechanics Sandbox — Project Guide for Claude

## What this is
A browser game that teaches engineering mechanics to intro engineering students.
Players build structures from blocks and members, attach supports, apply loads, and
press Play. The game shows free-body diagrams and the governing equations, first in
symbols, then with numbers substituted, so students see how forces become formulas.

Phase 1 goal: cover all of an intro statics course (see `docs/CURRICULUM.md`).
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

## Architecture
```
index.html                 entry point: course menu → unit → stage
style.css
src/
  core/                    shared by every subject, knows no physics topic
    vector.js              2D/3D vector math
    units.js               unit formatting (N, kN, m, N·m)
    equations.js           builds symbolic + numeric equation strings for KaTeX
    runner.js              loads a stage, runs its challenge, tracks completion
    progress.js            saves which stages a student finished
  challenges/              reusable ways of testing understanding (see below)
    explore.js  predict.js  build.js  debug.js  concept-check.js  solve.js
  render/                  drawing only, no physics
    canvas.js  arrows.js  fbd.js  diagrams.js  panel.js
  ui/
    controls.js  menus.js  feedback.js
  subjects/                one folder per subject; each is a plug-in
    statics/
      index.js             registers the statics solvers with the core
      particle.js          concurrent forces, ΣF = 0
      moment.js            moments about a point: M = Fd = xFy − yFx, balance ΣM = 0
      rigid-body.js        ΣF = 0, ΣM = 0, supports, determinacy check
      truss.js             method of joints and method of sections
      frame.js             frames and machines, multi-body
      internal-forces.js   shear and moment at a cut, V and M diagrams
      friction.js          dry friction, impending motion, wedges, belts
      geometry.js          centroids, area moments of inertia
    materials/             later: stress, strain, Mohr's circle
    dynamics/              later
content/
  statics/
    course.js              ordered list of units
    01-force-vectors/
      unit.js              concept, learning goals, ordered list of stages
      1-explore.js  2-predict.js  3-build.js  4-debug.js  5-solve.js
    02-.../
tests/
  tests.html               open with Live Server: runs every test, shows pass/fail
  statics/*.test.js        textbook problems with known answers
docs/
  CURRICULUM.md            what each unit teaches and how it is tested
```

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

## Stage file format
```js
export default {
  id: "03-moments/2-predict",
  challenge: "predict",          // one of the challenge types
  solver: "statics.rigidBody",   // solver registered by the subject
  title: "Balance the Seesaw",
  instructions: "Plain-language instructions shown to the student.",
  setup: { bodies: [...], supports: [...], loads: [...] },
  editable: ["loads.0.position"],
  ask: { quantity: "supports.0.Ry", units: "N", precision: 0.1 }, // predict/solve; ±0.1 is the default
  goal: null,                    // used by build challenges
  hints: ["First hint", "Second hint"],
  explanation: "Shown after completion: why the answer is what it is.",
};
```

## Teaching decisions (agreed with the owner)
- **Angles, textbook style**: directions are given as an angle from the nearest axis
  (`{ angle: 30, from: "-x", toward: "+y" }`), a slope triangle (`{ slope: [-4, 3] }`),
  or a word (`"down"`). Students pick sin/cos and signs by looking at the picture.
- **Wrong answers**: unlimited tries with specific feedback. After 2 wrong tries a
  "Show answer" button appears. Showing the answer records the stage as
  **needs practice** — an internal record only, never shown to the student — and
  the student gets a new version with different numbers (the stage's `vary` rules;
  debug uses the next `mutation`, concept-check the next question). Only solving a
  version without help marks it **complete** (shown as a centred "Stage complete" card).
- After a wrong numeric answer, the picture shows a faint dashed **shadow** of what the
  student's numbers would look like (their force, their tensions plus the ΣF they leave
  unbalanced, or their resultant), drawn to the same scale as the real arrows.
- Moments: counterclockwise positive; students type clockwise moments as negative
  numbers. Answer precision: ±0.1 N and ±0.1 N·m for forces and moments, ±0.01 m
  for distances (set per ask with `precision`).
- Nothing moves on by itself: after a correct step the student presses **Next step →**,
  and a finished stage shows **Continue →**, which opens the "Stage complete" card.
- The check button is called **Test** (not "Play"). Answer boxes show the accepted
  precision next to the unit. Numeric answers must be within **±0.1** of the true
  value in its unit (±0.1 N, ±0.1°), unless a stage sets `ask.precision`.
- **Drawing FBDs** (solve challenge): click a force in the palette; a faint shadow
  arrow follows the pointer, snapping to allowed directions; click to place. Dragging
  from the palette also works (touchscreens). The palette includes tempting wrong
  forces, each with its own explanation.
- Every unit uses all six challenge types: explore → predict → build → debug →
  concept-check → solve.

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

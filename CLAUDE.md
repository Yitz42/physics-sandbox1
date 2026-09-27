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
    record-file.js         the learning-record file: export / import, built to survive game changes
    evidence.js            a quiet record of every answer checked (localStorage)
    diagnosis.js           kinds of mistake, each a MATH error or an OBJECT error
    comprehension.js       scores units, chapters and courses from the record
    pace.js                how long answers take: fast/slow/rushing/left-the-page signals
    poly.js                polynomials in s and fractions of them (transfer functions)
    symbolic.js            polynomials in named symbols (G₁G₂/(1 + G₂H₂) …)
  challenges/              reusable ways of testing understanding (see below)
    explore.js  predict.js  build.js  debug.js  concept-check.js  solve.js
    (debug view "steps" and solve step "choices" take their lines from the solver)
  render/                  drawing only, no physics
    canvas.js  arrows.js  fbd.js  diagrams.js  panel.js
    objects.js (motor, lamp, eyebolt …)  mechanisms.js (springs, pulleys)
    scenery.js (traffic light, balloon, street pole)
    blocks.js (block diagrams, signal-flow graphs)
  ui/
    controls.js  menus.js  feedback.js  stage-view.js  comprehension-view.js (the Comprehension window)
    chrome.js (the top tab menu, the unit progress bar)  data-panel.js (export / import on the home page)
  subjects/                one folder per subject; each is a plug-in
    statics/
      index.js             registers the statics solvers with the core
      particle.js          concurrent forces, ΣF = 0; unit and position vectors; springs (F = ks);
                           pulleys (forces sharing one tension)
      moment.js            moments about a point: M = Fd = xFy − yFx (Varignon), balance ΣM = 0
      couple.js            couples: M = Fd about any point, equivalent couples, ΣM of couples
      equivalent.js        equivalent systems: F_R = ΣF, (M_R)_O = ΣM_O, single resultant position
      distributed.js       distributed loads: area and centroid (rectangle, triangle, trapezoid, ∫w dx)
      supports.js          support types → reactions (pin, roller, smooth, cable, fixed)
      rigid-body.js        ΣF = 0, ΣM = 0, supports, determinacy check
      truss.js             method of joints and method of sections
      frame.js             frames and machines, multi-body
      internal-forces.js   shear and moment at a cut, V and M diagrams
      friction.js          dry friction, impending motion, wedges, belts
      geometry.js          centroids, area moments of inertia
    controls/              automatic controls: block-diagram.js (+ block-tools.js,
                           block-layout.js) and signal-flow.js (Mason's rule); index.js
                           lists the solvers planned for later chapters
    materials/             later: stress, strain, Mohr's circle
    dynamics/              later
content/
  statics/
    course.js              chapters (following the textbook), each an ordered list of units;
                           planned units are listed as soon(...) and shown as "Coming soon"
    reading.js             the free textbook, and its chapter for each course chapter
    shared/                setups used by several units (angle-options.js, crate.js,
                           hanging.js: traffic light, balloon, lamp pulled aside)
    force-components/      one folder per unit (one concept), named after it
      unit.js              concept, learning goals, ordered list of stages
      1-explore.js  2-predict.js  3-build.js  4-debug.js  5-concept-check.js  6-solve.js
    cartesian-vectors/ …
  controls/                same layout: course.js (chapters follow Nise), reading.js
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
  mission: "Predict where child B must sit to balance the seesaw.", // one line, shown as MISSION:
  instructions: "Plain-language instructions shown to the student.",
  setup: { bodies: [...], supports: [...], loads: [...] },
  editable: ["loads.0.position"],
  ask: { quantity: "supports.0.Ry", units: "N", precision: 0.1 }, // predict/solve; ±0.1 is the default
  goal: null,                    // used by build challenges; goal.predict: numbers the student
                                 // must work out for their own design before each Test
  hints: ["First hint", "Second hint"],
  explanation: "Shown after completion: why the answer is what it is.",
};
```

A stage can be split into **parts** that run in order ("Part 2 of 3: …"):
`{ id, challenge, title, solver, explanation, parts: [ {...}, {...} ] }`. Each part
is written like a whole stage (title, instructions, setup, vary, ask, hints,
explanation…) and takes the stage's id, challenge type, title and (by default)
solver. The part reached is saved; the stage is complete after the last part.
`vary` rules apply in order; `{ paths: [a, b], values }` puts one value at several paths.

A stage (or part) can also give several **situations**: the same idea in different
settings, each with its own picture (a crate on two cables, a traffic light between
poles, a balloon held down by tethers …):
`{ id, challenge, title, solver, ask, explanation, situations: [ { name, instructions, setup, vary, hints, … }, … ] }`.
Each situation replaces the stage fields it sets. Every new version plays a
different situation (all are seen before any repeats), then new numbers from its `vary`.

## Teaching decisions (agreed with the owner)
- **Angles, textbook style**: directions are given as an angle from the nearest axis
  (`{ angle: 30, from: "-x", toward: "+y" }`), a slope triangle (`{ slope: [-4, 3] }`),
  a word (`"down"`), or two points (`{ points: [[1, 2], [5, 5]], names: ["A", "B"] }`,
  a cable from A to B). Students pick sin/cos and signs by looking at the picture.
- **Chapters and units**: the course is grouped into chapters that follow the
  textbook's chapters; each unit is ONE concept (e.g. Springs, Pulleys, Varignon's
  theorem) with all six stages. Units are numbered by chapter: 2.2 = chapter 2, unit 2.
  A new concept gets its own unit in the matching chapter. (Parts inside a stage are
  still available, e.g. unit vectors and cables as two parts of one Predict stage.)
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
- Page layout ("simulation lab" look, agreed with the owner): a tab at the top centre
  ("STATICS SIMULATION LAB") opens a menu on hover or tap: Home, back to the unit, the
  unit's stages (ticked when done), and a greyed "Account — coming soon" slot. The
  stage title sits top left with a progress bar top right showing **stages done in
  this unit**. No stage-type tag on the stage page. The panel starts with
  **MISSION:** (the stage's `mission` line), explore objectives are titled
  "Challenge objectives" and still tick themselves (no Test button in explore). The
  hint button sits bottom left of the panel and the main button (Test, Continue →)
  bottom right.
- Picture rules (agreed with the owner): an arrow pushing on a body ends ON its
  surface and is labelled at its outer end; other arrows start exactly at their
  point and are labelled just past the tip, in line (below a downward arrow).
  A resultant (F_R) is labelled at its top. Point and support letters sit as
  close to their point as they can (below first, else right beside it). Angle
  numbers sit just outside the arc, inside the angle next to its reference line,
  which is extended past the number. Dimension values sit IN their line (with a
  break); thin extension lines run from each dimension's ends to just short of
  the body; a dimension an arrow crosses moves down below the arrow and its
  label; any faint line under a label breaks around it. Beams on supports with
  no dimensions of their own are dimensioned automatically (supports, loads,
  overall length). Labels have no background box. A moment label that runs into something becomes its name
  ("M") with the value in the corner list; a stage can list every value there
  (`listValues: true`). Pictures without sliders or dragging are zoomed to fill
  the canvas. Real objects are drawn as themselves (wrench, trailer, eyebolt …).
- **Learning data** (agreed with the owner): the home page's "Learning data" panel
  exports everything this browser gathered (finished stages + every checked answer,
  with timing and mistake kinds) as ONE anonymous JSON file, and imports such a
  file by ADDING it (nothing is deleted, doubles are skipped). For now it's for the
  programmer; later, for teachers and students, files may be shrunk and encrypted.
  The format (src/core/record-file.js) must stay readable as the game changes:
  spelled-out field names with a dictionary, a format name + version, an
  `encoding` field ("none" for now), a snapshot of every course/unit/stage with
  titles (renamed stages are matched by title on import), and unknown fields are
  always kept. Change the format only by adding fields or raising the version.
- **Learning record, format 2** (owner's spec, 2026-09-27): every event has a type
  (stageStart, stageLeave, check, showAnswer, hint, exploreAction, complete,
  confidence), a random session id, app/content versions (src/core/version.js)
  and the time-zone offset. Checks store what was typed, the right value, units,
  tolerance and the round's `vary` numbers; FBD checks store the arrows drawn and
  expected; debug / concept-check / build store what was flagged, picked or
  designed. activeMs = time since the previous check in the round (or since the
  round started). Explore logs ONE summary per round, never every slider step.
  Storage is capped (5,000 events; oldest explore summaries go first).
  Privacy: no names, emails, account ids, IPs or device fingerprints; the only
  free text is what students type into answer boxes.
- Supports in pictures (agreed with the owner): a reaction arrow never runs
  through its support symbol — at a pin, roller or smooth surface it stops past
  the symbol (below a pin). A fixed support is a hatched block the body is
  mounted in, and the beam's end is square against it. Force arrows at a point
  with a moment arrow (M_A) stop outside the moment's circle.
- **Renaming a unit or stage**: add the old → new id to src/core/migrations.js
  (and bump CONTENT_VERSION in version.js). Saved progress, stored events and
  imported files are all translated there; old ids must never reach an export.
- **Mistake rules** (src/core/classify.js): after a solver's own slips, a wrong
  number is tested for sign, weight (×/÷ 9.81), sin/cos swap, radians and
  rounding (within 2%) before it counts as unexplained. The first check within
  8 s of a round starting is flagged as a fast guess. The "Sure / Not sure"
  tap (src/ui/confidence.js) is built but off until the owner switches it on.
- Side-by-side diagrams (space diagram | FBD, a couple | its replacement): every
  drawing and label stays in its own half — each half is sized for the picture
  both before and after the answer is shown, and anything that would still
  reach across the divider is clipped at it.
- Angle numbers stay with their arc: if the spot is taken, the arc grows outward
  and the dashed reference line extends to meet the number (render/angles.js).
- Nothing moves on by itself: after a correct step the student presses **Next step →**,
  and a finished stage shows **Continue →**, which opens the "Stage complete" card.
- The check button is called **Test** (not "Play"). Answer boxes show the accepted
  precision next to the unit. Numeric answers must be within **±0.1** of the true
  value in its unit (±0.1 N, ±0.1°), unless a stage sets `ask.precision`.
- **Drawing FBDs** (solve challenge): click a force in the palette; a faint shadow
  arrow follows the pointer, snapping to allowed directions; click to place. Dragging
  from the palette also works (touchscreens). The palette includes tempting wrong
  forces, each with its own explanation.
- **Build stages must not be passable by guessing.** When slider positions could be
  found by trial and error, the stage sets `goal.predict`: the student works out the
  key numbers for their own design (e.g. both tensions) before Test, and a changed
  design must be worked out again.
- **Different pictures each version**: predict, build and solve stages should
  have several `situations`, so a new version is a new picture to read, not the same
  one with new numbers. Started in Unit 2.1 Cables; roll out unit by unit once the
  owner has tried it.
- **Comprehension, not just completion**: students complete stages and units as
  usual; in the background every answer is recorded (core/evidence.js) and scored
  per unit, chapter and course (core/comprehension.js), shown in the Comprehension
  window on the Courses page (#/comprehension/<course>). Every mistake the game
  recognises names a kind (core/diagnosis.js) in one of three areas: **math errors**
  (signs, sin/cos, algebra, rounding, vectors), **object errors** (reading the
  picture: missed or extra force, wrong direction) and **physics errors** (a
  principle: W = mg, cables only pull, perpendicular moment arm, pulley tension,
  concept questions; in controls the block and loop rules). New mistakes in solvers,
  palettes, choices and debug steps must carry a `kind` — a test checks it.
- **Timing** (core/pace.js): every try is timed (only while the page is visible;
  time on other tabs is kept separately) and compared with an expected time
  (60 s per number, 60 s per FBD, 25 s per concept question …; a stage may set
  `expectedTime`) and with the student's own usual pace. Signals, never proof:
  very fast and right (outside help / AI?), rushing (fast and wrong — "lazy"),
  much slower than expected (struggling), left the page and came back right,
  much faster / slower than their usual pace (someone else doing the work?).
  Scoring (first proposal, owner may change): right first time 1, after one slip
  0.6, after more 0.3, with "Show answer" 0; a unit averages its 20 latest questions.
- Every unit uses all six challenge types: explore → predict → build → debug →
  concept-check → solve.
- Distributed loads (Unit 3.6) cover rectangles, triangles, trapezoids AND curved
  loads by integration ($F_R = \int w\,dx$). Loads push down, so Unit 3.6 takes down as positive.
- FBD reaction arrows (Unit 4.1 on), textbook rule: pin and fixed-support components
  (and the fixed-end moment) may point either way; rollers and smooth surfaces must
  push, cables must pull, weight points down. Some beams have mass, so the student
  must remember the weight W at the centre.
- Unit 4.1's solve stage goes all the way to the reactions (FBD → equations → answers);
  Unit 4.2 then goes deeper (choosing a smart moment point, harder shapes).

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

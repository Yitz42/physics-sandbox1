# Teaching decisions (agreed with the owner)

How the game teaches: answers, feedback, page layout, the flow of a stage, and unit-by-unit choices.
Read this before writing or changing stages or challenge types. Changing any of these is the owner's decision.

- **Angles, textbook style**: directions are given as an angle from the nearest axis
  (`{ angle: 30, from: "-x", toward: "+y" }`), a slope triangle (`{ slope: [-4, 3] }`),
  a word (`"down"`), or two points (`{ points: [[1, 2], [5, 5]], names: ["A", "B"] }`,
  a cable from A to B). Students pick sin/cos and signs by looking at the picture.
- **Chapters and units**: the course is grouped into chapters that follow the
  textbook's chapters, chapter for chapter (Chapter 5 = the book's Chapter 5); each unit is ONE concept (e.g. Springs, Pulleys, Varignon's
  theorem) with all six stages. Units are numbered by chapter: 3.2 = chapter 3, unit 2.
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
  ("STATICS SIMULATION LAB") opens a menu on hover or tap: Home; on the all-chapters
  page, every course; on a chapter page, every chapter; inside a unit, no chapter
  list — the way back (to the chapter from the unit's page, to the unit from a stage)
  and the unit's stages, ticked when done; and a greyed "Account — coming soon" slot.
  A chapter's and a unit's page title has a back arrow right beside it (to all
  chapters, or to the unit's chapter) instead of a text link: a plain blue chevron
  (two lines, no circle), with the small label above ("Chapter 3") flush with the
  title's text, not with the arrow (owner, 2026-09-27).
  The course page shows each chapter as a square **folder**: "Chapter N" on its tab at
  the top edge, then its title, progress, and its textbook link inside; a folder opens the
  chapter's page with its units. The
  stage title sits top left with a progress bar top right showing **stages done in
  this unit**. No stage-type tag on the stage page. The panel starts with
  **MISSION:** (the stage's `mission` line), explore objectives are titled
  "Challenge objectives" and still tick themselves (no Test button in explore). The
  hint button sits bottom left of the panel and the main button (Test, Continue →)
  bottom right.
- Units 5.4, 5.5 and 6.1 (the old Units 9, 10, 11): stability (degree of
  indeterminacy n − 3, improper supports), two-force members as a `link` support
  (one force along it, tension +) with the three-force lines drawn meeting at O
  (`showConcurrency`), and trusses (`statics.truss`, method of joints). Truss
  sign convention: every member assumed in TENSION, negative = compression;
  members red for tension, blue for compression, grey for zero-force.
- Math inside running text (explanations, hints, questions) is never split
  across lines: each formula is one box, so tall fractions push lines apart
  instead of overlapping.
- **Block diagram workbench** (agreed with the owner): the student makes a block
  (a name, and optionally a transfer function in s), chooses how it connects
  (series after/before, parallel ±, negative/positive feedback, or a unity loop),
  then drags it onto a block or group — or clicks it, hovers (the spot lights up
  and a preview under the picture shows the result) and clicks. To combine, they
  click the blocks of one group, name the rule, and TYPE the combined block's
  formula (G1 G2/(1 + G1 G2 H1)); it's checked by value, a classic slip is
  explained, Show answer after 2 tries; the group becomes G_e1, G_e2 …, with its
  formula in symbols and numbers. Lives in challenges/workbench.js (a build stage
  with `workbench: true`) and subjects/controls/block-edit.js / block-combine.js.
  It's both a free page (course.tools, shown at the top of the course page) and
  part 2 of the Block diagrams build stage.
- Solve stages never show the numbers still being asked for: the equations
  panel hides them (hideAnswers) until the answer step is done. After each
  solved step its hints go away; the next step gets fresh ones (solve.hints[step]).
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
  one with new numbers. Started in Unit 3.1 Cables; roll out unit by unit once the
  owner has tried it.
- Every unit uses all six challenge types: explore → predict → build → debug →
  concept-check → solve.
- Distributed loads (Unit 4.6) cover rectangles, triangles, trapezoids AND curved
  loads by integration ($F_R = \int w\,dx$). Loads push down, so Unit 4.6 takes down as positive.
- FBD reaction arrows (Unit 5.1 on), textbook rule: pin and fixed-support components
  (and the fixed-end moment) may point either way; rollers and smooth surfaces must
  push, cables must pull, weight points down. Some beams have mass, so the student
  must remember the weight W at the centre.
- Unit 5.1's solve stage goes all the way to the reactions (FBD → equations → answers);
  Unit 5.2 then goes deeper (choosing a smart moment point, harder shapes): built as
  rigid-body-equilibrium/ — the explore shows which unknowns stay in ΣM about the
  point chosen (setup.showMomentUnknowns / showMomentPoint), then an overhanging
  beam and a cantilever, a diving-board fulcrum, a debug of the equations, and an
  L-shaped jib crane.
- **Chapter challenge units** (agreed with the owner, 2026-09-27; first one Unit 2.4): a
  unit at the end of a chapter with harder problems that test comprehension in NEW
  situations, mixing the chapter's units. Still all six stage types. Working backwards
  (a known resultant, two unknown sizes) is written with `setup.target` + `symbol`
  (particle solver; the given resultant is drawn green, named and to scale).
  Unit 3.5 (owner's request): questions from the chapter's own units AND ones that
  combine them with earlier chapters. A known size the student must work out (a spring's
  force from its coordinates, a cable at its rating) is written `hideMagnitude: true`.
- **Predict first in explore stages** (owner, 2026-09-27: build intuition quickly, little
  reading). One question (`guess`, challenges/common/predict-first.js) before the numbers show
  and the sliders unlock; once answered, the choices disappear and one short line remains —
  the guess, the answer, and why. Recorded but never scored. (A second style, a one-tap
  up/down/same before each change, was tried and dropped: too much reading.) Every statics
  explore stage has one (a test checks: 3–4 choices, one right, a reason for each wrong one,
  a short question), aimed at the unit's most common misconception. Pictures that show an
  answer all the time (a resultant, a centroid) hide it until the guess (sceneOpts.preGuess).

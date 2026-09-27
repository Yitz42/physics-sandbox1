# Architecture: where everything lives
```
index.html                 entry point: course menu → unit → stage
style.css
src/
  core/                    shared by every subject, knows no physics topic
    vector.js              2D/3D vector math
    units.js               unit formatting (N, kN, m, N·m)
    equations.js           builds symbolic + numeric equation strings for KaTeX
    runner.js              loads a stage, runs its challenge, tracks completion
    library.js             the lesson library: shared situations (scenario, use, edit)
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
    labels.js (label placement, CLEAR)  bounds.js (the object-boundaries check)
    bar-label.js (values written along a bar)  regions.js (flat shapes filled in: a composite area's parts)
  ui/
    controls.js  menus.js  feedback.js  stage-view.js  comprehension-view.js (the Comprehension window)
    chrome.js (the top tab menu, the unit progress bar)  data-panel.js (export / import on the home page)
    gallery.js, gallery-items.js (#/gallery: every picture, for checking; also used by the picture test)
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
      rigid-body-sets.js   other sets of three equations (two moments + a force, three moments), Unit 4.3
      truss.js             method of joints
      truss-zero.js        zero-force members by inspection, Unit 5.2
      truss-section.js     method of sections, Unit 5.3
      frame.js             frames and machines, multi-body (frame-scene.js: put together / taken apart)
      internal-forces.js   shear and moment at a cut, V and M diagrams
      friction.js          dry friction, impending motion, wedges, belts
      centroid.js          centroids of composite areas, centres of gravity (centroid-scene.js), Unit 6.1
      geometry.js          later: area moments of inertia
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
    library/               the lesson library: situations with their questions, used by
                           any stage (hanging.js, beams.js, trusses.js, frames.js, shapes.js; see docs/STAGES.md)
    force-components/      one folder per unit (one concept), named after it
      unit.js              concept, learning goals, ordered list of stages
      1-explore.js  2-predict.js  3-build.js  4-debug.js  5-concept-check.js  6-solve.js
    cartesian-vectors/ …
  controls/                same layout: course.js (chapters follow Nise), reading.js
tests/
  tests.html               open with Live Server: runs every test, shows pass/fail
  statics/*.test.js        textbook problems with known answers
  content/stages.test.js   every stage loads, solves and varies; pictures.test.js: every picture passes
docs/
  CURRICULUM.md            what each unit teaches and how it is tested
  STAGES.md  TEACHING.md  PICTURES.md  LEARNING-RECORD.md  ARCHITECTURE.md   the detailed rules
```

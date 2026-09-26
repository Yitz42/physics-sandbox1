# Engineering Mechanics Sandbox

A browser game that teaches engineering mechanics to intro engineering students.
Students work with forces, beams and plates, and the game shows the free-body
diagrams and the equations behind them — first in symbols, then with the numbers
substituted — so they can see how forces become formulas.

The first course is **Statics**. Mechanics of materials and dynamics come later.

## What's in it so far

| Unit | Topic | What students learn |
|---|---|---|
| 1 | Forces as vectors | Components $F_x$, $F_y$; adding forces into a resultant |
| 2 | Equilibrium of a particle | $\Sigma F_x = 0$, $\Sigma F_y = 0$; cable tensions |
| 3 | Moment of a force | $M = Fd$, the moment arm, clockwise vs counterclockwise |
| 4 | Couples | Equal, opposite, offset forces; $M = Fd$ about any point; equivalent couples |
| 5 | Equivalent force systems | Replacing forces and couples with $F_R$ and $(M_R)_O$, or one force at the right spot |
| 6 | Distributed loads | A load's resultant is its area, at its centroid; trapezoids split up; curved loads by $\int w\,dx$ |
| 7 | Supports and free-body diagrams | Each support's reactions; drawing a rigid body's FBD; counting unknowns; reactions of a beam |

Every unit has six stages, each testing the idea a different way:

1. **Explore** — sliders and dragging; the picture and equations update live.
2. **Predict** — type a number, then press **Test**.
3. **Build** — meet a goal with limited parts.
4. **Debug** — find and fix a mistake in someone else's work.
5. **Concept check** — multiple choice, with an explanation for every wrong answer.
6. **Solve** — a full textbook problem, step by step.

Wrong answers get specific feedback (a wrong sign, a missing force, the wrong
moment arm …) and a faint "shadow" on the picture showing what the student's
numbers would look like. Every attempt uses random numbers, so neighbours get
different questions.

## How to run it

The game is plain HTML and JavaScript — there's nothing to install or build.

1. Open this folder in **VS Code**.
2. Install the **Live Server** extension (once).
3. Right-click `index.html` and choose **Open with Live Server**.

It has to be opened through Live Server (or any web server), not by
double-clicking the file, because the code is split into modules.

## How to check it works

Right-click `tests/tests.html` and choose **Open with Live Server**. It runs every
test — textbook problems with answers worked out by hand, plus checks on every
stage file — and should say **All … tests passed** in green.

## How it's organised

```
index.html            the page students open
style.css             how it looks
src/core/             shared machinery: vectors, units, equations, progress saving
src/challenges/       the six stage types (explore, predict, build, debug, concept-check, solve)
src/render/           drawing only: arrows, labels, beams, loads, supports, lamps, motors …
src/ui/               menus, buttons, feedback messages
src/subjects/statics/ the physics: one solver per topic (particle, moment, couple, equivalent, distributed, rigid body)
content/statics/      the lessons: one folder per unit, one file per stage
tests/                the test page and test files
docs/CURRICULUM.md    the plan for every unit
```

Adding a stage or a unit means adding files under `content/` — see
`docs/CURRICULUM.md` for the plan and `CLAUDE.md` for the full project guide.

## Libraries

Loaded from a CDN in `index.html`: [math.js](https://mathjs.org) for solving
equations and [KaTeX](https://katex.org) for drawing them. Student progress is
saved in the browser, so it stays on the computer they use.

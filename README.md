# Engineering Mechanics Sandbox

A browser game that teaches engineering mechanics to intro engineering students.
Students work with forces, beams and plates, and the game shows the free-body
diagrams and the equations behind them — first in symbols, then with the numbers
substituted — so they can see how forces become formulas.

The first course is **Statics**. A second course, **Automatic Controls**, is laid
out chapter by chapter following Nise's *Control Systems Engineering* (7th ed.),
with its units marked "Coming soon" until they're built. Mechanics of materials
and dynamics come later.

## What's in it so far

The course is grouped into chapters that follow a free textbook. Each unit teaches
one concept.

| Unit | Topic | What students learn |
|---|---|---|
| **Chapter 1** | **Forces and vectors** | |
| 1.1 | Force components and resultants | Components $F_x$, $F_y$; adding forces into a resultant |
| 1.2 | Cartesian vectors | $\mathbf{F} = F_x\mathbf{i} + F_y\mathbf{j}$, unit vectors, forces along a cable from coordinates |
| **Chapter 2** | **Equilibrium of a particle** | |
| 2.1 | Cables | $\Sigma F_x = 0$, $\Sigma F_y = 0$; cable tensions |
| 2.2 | Springs | $F = ks$: the stretch, and choosing a stiffness |
| 2.3 | Pulleys | The same tension on both sides of a frictionless pulley |
| **Chapter 3** | **Moments and static equivalence** | |
| 3.1 | Moment of a force | $M = Fd$, the moment arm, clockwise vs counterclockwise |
| 3.2 | Varignon's theorem | $M_O = xF_y - yF_x$: the moments of a force's components |
| 3.3 | Couples | Equal, opposite, offset forces; $M = Fd$ about any point; equivalent couples |
| 3.4 | Moving a force | A force moved to a point needs a couple $M = Fd$ |
| 3.5 | Equivalent force systems | Replacing forces and couples with $F_R$ and $(M_R)_O$, or one force at the right spot |

Every unit has six stages, each testing the idea a different way:

1. **Explore** — sliders and dragging; the picture and equations update live.
2. **Predict** — type a number, then press **Test**.
3. **Build** — meet a goal with limited parts.
4. **Debug** — find and fix a mistake in someone else's work.
5. **Concept check** — multiple choice, with an explanation for every wrong answer.
6. **Solve** — a full textbook problem, step by step.

A stage can also have several parts ("Part 2 of 3") that test related ideas the
same way; progress is saved part by part.

Each chapter links to the matching chapter of a free textbook
(*Engineering Statics: Open and Interactive*). The book is set in
`content/statics/reading.js`, so it can be swapped for another.

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
src/render/           drawing only: arrows, labels, beams, lamps, motors …
src/ui/               menus, buttons, feedback messages
src/subjects/statics/ the physics: one solver per topic (particle, moment, couple, equivalent)
content/statics/      the lessons: course.js (chapters), one folder per unit, one file per stage
tests/                the test page and test files
docs/CURRICULUM.md    the plan for every unit
```

Adding a stage or a unit means adding files under `content/` — see
`docs/CURRICULUM.md` for the plan and `CLAUDE.md` for the full project guide.

## Libraries

Loaded from a CDN in `index.html`: [math.js](https://mathjs.org) for solving
equations and [KaTeX](https://katex.org) for drawing them. Student progress is
saved in the browser, so it stays on the computer they use.

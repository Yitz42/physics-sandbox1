# Engineering Mechanics Sandbox

A browser game that teaches engineering mechanics to intro engineering students.
Students work with forces, beams and plates, and the game shows the free-body
diagrams and the equations behind them — first in symbols, then with the numbers
substituted — so they can see how forces become formulas.

The first course is **Statics**. Mechanics of materials and dynamics come later.

## What's in it so far

| Unit | Topic | What students learn |
|---|---|---|
| 1 | Forces as vectors | Components $F_x$, $F_y$; Cartesian form and unit vectors; forces along a cable from coordinates; adding forces into a resultant |
| 2 | Equilibrium of a particle | $\Sigma F_x = 0$, $\Sigma F_y = 0$; cable tensions; springs ($F = ks$); pulleys |
| 3 | Moment of a force | $M = Fd$, the moment arm, clockwise vs counterclockwise; Varignon's theorem |
| 4 | Couples | Equal, opposite, offset forces; $M = Fd$ about any point; equivalent couples |
| 5 | Equivalent force systems | Moving a force to a point (force + couple); replacing forces and couples with $F_R$ and $(M_R)_O$, or one force at the right spot |

Every unit has six stages, each testing the idea a different way:

1. **Explore** — sliders and dragging; the picture and equations update live.
2. **Predict** — type a number, then press **Test**.
3. **Build** — meet a goal with limited parts.
4. **Debug** — find and fix a mistake in someone else's work.
5. **Concept check** — multiple choice, with an explanation for every wrong answer.
6. **Solve** — a full textbook problem, step by step.

A stage can have several parts ("Part 2 of 3"), each testing another idea the same
way — for example Unit 1's Predict stage covers components, then the unit vector,
then a force along a cable. Progress is saved part by part.

Each unit page also links to the matching chapter of a free textbook
(*Engineering Statics: Open and Interactive*). The book is set in
`content/statics/reading.js`, so it can be swapped for another.

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
src/render/           drawing only: arrows, labels, beams, lamps, motors …
src/ui/               menus, buttons, feedback messages
src/subjects/statics/ the physics: one solver per topic (particle, moment, couple, equivalent)
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

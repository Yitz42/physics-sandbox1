// Unit 4.4, stage 4 — debug: a student's working when classifying a structure,
// with one wrong line (see src/subjects/statics/rigid-body-count.js).
// Situations (hand-checked):
//   propped cantilever: fixed A (3) + roller B (1) = 4 → degree 1. Mistake: fixed counted as 2.
//   three rollers: 1 + 1 + 1 = 3, but all parallel → improper. Mistake: called "stable".
//   pin A + rollers B, C: 2 + 1 + 1 = 4 → degree 1. Mistake: degree taken as n = 4.

const P = { id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2, 0], push: true };
const beam = (supports) => ({ analysis: "count", body: { points: [[0, 0], [6, 0]] }, supports, forces: [P] });

export default {
  id: "stability/4-debug",
  challenge: "debug",
  solver: "statics.rigidBody",
  title: "Check the Classification",
  mission: "Find the wrong line in a student's stability check.",
  instructions: "A student classified this beam: stable or not, determinate or not. One line of their working is wrong. Click it, then choose the fix.",
  situations: [
    {
      name: "propped cantilever",
      setup: beam([{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }, { id: "B", type: "roller", at: [6, 0] }]),
      debug: { view: "steps", intro: "The student's working:", mutations: [{ kind: "miscount", support: "A", as: 2 }] },
    },
    {
      name: "three rollers",
      setup: beam([{ id: "A", type: "roller", at: [0, 0] }, { id: "B", type: "roller", at: [3, 0] }, { id: "C", type: "roller", at: [6, 0] }]),
      debug: { view: "steps", intro: "The student's working:", mutations: [{ kind: "arrangement" }] },
    },
    {
      name: "pin and two rollers",
      setup: beam([{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [3, 0] }, { id: "C", type: "roller", at: [6, 0] }]),
      debug: { view: "steps", intro: "The student's working:", mutations: [{ kind: "degree" }] },
    },
  ],
  vary: [{ path: "forces.#P.magnitude", min: 300, max: 900, step: 10 }],
  view: { xmin: -1.4, xmax: 7.4, ymin: -1.6, ymax: 2.2 },
  hints: [
    "Check each support's count: pin 2, roller 1, fixed support 3.",
    "Is 3 unknowns always enough? Look at which way the reactions point.",
    "The degree of indeterminacy is the number of unknowns left over after the 3 equations.",
  ],
  explanation:
    "A stability check has three parts: count each support's unknowns, compare the total with the 3 equations, and — when there are exactly 3 — check that the reactions aren't all parallel or all through one point.",
};

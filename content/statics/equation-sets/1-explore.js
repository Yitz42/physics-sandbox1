// Unit 5.3, stage 1 — explore: choose which three equations to write for a jib
// crane, and see which unknowns each one holds, and whether the three are enough.
// The crane is from the lesson library (content/statics/library/beams.js), where
// its hand checks are. P = 800 N: B_x = 1333.3 N, A_x = 1333.3 N, A_y = 800 N.
//   usual  ΣF_x (A_x, B_x), ΣF_y (A_y), ΣM_A (B_x)          works, but ΣF_x has two unknowns
//   ΣM_A (B_x), ΣM_B (A_x), ΣF_y (A_y)                      works, one unknown each
//   ΣM_A, ΣM_B, ΣF_x                                        fails: A, B straight above each other (AB ⟂ x)
//   ΣM_A, ΣM_B, ΣM_C (C: the arm's tip; A_x, A_y, B_x)      works: A, B, C not in line
//   ΣM_A, ΣM_B, ΣM_D (D: the top of the post)               fails: A, B, D on one line
// B_x > 2000 N once P > 1200 N (B_x = 5P/3).

import { use } from "../../../src/core/library.js";
import { jibCrane, withSet } from "../library/beams.js";

const M = (p) => ({ M: p });
const sets = [
  ["ΣF_x, ΣF_y, ΣM_A — the usual three", [{ F: "x" }, { F: "y" }, M("A")]],
  ["ΣM_A, ΣM_B, ΣF_x", [M("A"), M("B"), { F: "x" }]],
  ["ΣM_A, ΣM_B, ΣF_y", [M("A"), M("B"), { F: "y" }]],
  ["ΣM_A, ΣM_B, ΣM_C (C: the arm's tip)", [M("A"), M("B"), M("C")]],
  ["ΣM_A, ΣM_B, ΣM_D (D: the top of the post)", [M("A"), M("B"), M("D")]],
];
const crane = use(withSet(jibCrane, sets[0][1], { showMomentPoint: true }));

export default {
  id: "equation-sets/1-explore",
  challenge: "explore",
  solver: "statics.rigidBody",
  title: "Choose Your Three Equations",
  mission: "Find three equations that each hold just one unknown.",
  instructions:
    `${crane.instructions} The crane is in equilibrium, so ANY sum of forces and ANY sum of moments is zero — but only three of them are independent. ` +
    "Choose which three to write, and watch which unknowns each one holds (under the equations) and whether the three can find them all. The rings mark the moment points.",
  setup: crane.setup,
  view: crane.view,
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "The roller B is straight above the pin A. **How many unknowns does $\\Sigma M_A$ hold?**",
    options: [
      { text: "One: $B_x$", correct: true },
      { text: "Two", feedback: "$A_x$ and $A_y$ both pass through A, so neither has a moment about it." },
      { text: "All three", feedback: "Reactions AT the moment point drop out of the moment equation." },
    ],
    explain: "Choosing the moment point on unknowns' lines of action removes them: one equation, one unknown.",
  },
  editable: [
    { label: "The three equations", options: sets.map(([label, sums]) => ({ label, set: { sums } })) },
    { path: "forces.#P.magnitude", label: "Load P", min: 400, max: 1600, step: 50, unit: "N" },
  ],
  tasks: [
    { text: "Choose a set where **every** equation holds just **one** unknown.", check: (v) => v.setOk === 1 && v.setMax === 1 },
    { text: "Find a set that **can't** find all three reactions.", check: (v) => v.setOk === 0 },
    { text: "Find a set of **three moment equations** that works.", check: (v, s) => v.setOk === 1 && s.sums.every((q) => q.M) },
    { text: "Make the roller B push with more than **2000 N**.", check: (v) => v.B_x > 2000 },
  ],
  hints: [
    "A reaction has no moment about a point on its line of action. $A_y$ acts straight up through A — and B is straight above A.",
    "$\\Sigma F_x$ holds every force with a sideways part: here both $A_x$ and $B_x$. $\\Sigma F_y$ holds only $A_y$.",
    "Two moment points on a vertical line, plus $\\Sigma F_x$: any sideways force has the same moment difference about both points, so the three can't tell $A_y$ apart.",
  ],
  explanation:
    "Any three independent equations will do. With the roller straight above the pin, $\\Sigma M_A$ holds only $B_x$, $\\Sigma M_B$ only $A_x$, and $\\Sigma F_y$ only $A_y$ — no simultaneous equations at all. " +
    "But $\\Sigma M_A$, $\\Sigma M_B$ and $\\Sigma F_x$ fail: with A straight above B, $\\Sigma F_x$ says nothing new. Three moment equations work too, if the points aren't all on one line.",
};

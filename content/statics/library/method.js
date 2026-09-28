// library/method.js — beams for Unit 1.2 (the steps every problem follows: sketch, FBD, equations,
// answer, check). Any stage may use them (see src/core/library.js).
// Questions:
//   reactions  predict the support reactions
//   solve      the whole problem: FBD, equations, answers
// Hand checks (default numbers):
//   plank: 5 m, 30 kg (W = 294.3 N at 2.5 m), pin A at 0, roller B at 5 m, a person P = 700 N at 3.5 m.
//            ΣM_A: 5B_y − 294.3(2.5) − 700(3.5) = 0 → B_y = 3185.75/5 = 637.15 N
//            ΣF_y: A_y = 994.3 − 637.15 = 357.15 N;  A_x = 0.
//            Check, ΣM_B: −5A_y + 294.3(2.5) + 700(1.5) = −1785.75 + 735.75 + 1050 = 0 ✓
//   two-load beam (the build stage): P₁ at 2 m, P₂ at 5 m, pin A at 0, roller B at x:
//            B_y = (2P₁ + 5P₂)/x,  A_y = P₁ + P₂ − B_y.

import { scenario } from "../../../src/core/library.js";

export const plank = scenario({
  name: "plank with a person",
  story: "A 5 m plank (its mass is shown) rests on a pin at A and a roller at B. A person stands on it.",
  setup: {
    body: { points: [[0, 0], [5, 0]], mass: 30 },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [5, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 700, direction: "down", at: [3.5, 0], push: true }],
    massLabel: { at: [1.2, 0.45], text: "plank" },
  },
  view: { xmin: -1.3, xmax: 6.3, ymin: -2.2, ymax: 2.2 },
  vary: [
    { path: "forces.#P.magnitude", min: 500, max: 900, step: 25 },
    { path: "forces.#P.at.0", values: [1.5, 2, 3, 3.5, 4] },
    { path: "body.mass", values: [20, 25, 30, 35] },
  ],
  questions: {
    reactions: {
      instruction: "Predict the vertical reactions at A and B.",
      ask: [{ quantity: "A_y" }, { quantity: "B_y", min: 0 }],
      hints: [
        "Sketch, then the FBD: the pin gives $A_x$ and $A_y$, the roller $B_y$; the plank's weight $W = mg$ acts at its middle.",
        "Moments about A leave one unknown, $B_y$. Then $\\Sigma F_y = 0$ gives $A_y$.",
        "Check: moments about B must come out zero too.",
      ],
    },
    solve: {
      instruction: "Work through the whole problem: the FBD, the equations, then the answers.",
      ask: [{ quantity: "A_x" }, { quantity: "A_y" }, { quantity: "B_y", min: 0 }],
      solve: {
        steps: ["fbd", "equations", "answer"],
        equationMode: "numeric",
        intros: { fbd: "Isolate the plank: replace each support with the forces it gives, and add every load — including the plank's own weight." },
        candidates: [
          { id: "A_x" },
          { id: "A_y" },
          { id: "B_y", wrongDirection: "A roller can only **push** on the plank: $B_y$ points up." },
          { id: "W", missing: "A force is missing. The plank has mass: what does gravity do to it?" },
          { id: "B_x", symbol: "B_x", at: "B", feedback: "A roller can't push sideways — it just rolls. It gives only $B_y$." },
          { id: "M_A", symbol: "M_A", at: "A", moment: true, feedback: "A pin lets the plank turn, so it gives no moment — only $A_x$ and $A_y$." },
        ],
      },
      hints: [
        "FBD: $A_x$ and $A_y$ at the pin, $B_y$ up at the roller, W at the middle, P where the person stands.",
        "$\\Sigma M_A = 0$ has only $B_y$ in it; $\\Sigma F_y = 0$ then gives $A_y$; $\\Sigma F_x = 0$ gives $A_x$.",
        "Check your answers: they should also make $\\Sigma M_B = 0$.",
      ],
    },
  },
});

export const twoLoadBeam = scenario({
  name: "beam with two loads",
  story: "A 6 m beam is pinned at A and carries two loads. Where the roller B goes is up to you.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [2.5, 0] }],
    forces: [
      { id: "P1", symbol: "P_1", magnitude: 600, direction: "down", at: [2, 0], push: true },
      { id: "P2", symbol: "P_2", magnitude: 400, direction: "down", at: [5, 0], push: true },
    ],
  },
  view: { xmin: -1.3, xmax: 7.3, ymin: -2.6, ymax: 2.2 },
  vary: [
    { path: "forces.#P1.magnitude", min: 400, max: 700, step: 25 },
    { path: "forces.#P2.magnitude", min: 250, max: 450, step: 25 },
  ],
  questions: {},
});

// Unit 7.2, stage 6 — solve: a link plate's centroid (rectangle + rounded end − pin hole).
// The plate and its hand check are in the lesson library (library/holes.js, linkPlate):
//   rectangle 3 × 2 (6 m², (1.5, 1)), half circle r = 1 (1.571 m², x̃ = 3.424 m), hole r = 0.5 (0.785 m², (3, 1))
//   A = 6.785 m²,  x̄ = 12.023/6.785 = 1.772 m,  ȳ = 1 m

import { use } from "../../../src/core/library.js";
import { linkPlate } from "../library/holes.js";

const s = use(linkPlate);

export default {
  id: "holes/6-solve",
  challenge: "solve",
  solver: "statics.centroid",
  title: "The Link Plate",
  mission: "Split the link plate into parts — one of them a hole — and find its centroid.",
  instructions: `${s.instructions} Find its centroid: split it up, write the three sums, and find $\\bar{x}$ and $\\bar{y}$ from O.`,
  setup: s.setup,
  view: s.view,
  vary: s.vary,
  solve: {
    steps: ["choices", "equations", "answer"],
    choicesName: "Split it up",
    choices: [
      {
        title: "Which parts make up the link plate?",
        options: [
          { tex: "\\text{a rectangle, plus a half circle, minus a circle (the hole)}", correct: true },
          { tex: "\\text{a rectangle, plus a half circle, plus a circle}", kind: "sign", feedback: "The hole is material taken away: it's a part with NEGATIVE area." },
          { tex: "\\text{a rectangle and a half circle (a hole doesn't count)}", kind: "missing", feedback: "The hole removes material, and that moves the centroid. It counts — with negative area." },
        ],
      },
    ],
    choicesDone: "Two solid parts and one hole (negative area). Now the sums.",
    equationMode: "numeric",
    intros: { equations: "Choose the correct version of each sum: the net area, and the first moments about O." },
  },
  ask: [{ quantity: "xbar", precision: 0.01 }, { quantity: "ybar", precision: 0.01 }],
  hints: [
    "The half circle's centroid is $\\tfrac{4r}{3\\pi}$ right of its flat edge; the hole's is at its centre, right on that edge.",
    "Subtract the hole in every sum: $A = A_1 + A_2 - A_3$, $\\Sigma \\tilde{x} A = \\tilde{x}_1 A_1 + \\tilde{x}_2 A_2 - \\tilde{x}_3 A_3$.",
    "The plate is symmetric about its centre line, so $\\bar{y}$ is half its height.",
  ],
  explanation:
    "Add the solid parts, subtract the hole — in the area and in both first moments. The rounded end pulls the centroid right, the hole (on the right too) pushes it back left.",
};

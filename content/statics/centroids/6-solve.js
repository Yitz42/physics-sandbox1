// Unit 6.1, stage 6 — solve: a shop sign's centroid, from splitting it up to x̄ and ȳ.
// The sign and its hand check are in the lesson library (library/shapes.js, sign):
//   board 3 × 2 (6 m², (1.5, 1)), triangle 1.5 × 2 (1.5 m², (3.5, 0.667)), half circle r = 1 (1.571 m², (1.5, 2.424))
//   ΣA = 9.071 m²,  x̄ = 16.606/9.071 = 1.831 m,  ȳ = 10.808/9.071 = 1.192 m

import { use } from "../../../src/core/library.js";
import { sign } from "../library/shapes.js";

const s = use(sign);

export default {
  id: "centroids/6-solve",
  challenge: "solve",
  solver: "statics.centroid",
  title: "The Shop Sign",
  mission: "Split the sign into simple parts and find its centroid.",
  instructions: `${s.instructions} Find its centroid: split it up, write the three sums, and find $\\bar{x}$ and $\\bar{y}$ from O.`,
  setup: s.setup,
  view: s.view,
  vary: s.vary,
  solve: {
    steps: ["choices", "equations", "answer"],
    choicesName: "Split it up",
    choices: [
      {
        title: "Which simple parts make up the sign?",
        options: [
          { tex: "\\text{a rectangle, a triangle and a half circle}", correct: true },
          { tex: "\\text{a rectangle and a triangle (the round top is too small to matter)}", kind: "concept", feedback: "Every part counts — the half circle adds area high up, so it raises ȳ noticeably." },
          { tex: "\\text{a rectangle and a half circle}", kind: "concept", feedback: "Look at the right-hand end: the pointed part is a triangle, and it counts too." },
        ],
      },
    ],
    choicesDone: "Three parts, each with a known area and centroid. Now the sums.",
    equationMode: "numeric",
    intros: { equations: "Choose the correct version of each sum: the total area, and the first moments about O." },
  },
  ask: [{ quantity: "xbar", precision: 0.01 }, { quantity: "ybar", precision: 0.01 }],
  hints: [
    "Board: its middle. Triangle: its right angle is at the board's bottom-right corner, so $\\tilde{x}_2$ = board length + ⅓ of the point, $\\tilde{y}_2$ = ⅓ of its height.",
    "Half circle: area $\\tfrac{1}{2}\\pi r^2$; its centroid is above the board's middle, $\\tfrac{4r}{3\\pi}$ above the top edge.",
    "$\\bar{x} = \\Sigma \\tilde{x}A / \\Sigma A$ and $\\bar{y} = \\Sigma \\tilde{y}A / \\Sigma A$.",
  ],
  explanation:
    "Split into parts you know, tabulate each part's area and centroid, and divide the first moments by the total area. " +
    "The triangle pulls the centroid right, the half circle pulls it up — each in proportion to its area.",
};

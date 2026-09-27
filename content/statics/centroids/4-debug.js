// Unit 7.1, stage 4 — debug: one mistake in a student's centroid working.
// The ramp block (library/shapes.js): square 2 × 2 (4 m², (1, 1)) and triangle with its right angle
// at (2, 0), legs 3 m along x and 2 m up (3 m², (3, 0.667)).
// Correct: A = 4 + 3 = 7 m²;  A x̄ = 1(4) + 3(3) = 13 m³;  A ȳ = 1(4) + 0.667(3) = 6 m³.

import { use } from "../../../src/core/library.js";
import { rampBlock } from "../library/shapes.js";

const s = use(rampBlock);

export default {
  id: "centroids/4-debug",
  challenge: "debug",
  solver: "statics.centroid",
  title: "Check the Table",
  mission: "Find and fix the mistake in a student's centroid working.",
  instructions: `${s.instructions} A student worked out its centroid. One term is wrong. Click it, then choose the fix.`,
  setup: { ...s.setup, showParts: true },
  view: s.view,
  vary: s.vary,
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's working (areas, then first moments about O):",
    mutations: [
      { equation: "Qy", kind: "swap", term: "2",
        explain: "The triangle's centroid is ⅓ of its length from its RIGHT ANGLE — here the ramp's foot, against the square — so $\\tilde{x}_2$ = the square's width + ⅓ of the ramp, not + ⅔." },
      { equation: "A", kind: "missing", term: "2",
        explain: "Every part's area belongs in $\\Sigma A$: the triangle too." },
      { equation: "Qx", kind: "swap", term: "2",
        explain: "Up the triangle's height, its centroid is ⅓ from the right angle (the base): $\\tilde{y}_2 = \\tfrac{h}{3}$, not $\\tfrac{2h}{3}$." },
      { equation: "Qx", kind: "missing", term: "1",
        explain: "The square's first moment, $\\tilde{y}_1 A_1$, belongs in $\\Sigma \\tilde{y} A$ as well." },
    ],
  },
  hints: [
    "Check each part is in every sum: $\\Sigma A$, $\\Sigma \\tilde{x} A$, $\\Sigma \\tilde{y} A$.",
    "A right triangle's centroid: ⅓ of each leg from the RIGHT ANGLE.",
    "Look at where the triangle's right angle is in the picture.",
  ],
  explanation:
    "The centroid table needs every part in every sum, each with its own area and centroid. For a right triangle the centroid is ⅓ of each leg from the right angle — the corner where its two legs meet.",
};

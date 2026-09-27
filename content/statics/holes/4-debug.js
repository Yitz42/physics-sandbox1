// Unit 7.2, stage 4 — debug: one mistake in a student's centroid working for a plate with a
// notch and a hole (library/holes.js, notchAndHole).
// Correct: A = A_1 − A_2 − A_3;  A x̄ = x̃_1 A_1 − x̃_2 A_2 − x̃_3 A_3;  A ȳ = ỹ_1 A_1 − ỹ_2 A_2 − ỹ_3 A_3,
// with ỹ_2 = 2 − 4r/(3π) (the notch's centroid, below the top edge).

import { use } from "../../../src/core/library.js";
import { notchAndHole } from "../library/holes.js";

const s = use(notchAndHole);

export default {
  id: "holes/4-debug",
  challenge: "debug",
  solver: "statics.centroid",
  title: "Check the Subtraction",
  mission: "Find and fix the mistake in a student's working for a plate with holes.",
  instructions: `${s.instructions} A student worked out its centroid. One term is wrong. Click it, then choose the fix.`,
  setup: { ...s.setup, showParts: true },
  view: s.view,
  vary: s.vary,
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's working (net area, then first moments about O):",
    mutations: [
      { equation: "A", kind: "sign", term: "3",
        explain: "The hole is material taken AWAY: its area is subtracted, $-A_3$, not added." },
      { equation: "Qy", kind: "sign", term: "2",
        explain: "The notch is a hole too, so its first moment is subtracted: $-\\tilde{x}_2 A_2$. A negative area gives a negative first moment." },
      { equation: "Qx", kind: "swap", term: "2",
        explain: "A half circle's centroid is $\\tfrac{4r}{3\\pi}$ from its flat edge (here the plate's top edge), not $r/2$." },
      { equation: "Qx", kind: "missing", term: "3",
        explain: "Every part belongs in every sum — the hole's first moment $-\\tilde{y}_3 A_3$ too." },
    ],
  },
  hints: [
    "Holes have NEGATIVE area: check every hole's term is subtracted, in all three sums.",
    "Check each part appears in every sum.",
    "A half circle's centroid: $\\tfrac{4r}{3\\pi}$ from its flat edge.",
  ],
  explanation:
    "With holes, every hole's area AND first moment are subtracted — in $\\Sigma A$, $\\Sigma \\tilde{x} A$ and $\\Sigma \\tilde{y} A$. " +
    "A notch is just a hole on the edge: here a half circle whose centroid is $\\tfrac{4r}{3\\pi}$ below the top edge.",
};

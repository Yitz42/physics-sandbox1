// Unit 8.1, stage 4 — debug: one mistake in a student's equations for the left piece of the
// overhanging beam (library/internal.js, overhangAll), cut at C.
// Correct (left piece, cut at x): ΣF_x: A_x + N = 0;  ΣF_y: A_y − F_1 − V = 0;  ΣM_C: −A_y x + F_1 (x/2) + M = 0,
// with F_1 = w x (the load on the piece) at x/2 from C.

import { use } from "../../../src/core/library.js";
import { overhangAll } from "../library/internal.js";

const s = use(overhangAll);

export default {
  id: "internal-forces/4-debug",
  challenge: "debug",
  solver: "statics.internal",
  title: "Check the Cut",
  mission: "Find and fix the mistake in a student's equations for a cut beam.",
  instructions: `${s.instructions} It is cut at C. A student wrote the left piece's equations (the reactions are already found). One term is wrong. Click it, then choose the fix.`,
  setup: { ...s.setup, knownReactions: true },
  vary: s.vary,
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's equations for the left piece:",
    mutations: [
      { equation: "sumFy", kind: "sign", term: "V",
        explain: "Positive V acts DOWN on a left piece's cut face, so it enters $\\Sigma F_y$ with a minus sign." },
      { equation: "sumM", kind: "swap", term: "w_1",
        explain: "The load on the piece, $F_1 = wx$, acts at its centroid — halfway along the piece, $x/2$ from C — not at A." },
      { equation: "sumM", kind: "missing", term: "w_1",
        explain: "The part of the distributed load on the piece acts on it: its resultant $F_1$ belongs in $\\Sigma M_C$ too." },
      { equation: "sumFy", kind: "sign", term: "A_y",
        explain: "$A_y$ pushes the beam UP: positive in $\\Sigma F_y$." },
    ],
  },
  hints: [
    "Check the directions: V down on a left piece's face, $A_y$ up, the load down.",
    "The load on the piece is only the part left of C, at ITS centroid.",
    "Every force on the piece belongs in every equation it has a part in.",
  ],
  explanation:
    "For a left piece: $\\Sigma F_y = A_y - F_1 - V = 0$ and $\\Sigma M_C = -A_y x + F_1 \\tfrac{x}{2} + M = 0$. " +
    "The distributed load counts only as far as the cut, acting at the middle of that part.",
};

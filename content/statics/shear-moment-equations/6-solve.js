// Unit 8.3, stage 6 — solve: write V(x) and M(x) for both segments of an overhanging beam,
// then use them to find V and M at x = 5 m.
// Pin A (0), roller B (4), w = 300 N/m from A to B, P = 400 N at the end (6 m) → B_y = 1200, A_y = 400 N.
//   Segment 1 (0–4): V = 400 − 300x,  M = 400x − 300x²/2
//   Segment 2 (4–6): V = 400 − 1200 + 1200 = 400,  M = 400x − 1200(x − 2) + 1200(x − 4) = 400x − 2400
//   At x = 5: V = 400 N, M = −400 N·m (= −P × 1 m).

import { use, edit } from "../../../src/core/library.js";
import { overhang } from "../library/beams.js";

const s = use(edit(overhang, { set: { view: "diagrams", cut: 5, showSegments: true } }));

export default {
  id: "shear-moment-equations/6-solve",
  challenge: "solve",
  solver: "statics.internal",
  title: "The Overhanging Beam",
  mission: "Write V(x) and M(x) for each segment, then use them.",
  instructions: `${s.instructions} Write V(x) and M(x) for each segment, then use them to find V and M at the dashed section, x = 5 m.`,
  setup: s.setup,
  vary: s.vary,
  tallPicture: true,
  solve: {
    steps: ["choices", "answer"],
    choicesName: "Write the equations",
    choicesDone: "Both segments' equations. Put x = 5 m into segment 2's.",
  },
  ask: [{ quantity: "V" }, { quantity: "M" }],
  hints: [
    "Find the reactions first: moments about A give $B_y$.",
    "Segment 2 (past B): the whole uniform load is on the left piece, as its resultant $F_w$ at 2 m, and $B_y$ acts at 4 m.",
    "Check: at x = 5 m only P is to the right, so $M = -P(1\\,\\text{m})$.",
  ],
  explanation:
    "Segment 1 holds $A_y$ and the load up to x; segment 2 holds $A_y$, the whole load (its resultant at 2 m) and $B_y$. " +
    "Past B the equations simplify to $V = P$ and $M = -P(6 - x)$ — as the right piece shows at once.",
};

// Unit 5.3, stage 4 — debug: one mistake in a student's section equations.
// The left part of the bridge with P at C (library/trusses.js, leftSection), A_y = P/2:
//   ΣM_C: −6A_y − 3F_FG = 0   ΣM_F: −3A_y + 3F_BC = 0   ΣF_y: A_y − (1/√2)F_CF = 0
// F_FG acts at the cut (4.5, 3): its arm about C is its height, 3 m — not the 3.35 m straight to it.

import { use } from "../../../src/core/library.js";
import { leftSection } from "../library/trusses.js";

const s = use(leftSection);

export default {
  id: "truss-sections/4-debug",
  challenge: "debug",
  solver: "statics.truss",
  title: "Check the Section",
  mission: "Find and fix the mistake in a student's equations for a section.",
  instructions:
    `${s.instructions} A student wrote $\\Sigma M_C$, $\\Sigma M_F$ and $\\Sigma F_y$ for the left part, with every cut member pulling (tension assumed). One term is wrong. Click it, then choose the fix.`,
  setup: s.setup,
  view: s.view,
  vary: s.vary,
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's equations for the left part (counterclockwise positive):",
    mutations: [
      { equation: "sumM_C", kind: "swap", term: "F_FG",
        explain: "$F_{FG}$ is horizontal, 3 m above C: its moment arm about C is that 3 m height (the perpendicular distance), not the straight-line distance to where it's drawn." },
      { equation: "sumM_F", kind: "sign", term: "F_BC",
        explain: "$F_{BC}$ pulls the left part to the right, 3 m BELOW F: about F that turns it counterclockwise, so its moment is positive." },
      { equation: "sumM_C", kind: "missing", term: "A_y",
        explain: "The reaction $A_y$ acts on the left part, 6 m from C. Every force on the part kept belongs in its equations — the reactions too." },
      { equation: "sumFy", kind: "sign", term: "F_CF",
        explain: "Tension pulls the kept part toward C: from F that's down and to the right, so $F_{CF}$'s y-part is negative." },
    ],
  },
  hints: [
    "Every force on the part KEPT belongs: its reaction and the three cut members' pulls. Nothing from the part cut away.",
    "A moment arm is the perpendicular distance from the point to the force's line.",
    "Tension pulls the kept part toward the part cut away: check each cut member's direction.",
  ],
  explanation:
    "A section's equations are a rigid body's: every force on the part kept (reactions, loads on it, and each cut member pulling toward the part cut away), " +
    "with perpendicular moment arms and the turning sense seen from each equation's own point.",
};

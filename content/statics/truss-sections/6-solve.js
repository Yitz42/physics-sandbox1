// Unit 5.3, stage 6 — solve: the right part of the bridge carrying two loads, from FBD to
// all three cut members. The section and its hand check are in the lesson library
// (library/trusses.js, rightSection): P = 600 N at B, Q = 1200 N at C → E_y = 750 N;
//   ΣM_C: 6E_y + 3F_GH = 0 → F_GH = −1500 N;  ΣM_H: 3E_y − 3F_CD = 0 → F_CD = +750 N;
//   ΣF_y: E_y − (1/√2)F_CH = 0 → F_CH = +1060.7 N

import { use } from "../../../src/core/library.js";
import { rightSection } from "../library/trusses.js";

const s = use(rightSection);

export default {
  id: "truss-sections/6-solve",
  challenge: "solve",
  solver: "statics.truss",
  title: "Cut and Solve",
  mission: "Draw the section's FBD and find the forces in GH, CD and CH.",
  instructions:
    `${s.instructions} Draw the free-body diagram of the right part, choose its three equations, and find the three member forces (tension positive).`,
  setup: s.setup,
  view: s.view,
  vary: s.vary,
  solve: {
    steps: ["fbd", "equations", "answer"],
    equationMode: "numeric",
    intros: {
      fbd: "Draw the free-body diagram of the right part: each cut member pulls on it (draw them as tension — the sign will tell), and its support reaction (already found) holds it up.",
      equations: "Choose the correct version of each equation: moments about C (where CH and CD meet), about H (where GH and CH meet), and the vertical forces.",
    },
    candidates: [
      { id: "F_GH" },
      { id: "F_CH" },
      { id: "F_CD" },
      { id: "E_y" },
      { id: "F_DH", symbol: "F_{DH}", at: "D", feedback: "DH isn't cut: it's inside the part you kept. Its pulls on D and H cancel out within the part, so it's not on the FBD." },
      { id: "Q", symbol: "Q", at: "D", feedback: "$Q$ acts at C, on the part cut away. Only forces on the part you KEEP go on its FBD." },
    ],
  },
  ask: [{ quantity: "F_GH" }, { quantity: "F_CD" }, { quantity: "F_CH" }],
  hints: [
    "On the right part: $E_y$ up at E, and the pulls of GH (toward G), CH (toward C) and CD (toward C). The loads are on the other part.",
    "About C: $E_y$ acts 6 m to the right; $F_{GH}$ acts 3 m up. About H: $E_y$ acts 3 m to the right; $F_{CD}$ acts 3 m down.",
    "$\\Sigma F_y$: only $E_y$ and CH's vertical part, $\\tfrac{1}{\\sqrt{2}}F_{CH}$ (downward, toward C).",
  ],
  explanation:
    "The right part carries no load, just $E_y$ — so it's the easy side to keep. Moments about C give $F_{GH}$ (the top chord pushes), about H give $F_{CD}$ (the bottom chord pulls), " +
    "and $\\Sigma F_y$ gives the diagonal $F_{CH}$ (it pulls, carrying the shear).",
};

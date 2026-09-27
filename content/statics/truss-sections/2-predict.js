// Unit 5.3, stage 2 — predict two member forces with the method of sections,
// one equation each. The sections and their hand checks are in the lesson library
// (library/trusses.js):
//   one load (P at C), left part:     F_FG = −P, F_BC = +P/2              (P = 1200: −1200, 600 N)
//   two loads (P at B, Q at C), left:  F_FG = −1500 N, F_BC = +1050 N      (P = 600, Q = 1200)

import { use } from "../../../src/core/library.js";
import { leftSection, twoLoadLeft } from "../library/trusses.js";

export default {
  id: "truss-sections/2-predict",
  challenge: "predict",
  solver: "statics.truss",
  title: "One Cut, Two Answers",
  mission: "Predict two member forces, each from one moment equation.",
  instructions: "Predict the member forces using the section shown (tension positive).",
  situations: [leftSection, twoLoadLeft].map((s) => use(s, "members")),
  hints: [],
  explanation:
    "About C, both CF and BC drop out, so $\\Sigma M_C$ holds only $F_{FG}$; about F, FG and CF drop out, leaving $F_{BC}$. " +
    "The top chord pushes (compression) and the bottom chord pulls (tension), like a beam bending under its load.",
};

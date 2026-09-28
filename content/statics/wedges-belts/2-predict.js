// Unit 9.3, stage 2 — predict: belt friction (hand pull, load held, turns needed) and wedges (the push
// to drive one in, the pull to get it out). Hand checks in library/wedges-belts.js:
//   boat 53.9 N;  hoist 1096.6 N;  turns 1.362;  mooring 3380.3 N;  machine P = 3782.5 N;  wedge out (18°) 1101.7 N.

import { use } from "../../../src/core/library.js";
import { boatBollard, pipeHoist, turnsNeeded, mooringHold, machineWedge, wedgeOut } from "../library/wedges-belts.js";

export default {
  id: "wedges-belts/2-predict",
  challenge: "predict",
  solver: "statics.belt",
  title: "Ropes and Wedges",
  mission: "Predict what a rope round a post can hold, and what it takes to drive a wedge.",
  instructions: "Predict the answer.",
  // (Each situation names its own solver: ropes use belt friction, wedges the wedge solver.)
  situations: [
    use(boatBollard, "hand", { solver: "statics.belt" }),
    use(pipeHoist, "hand", { solver: "statics.belt" }),
    use(turnsNeeded, "turns", { solver: "statics.belt" }),
    use(mooringHold, "load", { solver: "statics.belt" }),
    use(machineWedge, "push", { solver: "statics.wedge" }),
    use(wedgeOut, "out", { solver: "statics.wedge" }),
  ],
  hints: [],
  explanation:
    "A rope: find which end is tight (the way it would slip), then $T_2 = T_1 e^{\\mu_s\\beta}$ with β in radians. " +
    "A wedge: take the bodies apart, put N and $\\mu_s N$ at every contact (friction against each surface's sliding), and write ΣF_x and ΣF_y for each.",
};

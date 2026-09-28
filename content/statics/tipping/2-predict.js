// Unit 9.2, stage 2 — predict: the push (or slope) that slips a crate, the one that tips it, and so
// which comes first. Hand checks in library/tipping.js:
//   tall crate: slip 240 N, tip 200 N → tips first;  filing cabinet: slip 175 N, tip 375 N → slips first;
//   fridge on a truck bed: slip 26.57°, tip 21.25° → tips first;  rope crate: slip 224.0 N, tip 288.7 N → slips first.

import { use } from "../../../src/core/library.js";
import { tallCrate, filingCabinet, truckFridge, ropeCrate } from "../library/tipping.js";

export default {
  id: "tipping/2-predict",
  challenge: "predict",
  solver: "statics.friction",
  title: "Slide or Topple?",
  mission: "Predict the push (or slope) that slips it and the one that tips it: which comes first?",
  instructions: "Predict the answers.",
  situations: [
    use(tallCrate, "which"),
    use(filingCabinet, "which"),
    use(truckFridge, "angles"),
    use(ropeCrate, "which"),
  ],
  hints: [],
  explanation:
    "Slipping is a friction question: when does the friction needed reach $\\mu_s N$? Tipping is a moment question: when does N reach the corner O? " +
    "Answer both, and the smaller push (or gentler slope) is what really happens — the other limit is never reached.",
};

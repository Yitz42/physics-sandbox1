// Unit 6.2, stage 2 — predict how many members carry nothing, then one member force.
// The trusses and their hand checks are in the lesson library (library/trusses.js):
//   bridge, load below (P at C): 3 zero; F_FC = +0.7071P   (P = 1200: 848.5 N)
//   bridge, load on top (P at G): 2 zero; F_CG = −P         (−1200 N)
//   wall bracket: 1 zero (AB); F_AC = −4P/3                  (P = 900: −1200 N)

import { use } from "../../../src/core/library.js";
import { bridgeBottom, bridgeTop, wallBracket } from "../library/trusses.js";

const zeroQuestion = (s) => {
  const out = use(s, "zero");
  out.setup = { ...out.setup, showZero: "reveal" }; // the inspection working, once answered
  return out;
};

export default {
  id: "zero-force-members/2-predict",
  challenge: "predict",
  solver: "statics.truss",
  title: "Spot the Idle Members",
  mission: "Count the zero-force members by inspection, then find one member force.",
  instructions: "Count the members that carry no force, then predict a member force (tension positive).",
  situations: [bridgeBottom, bridgeTop, wallBracket].map(zeroQuestion),
  hints: [],
  explanation:
    "Look at the unloaded joints first: two members at an angle, or three with two in line. Those zero members drop out, and the joints left have fewer unknowns. " +
    "A load or support acting across the line stops the rule at that joint.",
};

// Unit 5.3, stage 2 — predict the reactions with two moment equations and one
// force equation, one unknown each. The bodies and their hand checks are in the
// lesson library (content/statics/library/beams.js):
//   jib crane (ΣM_A, ΣM_B, ΣF_y):   B_x = 5P/3, A_x = 5P/3, A_y = P          (P = 800: 1333.3, 1333.3, 800 N)
//   slanted push (ΣM_A, ΣM_B, ΣF_x): B_y = 0.48P, A_y = 0.32P, A_x = −0.6P   (P = 500 at 3 m: 240, 160, −300 N)

import { use } from "../../../src/core/library.js";
import { jibCrane, slantedBeam, withSet } from "../library/beams.js";

export default {
  id: "equation-sets/2-predict",
  challenge: "predict",
  solver: "statics.rigidBody",
  title: "One Unknown at a Time",
  mission: "Predict the reactions, one equation for each.",
  instructions: "Predict the reactions using two moment equations and one force equation.",
  situations: [
    use(withSet(jibCrane, [{ M: "A" }, { M: "B" }, { F: "y" }], { showMomentPoint: true }), "reactions"),
    use(withSet(slantedBeam, [{ M: "A" }, { M: "B" }, { F: "x" }], { showMomentPoint: true }), "reactions"),
  ],
  hints: [],
  explanation:
    "Taking moments about each support in turn wipes out that support's reactions, leaving one unknown per equation. The third equation then points along the direction " +
    "where only one unknown is left. No simultaneous equations — and each answer can be checked with an equation you didn't use.",
};

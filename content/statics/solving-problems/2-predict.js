// Unit 1.2, stage 2 — predict: the steps on three kinds of problem — a crate on two cables (a particle),
// a plank on two supports, an overhanging beam and a cantilever (rigid bodies). Hand checks in the
// library: crate (60 kg, 30°/45°) T_AB = 430.9 N, T_AC = 527.7 N (cables/2-predict.js);
// plank A_y = 357.15 N, B_y = 637.15 N (library/method.js); overhang A_y = 400 N, B_y = 1200 N;
// cantilever A_y = 1700 N, M_A = 3300 N·m (library/beams.js).

import { use } from "../../../src/core/library.js";
import { crate } from "../library/hanging.js";
import { overhang, cantilever } from "../library/beams.js";
import { plank } from "../library/method.js";

export default {
  id: "solving-problems/2-predict",
  challenge: "predict",
  solver: "statics.rigidBody",
  title: "Same Steps, Any Problem",
  mission: "Use the five steps on a particle and on beams to predict the unknowns.",
  instructions: "Predict the answer.",
  situations: [
    use(crate, "tensions", { solver: "statics.particle", ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }] }),
    use(plank, "reactions"),
    use(overhang, "reactions"),
    use(cantilever, "reactions"),
  ],
  hints: [],
  explanation:
    "The steps are the same every time: sketch, FBD, equations, solve, check. A ring where forces meet needs ΣF_x and ΣF_y; " +
    "a beam needs ΣM too — and a smart moment point leaves one unknown per equation.",
};

// Unit 1.1, stage 2 — predict: weights, a mass, an acceleration, an elevator's cable. Hand checks in
// library/newton.js: person 735.75 N (N the same);  2.5 kN crate 254.84 kg;  Moon rover 1944 N;
// ice push a = 5 m/s²;  elevator T = 9048 N.

import { use } from "../../../src/core/library.js";
import { personOnFloor, heavyCrate, moonRover, icePush, elevatorUp } from "../library/newton.js";

export default {
  id: "newtons-laws/2-predict",
  challenge: "predict",
  solver: "statics.newton",
  title: "Mass, Weight, Force",
  mission: "Predict weights, masses and the forces Newton's laws call for.",
  instructions: "Predict the answer.",
  situations: [use(personOnFloor, "weight"), use(heavyCrate, "mass"), use(moonRover, "weight"), use(icePush, "accel"), use(elevatorUp, "cable")],
  hints: [],
  explanation:
    "Weight is a force: $W = mg$ in newtons. At rest the forces balance (ΣF = 0); with a net force the body accelerates, $a = F/m$. " +
    "Keep units honest: kg for mass, N for force, 1 kN = 1000 N.",
};

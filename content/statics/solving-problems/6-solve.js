// Unit 1.2, stage 6 — solve: the whole method on a plank with a person on it — FBD, equations, answers.
// Hand check (library/method.js): A_x = 0, A_y = 357.15 N, B_y = 637.15 N; check ΣM_B = 0.

import { use } from "../../../src/core/library.js";
import { plank } from "../library/method.js";

export default {
  id: "solving-problems/6-solve",
  challenge: "solve",
  solver: "statics.rigidBody",
  title: "The Five Steps",
  mission: "Solve a plank problem step by step: FBD, equations, answers.",
  situations: [use(plank, "solve")],
  explanation:
    "Sketch (done for you), FBD, equations, solve — and check: your $A_y$ and $B_y$ also make $\\Sigma M_B = 0$ and add up to the loads. " +
    "Every statics problem in this course follows these same steps.",
};

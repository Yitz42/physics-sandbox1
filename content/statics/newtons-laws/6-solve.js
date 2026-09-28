// Unit 1.1, stage 6 — solve: an elevator's cable, from the FBD's equations to the numbers.
// Hand checks in library/newton.js: speeding up going up (800 kg, 1.5 m/s²): W = 7848 N, T = 9048 N;
// slowing on the way down (600 kg, a = 2 m/s² up): W = 5886 N, T = 7086 N.

import { use } from "../../../src/core/library.js";
import { elevatorUp, elevatorSlowing } from "../library/newton.js";

export default {
  id: "newtons-laws/6-solve",
  challenge: "solve",
  solver: "statics.newton",
  title: "The Elevator Cable",
  mission: "Use W = mg and ΣF = ma to find an elevator cable's pull.",
  situations: [use(elevatorUp, "cable"), use(elevatorSlowing, "cable")],
  solve: {
    steps: ["equations", "answer"],
    equationMode: "numeric",
    intros: { equations: "The free-body diagram is drawn (right). Choose the correct equation in each group: the weight, then Newton's second law up and down." },
  },
  explanation:
    "Weight first: $W = mg$. Then the second law along the cable: $T - W = ma$. With a = 0 this is the statics equation $T = W$; " +
    "accelerating upward, the cable must pull harder than the weight.",
};

// Unit 5.4, stage 2 — predict the floor's push and the crossbar's pull in a stepladder.
// The ladders and their hand checks are in the lesson library (library/frames.js):
//   load at the top:  B_y = P/2,    F_DE = P/2        (P = 1000: 500, 500 N)
//   load on leg AC:   B_y = 0.375P, F_DE = 0.375P     (P = 800: 300, 300 N)

import { use } from "../../../src/core/library.js";
import { ladderTop, ladderLeg } from "../library/frames.js";

export default {
  id: "frames/2-predict",
  challenge: "predict",
  solver: "statics.frame",
  title: "Hold the Legs Together",
  mission: "Predict the floor's push at B and the crossbar's pull.",
  instructions: "Predict $B_y$ and the crossbar's force $F_{DE}$ (tension positive).",
  situations: [ladderTop, ladderLeg].map((s) => use(s, "crossbar")),
  hints: [],
  explanation:
    "First the whole ladder (one body): moments about A give $B_y$. Then take leg BC apart: about C, the pin's forces drop out and only $B_y$ and the crossbar's pull are left. " +
    "The crossbar pulls — it's in tension, stopping the legs from spreading.",
};

// Unit 7.1, stage 2 — predict N, V and M at a cut, on four beams.
// The beams and their hand checks are in the lesson library (library/internal.js):
//   shelf (cut at 4 m): V = −400 N, M = 800 N·m;  cantilever (right piece): V = 800 N, M = −800 N·m;
//   overhang (cut at 2 m): V = −150 N, M = 300 N·m;  slanted load: N = 600 N, V = 320 N, M = 480 N·m.

import { use } from "../../../src/core/library.js";
import { shelf, cantileverCut, overhangAll, rampLoad } from "../library/internal.js";

export default {
  id: "internal-forces/2-predict",
  challenge: "predict",
  solver: "statics.internal",
  title: "What's Inside?",
  mission: "Predict the internal forces at a cut through a beam.",
  instructions: "Predict the internal forces at C.",
  situations: [shelf, cantileverCut, overhangAll, rampLoad].map((s) => use(s, "cut")),
  hints: [],
  explanation:
    "Keep one piece, put N, V and M on its cut face in their positive directions, and write its three equations. " +
    "A negative answer means the force really acts the other way. Count only the part of a distributed load on the piece — and a piece with no support needs no reactions.",
};

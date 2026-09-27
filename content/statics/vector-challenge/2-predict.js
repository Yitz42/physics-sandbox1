// Unit 2.4, stage 2 — predict: work backwards. The resultant is given (green); two force
// sizes are not. A different picture each version: components of a force along two slanted
// rods u and v (angles), or two ropes to posts on a dock (coordinates).
// Hand checks in library/backwards.js.

import { use } from "../../../src/core/library.js";
import { hookUV, boatRopes } from "../library/backwards.js";

export default {
  id: "vector-challenge/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Work Backwards",
  mission: "The resultant is known: predict the two unknown forces that make it.",
  instructions: "Predict the answers.",
  situations: [use(hookUV, "sizes"), use(boatRopes, "sizes")],
  hints: [],
  explanation:
    "Knowing the resultant turns the resultant equations around: $F_{Rx} = \\Sigma F_x$ and $F_{Ry} = \\Sigma F_y$ are **two equations**, so they can find **two unknown sizes** " +
    "whenever the two directions are known and not along one line. Components along slanted axes are found the same way — and they are not the projections: they can even be bigger than the force itself.",
};

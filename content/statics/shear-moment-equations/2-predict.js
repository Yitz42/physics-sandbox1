// Unit 8.3, stage 2 — predict coefficients of V(x) or M(x) on four beams.
// The beams and their hand checks are in the lesson library (library/internal.js):
//   half-loaded M = 900x − 200x² (c₁ = A_y, c₂ = −w/2);  uniform span V = 1000 − 400x;
//   shelf, segment 2: M = 1200(2) + (800 − 1200)x → c₀ = Pa = 2400, c₁ = A_y − P = −400;
//   triangle span V = 600 − 50x².

import { use } from "../../../src/core/library.js";
import { halfLoaded, uniformSpan, shelfSegments, triangleSpan } from "../library/internal.js";


export default {
  id: "shear-moment-equations/2-predict",
  challenge: "predict",
  solver: "statics.internal",
  title: "Write It as an Equation",
  mission: "Predict the numbers in a beam's V(x) and M(x) equations.",
  instructions: "Predict the coefficients.",
  tallPicture: true,
  situations: [halfLoaded, uniformSpan, shelfSegments, triangleSpan].map((s) => {
    const u = use(s, "segments", { tallPicture: true });
    u.setup.showSegments = true;
    return u;
  }),
  hints: [],
  explanation:
    "Cut at a general x in the segment and keep the left piece: $V(x)$ = the upward forces minus the downward ones on it; $M(x)$ = each force times its arm $(x - a)$, with a distributed load's part at its own centroid. " +
    "Multiplying out gives the coefficients.",
};

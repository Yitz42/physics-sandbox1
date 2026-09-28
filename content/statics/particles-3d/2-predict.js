// Unit 3.4, stage 2 — predict: three unknown forces in space. A different picture each version:
// a crate on three cables, on two cables and a spring, or pulled aside by a known rope force.
// Hand checks in library/particles3d.js.

import { use } from "../../../src/core/library.js";
import { crateThreeCables, crateOnSpring, cratePulledAside } from "../library/particles3d.js";

export default {
  id: "particles-3d/2-predict",
  challenge: "predict",
  solver: "statics.force3d",
  title: "Three Unknowns",
  mission: "Predict three unknown forces holding a point in space.",
  instructions: "Predict the answers.",
  situations: [use(crateThreeCables, "tensions"), use(crateOnSpring, "tensions"), use(cratePulledAside, "tensions")],
  hints: [],
  explanation:
    "Every force becomes a Cartesian vector — cables and springs from coordinates, the weight as $-W\\,\\mathbf{k}$, a known pull from its angles — and then the $\\mathbf{i}$, $\\mathbf{j}$ and $\\mathbf{k}$ parts each add to zero. " +
    "Three equations find three unknowns.",
};

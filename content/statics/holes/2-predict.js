// Unit 6.2, stage 2 — predict the centroid (or net area) of shapes with holes and cut-outs.
// The shapes and their hand checks are in the lesson library (library/holes.js):
//   plate with a hole A = 7.215 m², x̄ = 2.109 m;  cut-out bracket x̄ = ȳ = 1.25 m;
//   notched plate ȳ = 0.905 m;  link plate x̄ = 1.772 m.

import { use } from "../../../src/core/library.js";
import { plateHole, cutoutBracket, notchedPlate, linkPlate } from "../library/holes.js";

export default {
  id: "holes/2-predict",
  challenge: "predict",
  solver: "statics.centroid",
  title: "Minus the Hole",
  mission: "Predict the centroid of shapes with holes and cut-outs.",
  instructions: "Predict the centroid's coordinates.",
  situations: [
    use(plateHole, "area"),
    use(plateHole, "centroid"),
    use(cutoutBracket, "centroid"),
    use(notchedPlate, "centroid"),
    use(linkPlate, "centroid"),
  ],
  hints: [],
  explanation:
    "A hole is a part with negative area: subtract its area in $\\Sigma A$ and its first moment in $\\Sigma \\tilde{x} A$ and $\\Sigma \\tilde{y} A$. " +
    "The centroid always moves away from the hole — and an awkward shape (an L, a notched plate) is often easiest as a simple shape minus another.",
};

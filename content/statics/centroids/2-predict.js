// Unit 7.1, stage 2 — predict centroids (and a centre of gravity) of composite shapes.
// The shapes and their hand checks are in the lesson library (library/shapes.js):
//   L-plate x̄ = ȳ = 1.1 m;  tee ȳ = 2.643 m;  ramp block x̄ = 1.857, ȳ = 0.857 m;
//   arch ȳ = 1.899 m;  bracket (by weight) x̄ = 0.8125, ȳ = 0.5 m.

import { use } from "../../../src/core/library.js";
import { lPlate, tee, rampBlock, arch, bracket } from "../library/shapes.js";

export default {
  id: "centroids/2-predict",
  challenge: "predict",
  solver: "statics.centroid",
  title: "Where Is the Centroid?",
  mission: "Predict where a composite shape's area (or a body's weight) acts.",
  instructions: "Predict the centroid's coordinates.",
  situations: [lPlate, tee, rampBlock, arch, bracket].map((s) => use(s, "centroid")),
  hints: [],
  explanation:
    "Split the shape into simple parts, list each part's area (or weight) and centroid, and take the weighted average: $\\bar{x} = \\Sigma \\tilde{x} A / \\Sigma A$. " +
    "Triangles: ⅓ from the right angle. Half circles: $4r/3\\pi$ from the flat edge. A body of different materials: weigh by weight, not area.",
};

// Unit 10.1, stage 2 — predict: Ī_x of an I-beam, a T-beam (with ȳ), an unequal I-beam, a hollow box,
// and a plank about its base. Hand checks in library/sections.js:
//   I-beam 186.36;  T-beam ȳ = 135.45 mm, 26.18;  unequal I ȳ = 98.0 mm, 98.89;  box 13.87;  plank base 67.5 (×10⁶ mm⁴).

import { use } from "../../../src/core/library.js";
import { iBeam, tBeam, unequalI, hollowBox, plankBase } from "../library/sections.js";

export default {
  id: "inertia/2-predict",
  challenge: "predict",
  solver: "statics.inertia",
  title: "How Stiff Is It?",
  mission: "Predict beam sections' moments of inertia.",
  instructions: "Predict the answer.",
  situations: [use(iBeam, "Ix"), use(tBeam, "tee"), use(unequalI, "tee"), use(hollowBox, "Ix"), use(plankBase, "axis")],
  hints: [],
  explanation:
    "Split the section into rectangles, find where its centroid is, then add each part's $\\bar{I} = bh^3/12$ and its $A d^2$ (d to the section's centroid). " +
    "A hole subtracts its Ī (and its $A d^2$). About another axis, add $A d^2$ for the whole section.",
};

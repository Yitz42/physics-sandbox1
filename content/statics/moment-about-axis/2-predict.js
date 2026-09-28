// Unit 4.8, stage 2 — predict a moment about an axis: a crank on a slanted shaft, or a tilting
// flagpole about its hinge line (hand checks in library/moments3d.js).

import { use } from "../../../src/core/library.js";
import { crankOnShaft, tiltingPole } from "../library/moments3d.js";

export default {
  id: "moment-about-axis/2-predict",
  challenge: "predict",
  solver: "statics.force3d",
  title: "About the Axis",
  mission: "Predict how hard a force turns a body about a given axis.",
  instructions: "Predict the answers.",
  situations: [use(crankOnShaft, "axis"), use(tiltingPole, "axis")],
  hints: [],
  explanation:
    "Two steps: the moment about a point ON the axis, $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$; then its part along the axis, $M_a = \\mathbf{u}_a \\cdot \\mathbf{M}_O$. " +
    "Together that's the triple product $\\mathbf{u}_a \\cdot (\\mathbf{r} \\times \\mathbf{F})$.",
};

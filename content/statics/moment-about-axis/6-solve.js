// Unit 4.8, stage 6 — solve: a rope pulls on a crank; its moment about the slanted shaft
// (library/moments3d.js, crankAndRope; hand check there).

import { use } from "../../../src/core/library.js";
import { crankAndRope } from "../library/moments3d.js";

export default {
  id: "moment-about-axis/6-solve",
  challenge: "solve",
  solver: "statics.force3d",
  title: "Turn the Shaft",
  mission: "Find how hard a rope turns a crank about its slanted shaft.",
  ...use(crankAndRope, "axis"),
  solve: { steps: ["choices", "answer"], choicesName: "Write r, T, r × T and M_a" },
  explanation:
    "The triple product in steps: $\\mathbf{r}$ from a point on the axis, $\\mathbf{T}$ from its coordinates, $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{T}$, then $M_a = \\mathbf{u}_a \\cdot \\mathbf{M}_O$. " +
    "Its sign says which way the rope turns the shaft.",
};

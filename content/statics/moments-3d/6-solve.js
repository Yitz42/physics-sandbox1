// Unit 4.7, stage 6 — solve: a load and a rope on a bracket; the total moment about O
// (library/moments3d.js, bracketTwoForces; hand check there).

import { use } from "../../../src/core/library.js";
import { bracketTwoForces } from "../library/moments3d.js";

export default {
  id: "moments-3d/6-solve",
  challenge: "solve",
  solver: "statics.force3d",
  title: "Two Forces on a Bracket",
  mission: "Find the total moment of two forces in space about the wall fitting O.",
  ...use(bracketTwoForces, "moment"),
  solve: { steps: ["choices", "answer"], choicesName: "Write r, F and r × F" },
  explanation:
    "Each force needs its own $\\mathbf{r}$ (to where IT acts) and its own cross product; then the moments add part by part. The total says how the wall fitting is loaded: " +
    "$M_x$ and $M_y$ bend the bracket, $M_z$ twists it.",
};

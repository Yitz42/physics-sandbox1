// Unit 4.7, stage 2 — predict the moment about O as a Cartesian vector. A different picture each
// version: a rope on a bent pipe, or the flagpole cable of Unit 2.3 (hand checks in library/moments3d.js).

import { use } from "../../../src/core/library.js";
import { pipeAndRope, poleCableMoment } from "../library/moments3d.js";

export default {
  id: "moments-3d/2-predict",
  challenge: "predict",
  solver: "statics.force3d",
  title: "r × F",
  mission: "Predict a force's moment about a point in space, part by part.",
  instructions: "Predict the answers.",
  situations: [use(pipeAndRope, "moment"), use(poleCableMoment, "moment")],
  hints: [],
  explanation:
    "Two vectors, one cross product: $\\mathbf{r}$ from O to the force's line and $\\mathbf{F}$ as a Cartesian vector, then " +
    "$\\mathbf{M}_O = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ r_x & r_y & r_z \\\\ F_x & F_y & F_z \\end{vmatrix}$ — with the minus on the middle term.",
};

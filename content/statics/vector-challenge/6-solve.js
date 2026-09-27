// Unit 2.4, stage 6 — solve, in two parts, each with every way of giving a direction:
//   1. a sign lifted by three lines (an angle, coordinates, a slope): work BACKWARDS from the
//      known resultant to the two unknown sizes;
//   2. a mast pulled three ways in space (direction angles, an azimuth and elevation, a line):
//      the resultant's size and direction angles.
// Hand checks in library/backwards.js (signHook) and library/forces3d.js (mastThreeWays).

import { use } from "../../../src/core/library.js";
import { signHook } from "../library/backwards.js";
import { mastThreeWays } from "../library/forces3d.js";

export default {
  id: "vector-challenge/6-solve",
  challenge: "solve",
  title: "Every Direction at Once",
  mission: "Solve two full problems that mix every way a force's direction can be given.",
  explanation:
    "Whatever the problem, the method is the same: turn every force into components — from an angle, a slope, coordinates or angles in space — then use $F_R = \\Sigma F$ one component at a time. " +
    "If the resultant is known, those same equations find the unknown forces instead.",
  parts: [
    {
      ...use(signHook, "sizes"),
      title: "Lift the sign",
      solver: "statics.particle",
      mission: "Work backwards from the resultant to a rope tension and a chain force.",
      solve: { steps: ["equations", "answer"] },
      explanation:
        "Each unknown gets its direction from a different kind of information, but they all end up as fractions in the same two equations: $F_{Rx} = \\Sigma F_x = 0$ ties the two unknowns together, " +
        "and $F_{Ry} = \\Sigma F_y = F_R$ fixes their sizes.",
    },
    {
      ...use(mastThreeWays, "resultant"),
      title: "Three ways in space",
      solver: "statics.force3d",
      mission: "Find the resultant of three forces in space, each given a different way.",
      solve: { steps: ["choices", "answer"], choicesName: "Write the forces" },
      explanation:
        "Three descriptions, one goal: a unit vector for each force — $(\\cos\\alpha, \\cos\\beta, \\cos\\gamma)$, $(\\cos\\phi\\cos\\theta, \\cos\\phi\\sin\\theta, \\sin\\phi)$ or $\\mathbf{r}_{AB}/r_{AB}$. " +
        "Once every force is a Cartesian vector, adding them is just adding $\\mathbf{i}$, $\\mathbf{j}$ and $\\mathbf{k}$ parts.",
    },
  ],
};

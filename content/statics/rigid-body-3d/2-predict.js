// Unit 5.6, stage 2 — predict: a shelf plate on a cable, a windlass on bearings, a boom on two cables.
// Hand checks in library/rigid3d.js: shelf T = 969.45 N, B_z = 25.0 N, A_z = 295.25 N;
// windlass P = 200 N, B_x = 260 N, B_z = 200 N;  boom T_BC = 734.85 N, A_x = 1200 N.

import { use } from "../../../src/core/library.js";
import { shelfPlate, windlass, boom3d } from "../library/rigid3d.js";

export default {
  id: "rigid-body-3d/2-predict",
  challenge: "predict",
  solver: "statics.force3d",
  title: "Forces in Space",
  mission: "Predict cable tensions and bearing reactions on bodies in 3D.",
  instructions: "Predict the answers.",
  situations: [use(shelfPlate, "reactions"), use(windlass, "reactions"), use(boom3d, "reactions")],
  hints: [],
  explanation:
    "Replace every support with its reactions, then look for axes that pass through as many unknowns as possible: moments about them leave one unknown at a time. " +
    "The force sums finish the job.",
};

// Unit 5.6, stage 4 — debug: one wrong line in a student's working for the shelf plate (library/rigid3d.js).
// Correct (default): u = (−0.728, −0.485, 0.485); ΣM_x → T = 969.45 N; ΣM_y → B_z = 25.0 N; ΣF_z → A_z = 295.25 N.

import { shelfPlate } from "../library/rigid3d.js";

export default {
  id: "rigid-body-3d/4-debug",
  challenge: "debug",
  solver: "statics.force3d",
  title: "Check the Shelf",
  mission: "Find and fix the mistake in a student's 3D equilibrium working.",
  instructions: "A plate shelf is hinged on a ball-and-socket A and a bearing B, and held by a cable CE. A student worked out the cable's tension and the vertical reactions, one equation at a time. One line is wrong.",
  setup: shelfPlate.setup,
  vary: shelfPlate.vary,
  debug: {
    view: "steps",
    intro: "The student's working (moments about axes through A):",
    mutations: [{ slip: "noUnit" }, { slip: "arm", force: "W" }, { slip: "sign" }, { slip: "drop", reaction: "B_z" }],
  },
  hints: [
    "Is the cable's direction a UNIT vector?",
    "A moment arm about an axis is measured square to the axis and to the force.",
    "Check each term's sign with $\\mathbf{r} \\times \\mathbf{F}$ — and that every force along z is in $\\Sigma F_z$.",
  ],
  explanation:
    "Cable: $\\mathbf{u} = \\mathbf{r}/r$. About the x axis (the hinge) only T's upward part, W and P turn the shelf, with arms measured along y. " +
    "About the y axis, $B_z$, T and the loads, arms along x. Then $\\Sigma F_z$ with every vertical force — $B_z$ included.",
};

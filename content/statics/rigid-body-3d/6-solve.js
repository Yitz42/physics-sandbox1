// Unit 5.6, stage 6 — solve: a windlass on two bearings, or a boom on two cables — the six equations,
// then the unknowns. Hand checks in library/rigid3d.js: windlass P = 200 N, B_x = 260 N, B_z = 200 N,
// A_z = 300 N;  boom T_BC = 734.85 N, A_x = 1200 N.

import { use } from "../../../src/core/library.js";
import { windlass, boom3d } from "../library/rigid3d.js";

export default {
  id: "rigid-body-3d/6-solve",
  challenge: "solve",
  solver: "statics.force3d",
  title: "Six Equations",
  mission: "Write a 3D body's six equilibrium equations, then solve them.",
  situations: [
    use(windlass, "reactions", { ask: [{ quantity: "P", min: 0 }, { quantity: "B_x" }, { quantity: "B_z" }, { quantity: "A_z" }] }),
    use(boom3d, "reactions"),
  ],
  solve: {
    steps: ["equations", "answer"],
    equationMode: "numeric",
    intros: { equations: "Every support is replaced by its reactions (the picture). Choose the correct equation in each group: three force sums, then moments about the x, y and z axes through A." },
  },
  explanation:
    "Six equations for six ways to move. About axes through A its reactions vanish; about the shaft (or the boom) only the loads and the one pull that holds them appear. " +
    "Solve those first, then the force sums give the rest.",
};

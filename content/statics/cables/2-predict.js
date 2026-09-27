// Cables, stage 2 — predict both cable tensions.
// Hand check (default numbers): W = 60(9.81) = 588.6 N.
// ΣFx: −T_AB cos30° + T_AC cos45° = 0;  ΣFy: T_AB sin30° + T_AC sin45° − 588.6 = 0
// → T_AB = 588.6 / (sin30° + cos30°·tan45°) = 430.9 N,  T_AC = 527.7 N.

import { crateSetup } from "../shared/crate.js";

export default {
  id: "cables/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Predict the Tensions",
  instructions:
    "The crate hangs at rest. Using the angles and mass in the picture, predict the tension in each cable, then press **Test**.",
  setup: crateSetup({ angleAB: 30, angleAC: 45, mass: 60 }),
  vary: [
    { path: "forces.#T_AB.direction.angle", values: [20, 25, 30, 35, 40, 50, 55, 60] },
    { path: "forces.#T_AC.direction.angle", values: [25, 30, 35, 40, 45, 50, 60, 65] },
    { path: "forces.#W.mass", min: 20, max: 120, step: 5 },
  ],
  ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }], // tensions are never negative
  hints: [
    "Draw the FBD of ring A: $T_{AB}$ and $T_{AC}$ pull along the cables, $W = mg$ pulls straight down.",
    "$\\Sigma F_x = 0$: $-T_{AB}\\cos\\theta_{AB} + T_{AC}\\cos\\theta_{AC} = 0$. Use it to write $T_{AC}$ in terms of $T_{AB}$.",
    "Substitute into $\\Sigma F_y = 0$: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} - W = 0$.",
  ],
  explanation:
    "Two unknowns, two equations. $\\Sigma F_x = 0$ says the horizontal pulls cancel, which fixes the ratio of the tensions. " +
    "$\\Sigma F_y = 0$ says the vertical pulls add up to the weight, which fixes their size. Don't forget $W = mg$, not $m$!",
};

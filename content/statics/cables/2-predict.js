// Cables, stage 2 — predict both cable tensions, in a different situation
// each version (see `situations` in src/core/content.js): a crate on two
// cables, a traffic light between poles, a balloon held down by tethers, and
// a lamp pulled aside by a level cord. The same two equations every time,
// ΣFx = 0 and ΣFy = 0 at A, but each picture has to be read afresh.
//
// Hand checks (each situation's default numbers):
//   crate:         W = 60(9.81) = 588.6 N, AB 30°, AC 45°.
//                  ΣFx: −T_AB cos30° + T_AC cos45° = 0;  ΣFy: T_AB sin30° + T_AC sin45° − 588.6 = 0
//                  → T_AB = 588.6 / (sin30° + cos30°·tan45°) = 430.9 N,  T_AC = 527.7 N.
//   traffic light: W = 25(9.81) = 245.25 N, AB 10°, AC 15° (both above level).
//                  T_AB = W cos15°/sin25° = 560.5 N,  T_AC = W cos10°/sin25° = 571.5 N
//                  — more than twice the light's weight, because the wires are nearly flat.
//   balloon:       F_L = 600 N up; tethers AB 40° and AC 55° BELOW level.
//                  ΣFx: −T_AB cos40° + T_AC cos55° = 0;  ΣFy: 600 − T_AB sin40° − T_AC sin55° = 0
//                  → T_AB = 600 cos55°/sin95° = 345.5 N,  T_AC = 600 cos40°/sin95° = 461.4 N.
//   lamp aside:    W = 12(9.81) = 117.72 N, AB 60°, cord AC level.
//                  ΣFy: T_AB sin60° = W → T_AB = 135.9 N;  ΣFx: T_AC = T_AB cos60° = 68.0 N.

import { crateSetup } from "../shared/crate.js";
import { trafficLightSetup, balloonSetup, lampAsideSetup } from "../shared/hanging.js";

const AB = "forces.#T_AB.direction.angle";
const AC = "forces.#T_AC.direction.angle";

export default {
  id: "cables/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Predict the Tensions",
  ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }], // tensions are never negative
  explanation:
    "Two unknowns, two equations. $\\Sigma F_x = 0$ says the horizontal pulls cancel, which fixes the ratio of the tensions. " +
    "$\\Sigma F_y = 0$ says the vertical pulls balance, which fixes their size. Whatever the picture — a crate, a traffic light, a balloon — " +
    "draw the FBD of the point where the cables meet and read each force's direction from the picture. Don't forget $W = mg$, not $m$!",
  situations: [
    {
      name: "crate",
      instructions:
        "The crate hangs at rest. Using the angles and mass in the picture, predict the tension in each cable, then press **Test**.",
      setup: crateSetup({ angleAB: 30, angleAC: 45, mass: 60 }),
      vary: [
        { path: AB, values: [20, 25, 30, 35, 40, 50, 55, 60] },
        { path: AC, values: [25, 30, 35, 40, 45, 50, 60, 65] },
        { path: "forces.#W.mass", min: 20, max: 120, step: 5 },
      ],
      hints: [
        "Draw the FBD of ring A: $T_{AB}$ and $T_{AC}$ pull along the cables, $W = mg$ pulls straight down.",
        "$\\Sigma F_x = 0$: $-T_{AB}\\cos\\theta_{AB} + T_{AC}\\cos\\theta_{AC} = 0$. Use it to write $T_{AC}$ in terms of $T_{AB}$.",
        "Substitute into $\\Sigma F_y = 0$: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} - W = 0$.",
      ],
    },
    {
      name: "traffic light",
      instructions:
        "A traffic light hangs over the street from two wires strung between poles. The wires are nearly level. " +
        "Predict the tension in each wire, then press **Test**. (Guess first: more or less than the light's weight?)",
      setup: trafficLightSetup({ angleAB: 10, angleAC: 15, mass: 25 }),
      vary: [
        { path: AB, values: [6, 8, 10, 12, 15, 18] },
        { path: AC, values: [8, 10, 12, 15, 18, 20] },
        { path: "forces.#W.mass", min: 15, max: 40, step: 1 },
      ],
      hints: [
        "Isolate A, where the wires meet: $T_{AB}$ and $T_{AC}$ pull along the wires, $W = mg$ pulls down.",
        "The angles are measured from the level, so the vertical parts are $T\\sin\\theta$ — small, because the angles are small.",
        "$\\Sigma F_y = 0$: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} = W$. Small sines mean big tensions!",
      ],
    },
    {
      name: "balloon",
      instructions:
        "A balloon pulls up on ring A with a net lift $F_L$ (its buoyancy minus its own weight). Two tethers hold it down to the ground. " +
        "Predict the tension in each tether, then press **Test**.",
      setup: balloonSetup({ angleAB: 40, angleAC: 55, lift: 600 }),
      vary: [
        { path: AB, values: [30, 35, 40, 45, 50, 55, 60] },
        { path: AC, values: [30, 35, 40, 45, 50, 55, 60] },
        { path: "forces.#F_L.magnitude", min: 300, max: 900, step: 50 },
      ],
      hints: [
        "Isolate A: $F_L$ pulls up, and each tether pulls DOWN along itself, toward the ground.",
        "$\\Sigma F_y = 0$: $F_L - T_{AB}\\sin\\theta_{AB} - T_{AC}\\sin\\theta_{AC} = 0$. The tethers' vertical parts are negative.",
        "$\\Sigma F_x = 0$: $-T_{AB}\\cos\\theta_{AB} + T_{AC}\\cos\\theta_{AC} = 0$, the same as for a hanging crate.",
      ],
    },
    {
      name: "lamp aside",
      instructions:
        "A lamp hangs from cable AB. A level cord AC pulls it aside to the wall. Predict the tension in the cable and in the cord, then press **Test**.",
      setup: lampAsideSetup({ angleAB: 60, mass: 12 }),
      vary: [
        { path: AB, values: [40, 45, 50, 55, 60, 65, 70] },
        { path: "forces.#W.mass", min: 4, max: 20, step: 1 },
      ],
      hints: [
        "Isolate A: $T_{AB}$ pulls up-left along the cable, $T_{AC}$ pulls straight right, $W$ pulls down.",
        "The cord is level, so it has no vertical part. $\\Sigma F_y = 0$ has only $T_{AB}$ in it: $T_{AB}\\sin\\theta = W$.",
        "Then $\\Sigma F_x = 0$: $T_{AC} = T_{AB}\\cos\\theta$.",
      ],
    },
  ],
};

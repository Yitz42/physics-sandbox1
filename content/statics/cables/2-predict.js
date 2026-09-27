// Cables, stage 2 — predict both cable tensions, in a different situation
// each version (see `situations` in src/core/content.js), from the lesson library: a crate on two
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

import { use } from "../../../src/core/library.js";
import { crate, trafficLight, balloon, lampAside } from "../library/hanging.js";

export default {
  id: "cables/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Predict the Tensions",
  mission: "Predict the tension in each cable holding the crate.",
  ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }], // tensions are never negative
  explanation:
    "Two unknowns, two equations. $\\Sigma F_x = 0$ says the horizontal pulls cancel, which fixes the ratio of the tensions. " +
    "$\\Sigma F_y = 0$ says the vertical pulls balance, which fixes their size. Whatever the picture — a crate, a traffic light, a balloon — " +
    "draw the FBD of the point where the cables meet and read each force's direction from the picture. Don't forget $W = mg$, not $m$!",
  // The situations come from the lesson library (content/statics/library/hanging.js),
  // each with its "tensions" question: its words, numbers and hints.
  situations: [crate, trafficLight, balloon, lampAside].map((s) => use(s, "tensions")),
};

// Cables, stage 6 — solve, from FBD to answer, in a different situation each
// version (see `situations` in src/core/content.js): a hanging lamp, a traffic
// light between poles, and a balloon held down by two tethers. Each has its own
// picture and its own tempting wrong forces in the FBD palette.
//
// Hand checks (each situation's default numbers):
//   lamp:          W = 20(9.81) = 196.2 N; AB on a 3-4-5 slope, AC at 45°.
//                  ΣFx: −(4/5)T_AB + T_AC cos45° = 0;  ΣFy: (3/5)T_AB + T_AC sin45° − 196.2 = 0
//                  Adding (cos45° = sin45°): 1.4 T_AB = 196.2 → T_AB = 140.1 N, T_AC = 158.6 N.
//                  (Same numbers as the test in tests/statics/particle.test.js.)
//   traffic light: W = 20(9.81) = 196.2 N; AB on a 5-12-13 slope, AC at 20°.
//                  ΣFx: −(12/13)T_AB + T_AC cos20° = 0 → T_AC = (12/13)T_AB / cos20°
//                  ΣFy: (5/13)T_AB + T_AC sin20° = 196.2 → T_AB (5/13 + (12/13) tan20°) = 196.2
//                  → T_AB = 272.3 N, T_AC = 267.5 N.
//   balloon:       F_L = 700 N up; tether AB on a 3-4-5 slope DOWN to the left, AC 50° below level.
//                  ΣFx: −(3/5)T_AB + T_AC cos50° = 0 → T_AC = 0.6 T_AB / cos50°
//                  ΣFy: 700 − (4/5)T_AB − T_AC sin50° = 0 → T_AB (0.8 + 0.6 tan50°) = 700
//                  → T_AB = 462.0 N, T_AC = 431.3 N.

import { use } from "../../../src/core/library.js";
import { lamp, trafficLightOnSlope, balloonOnSlope } from "../library/hanging.js";

export default {
  id: "cables/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "The Whole Problem",
  mission: "Find the cable tensions holding the lamp: FBD, equations, answers.",
  ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }], // tensions are never negative
  explanation:
    "The full method, whatever the picture: (1) isolate the point where the cables meet and draw every force on it, " +
    "(2) write $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ using components, (3) solve the two equations for the two unknowns. " +
    "A positive tension confirms the cable really is pulling.",
  // From the lesson library (content/statics/library/hanging.js), each with its
  // "solve" question: its FBD palette (with tempting wrong forces), numbers and hints.
  situations: [lamp, trafficLightOnSlope, balloonOnSlope].map((s) => use(s, "solve")),
};

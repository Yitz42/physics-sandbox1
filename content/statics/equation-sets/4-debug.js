// Unit 4.3, stage 4 — debug: one mistake in a student's ΣM_A, ΣM_B, ΣF_x.
// The beam with a slanted push (lesson library, beams.js): pin A (0), roller B (5 m),
// P down and to the right (c_x P right, c_y P down) at C.
// P's line of action misses A by d = AC × c_y and B by CB × c_y (not AC and CB) — e.g.
// 3-4-5 at 3 m: 2.4 m and 1.6 m.
// Correct:  ΣM_A = 5B_y − (AC c_y)P = 0,  ΣM_B = −5A_y + (CB c_y)P = 0,  ΣF_x = A_x + c_x P = 0

import { use } from "../../../src/core/library.js";
import { slantedBeam, withSet } from "../library/beams.js";

const beam = use(withSet(slantedBeam, [{ M: "A" }, { M: "B" }, { F: "x" }]));

export default {
  id: "equation-sets/4-debug",
  challenge: "debug",
  solver: "statics.rigidBody",
  title: "Check the Three Equations",
  mission: "Find and fix the mistake in a student's two moment equations and one force equation.",
  instructions:
    `${beam.instructions} A student chose $\\Sigma M_A$, $\\Sigma M_B$ and $\\Sigma F_x$ — a good set, one unknown each — ` +
    "but one term is wrong. Click it, then choose the fix.",
  setup: beam.setup,
  view: beam.view,
  vary: beam.vary,
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's equations (counterclockwise positive):",
    mutations: [
      { equation: "sumM_A", kind: "swap", term: "P",
        explain: "The moment arm of $P$ is the **perpendicular** distance from A to $P$'s line of action, not the distance along the beam. Only $P$'s down part turns the beam, so $d_P$ is AC times $P$'s down fraction." },
      { equation: "sumM_B", kind: "sign", term: "A_y",
        explain: "$A_y$ pushes up at A, to the LEFT of B: about B it turns the beam **clockwise**, so its moment is negative." },
      { equation: "sumFx", kind: "missing", term: "P",
        explain: "$P$ is slanted: its sideways part, to the right, belongs in $\\Sigma F_x$." },
      { equation: "sumM_B", kind: "swap", term: "P",
        explain: "About B too, $P$'s arm is the perpendicular distance to its line of action — CB times $P$'s down fraction, not CB." },
    ],
  },
  hints: [
    "Check each moment arm: is it the perpendicular distance from the moment point to the force's line of action?",
    "Check each sign: does the force turn the beam counterclockwise (+) or clockwise (−) about THAT equation's point?",
    "Check $\\Sigma F_x$: every force with a sideways part belongs.",
  ],
  explanation:
    "Two moment equations are written exactly like one: each force's moment about that equation's own point, with the perpendicular arm and the turning sense seen from that point. " +
    "The same force can turn the beam one way about A and the other way about B.",
};

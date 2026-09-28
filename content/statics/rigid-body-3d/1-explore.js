// Unit 5.6, stage 1 — explore: a plate shelf hinged on a ball-and-socket A and a bearing B, held by a
// cable from its corner C to E on the wall. Move E and watch the tension and the reactions.
// T u_z = 470.25 N always (ΣM_x: 2 T u_z = W(1) + P(1.5)), so T = 470.25 r/z_E, r = √((x_E − 3)² + 4 + z_E²).
// Start: E (0, 0, 2): T = 969.45 N, A_x = 705.4 N, A_y = 470.25 N (no task done yet).
// Checks: T < 600 N (e.g. E (3, 0, 3): 470.25 √13/3 = 565.2 N);  A_x = 0 (x_E = 3);  A_y > A_x.

import { shelfPlate } from "../library/rigid3d.js";

export default {
  id: "rigid-body-3d/1-explore",
  challenge: "explore",
  solver: "statics.force3d",
  title: "Hang the Shelf",
  mission: "Move a shelf's cable anchor around the wall and see how the forces in space change.",
  instructions:
    "A plate shelf is hinged along AB (a ball-and-socket at A, a bearing at B) and held level by a cable CE. Slide the anchor E along the wall and up and down, " +
    "and watch the cable's tension and the hinge's reactions — six equations, solved live.",
  setup: { ...shelfPlate.setup, keepInView: [[0, 0, 3.2], [3, 0, 3.2]] },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**Move the cable's anchor E higher up the wall. The cable's tension…**",
    options: [
      { text: "drops", correct: true },
      { text: "rises", feedback: "A steeper cable points more UP: more of its pull holds the shelf, so it needs less pull in all." },
      { text: "stays the same", feedback: "Only its UPWARD part $T u_z$ is fixed (by the moments about the hinge). A steeper cable gets that with less T." },
    ],
    explain: "About the hinge line only T's upward part counts: $T u_z$ is fixed, so a steeper cable (bigger $u_z$) needs less T.",
  },
  editable: [
    { path: "points.E.0", label: "E along the wall (x)", min: 0, max: 3, step: 0.25, unit: "m" },
    { path: "points.E.2", label: "E's height (z)", min: 0.5, max: 3, step: 0.25, unit: "m" },
  ],
  tasks: [
    { text: "Get the cable's tension under **600 N**.", check: (v) => v.T < 600 },
    { text: "Make the ball-and-socket's sideways reaction $A_x$ **zero**.", check: (v) => Math.abs(v.A_x) < 1e-6 },
    { text: "Make $A_y$ bigger than $A_x$.", check: (v) => v.A_y > v.A_x + 1e-9 },
  ],
  hints: [
    "About the hinge line AB, only T's upward part $T u_z$ has a moment — so a steeper cable needs less tension.",
    "$A_x$ balances the cable's x-part. Put E straight across from C and the cable has no x-part.",
    "$A_y$ balances the cable's y-part, $A_x$ its x-part: make the cable run more along y than along x.",
  ],
  explanation:
    "In 3D each reaction balances the part of the loads along its own direction, and moments about well-chosen axes pick them off one by one: about the hinge line only the cable's upward pull and the loads appear. " +
    "Six equations, six unknowns ($A_x, A_y, A_z, B_y, B_z, T$).",
};

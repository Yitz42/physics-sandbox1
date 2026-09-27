// Unit 8.2, stage 1 — explore: move a point load and change a uniform load, and watch the
// shear and moment diagrams change.
// Pin A (0), roller B (6), P = 1500 N at a, w over the whole span:
//   A_y = 1500(6 − a)/6 + 3w,  B_y = 1500a/6 + 3w.
// Start: a = 1, w = 400 → A_y = 2450 N; V crosses zero at x = 1 + 550/400 = 2.375 m; M_max = 2628 N·m there.
// Checks: M_max > 3500 — e.g. a = 3, w = 800 → M(3) = 5850 N·m;  peak under the load — w = 0, or a near the middle;
//         a flat shear diagram — w = 0;  |V_max| > 3000 N — w = 800, a = 0.5 → A_y = 3775 N.

export default {
  id: "shear-moment-diagrams/1-explore",
  challenge: "explore",
  solver: "statics.internal",
  title: "Draw the Diagrams",
  mission: "Change the loads and watch the shear and moment diagrams follow.",
  instructions:
    "Under the beam are its **shear diagram** V and its **moment diagram** M — the shear and bending moment at every point along it. " +
    "Move the point load and change the uniform load. Watch where V jumps, where it slopes, and where M is biggest.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 1500, direction: "down", at: [1, 0], push: true }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 6, w: 400 }],
    view: "diagrams",
    showDiagrams: true,
    knownReactions: true,
  },
  view: { xmin: -1.4, xmax: 7.2, ymin: -7.9, ymax: 2.4 },
  tallPicture: true,
  editable: [
    { path: "forces.0.at.0", label: "Point load position", min: 0.5, max: 5.5, step: 0.25, unit: "m" },
    { path: "loads.0.w", label: "Uniform load w", min: 0, max: 800, step: 50, unit: "N/m" },
  ],
  tasks: [
    { text: "Make the largest bending moment bigger than **3500 N·m**.", check: (v) => Math.abs(v.Mmax) > 3500 },
    { text: "Make the peak moment sit exactly **under the point load**.", check: (v, s) => Math.abs(v.xM - s.forces[0].at[0]) < 1e-6 },
    { text: "Make the shear diagram **flat** everywhere (no slope).", check: (v, s) => s.loads[0].w === 0 },
    { text: "Make the largest shear bigger than **3000 N**.", check: (v) => Math.abs(v.Vmax) > 3000 },
  ],
  hints: [
    "V jumps DOWN by P at the point load, and slopes down at the rate w under the uniform load.",
    "M peaks where V crosses zero. If V crosses zero right at the jump, the peak is under the load.",
    "Only a distributed load makes V slope: take it away and V is made of flat steps.",
  ],
  explanation:
    "Walking along the beam: V jumps at every point force and slopes at the rate $-w$ under a distributed load. M rises while V is positive and falls while it's negative, " +
    "so M peaks where V passes through zero — under the point load when V jumps through zero there, or under the uniform load where V's slope crosses zero.",
};

// Unit 8.1, stage 1 — explore: slide a cut along a loaded beam and watch N, V and M at it.
// Pin A (0), roller B (6), P = 1200 N at a: A_y = 1200(6 − a)/6.
//   Left of the load (x < a): V = A_y, M = A_y x.   Right of it: V = A_y − 1200 = −1200a/6, M = A_y x − 1200(x − a).
// Start: a = 3, cut at 1 → V = 600 N, M = 600 N·m (no task done yet).
// Checks: V < 0 — any cut right of the load;  M > 1500 N·m — e.g. a = 3, cut at 3 ± 0.25 (M = 1800 − … ≥ 1650);
//         V = +1000 N — a = 1, any cut left of it (A_y = 1000);  M < 300 N·m right of the load — cut near B.

export default {
  id: "internal-forces/1-explore",
  challenge: "explore",
  solver: "statics.internal",
  title: "Cut the Beam",
  mission: "Slide a cut along a beam and watch the forces inside it.",
  instructions:
    "A beam on a pin at A and a roller at B carries a load P. It's cut at C and pulled apart: the left piece (solid) is held in equilibrium by the reactions, the load on it, and three internal forces on its cut face — **N**, **V** and **M**, drawn in their positive directions. " +
    "Slide the cut and the load, and watch how they change.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [3, 0], push: true }],
    cut: 1,
    view: "cut",
  },
  view: { xmin: -1.6, xmax: 7.8, ymin: -2.2, ymax: 2.4 },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**If you slide the cut from left of the load to right of it, the shear V…**",
    options: [
      { text: "jumps down by $P$", correct: true },
      { text: "stays the same", feedback: "Past the load, the left piece carries $P$ too: $V$ drops by 1200 N." },
      { text: "changes gradually", feedback: "With no load between points, $V$ is constant; it jumps only at a point load." },
    ],
    explain: "The shear on a cut is the net vertical force on one piece: crossing a point load changes it by exactly $P$.",
  },
  editable: [
    { path: "cut", label: "Cut at C (x)", min: 0.25, max: 5.75, step: 0.25, unit: "m" },
    { path: "forces.0.at.0", label: "Load position", min: 0.5, max: 5.5, step: 0.5, unit: "m" },
  ],
  tasks: [
    { text: "Make the shear V at C **negative**.", check: (v) => v.V < -1e-6 },
    { text: "Make the bending moment at C bigger than **1500 N·m**.", check: (v) => v.M > 1500 },
    { text: "Make V at C exactly **+1000 N**.", check: (v) => Math.abs(v.V - 1000) < 0.5 },
    { text: "With the cut right of the load, make M at C smaller than **300 N·m**.", check: (v, s) => s.cut > s.forces[0].at[0] && v.M < 300 },
  ],
  hints: [
    "Left of the load, the left piece has only $A_y$ on it: V = $A_y$. Right of it, P is on the piece too.",
    "M grows with the distance from A while only $A_y$ acts: it is biggest right at the load.",
    "Near B, the piece to the right is tiny — and M there is small.",
  ],
  explanation:
    "The left piece's equations give $V = A_y$ (minus any loads on the piece) and $M = A_y x$ (minus each load times its distance to C). " +
    "So V jumps down at the load and M peaks there; M falls back to zero at the supports, where nothing is left to bend the beam.",
};

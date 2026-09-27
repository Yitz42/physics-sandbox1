// Unit 8.3, stage 4 — debug: one wrong line in a student's V(x) and M(x) equations.
// Pin A (0), roller B (6), P at 2 m, w from 2 to 6 m. P = 1200, w = 300:
//   load 1200 N at 4 m → B_y = (2400 + 4800)/6 = 1200, A_y = 1200 N.
//   Segment 1 (0–2): V = 1200,  M = 1200x
//   Segment 2 (2–6): V = 1200 − 1200 − 300(x − 2),  M = 1200x − 1200(x − 2) − 300(x − 2)²/2

export default {
  id: "shear-moment-equations/4-debug",
  challenge: "debug",
  solver: "statics.internal",
  title: "Check the Equations",
  mission: "Find the wrong line in a student's V(x) and M(x) equations.",
  instructions:
    "A beam on a pin at A and a roller at B carries a point load P and a uniform load from P to B. A student wrote V(x) and M(x) for both segments (with the reactions already found). One line is wrong. Click it, then choose the fix.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [2, 0], push: true }],
    loads: [{ id: "w", shape: "uniform", from: 2, to: 6, w: 300 }],
    view: "diagrams",
    noPlots: true,
    knownReactions: true,
  },
  vary: [
    { path: "forces.#P.magnitude", min: 600, max: 1600, step: 100 },
    { path: "loads.#w.w", min: 150, max: 500, step: 25 },
  ],
  debug: {
    view: "steps",
    intro: "The student's equations, segment by segment (x from A):",
    mutations: [
      { segment: 2, which: "M", slip: "sq" },
      { segment: 2, which: "M", slip: "linx" },
      { segment: 2, which: "V", slip: "sign", term: 1 },
      { segment: 2, which: "M", slip: "missing", term: 1 },
    ],
  },
  hints: [
    "In segment 2 the left piece holds $A_y$, P (at x = 2) and the load from 2 m to x.",
    "Each force's arm is measured from where it acts: P's is $(x - 2)$.",
    "The load on the piece, $w(x - 2)$, acts at its middle: its moment is $w\\,\\tfrac{(x-2)^2}{2}$.",
  ],
  explanation:
    "In segment 2: $V = A_y - P - w(x-2)$ and $M = A_y x - P(x-2) - w\\,\\tfrac{(x-2)^2}{2}$. Every force on the left piece, each with its arm from where it acts; the load's part at its own middle.",
};

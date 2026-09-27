// Unit 6.1, stage 4 — debug: one mistake in a student's equations for a joint.
// The triangular truss (A (0, 0), B (8, 0), C (4, 3)) with P down and H to the right at C.
// Correct (tension assumed, members pulling C toward A and toward B):
//   ΣF_x: H − (4/5)F_AC + (4/5)F_BC = 0
//   ΣF_y: −P − (3/5)F_AC − (3/5)F_BC = 0

export default {
  id: "trusses/4-debug",
  challenge: "debug",
  solver: "statics.truss",
  title: "Check the Joint",
  mission: "Find and fix the mistake in a student's equations for joint C.",
  instructions:
    "A student drew joint C with both member forces pulling away from it (tension assumed) and wrote its two equations. One term is wrong. Click it, then choose the fix.",
  setup: {
    joints: { A: [0, 0], B: [8, 0], C: [4, 3] },
    members: ["AB", "AC", "BC"],
    supports: [{ id: "A", type: "pin" }, { id: "B", type: "roller" }],
    forces: [
      { id: "P", symbol: "P", magnitude: 1200, direction: "down", joint: "C", push: true },
      { id: "H", symbol: "H", magnitude: 400, direction: "right", joint: "C", push: true },
    ],
    joint: "C",
    showReactions: "reveal",
  },
  view: { xmin: -1.4, xmax: 9.4, ymin: -1.4, ymax: 4.8 },
  vary: [
    { path: "forces.#P.magnitude", min: 600, max: 2400, step: 100 },
    { path: "forces.#H.magnitude", min: 100, max: 500, step: 50 },
  ],
  debug: {
    view: "equations",
    intro: "The student's equations for joint C:",
    mutations: [
      { equation: "C_x", kind: "swap", term: "F_BC",
        explain: "In $\\Sigma F_x$, $F_{BC}$'s part must be its run along x over its length, $\\tfrac{4}{5}$ — not its rise, $\\tfrac{3}{5}$." },
      { equation: "C_y", kind: "sign", term: "F_AC",
        explain: "Tension pulls C toward A, which is DOWN and to the left: $F_{AC}$'s y-part is negative, $-\\tfrac{3}{5}F_{AC}$." },
      { equation: "C_y", kind: "missing", term: "P",
        explain: "The load $P$ acts at joint C, so it belongs in the joint's $\\Sigma F_y$." },
      { equation: "C_x", kind: "sign", term: "H",
        explain: "$H$ pushes C to the right, so it enters $\\Sigma F_x$ as $+H$." },
    ],
  },
  hints: [
    "Tension pulls the joint toward the member's other end. Which way is that from C, for AC and for BC?",
    "Each slanted member: x-part = run/length, y-part = rise/length (here 4/5 and 3/5).",
    "Every force AT the joint belongs — the loads too.",
  ],
  explanation:
    "A joint's equations come straight from its FBD: each member pulls the joint toward its far end (tension assumed), with parts run/length and rise/length, " +
    "and every load at the joint joins in. Get these right, and a negative answer honestly means compression.",
};

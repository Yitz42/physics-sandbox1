// Unit 5.1, stage 6 — solve: a wall-mounted truss, at its loaded joint.
// Joints A (0, 0) and B (0, 3) on the wall, C (4, 0) out at the tip; BC on a 4-3-5 slope.
// A sits on a roller against the wall, B is pinned; the load P hangs at C.
// Joint C (tension assumed: F_AC pulls C toward A, left; F_BC pulls C toward B, up-left):
//   ΣF_y: (3/5)F_BC − P = 0         → F_BC = 5P/3      (P = 900 → +1500 N, tension)
//   ΣF_x: −F_AC − (4/5)F_BC = 0     → F_AC = −4P/3     (P = 900 → −1200 N, compression)
// (Same numbers as tests/statics/truss.test.js; AB turns out to be a zero-force member.)

export default {
  id: "trusses/6-solve",
  challenge: "solve",
  solver: "statics.truss",
  title: "The Wall Bracket Truss",
  mission: "Draw joint C's free-body diagram and find the forces in AC and BC.",
  instructions:
    "A small truss sticks out from a wall and carries a load $P$ at its tip, C. Joint C has only two members, so start there: " +
    "draw its free-body diagram, choose its equations, then find the member forces (tension positive).",
  setup: {
    joints: { A: [0, 0], B: [0, 3], C: [4, 0] },
    members: ["AB", "AC", "BC"],
    supports: [{ id: "A", type: "roller", normal: [1, 0] }, { id: "B", type: "pin", normal: [1, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 900, direction: "down", joint: "C" }],
    joint: "C",
    showReactions: "reveal",
    dims: [{ from: [0, -0.9], to: [4, -0.9] }, { from: [-1.1, 0], to: [-1.1, 3] }],
  },
  view: { xmin: -2.2, xmax: 5.6, ymin: -2.6, ymax: 3.8 },
  vary: [{ path: "forces.#P.magnitude", min: 300, max: 1500, step: 20 }],
  solve: {
    steps: ["fbd", "equations", "answer"],
    equationMode: "symbolic",
    intros: {
      fbd: "Draw the free-body diagram of joint C: every member that meets at C pulls on it (draw them as tension — the sign will tell), plus the load.",
      equations: "Choose joint C's two equations.",
    },
    candidates: [
      { id: "F_AC" },
      { id: "F_BC" },
      { id: "F_AB", symbol: "F_{AB}", at: "C", feedback: "Member AB doesn't touch joint C — it runs between A and B. Only the members that meet at C act on it." },
      { id: "C_y", symbol: "C_y", at: "C", feedback: "There's no support at C: nothing holds it except the two members (and the load pulls on it)." },
    ],
  },
  ask: [{ quantity: "F_BC" }, { quantity: "F_AC" }],
  hints: [
    "At C: $F_{AC}$ pulls left (toward A), $F_{BC}$ pulls up and to the left (toward B), and $P$ pulls down.",
    "ΣF_y: only $F_{BC}$ has an up-down part, $\\tfrac{3}{5}F_{BC}$. It must hold up $P$.",
    "ΣF_x: $-F_{AC} - \\tfrac{4}{5}F_{BC} = 0$. A negative $F_{AC}$ means AC pushes: compression.",
  ],
  explanation:
    "Joint C has just two unknowns, so its two equations solve it straight away: BC holds the load up by pulling (tension), and AC pushes the tip away from the wall (compression). " +
    "That's the method of joints: pick a joint with at most two unknowns, solve it, move on.",
};

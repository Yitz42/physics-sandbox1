// Unit 5.5, stage 2 — predict the direction of a pin force without solving,
// using the three-force rule, and the force in the two-force member.
// A beam is pinned to the wall at A (0, 0); a tie runs from B (4, 0) to D (0, 3)
// (a 3-4-5 slope); a load P hangs at x. Three forces → their lines meet at O:
//   the tie's line: y = 3 − 0.75x;  the load's line: x = x_P  →  O = (x_P, 3 − 0.75x_P)
//   so θ_A = tan⁻¹((3 − 0.75x_P)/x_P):  x_P = 2 → 36.9°;  x_P = 1 → 66.0°;  x_P = 3 → 14.0°
//   The tie: ΣM_A: 4(3/5)F_BD − P·x_P = 0 → F_BD = P·x_P/2.4 (x_P = 2, P = 600 → 500 N)
// (Same numbers as tests/statics/rigid-body.test.js.)

export default {
  id: "two-force-members/2-predict",
  challenge: "predict",
  solver: "statics.rigidBody",
  title: "Which Way Does the Pin Push?",
  mission: "Predict the pin force's direction from geometry, and the tie's force.",
  instructions:
    "The beam is pinned at A and held by a tie BD (a two-force member). The load $P$ hangs from it. " +
    "Only three forces act on the beam, so their lines of action meet at one point. Predict the angle $\\theta_A$ of the pin's force on the beam " +
    "(counterclockwise from $+x$) and the tie's force $F_{BD}$ (positive in tension).",
  setup: {
    body: { points: [[0, 0], [4, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0], normal: [1, 0] },
      { id: "B", type: "link", at: [4, 0], anchor: [0, 3], anchorLabel: "D", symbol: "F_{BD}" },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2, 0] }],
    dims: [{ from: [0, -0.8], to: [2, -0.8] }, { from: [2, -0.8], to: [4, -0.8] }, { from: [-0.9, 0], to: [-0.9, 3] }],
    showReactions: "reveal",
    showConcurrency: "reveal", // the meeting point O appears after Test: finding it is the question
  },
  view: { xmin: -1.8, xmax: 5.2, ymin: -2.2, ymax: 3.8 },
  vary: [
    { paths: ["forces.#P.at.0", "dims.0.to.0", "dims.1.from.0"], values: [1, 1.5, 2, 2.5, 3] },
    { path: "forces.#P.magnitude", min: 400, max: 900, step: 25 },
  ],
  ask: [{ quantity: "theta_A", unit: "deg", min: 0, max: 360 }, { quantity: "F_BD" }],
  hints: [
    "The tie is a two-force member: its force lies along BD. The load's line is vertical through where it hangs.",
    "Find O, where those two lines cross. The pin's force must point from A towards O: $\\theta_A = \\tan^{-1}(y_O / x_O)$.",
    "For $F_{BD}$, take moments about A: the tie's vertical part, $\\tfrac{3}{5}F_{BD}$, acts 4 m from A.",
  ],
  explanation:
    "The beam is a three-force member: $P$, the tie's force along BD, and the pin force. Three forces in equilibrium are concurrent, so the pin force points at O, " +
    "where the other two lines cross — its direction comes from the picture alone. Then one moment equation about A gives the tie's force.",
};

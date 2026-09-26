// Unit 5, stage 6 — solve: reduce a bracket's loads to a force and a couple at O.
// Hand check (default numbers), O at the base of the bracket:
//   F_1 = 300 N on a 4-3 slope (down-right) at A (0.8, 0.6): (240, −180) N,
//        M = x F_y − y F_x = 0.8(−180) − 0.6(240) = −288 N·m   (d = 0.96 m, not |OA| = 1.0 m)
//   F_2 = 250 N down at B (0.4, 0.6):  M = 0.4(−250) = −100 N·m
//   couple M = 60 N·m clockwise:  −60 N·m
//   F_Rx = 240 N, F_Ry = −430 N, (M_R)_O = −448 N·m.

export default {
  id: "05-equivalent-systems/6-solve",
  challenge: "solve",
  solver: "statics.equivalent",
  title: "Reduce to O",
  instructions:
    "Replace the two forces and the couple on the bracket with a single resultant force and a couple moment at O. " +
    "First choose the correct equations, then find $F_{Rx}$, $F_{Ry}$ and $(M_R)_O$ (counterclockwise positive). Stuck? Press **Show the moment arms** under the picture.",
  setup: {
    analysis: "equivalent",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0, 0.6], [0.8, 0.6]] }, // an L-shaped bracket
    arrowFraction: 0.3,
    resultant: "at O",
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 300, direction: { slope: [4, -3] }, at: [0.8, 0.6], pointLabel: "A" },
      { id: "F2", symbol: "F_2", magnitude: 250, direction: "down", at: [0.4, 0.6], pointLabel: "B", push: true },
    ],
    moments: [{ id: "M1", symbol: "M", magnitude: 60, sense: -1, at: [0.42, 0.22] }],
    dims: [
      { from: [0, -0.12], to: [0.4, -0.12] },
      { from: [0.4, -0.12], to: [0.8, -0.12] },
      { from: [-0.16, 0], to: [-0.16, 0.6], side: -1 },
    ],
  },
  view: { xmin: -0.5, xmax: 1.4, ymin: -0.45, ymax: 1.05 },
  vary: [
    { path: "forces.#F1.magnitude", min: 150, max: 400, step: 10 },
    { path: "forces.#F2.magnitude", min: 100, max: 300, step: 10 },
    { path: "moments.#M1.magnitude", min: 40, max: 100, step: 5 },
  ],
  // A button under the picture shows the moment arms from O (never the answers).
  toggles: [{ key: "arms", label: "the moment arms" }],
  solve: { steps: ["equations", "answer"], equationMode: "numeric" },
  ask: [{ quantity: "R.x" }, { quantity: "R.y" }, { quantity: "M" }],
  hints: [
    "$F_1$ on a 4-3-5 slope: $F_{1x} = \\tfrac{4}{5}F_1$ (right), $F_{1y} = \\tfrac{3}{5}F_1$ (down).",
    "$(M_R)_O = \\Sigma(xF_y - yF_x)$ for the forces, plus the couple moment with its sign.",
    "The couple is clockwise, so it adds a negative moment wherever it acts.",
  ],
  explanation:
    "To move a system to O: add the forces as vectors for $F_R$, and add every force's moment about O plus every couple moment for $(M_R)_O$. " +
    "The couple needs no moment arm — its moment is the same about any point.",
};

// Moving a force, stage 6 — solve: replace a force on a bracket by a
// force-couple system at the bolt O, step by step.
// Hand check (default numbers): F = 350 N on a 3-4-5 slope (3 right, 4 up) at A (0.8, 0.3):
//   F_x = 210 N, F_y = 280 N; (M_R)_O = 0.8(280) − 0.3(210) = 224 − 63 = 161 N·m (counterclockwise).
//   Its moment arm d = 161/350 = 0.46 m is clearly shorter than OA = 0.854 m.

export default {
  id: "moving-forces/6-solve",
  challenge: "solve",
  solver: "statics.equivalent",
  title: "Force and Couple at the Bolt",
  mission: "Replace the force on the bracket with a force and a couple at the bolt.",
  instructions:
    "Replace the force $F$ on the bracket by an equivalent force-couple system at the bolt O: find $F_{Rx}$, $F_{Ry}$ and the couple $(M_R)_O$ (counterclockwise positive). " +
    "First choose the correct equations. Stuck? Press **Show the moment arms** under the picture.",
  setup: {
    analysis: "equivalent",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0.8, 0], [0.8, 0.3]] },
    arrowFraction: 0.3,
    resultant: "at O",
    line: false,
    forces: [{ id: "F", symbol: "F", magnitude: 350, direction: { slope: [3, 4] }, at: [0.8, 0.3], pointLabel: "A" }],
    dims: [
      { from: [0, -0.12], to: [0.8, -0.12] },
      { from: [1.2, 0], to: [1.2, 0.3] },
    ],
  },
  view: { xmin: -0.5, xmax: 1.3, ymin: -0.4, ymax: 1.1 },
  vary: [
    { path: "forces.0.magnitude", min: 150, max: 500, step: 25 },
    // Directions and points where the moment arm d is clearly not the distance OA.
    { path: "forces.0.direction", values: [{ slope: [3, 4] }, { slope: [-4, 3] }, { slope: [4, -3] }] },
    { paths: ["forces.0.at.0", "body.points.1.0", "body.points.2.0"], values: [0.7, 0.8, 0.9] },
  ],
  toggles: [{ key: "arms", label: "the moment arms" }],
  solve: { steps: ["equations", "answer"], equationMode: "numeric" },
  ask: [{ quantity: "R.x" }, { quantity: "R.y" }, { quantity: "M" }],
  hints: [
    "The force doesn't change when it moves: $F_{Rx} = F_x$ and $F_{Ry} = F_y$ (from the 3-4-5 triangle).",
    "The couple is $F$'s moment about O. Varignon is quickest: $(M_R)_O = xF_y - yF_x$ with A's coordinates.",
    "Watch the signs: $F_x$ pushing right, above O, turns the bracket clockwise, so $-yF_x$ is negative.",
  ],
  explanation:
    "To move a force to a point: keep the force exactly as it is, and add a couple equal to its moment about the new point. " +
    "Varignon's theorem, $M_O = xF_y - yF_x$, is usually the quickest way to that moment.",
};

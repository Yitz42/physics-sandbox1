// Unit 1, stage 6 — solve: a full textbook resultant problem.
// Hand check (default numbers): F_Rx = 600cos45° − (4/5)400 = 104.3 N,
// F_Ry = 600sin45° + (3/5)400 − 200 = 464.3 N, F_R = 475.8 N, θ = 77.3°.
// (Same numbers as the test in tests/statics/particle.test.js.)

export default {
  id: "01-force-vectors/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "Resultant of Three Forces",
  instructions:
    "Three forces act on the eyebolt. Find their resultant: its components, its magnitude $F_R$, and the angle $\\theta$ it makes with the x-axis.",
  setup: {
    analysis: "resultant",
    point: { at: [0, 0], label: "" },
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 600, direction: { angle: 45, from: "+x", toward: "+y" } },
      { id: "F2", symbol: "F_2", magnitude: 400, direction: { slope: [-4, 3] } },
      { id: "F3", symbol: "F_3", magnitude: 200, direction: "down" },
    ],
  },
  vary: [
    { path: "forces.0.magnitude", min: 400, max: 800, step: 50 },
    { path: "forces.0.direction.angle", values: [30, 40, 45, 50, 60] },
    { path: "forces.1.magnitude", min: 200, max: 500, step: 50 },
    { path: "forces.2.magnitude", min: 100, max: 300, step: 50 },
  ],
  solve: { steps: ["equations", "answer"] },
  ask: [
    { quantity: "R.x" },
    { quantity: "R.y" },
    { quantity: "R" },
    { quantity: "R.angle", label: "\\theta" },
  ],
  hints: [
    "The 3-4-5 triangle means $F_2$'s components are $\\tfrac{4}{5}F_2$ and $\\tfrac{3}{5}F_2$ — no angle needed.",
    "Add all x-components (with signs) for $F_{Rx}$, all y-components for $F_{Ry}$.",
    "$\\theta = \\tan^{-1}|F_{Ry}/F_{Rx}|$ is measured from the x-axis; the signs of $F_{Rx}$ and $F_{Ry}$ tell you which quadrant.",
  ],
  explanation:
    "The method never changes: (1) resolve every force into components, (2) add them, $F_{Rx} = \\Sigma F_x$ and $F_{Ry} = \\Sigma F_y$, " +
    "(3) combine: $F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2}$, $\\theta = \\tan^{-1}|F_{Ry}/F_{Rx}|$. Slope triangles give the components directly as fractions.",
};

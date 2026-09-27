// Varignon's theorem, stage 6 — solve: the moment of a force given by a slope,
// component by component, then its moment arm.
// Hand check (default numbers): F = 260 N on a 5-12-13 slope (5 left, 12 up), at A = (0.45, 0.3) m:
//   F_x = −100 N, F_y = 240 N; M_O(F_y) = 0.45(240) = 108 N·m, M_O(F_x) = −0.3(−100) = +30 N·m,
//   M_O = 138 N·m (counterclockwise); d = 138 / 260 = 0.531 m.

export default {
  id: "varignon/6-solve",
  challenge: "solve",
  solver: "statics.moment",
  title: "Moment by Components",
  mission: "Find a moment about O from the force's components, using Varignon's theorem.",
  instructions:
    "A force $F$ acts on the bracket at A, along the slope shown. Use Varignon's theorem: find the moment of each component about O, then add them for $M_O$. " +
    "First choose the correct equations.",
  setup: {
    analysis: "moment",
    varignon: true,
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0.45, 0], [0.45, 0.3]] },
    forces: [{ id: "F", symbol: "F", magnitude: 260, direction: { slope: [-5, 12] }, at: [0.45, 0.3], pointLabel: "A" }],
    dims: [{ force: "F", offset: -0.1 }, { force: "F", axis: "y", offset: 0.8 }],
  },
  view: { xmin: -0.3, xmax: 1.0, ymin: -0.22, ymax: 0.72 },
  vary: [
    { path: "forces.0.magnitude", min: 130, max: 520, step: 13 }, // multiples of 13: whole-number components
    { path: "forces.0.direction", values: [{ slope: [-5, 12] }, { slope: [5, 12] }, { slope: [-12, 5] }] },
    { paths: ["forces.0.at.0", "body.points.1.0", "body.points.2.0"], values: [0.35, 0.45, 0.55] },
  ],
  sceneOpts: { components: true, hideMoment: true },
  solve: { steps: ["equations", "answer"], equationMode: "numeric" },
  ask: [{ quantity: "My_F" }, { quantity: "Mx_F" }, { quantity: "M" }],
  hints: [
    "The 5-12-13 triangle gives the components straight away: $F_x = \\pm\\tfrac{5}{13}F$ and $F_y = \\pm\\tfrac{12}{13}F$ (signs from the picture).",
    "$M_O(F_y) = xF_y$ and $M_O(F_x) = -yF_x$, with A's coordinates $x$ and $y$.",
    "Add the two, with their signs, for $M_O$. (Bonus: the moment arm is then $d = |M_O|/F$ — no trigonometry needed.)",
  ],
  explanation:
    "Varignon's theorem turns an awkward moment arm into two easy ones. The components' moments add (with signs) to $M_O$, and $M_O = Fd$ then gives $d = |M_O|/F$. " +
    "Here $d$ is shorter than OA, because the force is angled.",
};

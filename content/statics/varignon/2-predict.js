// Varignon's theorem, stage 2 — predict the moments of F_x and F_y, and their sum.
// Hand check (default numbers): F = 200 N at 60° above +x, at A = (0.45, 0.25) m:
//   F_x = 100 N, F_y = 173.2 N; M(F_y) = 0.45(173.2) = +77.9 N·m, M(F_x) = −0.25(100) = −25 N·m;
//   M_O = 52.9 N·m.

export default {
  id: "varignon/2-predict",
  challenge: "predict",
  solver: "statics.moment",
  title: "Split the Force",
  instructions:
    "An angled force $F$ acts on the bracket at A. **Varignon's theorem** says its moment about O equals the moments of its two components added together. " +
    "Predict the moment of $F_y$ alone, the moment of $F_x$ alone (both about O, counterclockwise positive), and their sum $M_O$. Then press **Test**.",
  setup: {
    analysis: "moment",
    about: { at: [0, 0], label: "O" },
    // Along from O, then up to A: F_x and F_y at A don't lie along the bracket.
    body: { points: [[0, 0], [0.45, 0], [0.45, 0.25]] },
    forces: [{ id: "F", symbol: "F", magnitude: 200, direction: { angle: 60, from: "+x", toward: "+y" }, at: [0.45, 0.25], pointLabel: "A" }],
    dims: [{ force: "F", offset: -0.1 }, { force: "F", axis: "y", offset: 0.75 }],
  },
  view: { xmin: -0.3, xmax: 0.95, ymin: -0.22, ymax: 0.72 },
  vary: [
    { path: "forces.0.magnitude", min: 100, max: 400, step: 10 },
    { path: "forces.0.direction", values: [{ from: "+x", toward: "+y" }, { from: "-x", toward: "+y" }] },
    { path: "forces.0.direction.angle", values: [30, 40, 50, 60, 70] },
    // A moves sideways, and the bracket's corner with it.
    { paths: ["forces.0.at.0", "body.points.1.0", "body.points.2.0"], values: [0.35, 0.45, 0.55] },
  ],
  sceneOpts: { components: true, hideMoment: true },
  ask: [{ quantity: "My_F" }, { quantity: "Mx_F" }, { quantity: "M" }],
  hints: [
    "Split $F$ into $F_x$ and $F_y$, both acting at A. Which axis is the angle measured from?",
    "$F_y$ is vertical, so its moment arm is the sideways distance $x$ from O. $F_x$ is horizontal, so its arm is the height $y$.",
    "Signs: $F_y$ up, to the right of O, turns counterclockwise (+). $F_x$ pushing right, above O, turns clockwise (−). Then add.",
  ],
  explanation:
    "**Varignon's theorem**: the moment of a force about a point equals the sum of the moments of its components about that point. " +
    "Each component has an easy moment arm — $x$ for $F_y$, $y$ for $F_x$ — so $M_O = xF_y - yF_x$ with no need to find the perpendicular distance $d$.",
};

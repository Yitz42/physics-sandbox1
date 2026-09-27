// Unit 3, stage 2 — predict, in two parts:
//   1. where must child B sit so the seesaw balances?
//   2. Varignon's theorem: the moments of F_x and F_y, and their sum.
// Part 2 hand check (default numbers): F = 200 N at 60° above +x, at A = (0.45, 0.25) m:
//   F_x = 100 N, F_y = 173.2 N; M(F_y) = 0.45(173.2) = +77.9 N·m, M(F_x) = −0.25(100) = −25 N·m;
//   M_O = 52.9 N·m.
// Part 1 hand check (default numbers): ΣM_O = W_A(1.5) − W_B·x_B = 0
// → x_B = (30)(9.81)(1.5) / ((20)(9.81)) = 2.25 m  (g cancels).

export default {
  id: "03-moments/2-predict",
  challenge: "predict",
  solver: "statics.moment",
  title: "Predict the Moments",
  parts: [
    {
      title: "Balance the seesaw",
      instructions:
        "Child A sits on the left of a light seesaw pivoted at O. Where must child B sit, to the right of O, so the seesaw balances? Predict $x_B$, then press **Test**.",
      setup: {
        analysis: "balance",
        about: { at: [0, 0], label: "O", pivot: true },
        arrowFraction: 0.22, // weights drawn shorter on this long plank
        boxSize: 0.5,
        body: { points: [[-3, 0], [3, 0]] }, // a 6 m plank
        forces: [
          { id: "W_A", symbol: "W_A", kind: "weight", mass: 30, at: [-1.5, 0] },
          { id: "W_B", symbol: "W_B", kind: "weight", mass: 20, at: null, along: { dir: [1, 0], placeholder: 1.8 }, posSymbol: "x_B" },
        ],
        dims: [{ force: "W_A", offset: -0.45 }, { force: "W_B", offset: -0.45 }],
      },
      // New versions: every combination keeps B on the plank (x_B ≤ 35·2/25 = 2.8 m < 3 m).
      vary: [
        { path: "forces.#W_A.mass", min: 20, max: 35, step: 1 },
        { path: "forces.#W_A.at.0", min: -2, max: -1, step: 0.05 },
        { path: "forces.#W_B.mass", min: 25, max: 50, step: 1 },
      ],
      ask: [{ quantity: "W_B.pos", precision: 0.01 }],
      hints: [
        "Take moments about the pivot O: A turns the seesaw one way, B the other.",
        "Balanced means $\\Sigma M_O = 0$: $W_A x_A = W_B x_B$.",
        "$g$ cancels, so you can use the masses: $m_A x_A = m_B x_B$.",
      ],
      explanation:
        "About the pivot, A's weight turns the seesaw counterclockwise and B's turns it clockwise. " +
        "Balance needs the moments to cancel: $W_A x_A = W_B x_B$, so the lighter child sits farther out. The pivot's own force has no moment about O, so it drops out.",
    },
    {
      title: "Varignon's theorem",
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
    },
  ],
  explanation:
    "Moments add with signs (counterclockwise +). Balance needs $\\Sigma M_O = 0$; and by Varignon's theorem any force's moment can be found by adding the moments of its components.",
};

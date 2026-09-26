// Unit 3, stage 2 — predict: where must child B sit so the seesaw balances?
// Hand check (default numbers): ΣM_O = W_A(1.5) − W_B·x_B = 0
// → x_B = (30)(9.81)(1.5) / ((20)(9.81)) = 2.25 m  (g cancels).

export default {
  id: "03-moments/2-predict",
  challenge: "predict",
  solver: "statics.moment",
  title: "Balance the Seesaw",
  mission: "Predict where child B must sit to balance the seesaw.",
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
};

// Equivalent systems, stage 2 — predict: the single resultant of three loads on a beam.
// Hand check (default numbers): F_R = 400 + 600 + 200 = 1200 N down,
//   (M_R)_O = −(400·1 + 600·3 + 200·5) = −3200 N·m,  x̄ = 3200 / 1200 = 2.67 m.

export default {
  id: "equivalent-systems/2-predict",
  challenge: "predict",
  solver: "statics.equivalent",
  title: "Where Does the Resultant Act?",
  instructions:
    "Replace the three loads with **one** force that has the same effect on the beam. How big is it, and how far from O must it act? Predict both, then press **Test**.",
  setup: {
    analysis: "equivalent",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [6, 0]] },
    arrowFraction: 0.15,
    hideArms: true,
    resultant: "single",
    resultantDimOffset: -0.65,
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 400, direction: "down", at: [1, 0], push: true },
      { id: "F2", symbol: "F_2", magnitude: 600, direction: "down", at: [3, 0], push: true },
      { id: "F3", symbol: "F_3", magnitude: 200, direction: "down", at: [5, 0], push: true },
    ],
    dims: [
      { from: [0, -0.3], to: [1, -0.3] },
      { from: [1, -0.3], to: [3, -0.3] },
      { from: [3, -0.3], to: [5, -0.3] },
      { from: [5, -0.3], to: [6, -0.3] },
    ],
  },
  view: { xmin: -0.6, xmax: 6.6, ymin: -1.1, ymax: 1.3 },
  vary: [
    { path: "forces.#F1.magnitude", min: 100, max: 800, step: 50 },
    { path: "forces.#F2.magnitude", min: 100, max: 800, step: 50 },
    { path: "forces.#F3.magnitude", min: 100, max: 800, step: 50 },
  ],
  ask: [{ quantity: "R", min: 0 }, { quantity: "pos", precision: 0.01, min: 0, max: 6 }],
  hints: [
    "The single force must push as hard as all three together: $F_R = \\Sigma F$.",
    "It must also turn the beam about O as much as they do: add up each load's moment $F x$ about O.",
    "Then $F_R\\,\\bar{x} = \\Sigma F x$, so $\\bar{x} = \\Sigma F x \\,/\\, F_R$.",
  ],
  explanation:
    "Two systems are equivalent when they push the same (same $F_R$) and turn the same about any point (same moment). " +
    "So $F_R = \\Sigma F$, and its moment about O, $F_R\\,\\bar{x}$, must equal the loads' total moment $\\Sigma F x$. " +
    "The resultant ends up nearer the heavier loads.",
};

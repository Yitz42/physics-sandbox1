// Unit 9.2, stage 4 — debug: one wrong line in a student's working for a crate pushed level at height h_P.
// Correct (default 600 N, 0.8 m × 1.6 m, μs = 0.4, h_P = 1.2 m):
//   slip: P = μs W = 240 N;  tip: P(1.2) − 600(0.4) = 0 → P = 200 N;  200 < 240: it tips first, at 200 N.
// h_P ≥ 1.0 m > h/2 in every version, so "measured from the centre" (h_P − 0.8) is a real, positive arm.

export default {
  id: "tipping/4-debug",
  challenge: "debug",
  solver: "statics.friction",
  title: "Check the Crate Push",
  mission: "Find and fix the mistake in a student's tipping-or-slipping working.",
  instructions:
    "A tall crate is pushed level at height $h_P$ across a rough floor. A student worked out whether it slips or tips first " +
    "(O is its front bottom corner). One line is wrong.",
  setup: {
    ramp: { angle: 0, length: 3 },
    block: { w: 0.8, h: 1.6, at: 1.5 },
    weight: 600,
    mus: 0.4,
    forces: [{ id: "P", symbol: "P", magnitude: 150, along: "up", height: 1.2 }],
    tipping: { about: "right" },
    find: { path: "forces.#P.magnitude", motion: "right", min: 0, max: 5000, symbol: "P", unit: "N" },
    showFbd: "unknowns",
  },
  vary: [
    { path: "weight", min: 400, max: 800, step: 50 },
    { path: "forces.#P.height", values: [1.0, 1.2, 1.4] },
    { path: "mus", values: [0.3, 0.4, 0.5] },
  ],
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [{ slip: "halfHeight" }, { slip: "fullWidth" }, { slip: "tipMu" }, { slip: "biggerFirst" }],
  },
  hints: [
    "Moments are about O, on the floor. What is the push's arm about O?",
    "The weight acts at the crate's centre. How far is that from O, measured level?",
    "Does friction have a moment about O? And which push is reached first as you push harder?",
  ],
  explanation:
    "Slipping: $P = \\mu_s W$. Tipping: with N at O, $\\Sigma M_O = P\\,h_P - W\\,\\tfrac{w}{2} = 0$ — friction and N both act at O, so no $\\mu_s$ here. " +
    "Pushing harder from zero, the crate does whichever needs the smaller push.",
};

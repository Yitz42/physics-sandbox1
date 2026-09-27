// Unit 9.1, stage 4 — debug: one wrong line in a student's working for a crate on a ramp, pushed a little
// up the slope. Correct (default 500 N, 25°, P = 60 N, μs = 0.6):
//   N = W cos 25° = 453.2 N;  F = W sin 25° − P = 151.3 N;  μs N = 271.9 N;  151.3 < 271.9: holds, 151.3 N up the slope.
// Every version holds (tan 28° = 0.53 < 0.6) with friction up the slope (400 sin 20° − 80 = 57 N > 0).

export default {
  id: "dry-friction/4-debug",
  challenge: "debug",
  solver: "statics.friction",
  title: "Check the Crate",
  mission: "Find and fix the mistake in a student's friction working.",
  instructions:
    "A crate rests on a ramp ($\\mu_s = 0.6$), and a worker pushes it gently up the slope with $P$. A student worked out whether it holds and what the friction is " +
    "(axes: x' up the slope, y' across it; F positive up the slope). One line is wrong.",
  setup: {
    ramp: { angle: 25, length: 6 },
    block: { w: 1.2, h: 0.8, at: 3.2 },
    weight: 500,
    mus: 0.6,
    forces: [{ id: "P", symbol: "P", magnitude: 60, along: "up" }],
    showFbd: "unknowns",
  },
  vary: [
    { path: "weight", min: 400, max: 800, step: 50 },
    { path: "ramp.angle", values: [20, 22, 25, 28] },
    { path: "forces.#P.magnitude", values: [40, 60, 80] },
  ],
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [{ slip: "noCos" }, { slip: "swap" }, { slip: "limit" }, { slip: "weight" }, { slip: "direction" }],
  },
  hints: [
    "Across the slope, only part of the weight presses the crate in. Which part, sin or cos?",
    "The limit is $\\mu_s$ times the NORMAL force.",
    "Is friction always $\\mu_s N$? And which way does it act, for a positive F?",
  ],
  explanation:
    "Across the slope $N = W\\cos\\theta$; along it friction is what equilibrium needs, $F = W\\sin\\theta - P$. Only then compare it with the limit $\\mu_s N$: " +
    "here it's well below, so the crate holds and friction is just $F$, up the slope — not $\\mu_s N$.",
};

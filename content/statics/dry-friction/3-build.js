// Unit 9.1, stage 3 — build: hold a crate on a ramp too steep for it with a push up the slope —
// not so weak that it slides down, not so strong that it's pushed up.
// It holds for W(sin θ − μs cos θ) ≤ P ≤ W(sin θ + μs cos θ). Default 500 N, 35°, μs = 0.3:
//   286.8 − 122.9 = 163.9 N … 409.6 N. The window is 2μs W cos θ ≥ 2(0.2)(300)cos 40° = 91.9 N wide:
//   the 10 N slider always lands in it. Start: P = 0 — it slides (tan θ > μs in every version).

export default {
  id: "dry-friction/3-build",
  challenge: "build",
  solver: "statics.friction",
  title: "Hold the Crate",
  mission: "Set a push that keeps a crate still on a steep ramp.",
  instructions:
    "This ramp is too steep: the crate slides down on its own. Set the push $P$ (parallel to the slope) so the crate stays put — " +
    "neither sliding down nor being pushed up. Then work out the friction on it and press **Test**. ($F$ is positive up the slope.)",
  setup: {
    ramp: { angle: 35, length: 6 },
    block: { w: 1.2, h: 0.8, at: 3.2 },
    weight: 500,
    mus: 0.3,
    forces: [{ id: "P", symbol: "P", magnitude: 0, along: "up" }],
    showFbd: "reveal",
  },
  vary: [
    { path: "ramp.angle", values: [30, 35, 40] },
    { path: "mus", values: [0.2, 0.25, 0.3, 0.35] },
    { path: "weight", min: 300, max: 700, step: 50 },
  ],
  editable: [{ path: "forces.#P.magnitude", label: "Push P", min: 0, max: 800, step: 10, unit: "N" }],
  goal: {
    text: "The crate stays still: $|F| \\le \\mu_s N$.",
    predict: [{ quantity: "F" }],
    check(result) {
      if (result.state === "slides") {
        return { ok: false, message: result.moves === "down"
          ? "It still slides DOWN: friction can give at most $\\mu_s N$, and that isn't enough. Push harder."
          : "It's pushed UP the ramp: now friction holds it back (down the slope), and even $\\mu_s N$ isn't enough. Push less." };
      }
      return { ok: true, message: `It holds. Friction is ${Math.abs(result.values.F).toFixed(1)} N ${result.values.F >= 0 ? "up" : "down"} the slope — within its limit $\\mu_s N$ = ${result.values.Fmax.toFixed(1)} N.` };
    },
  },
  hints: [
    "Along the slope: $F = W\\sin\\theta - P$. It holds while $|F| \\le \\mu_s N$, with $N = W\\cos\\theta$.",
    "Weakest push that works: friction up the slope at its limit, $P = W(\\sin\\theta - \\mu_s\\cos\\theta)$.",
    "Strongest: friction DOWN the slope at its limit, $P = W(\\sin\\theta + \\mu_s\\cos\\theta)$. Anything between holds.",
  ],
  explanation:
    "A whole range of pushes holds the crate: friction adjusts itself, from $\\mu_s N$ up the slope (the weakest push) to $\\mu_s N$ down it (the strongest). " +
    "Outside that range friction can't keep up, and the crate slides — down if the push is too weak, up if it's too strong.",
};

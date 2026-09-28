// Unit 9.2, stage 1 — explore: push a tall crate at different heights; watch where the floor's
// push N acts (x behind the front corner O), and whether it slides or tips.
// 600 N, 0.8 m wide, 1.6 m tall, μs = 0.4. Slips at P = μs W = 240 N; tips at P = W(w/2)/h_P = 240/h_P N.
// So it slides first when h_P < w/(2μs) = 1.0 m, and tips first above that.
// Start: P = 60 N, h_P = 1.2 m: x = 0.4 − 60(1.2)/600 = 0.28 m — it holds (nothing done yet; N already a
// little forward of W's line, so the two arrows don't overlap).
// Checks: slides (not tipping) — state slides or impending;  tips — state tips or tipImpending;
//   the height where both come together — |h_P − w/(2μs)| < 0.026 m (0.05 m slider steps).

export default {
  id: "tipping/1-explore",
  challenge: "explore",
  solver: "statics.friction",
  title: "Push High, Push Low",
  mission: "Push a tall crate at different heights and see whether it slides or tips.",
  instructions:
    "A tall 600 N crate stands on a rough floor. Push it level, at the height you choose. On its free-body diagram, watch where the floor's push **N** acts: " +
    "$x$ is how far it is behind the front corner **O**. It can't act outside the base — if the push would need that, the crate tips.",
  setup: {
    ramp: { angle: 0, length: 3 },
    block: { w: 0.8, h: 1.6, at: 1.5 },
    weight: 600,
    mus: 0.4,
    forces: [{ id: "P", symbol: "P", magnitude: 60, along: "up", height: 1.2 }],
    tipping: { about: "right" },
    showFbd: "always",
  },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**You push the crate a little harder, but it still doesn't move. The floor's push N…**",
    options: [
      { text: "moves toward the front corner O", correct: true },
      { text: "stays under the middle", feedback: "Then nothing would balance the push's turning effect about the middle. N shifts forward to balance it." },
      { text: "moves back, toward where you push", feedback: "The push tries to turn the crate forward, over O; N moves forward to hold it back." },
    ],
    explain: "The push turns the crate toward O; N shifts forward to balance it. At O it can shift no further — then the crate tips.",
  },
  editable: [
    { path: "forces.#P.magnitude", label: "Push P", min: 0, max: 400, step: 10, unit: "N" },
    { path: "forces.#P.height", label: "Push height", min: 0.1, max: 1.6, step: 0.05, unit: "m" },
    { path: "mus", label: "μs", min: 0.2, max: 0.8, step: 0.05, unit: "" },
  ],
  tasks: [
    { text: "Push hard enough that the crate **slides** — without tipping it.", check: (v, s, r) => r.state === "slides" || r.state === "impending" },
    { text: "Now make it **tip** over O instead.", check: (v, s, r) => r.state === "tips" || r.state === "tipImpending" },
    { text: "Find the push height at which it would slip and tip at the **same** push (within 0.05 m).", check: (v, s) => Math.abs(s.forces[0].height - s.block.w / (2 * s.mus)) < 0.026 },
  ],
  hints: [
    "It slips once the push reaches $\\mu_s W$ — whatever the height.",
    "It tips once $N$ reaches O: then $\\Sigma M_O = 0$ gives $P\\,h_P = W\\,\\tfrac{w}{2}$. The higher you push, the smaller that push.",
    "Both at once: $\\mu_s W\\,h_P = W\\,\\tfrac{w}{2}$, so $h_P = \\dfrac{w}{2\\mu_s}$.",
  ],
  explanation:
    "Pushing doesn't only slide a crate — it also turns it about its front corner. N moves forward to hold it; once it reaches O, the crate tips. " +
    "Push low and friction gives out first (it slides); push high and N runs out of base first (it tips). The dividing height is $h_P = w/(2\\mu_s)$ — a rougher floor means you must push lower.",
};

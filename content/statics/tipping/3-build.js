// Unit 9.2, stage 3 — build: slide a tall bookcase across the floor without tipping it. The student
// chooses the push's height and size; before Test they work out the push that WOULD tip it at their
// height (goal.predict, so the stage can't be passed by guessing).
// Default 500 N, 0.5 m wide, 1.8 m tall, μs = 0.35: slips at 175 N; pushed at h_P it tips at
// 125/h_P N. It slides first while h_P < w/(2μs) = 0.714 m (e.g. 0.5 m: tips at 250 N; push 180–245 N).
// Every version: w/(2μs) ≥ 0.4/0.8 = 0.5 m, so pushes at 0.1–0.45 m always leave a window:
//   at h_P = 0.3 m the tipping push is ≥ W(0.2)/0.3 = 0.67 W > μs W (μs ≤ 0.4). Start: P = 0 — nothing moves.

export default {
  id: "tipping/3-build",
  challenge: "build",
  solver: "statics.friction",
  title: "Move the Bookcase",
  mission: "Choose where and how hard to push so a tall bookcase slides without tipping.",
  instructions:
    "A tall bookcase has to slide across the room. Choose the height of your push and how hard you push, so that it **slides without tipping over**. " +
    "Before you press **Test**, work out the push that would tip it at the height you chose.",
  setup: {
    ramp: { angle: 0, length: 3 },
    block: { w: 0.5, h: 1.8, at: 1.5, label: "" },
    weight: 500,
    mus: 0.35,
    forces: [{ id: "P", symbol: "P", magnitude: 0, along: "up", height: 1.4 }],
    tipping: { about: "right" },
    find: { path: "forces.#P.magnitude", motion: "right", min: 0, max: 5000, symbol: "P", unit: "N", quiet: true },
    showFbd: "reveal",
  },
  vary: [
    { path: "weight", min: 300, max: 700, step: 50 },
    { path: "mus", values: [0.3, 0.35, 0.4] },
    { path: "block.w", values: [0.4, 0.5, 0.6] },
  ],
  editable: [
    { path: "forces.#P.height", label: "Push height", min: 0.1, max: 1.8, step: 0.05, unit: "m" },
    { path: "forces.#P.magnitude", label: "Push P", min: 0, max: 800, step: 5, unit: "N" },
  ],
  goal: {
    text: "The bookcase slides, and doesn't tip.",
    predict: [{ quantity: "criticalTip" }],
    check(result) {
      if (result.state === "tips" || result.state === "tipImpending") {
        return { ok: false, message: "It tips over! N has reached the front corner O. Push lower: that shrinks your push's turning effect about O." };
      }
      if (result.state === "holds") {
        return { ok: false, message: "It doesn't move yet: friction still holds it. Push harder — it needs $\\mu_s W$ to start sliding." };
      }
      return { ok: true, message: `It slides, and stays upright: N acts ${result.values.x.toFixed(2)} m behind O, still under the base.` };
    },
  },
  hints: [
    "It starts to slide once $P = \\mu_s W$, at any height.",
    "It tips once N reaches O: $P\\,h_P = W\\,\\tfrac{w}{2}$. For it to slide first, that tipping push must be BIGGER than $\\mu_s W$.",
    "That needs $h_P < \\dfrac{w}{2\\mu_s}$ — push low. Then push between $\\mu_s W$ and the tipping push.",
  ],
  explanation:
    "A tall, narrow object tips easily: its weight's arm about O is only half its width. Push it low, so the push's arm about O is small, " +
    "and friction gives way before N runs out of base — it slides. That's why movers push furniture near the bottom.",
};

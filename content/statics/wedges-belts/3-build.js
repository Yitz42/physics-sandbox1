// Unit 9.3, stage 3 — build: choose a wedge's angle. It must lift the machine at least 0.1 m for every
// 0.5 m it's driven in (tan α ≥ 0.2, α ≥ 11.31°) AND stay in by itself once the push stops (self-locking).
// Before Test the student works out the push P for their angle (goal.predict), so it can't be guessed.
// Default 4000 N, μs = 0.3: every angle from 12° to 25° works for μs = 0.25–0.35 — pulled out, each needs
// a pull (self-locking; tests/statics/wedges-belts.test.js). Much steeper (35°) slides back out by itself.
// Start: α = 6° — too flat (tan 6° = 0.105).

export default {
  id: "wedges-belts/3-build",
  challenge: "build",
  solver: "statics.wedge",
  title: "Pick the Wedge",
  mission: "Choose a wedge angle that lifts enough and stays in by itself.",
  instructions:
    "You're choosing a wedge to lift a machine. It must raise the machine at least **0.1 m for every 0.5 m** it's driven in, " +
    "and it must **stay in by itself** when you stop pushing (self-locking). Choose its angle α, then work out the push P that drives it in, and press **Test**.",
  setup: { wedge: { angle: 6, length: 1.6, tip: -0.3 }, block: { w: 1, h: 0.7, label: "" }, weight: 4000, mus: 0.3, motion: "in", showFbd: "reveal" },
  vary: [
    { path: "weight", min: 2000, max: 6000, step: 250 },
    { path: "mus", values: [0.25, 0.3, 0.35] },
  ],
  editable: [{ path: "wedge.angle", label: "Wedge angle α", min: 4, max: 40, step: 1, unit: "deg" }],
  goal: {
    text: "Rises ≥ 0.1 m per 0.5 m driven ($\\tan\\alpha \\ge 0.2$), and self-locking.",
    predict: [{ quantity: "P" }],
    check(result, setup) {
      if (Math.tan((setup.wedge.angle * Math.PI) / 180) < 0.2 - 1e-9) {
        return { ok: false, message: `Too flat: it lifts only ${(0.5 * Math.tan((setup.wedge.angle * Math.PI) / 180)).toFixed(3)} m per 0.5 m. A steeper wedge lifts more per push stroke.` };
      }
      if (!result.values.selfLocking) {
        return { ok: false, message: "Too steep: pulled out, it would slide back by itself — the block's weight pushes it out harder than friction can hold. Make it flatter." };
      }
      return { ok: true, message: `It lifts enough and is self-locking: it would take a pull of ${result.values.Pout.toFixed(1)} N to get it back out.` };
    },
  },
  hints: [
    "The lift per stroke is $\\tan\\alpha$ times the stroke: you need $\\tan\\alpha \\ge 0.2$.",
    "A steep wedge is pushed back out by the block; friction holds a flatter one in. Try angles just above the lower limit first.",
    "For your angle: block ΣF_x and ΣF_y give $N_1$ and $N_2$; the wedge's ΣF_y gives $N_3$, and its ΣF_x gives P.",
  ],
  explanation:
    "A wedge is a trade-off. Flatter: less push and it locks itself in place, but it lifts less per stroke. Steeper: more lift per stroke, " +
    "but more push, and past a point friction can't hold it in — it squirts back out. Good wedges sit in between.",
};

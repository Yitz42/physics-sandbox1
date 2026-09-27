// Unit 8.1, stage 3 — build: place a bolted splice where the bending moment is (almost) zero.
// Pin A (0), roller B (b), beam 6 m, w all along: A_y = 6w(b − 3)/b.
// In the span (x < b): M = A_y x − w x²/2 = 0 at x = 2A_y/w = 12(b − 3)/b — b = 4: 3 m; b = 3.8: 2.53 m; b = 4.2: 3.43 m.
// |M| ≤ 100 N·m within about ±100/A_y of it (A_y = 316…686 N → ±0.15…0.32 m): a 0.05 m slider always fits.
// The slider (0.6 … 4 m) can't reach the other small-M spots (x < 0.4 m, or past B, where M ≤ −405 N·m).
// Start: splice at 1 m → M = A_y − w/2 ≥ 191 N·m (never already done).

const LIMIT = 100; // N·m, what the splice's bolts can take in bending

export default {
  id: "internal-forces/3-build",
  challenge: "build",
  solver: "statics.internal",
  title: "Place the Splice",
  mission: "Put the bolted splice where the beam hardly bends.",
  instructions:
    "This beam is made of two lengths bolted together by a splice at C. The splice can pass any shear, but its bolts can only take a bending moment of " +
    `${LIMIT} N·m. Slide the splice to a place where the bending moment is that small — then work out V and M there on paper and press **Test**.`,
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [4, 0] }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 6, w: 300 }],
    cut: 1,
    view: "cut",
    knownReactions: true,
  },
  view: { xmin: -1.6, xmax: 7.8, ymin: -2.2, ymax: 2.4 },
  vary: [
    { path: "loads.#w.w", min: 250, max: 400, step: 5 },
    { path: "supports.#B.at.0", values: [3.8, 4, 4.2] },
  ],
  editable: [{ path: "cut", label: "Splice position (x)", min: 0.6, max: 4, step: 0.05, unit: "m" }],
  goal: {
    text: `The bending moment at the splice is at most **${LIMIT} N·m** (either sign).`,
    predict: [{ quantity: "V" }, { quantity: "M" }],
    check(result) {
      const M = result.values.M;
      if (Math.abs(M) > LIMIT + 1e-9) {
        return { ok: false, message: `M at the splice is ${M.toFixed(0)} N·m — too much for its bolts. Look for where M changes from a smile to a frown: there it passes through zero.` };
      }
      return { ok: true, message: `M = ${M.toFixed(1)} N·m at the splice: near the point where the beam's bending changes from a smile to a frown, where M = 0.` };
    },
  },
  hints: [
    "Near A the moment starts at zero and grows; over B the overhang makes it negative. Somewhere between, M passes through zero.",
    "Left piece: $M = A_y x - w x \\cdot \\tfrac{x}{2}$. Set it to zero: $x = 2A_y / w$.",
    "Then V at the splice: $V = A_y - wx$.",
  ],
  explanation:
    "Where M changes sign (the point of contraflexure), the beam hardly bends: a splice there needs to carry shear, but almost no moment. " +
    "Engineers put splices and hinges at such points for exactly this reason.",
};

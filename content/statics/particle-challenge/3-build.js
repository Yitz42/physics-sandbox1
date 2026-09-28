// Unit 3.5, stage 3 — build: a crate hangs from ring A (3, 0); cable AB runs to B (0, 4) on the
// ceiling (y = 4). The student slides anchor C along the ceiling so NEITHER cable carries more
// than 65% of the crate's weight, and works out both tensions for their own design before Test.
// Tensions ÷ W depend only on where C is (hand-worked, W = 50 kg × 9.81 = 490.5 N):
//   C x = 5.0:  T_AB = 245.3 N (0.500 W), T_AC = 329.0 N (0.671 W)  — too much in AC
//   C x = 5.5:  T_AB = 278.7 N (0.568 W), T_AC = 315.5 N (0.643 W)  — works
//   C x = 6.0:  T_AB = T_AC = 306.6 N (0.625 W) (C is B's mirror image) — works
//   C x = 6.5:  T_AB = 330.1 N (0.673 W), T_AC = 300.8 N          — too much in AB
// So x = 5.5 or 6.0 m, whatever the crate weighs (every version: 20–80 kg).
// Start: C (4, 4): T_AC = 379.2 N = 0.773 W.

const LIMIT = 0.65; // each cable may carry at most this share of the crate's weight

export default {
  id: "particle-challenge/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Share the Load",
  mission: "Place the second anchor so neither cable carries more than 65% of the crate's weight.",
  instructions:
    "A crate hangs from ring A. Cable AB is fixed; slide anchor C along the ceiling (coordinates in m). The cables are thin: " +
    `**each may carry at most ${LIMIT * 100}% of the crate's weight $W$**. Find a place for C that works, then work out both tensions for your design and press **Test**.`,
  setup: {
    analysis: "equilibrium",
    point: { at: [3, 0], label: "A" },
    ceiling: { y: 4, from: -3.6, to: 6.6 },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { points: [[3, 0], [0, 4]], names: ["A", "B"] } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { points: [[3, 0], [4, 4]], names: ["A", "C"] } },
      { id: "W", symbol: "W", kind: "weight", mass: 50 },
    ],
  },
  vary: [{ path: "forces.#W.mass", min: 20, max: 80, step: 1 }],
  editable: [
    { path: "forces.#T_AC.direction.points.1.0", label: "Anchor C: x", min: 3.5, max: 9.5, step: 0.5, unit: "m" },
  ],
  goal: {
    text: `$T_{AB} \\le ${LIMIT}\\,W$ and $T_{AC} \\le ${LIMIT}\\,W$.`,
    predict: [{ quantity: "T_AB" }, { quantity: "T_AC" }],
    check(result) {
      const v = result.values;
      const limit = LIMIT * v.W;
      const over = ["T_AB", "T_AC"].filter((id) => v[id] > limit);
      const share = (id) => `${(v[id] / v.W * 100).toFixed(1)}%`;
      if (!over.length) return { ok: true, message: `Both cables stay under ${limit.toFixed(1)} N: AB carries ${share("T_AB")} of $W$ and AC ${share("T_AC")}.` };
      const id = over[0];
      const fix = id === "T_AC" ? "C is too close to straight above A: AC is steep and takes most of the load. Move C further out." : "C is so far out that AC is flat: AB now takes most of the load. Move C back in.";
      return { ok: false, flagged: over, message: `${id === "T_AC" ? "AC" : "AB"} carries ${v[id].toFixed(1)} N (${share(id)} of $W$), over the ${limit.toFixed(1)} N limit. ${fix}` };
    },
  },
  hints: [
    "For each place you try: $\\mathbf{u}_{AC} = \\mathbf{r}_{AC}/r_{AC}$ with $\\mathbf{r}_{AC} = (x_C - 3)\\,\\mathbf{i} + 4\\,\\mathbf{j}$.",
    "$\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ at A give both tensions. Compare each with $0.65\\,W$.",
    "The steeper cable always carries more. The best sharing is when the two cables are equally steep — but a little either side of that may work too.",
  ],
  explanation:
    "The tensions are proportional to the weight, so the SHARE each cable carries depends only on the geometry: the anchor that works for a 20 kg crate works for an 80 kg one. " +
    "Equal angles share the load equally (C at B's mirror image, x = 6 m); moving C in makes AC steeper and it takes more, moving C out makes AB take more.",
};

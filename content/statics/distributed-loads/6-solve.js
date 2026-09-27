// Unit 6, stage 6 — solve: a curved load, by integration.
// Hand check (default numbers), w = 600(x/4)² N/m over L = 4 m (zero at O):
//   F_R = ∫₀⁴ 600(x/4)² dx = 600(4)/3 = 800 N
//   F_R x̄ = ∫₀⁴ x · 600(x/4)² dx = 600(4²)/4 = 2400 N·m  →  x̄ = 2400 / 800 = 3.00 m  (= ¾L)
// With n = 3: F_R = w₀L/4, x̄ = ⅘L.

export default {
  id: "distributed-loads/6-solve",
  challenge: "solve",
  solver: "statics.distributed",
  title: "The Curved Load",
  mission: "Replace a curved load with one force, using integration.",
  instructions:
    "The load on this beam follows a curve: zero at O, rising to $w_0$ at the far end. Replace it with one force. " +
    "First choose the correct integrals, then find $F_R$ and where it acts, $\\bar{x}$ from O.",
  setup: {
    about: { at: [0, 0], label: "O" },
    loadDims: true,
    loadDimOffset: -0.35,
    resultantDimOffset: -0.8,
    loads: [{ id: "w", shape: "power", from: 0, to: 4, w: 600, n: 2, symbol: "w_0" }],
  },
  view: { xmin: -0.7, xmax: 6.7, ymin: -1.2, ymax: 2.3 },
  vary: [
    { path: "loads.#w.w", min: 300, max: 1200, step: 50 },
    { path: "loads.#w.n", values: [2, 3] },
    { path: "loads.#w.to", values: [3, 4, 5, 6] },
  ],
  solve: { steps: ["equations", "answer"], equationMode: "symbolic" },
  ask: [{ quantity: "R", min: 0 }, { quantity: "pos", precision: 0.01, min: 0, max: 6 }],
  hints: [
    "Size: add up the load on every thin slice $dx$: $F_R = \\int_0^L w\\,dx$.",
    "$\\int_0^L (x/L)^n dx = \\dfrac{L}{n+1}$, and $\\int_0^L x\\,(x/L)^n dx = \\dfrac{L^2}{n+2}$.",
    "Position: $\\bar{x} = \\dfrac{\\int x\\,w\\,dx}{\\int w\\,dx}$ — the moment of the load about O divided by $F_R$.",
  ],
  explanation:
    "For any load curve, $F_R = \\int w\\,dx$ (the area) and $\\bar{x} = \\int x\\,w\\,dx \\,/ \\int w\\,dx$ (the centroid). " +
    "For $w = w_0(x/L)^n$ that gives $F_R = \\dfrac{w_0L}{n+1}$ at $\\bar{x} = \\dfrac{n+1}{n+2}L$ — bunched toward the tall end, more so as $n$ grows.",
};

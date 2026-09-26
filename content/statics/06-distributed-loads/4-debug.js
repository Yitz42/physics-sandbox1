// Unit 6, stage 4 — debug: a mistake in replacing a trapezoidal load.
// Hand check (default numbers), load 300 → 900 N/m over the first 6 m, P = 500 N at 7 m:
//   F_1 = 300(6) = 1800 N at x̃₁ = 3 m;  F_2 = ½(600)(6) = 1800 N at x̃₂ = 6 − 2 = 4 m
//   F_R = 1800 + 1800 + 500 = 4100 N;  F_R x̄ = 5400 + 7200 + 3500 = 16100 N·m;  x̄ = 3.93 m.

export default {
  id: "06-distributed-loads/4-debug",
  challenge: "debug",
  solver: "statics.distributed",
  title: "Find the Mistake",
  mission: "Find the mistake in a student's replacement of a trapezoidal load.",
  instructions:
    "A student split this load into a rectangle ($F_1$) and a triangle ($F_2$), then combined them with the point load $P$ into one resultant. " +
    "One term in their work is wrong. Find it and fix it.",
  setup: {
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [7.5, 0]] },
    showParts: true,
    loadDims: true,
    loadDimOffset: -0.4,
    resultantDimOffset: -1.15,
    loads: [{ id: "w", shape: "linear", from: 0, to: 6, w: [300, 900] }],
    forces: [{ id: "P", symbol: "P", magnitude: 500, direction: "down", at: [7, 0] }],
    dims: [{ from: [0, -0.8], to: [7, -0.8] }],
  },
  view: { xmin: -0.7, xmax: 8.2, ymin: -1.6, ymax: 2.6 },
  vary: [
    { path: "loads.#w.w.0", min: 200, max: 400, step: 50 },
    { path: "loads.#w.w.1", min: 700, max: 1000, step: 50 },
    { path: "forces.#P.magnitude", values: [300, 400, 500, 600] },
  ],
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's work (numbers in N, N/m and m). One term is wrong.",
    mutations: [
      { kind: "swap", equation: "A_w_tri", term: "w_tri" }, // the ½ left out of the triangle's area
      { kind: "swap", equation: "M", term: "w_tri" }, // the triangle's resultant ⅓ from the SHORT end
      { kind: "missing", equation: "M", term: "P" }, // P left out of the moments
      { kind: "sign", equation: "M", term: "w_rect" }, // a load that turns the "wrong" way
    ],
    notes: {
      w_rect: "The rectangle is right: $F_1 = w_A L$, acting at the middle of the beam.",
      w_tri: "The triangle's term is right here: area $\\tfrac{1}{2}L(w_B - w_A)$, acting $\\tfrac{1}{3}L$ from its tall (right) end.",
      P: "$P$'s term is right: it pushes down 7 m from O.",
    },
  },
  hints: [
    "Check each piece's area: a rectangle is $wL$, a triangle is $\\tfrac{1}{2}wL$.",
    "Check each piece's position: a rectangle's middle, and a triangle's resultant $\\tfrac{1}{3}L$ from its TALL end.",
    "Every load pushes down on the same side of O, so every term in $\\Sigma F\\tilde{x}$ is positive — and none can be left out.",
  ],
  explanation:
    "To replace a trapezoidal load: split it into a rectangle and a triangle, give each its area ($wL$ and $\\tfrac{1}{2}wL$) at its centroid (the middle, and $\\tfrac{1}{3}L$ from the triangle's tall end), " +
    "then combine them with any point loads: $F_R = \\Sigma F$ and $\\bar{x} = \\Sigma F\\tilde{x} / F_R$.",
};

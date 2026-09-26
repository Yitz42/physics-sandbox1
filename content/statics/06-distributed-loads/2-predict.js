// Unit 6, stage 2 — predict: the resultant of a triangular load.
// Hand check (default numbers), triangle 0 → 600 N/m over L = 6 m, tall at the right:
//   F_R = ½(600)(6) = 1800 N,  x̄ = 6 − 6/3 = 4 m from O.

export default {
  id: "06-distributed-loads/2-predict",
  challenge: "predict",
  solver: "statics.distributed",
  title: "The Triangular Load",
  mission: "Predict the size and position of the triangular load's resultant.",
  instructions:
    "Water pressure on this beam grows steadily from zero to its largest value $w_0$. Replace it with **one** force: how big is it, and how far from O does it act? " +
    "Predict both, then press **Test**.",
  setup: {
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [6, 0]] },
    loadDims: true,
    loadDimOffset: -0.4,
    resultantDimOffset: -0.85,
    loads: [{ id: "w", shape: "triangle", from: 0, to: 6, w: 600, peak: "right", symbol: "w_0" }],
  },
  view: { xmin: -0.7, xmax: 6.7, ymin: -1.3, ymax: 2.3 },
  vary: [
    { path: "loads.#w.w", min: 300, max: 1200, step: 50 },
    { path: "loads.#w.peak", values: ["left", "right"] },
    { path: "loads.#w.to", values: [4, 4.5, 5, 5.5, 6] }, // the load covers part or all of the beam
  ],
  ask: [{ quantity: "R", min: 0 }, { quantity: "pos", precision: 0.01, min: 0, max: 6 }],
  hints: [
    "$F_R$ is the area of the triangle: $\\tfrac{1}{2} \\times$ base $\\times$ height $= \\tfrac{1}{2}w_0L$.",
    "It acts at the triangle's centroid: $\\tfrac{1}{3}L$ from the TALL end.",
    "Measure $\\bar{x}$ from O. If the tall end is on the right, $\\bar{x} = L - \\tfrac{1}{3}L = \\tfrac{2}{3}L$.",
  ],
  explanation:
    "A triangular load is replaced by its area, $F_R = \\tfrac{1}{2}w_0L$, acting at its centroid, $\\tfrac{1}{3}L$ from the tall end. " +
    "The resultant sits toward the tall end because that's where most of the load is.",
};

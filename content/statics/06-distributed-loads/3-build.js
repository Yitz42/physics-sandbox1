// Unit 6, stage 3 — build: load a trailer so the gravel sits right over the axle.
// The bed is 4 m long; the axle is 1.6 m behind the front (O).
// Hand-worked solution:
//   F_R = ½(w_F + w_B)(4) = 6000 N          → w_F + w_B = 3000 N/m
//   x̄ = L(w_F + 2w_B) / 3(w_F + w_B) = 1.6 m → w_F + 2w_B = 3600 N/m
//   so w_B = 600 N/m and w_F = 2400 N/m.
// (Check with pieces: rectangle 600(4) = 2400 N at 2 m, triangle ½(1800)(4) = 3600 N at 4/3 m:
//  x̄ = (4800 + 4800) / 6000 = 1.6 m ✓)

const TARGET_F = 6000; // N
const AXLE = 1.6; // m from the front
const TOL = 0.02; // m

export default {
  id: "06-distributed-loads/3-build",
  challenge: "build",
  solver: "statics.distributed",
  title: "Load the Trailer",
  mission: "Spread the gravel so its resultant sits right over the trailer's axle.",
  instructions:
    "Spread gravel along this 4 m trailer bed. Its depth changes steadily from the front (O) to the back, so the load goes from $w_F$ to $w_B$. " +
    "The trailer pulls best when the gravel's resultant sits **right over the axle**. Set the two ends, then press **Test**.",
  setup: {
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [4, 0]] },
    loadScale: 2500, // 1 m of picture per 2500 N/m
    partsOnReveal: true,
    resultantDimOffset: -1.3,
    // The trailer: tow bar and hitch in front of the bed, and its wheel at the axle.
    extras: [{ type: "trailer", from: [0, 0], to: [4, 0] }, { type: "wheel", at: [AXLE, 0], rPx: 14 }],
    loads: [{ id: "g", shape: "linear", from: 0, to: 4, w: [1000, 1000], symbols: ["w_F", "w_B"] }],
    dims: [
      { from: [0, -0.62], to: [AXLE, -0.62], label: "axle: 1.6 m" },
      { from: [0, -0.95], to: [4, -0.95], label: "bed: 4 m" },
    ],
  },
  view: { xmin: -0.95, xmax: 4.35, ymin: -1.55, ymax: 2.1 },
  editable: [
    { path: "loads.#g.w.0", label: "w at the front, w_F", min: 0, max: 3000, step: 100, unit: "N/m" },
    { path: "loads.#g.w.1", label: "w at the back, w_B", min: 0, max: 3000, step: 100, unit: "N/m" },
  ],
  goal: {
    text: `Total load $F_R = ${TARGET_F}$ N, acting right over the axle: $\\bar{x} = ${AXLE.toFixed(2)}$ m from O (within ${TOL} m).`,
    check(result) {
      const { R, pos } = result.values;
      if (Math.abs(R - TARGET_F) > 0.5) {
        return { ok: false, message: `The gravel adds up to $F_R = ${R.toFixed(0)}$ N, but it must be ${TARGET_F} N. $F_R$ is the area: $\\tfrac{1}{2}(w_F + w_B) \\times 4$ m.` };
      }
      if (Math.abs(pos - AXLE) > TOL) {
        const behind = pos > AXLE;
        return { ok: false, message: `$F_R$ is right, but it acts at $\\bar{x} = ${pos.toFixed(2)}$ m, ${Math.abs(pos - AXLE).toFixed(2)} m ${behind ? "behind" : "in front of"} the axle. Move gravel toward the ${behind ? "front" : "back"}, keeping $w_F + w_B$ the same.` };
      }
      return { ok: true, message: `$F_R = ${R.toFixed(0)}$ N at $\\bar{x} = ${pos.toFixed(2)}$ m: right over the axle.` };
    },
  },
  hints: [
    "First the size: $F_R = \\tfrac{1}{2}(w_F + w_B)(4) = 6000$ N, so $w_F + w_B = 3000$ N/m.",
    "The axle is in front of the middle (2 m), so the load must be deeper at the front.",
    "Split it into a rectangle ($w_B$ all along, at 2 m) and a triangle ($w_F - w_B$, at $\\tfrac{1}{3}(4)$ m from the front). Their moments about O must add up to $6000 \\times 1.6$ N·m.",
  ],
  explanation:
    "The resultant of a trapezoidal load is found by splitting it: a rectangle (at its middle) plus a triangle (⅓ from its tall end). " +
    "Two targets — the size and the position — fix the two end values: $w_F = 2400$ N/m and $w_B = 600$ N/m.",
};

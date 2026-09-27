// Unit 6.2, stage 3 — build: drill the hole in the right place so the plate balances on a pin.
// Plate 4 × 2 (8 m², (2, 1)); hole r = 0.6 m at (x_h, 1): A_h = π(0.36) = 1.131 m², A = 6.869 m².
//   x̄ = (16 − 1.131 x_h)/6.869.  Balanced when x̄ = p:  x_h = (16 − 6.869 p)/1.131.
//   p = 1.80 → x_h = 3.215 m;  p = 1.85 → 2.911 m;  p = 1.90 → 2.607 m (all inside the plate: x_h ≤ 3.4).
// x̄ changes 0.165 m per metre of x_h, so ±0.02 m is ±0.12 m of slider: a 0.05 m step always fits.
// Other plate heights h (1.8 … 2.2 m; the hole stays at y = 1): x_h = (8h − p(4h − 1.131))/1.131,
//   from 2.53 m (h = 1.8, p = 1.9) to 3.36 m (h = 2.2, p = 1.8 — the slider's 3.35 is 0.0015 m off: fine).
// Start: x_h = 2 → x̄ = 2 m, at least 0.1 m right of the pin.

const PIN_TOL = 0.02; // m

export default {
  id: "holes/3-build",
  challenge: "build",
  solver: "statics.centroid",
  title: "Drill to Balance",
  mission: "Choose where to drill the hole so the plate balances on the pin.",
  instructions:
    "A 4 m wide plate rests on a single pin, left of its middle — so it tips. Drilling a 0.6 m-radius hole takes material away and moves the centroid. " +
    "Slide the hole until the centroid is right above the pin. Work out the plate's net area and $\\Sigma \\tilde{x} A$ for YOUR hole on paper, then press **Test**.",
  setup: {
    parts: [{ id: "1", shape: "rect", at: [0, 0], w: 4, h: 2 }, { id: "2", shape: "circle", at: [2, 1], r: 0.6, hole: true }],
    pivot: 1.85,
    balanceTolerance: PIN_TOL,
  },
  view: { xmin: -1.2, xmax: 4.8, ymin: -1.8, ymax: 2.6 },
  vary: [{ path: "pivot", min: 1.8, max: 1.9, step: 0.01 }, { path: "parts.0.h", values: [1.8, 1.9, 2, 2.1, 2.2] }],
  editable: [{ path: "parts.1.at.0", label: "Hole position (x)", min: 0.8, max: 3.35, step: 0.05, unit: "m" }],
  goal: {
    text: `The plate's centroid is right above the pin (within **${PIN_TOL} m**): it balances.`,
    predict: [{ quantity: "A", precision: 0.01 }, { quantity: "Qy", precision: 0.01 }],
    check(result, setup) {
      const off = result.values.off;
      if (Math.abs(off) > PIN_TOL + 1e-9) {
        return { ok: false, message: `The centroid is ${Math.abs(off).toFixed(2)} m ${off > 0 ? "right" : "left"} of the pin: the plate tips ${off > 0 ? "clockwise" : "counterclockwise"}. Move the hole ${off > 0 ? "right (the centroid moves away from it)" : "left"}.` };
      }
      return { ok: true, message: `x̄ = ${result.values.xbar.toFixed(3)} m — right above the pin at ${setup.pivot.toFixed(2)} m. It balances.` };
    },
  },
  hints: [
    "Net area: $A = 4h - \\pi (0.6)^2$ — the hole's area is taken away.",
    "$\\Sigma \\tilde{x} A = (2)(4h) - x_h\\,\\pi(0.6)^2$: the hole's first moment is subtracted too.",
    "The centroid moves AWAY from the hole. To pull it left onto the pin, drill the hole on the right.",
  ],
  explanation:
    "The pin is left of the plate's middle, so material must come off the right. The hole's negative area pulls the centroid away from itself: " +
    "$\\bar{x} = (\\tilde{x}_1 A_1 - x_h A_h)/(A_1 - A_h)$, and it balances when that equals the pin's position.",
};

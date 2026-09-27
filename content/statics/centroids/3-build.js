// Unit 7.1, stage 3 — build: size a sign so it balances on a pin.
// The sign: a board 1 m tall and L long from O (part 1), with a triangular point on its
// left (part 2: right angle at O, legs 1 m to the LEFT and 1 m up → centroid (−1/3, 1/3)).
//   A = L + 0.5;  Σx̃A = L²/2 − 1/6;  x̄ = (L²/2 − 1/6)/(L + 0.5)
// It balances when x̄ = p (the pin), within 0.02 m:  L² − 2pL − (p + 1/3) = 0 → L = p + √(p² + p + 1/3).
//   p = 1.2: L = 2.622 → L = 2.60 or 2.65 m (x̄ = 1.189, 1.214);  p = 1.0: L = 2.528 → 2.50 or 2.55 m;
//   p = 1.6: L = 3.422 → 3.40 or 3.45 m.  x̄ changes about 0.5 m per metre of L, so a 0.05 m step always has a fit.

const PIN_TOL = 0.02; // m

export default {
  id: "centroids/3-build",
  challenge: "build",
  solver: "statics.centroid",
  title: "Balance the Sign",
  mission: "Choose the board's length so the sign balances on the pin.",
  instructions:
    "A cut-out sign — a board with a pointed end on its left — must balance on a single pin. Slide the board's length until its centroid is right above the pin. " +
    "Work out the sign's total area and $\\Sigma \\tilde{x} A$ for YOUR length on paper, then press **Test**.",
  setup: {
    parts: [{ id: "1", shape: "rect", at: [0, 0], w: 1.5, h: 1 }, { id: "2", shape: "tri", at: [0, 0], w: -1, h: 1 }],
    pivot: 1.2,
    balanceTolerance: PIN_TOL,
  },
  view: { xmin: -2, xmax: 5, ymin: -1.8, ymax: 2.6 },
  vary: [{ path: "pivot", min: 1, max: 1.6, step: 0.01 }],
  editable: [{ path: "parts.0.w", label: "Board length", min: 1, max: 4, step: 0.05, unit: "m" }],
  goal: {
    text: `The sign's centroid is right above the pin (within **${PIN_TOL} m**): it balances.`,
    predict: [{ quantity: "A", precision: 0.01 }, { quantity: "Qy", precision: 0.01 }],
    check(result, setup) {
      const off = result.values.off;
      if (Math.abs(off) > PIN_TOL + 1e-9) {
        return { ok: false, message: `The centroid is ${Math.abs(off).toFixed(2)} m ${off > 0 ? "right" : "left"} of the pin: the sign tips ${off > 0 ? "clockwise" : "counterclockwise"}. Make the board ${off > 0 ? "shorter" : "longer"}.` };
      }
      return { ok: true, message: `x̄ = ${result.values.xbar.toFixed(3)} m — right above the pin at ${setup.pivot.toFixed(2)} m. It balances.` };
    },
  },
  hints: [
    "The board: $A_1 = L \\times 1$, centroid at $L/2$. The point: $A_2 = \\tfrac{1}{2}(1)(1)$, centroid ⅓ m LEFT of O: $\\tilde{x}_2 = -\\tfrac{1}{3}$ m.",
    "$\\Sigma \\tilde{x} A = \\tfrac{L}{2}\\cdot L + (-\\tfrac{1}{3})(0.5)$ — the point's term is negative (it's left of O).",
    "Balanced when $\\bar{x} = \\Sigma \\tilde{x} A / \\Sigma A$ equals the pin's position.",
  ],
  explanation:
    "A body balances on a pin when its centroid (its centre of gravity, for a uniform plate) is straight above it — then its weight has no moment about the pin. " +
    "The point on the left pulls the centroid left (its $\\tilde{x}$ is negative), so the board must reach further right to bring the centroid over the pin.",
};

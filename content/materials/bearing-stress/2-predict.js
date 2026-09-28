// Bearing stress, stage 2 — predict: predict projected bearing area and average bearing stress.
// Hand check: P = 36 kN, t = 12 mm, d = 20 mm.
// A_b = t · d = 12 · 20 = 240 mm².
// σ_b = 36 000 N / 240 mm² = 150.0 MPa.

export default {
  id: "bearing-stress/2-predict",
  challenge: "predict",
  solver: "materials.bearingStress",
  title: "Predicting Bearing Stress",
  mission: "Predict the projected contact area and average bearing stress in a pinned plate connection.",
  instructions:
    "A steel bar of thickness $t$ is fastened to a bracket by a cylindrical pin of diameter $d$. " +
    "A tensile load $P$ pulls the bar, pressing the pin against the cylindrical hole in the plate.\n\n" +
    "Predict the **projected bearing area** $A_b$ (in $\\text{mm}^2$) and the **average bearing stress** $\\sigma_b$ (in MPa), then press **Test**.",
  setup: {
    joint: { plateThickness: 12, pinDiameter: 20 },
    load: { P: 36 },
  },
  vary: [
    { path: "load.P", values: [24, 30, 36, 42, 48, 54, 60, 72] },
    { path: "joint.plateThickness", values: [8, 10, 12, 14, 15, 16, 18, 20] },
  ],
  ask: [
    { quantity: "A_b", precision: 0.1 },
    { quantity: "sigma_b", precision: 0.1 },
  ],
  hints: [
    "Projected bearing area is the rectangle $A_b = t \\cdot d$, not the curved half-cylinder area.",
    "Convert load from kN to N ($1\\text{ kN} = 1000\\text{ N}$) before dividing by area in $\\text{mm}^2$.",
    "Average bearing stress: $\\sigma_b = \\frac{P}{A_b} = \\frac{P}{t \\cdot d}$. With $P$ in N and $A_b$ in $\\text{mm}^2$, $\\sigma_b$ is directly in MPa.",
  ],
  // (Numbers change between versions: the working itself is under the equations after Test.)
  explanation:
    "The projected contact area is the rectangle the pin's diameter $d$ wide and the plate's thickness $t$ high: $A_b = t \\cdot d$. " +
    "The bearing stress is the load in newtons divided by it: $\\sigma_b = P/A_b$. " +
    "For example, a 12 mm plate on a 20 mm pin: $A_b = 240\\,\\text{mm}^2$, and 36 kN gives $\\sigma_b = 150.0\\,\\text{MPa}$.",
};

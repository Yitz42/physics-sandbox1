// Direct shear, stage 2 — predict: predict shear force, pin area, and shear stress in double shear.
// Hand check: P = 36 kN, d = 18 mm, double shear (n = 2).
// V = 36 / 2 = 18 kN = 18,000 N.
// A = (π/4)(18)² = 254.47 mm².
// τ = 18,000 / 254.47 = 70.73 MPa.

export default {
  id: "shear-stress/2-predict",
  challenge: "predict",
  solver: "materials.shearStress",
  title: "Clevis Pin Shear",
  mission: "Predict the shear force per plane, pin cross-sectional area, and average shear stress.",
  instructions:
    "A clevis connection carries a tensile load $P$. The pin connects three plates, putting it into **double shear** ($n = 2$).\n\n" +
    "Predict the shear force $V$ acting on each cross-section (in kN), the pin area $A$ (in $\\text{mm}^2$), and the average shear stress $\\tau$ (in MPa), then press **Test**.",
  setup: {
    joint: { type: "clevis", planes: 2, pinDiameter: 18 },
    load: { P: 36 },
  },
  vary: [
    { path: "load.P", values: [20, 24, 30, 36, 42, 48, 54, 60] },
    { path: "joint.pinDiameter", values: [14, 16, 18, 20, 22, 24, 26, 28] },
  ],
  ask: [
    { quantity: "V", precision: 0.1 },
    { quantity: "A", precision: 0.1 },
    { quantity: "tau", precision: 0.1 },
  ],
  hints: [
    "Double shear means two shear planes share the load equally: $V = P / 2$.",
    "Area of the pin: $A = \\frac{\\pi}{4} d^2$. With diameter in mm, area comes out directly in $\\text{mm}^2$.",
    "To find shear stress $\\tau = V / A$: convert $V$ from kN to N ($1\\text{ kN} = 1000\\text{ N}$) and divide by area in $\\text{mm}^2$ ($1\\text{ N/mm}^2 = 1\\text{ MPa}$).",
  ],
  explanation:
    "Because the pin is in double shear, the applied tension splits equally across two cut surfaces: " +
    "$V = \\frac{P}{2} = \\frac{36\\,\\text{kN}}{2} = 18\\,\\text{kN} = 18\\,000\\,\\text{N}$. " +
    "The pin area is $A = \\frac{\\pi}{4}(18\\,\\text{mm})^2 = 254.5\\,\\text{mm}^2$. " +
    "The shear stress is $\\tau = \\frac{18\\,000\\,\\text{N}}{254.5\\,\\text{mm}^2} = 70.7\\,\\text{MPa}$.",
};

// Normal stress, stage 2 — predict: calculate cross-sectional area and normal stress.
// Hand check (default numbers): d = 20 mm → A = (π/4)(20)² = 314.16 mm².
// P = 30 kN = 30,000 N → σ = 30,000 / 314.16 = 95.49 MPa (tension).

export default {
  id: "normal-stress/2-predict",
  challenge: "predict",
  solver: "materials.axialStress",
  title: "Tie Rod Stress",
  mission: "Predict the cross-sectional area and normal stress in a steel tie rod.",
  instructions:
    "A solid cylindrical tie rod carries an axial tensile load $P$ as shown in the diagram.\n\n" +
    "Predict the cross-sectional area $A$ (in $\\text{mm}^2$) and the average normal stress $\\sigma$ (in MPa), then press **Test**.",
  setup: {
    bar: { shape: "circle", diameter: 20, length: 1.5, material: "Steel" },
    load: { P: 30 },
    view3d: { yaw: 34, pitch: 20 },
  },
  toggles: [
    {
      key: "viewMode",
      default: "2d",
      options: [
        { label: "2D View", value: "2d" },
        { label: "3D View", value: "3d" },
      ],
    },
  ],
  vary: [
    { path: "bar.diameter", values: [15, 18, 20, 24, 28, 32, 36, 40] },
    { path: "load.P", values: [15, 20, 25, 30, 35, 40, 50, 60] },
  ],
  ask: [
    { quantity: "A", min: 0, precision: 0.1 },
    { quantity: "sigma", precision: 0.1 },
  ],
  hints: [
    "The rod is a solid circle: $A = \\frac{\\pi}{4} d^2$. With $d$ in mm, $A$ comes out directly in $\\text{mm}^2$.",
    "Convert load $P$ from kN to N: $P\\,\\text{(N)} = P\\,\\text{(kN)} \\times 1000$.",
    "Convenient units: $1\\,\\text{MPa} = 1\\,\\text{N/mm}^2$. Divide force in newtons by area in $\\text{mm}^2$: $\\sigma = P / A$.",
  ],
  // (Numbers change between versions: the working itself is under the equations after Test.)
  explanation:
    "First find the cross-sectional area, $A = \\frac{\\pi}{4} d^2$ (in $\\text{mm}^2$ with d in mm). " +
    "Then divide the force in newtons by that area: $\\sigma = P/A$. For example, $d = 20\\,\\text{mm}$ gives $A = 314.2\\,\\text{mm}^2$, and 30 kN gives $\\sigma = 30\\,000/314.2 = 95.5\\,\\text{MPa}$. " +
    "Because $1\\,\\text{N/mm}^2 = 10^6\\,\\text{N/m}^2 = 1\\,\\text{MPa}$, working in newtons and millimetres gives megapascals automatically!",
};

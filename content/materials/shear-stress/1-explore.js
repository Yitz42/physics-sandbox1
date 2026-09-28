// Direct shear, stage 1 — explore: toggle single vs double shear, adjust load and pin size.

export default {
  id: "shear-stress/1-explore",
  challenge: "explore",
  solver: "materials.shearStress",
  title: "Cutting Across",
  mission: "Explore how load, pin diameter, and shear planes determine the average shear stress.",
  instructions:
    "An axial load $P$ tries to slice the connecting pin across its cross-section. The internal cutting force is **shear force** $V$.\n\n" +
    "In **single shear**, one cross-section resists the whole load ($V = P$). In **double shear**, two cross-sections share the load ($V = P / 2$).\n\n" +
    "Move the sliders and toggle between single and double shear. Notice how the shear force $V$, area $A$, and shear stress $\\tau = V / A$ update.",
  setup: {
    joint: { type: "lap", planes: 1, pinDiameter: 20 },
    load: { P: 30 },
  },
  // Predict first (as in statics, owner 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**Move the same pin from a single-shear joint to a double-shear clevis. The shear stress in it…**",
    options: [
      { text: "halves", correct: true },
      { text: "doubles", feedback: "Two cut planes SHARE the load: each carries only half of it." },
      { text: "stays the same", feedback: "In double shear the load is split between two cross-sections, $V = P/2$." },
    ],
    explain: "Double shear: two planes each carry $V = P/2$, so $\\tau = V/A$ halves.",
  },
  toggles: [
    {
      key: "joint.planes",
      default: 1,
      options: [
        { label: "Single Shear (n = 1 plane)", value: 1 },
        { label: "Double Shear (n = 2 planes)", value: 2 },
      ],
    },
  ],
  editable: [
    { path: "load.P", label: "Tensile load P", min: 10, max: 80, step: 5, unit: "kN" },
    { path: "joint.pinDiameter", label: "Pin diameter d", min: 12, max: 36, step: 1, unit: "mm" },
  ],
  tasks: [
    { text: "Make the single shear stress exceed 120 MPa by increasing the load or reducing the pin diameter.", check: (v) => v.n === 1 && v.tau > 120 },
    { text: "Switch to double shear with the same load and watch the stress cut in half.", check: (v) => v.n === 2 && v.tau > 0 },
    { text: "In double shear with P ≥ 50 kN, keep the stress below 60 MPa with a thicker pin.", check: (v) => v.n === 2 && v.P >= 50 && v.tau < 60 },
  ],
  hints: [
    "Shear stress is shear force per area: $\\tau = V / A$.",
    "In single shear, $V = P$. In double shear, the load splits equally between two planes: $V = P / 2$.",
    "Area grows with the square of diameter: $A = \\frac{\\pi}{4} d^2$. A thicker pin drops the stress rapidly.",
  ],
  explanation:
    "Shear stress $\\tau$ acts parallel to the cut plane, tending to slice the pin. " +
    "Double shear is one of the most effective techniques in structural engineering: by sharing load across two cross-sections, it halves the required shear force on each plane ($V = P / 2$) and allows much lighter pins.",
};

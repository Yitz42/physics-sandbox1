// Normal stress, stage 1 — explore: change the axial load and bar diameter; watch the stress.

export default {
  id: "normal-stress/1-explore",
  challenge: "explore",
  solver: "materials.axialStress",
  title: "Pull and Squash",
  mission: "Change the axial load and bar diameter and watch how normal stress changes.",
  instructions:
    "An axial force $P$ acts along the bar's centerline. The force is shared across the cross-sectional area $A$, creating **normal stress**: $\\sigma = P / A$.\n\n" +
    "Move the sliders to change the load $P$ and diameter $d$. Watch how the area $A$ and the stress $\\sigma$ update in the equations below.",
  setup: {
    bar: { shape: "circle", diameter: 25, length: 2.0, material: "Structural Steel" },
    load: { P: 40 },
    view3d: { yaw: 34, pitch: 20 },
  },
  // Predict first (as in statics, owner 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**Double the bar's diameter, same load. The stress…**",
    options: [
      { text: "drops to a quarter", correct: true },
      { text: "halves", feedback: "The area goes with the diameter SQUARED: twice the diameter is four times the area." },
      { text: "stays the same", feedback: "The load is shared by more material, so each square millimetre carries less." },
    ],
    explain: "$A = \\frac{\\pi}{4} d^2$: twice the diameter is 4 times the area, so $\\sigma = P/A$ drops to a quarter.",
  },
  toggles: [
    {
      key: "viewMode",
      default: "2d",
      options: [
        { label: "2D View (Elevation + Profile)", value: "2d" },
        { label: "3D Perspective View", value: "3d" },
      ],
    },
  ],
  editable: [
    { path: "load.P", label: "Axial load P", min: -80, max: 80, step: 5, unit: "kN" },
    { path: "bar.diameter", label: "Diameter d", min: 10, max: 50, step: 1, unit: "mm" },
  ],
  tasks: [
    { text: "Make the tensile stress exceed 100 MPa.", check: (v) => v.sigma > 100 },
    { text: "Keep the load above 50 kN, but reduce the stress below 40 MPa by making the bar thicker.", check: (v) => v.P >= 50 && v.sigma < 40 },
    { text: "Change the load to put the bar into compression (negative stress, σ < 0).", check: (v) => v.sigma < -10 },
  ],
  hints: [
    "Stress is force divided by area: $\\sigma = P / A$. To increase stress, increase load $P$ or decrease diameter $d$.",
    "Area grows with the SQUARE of diameter: $A = \\frac{\\pi}{4} d^2$. Doubling $d$ quadruples $A$ and cuts stress to one fourth.",
    "A negative load $P < 0$ pushes into the bar, putting it into compression ($\\sigma < 0$).",
  ],
  explanation:
    "Normal stress measures the intensity of internal force: $\\sigma = P / A$. A positive stress is tension (pulling apart); a negative stress is compression (pushing together). " +
    "Notice that stress does NOT depend on how long the bar is — only on the load and the cross-sectional area.",
};

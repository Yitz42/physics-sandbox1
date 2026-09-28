// Normal stress, stage 6 — solve: full textbook problem on an axially loaded rectangular strut.
// Hand check (default numbers): b = 40 mm, h = 12 mm → A = 40 × 12 = 480 mm².
// P = -72 kN = -72,000 N (compression) → σ = -72,000 / 480 = -150.0 MPa.

export default {
  id: "normal-stress/6-solve",
  challenge: "solve",
  solver: "materials.axialStress",
  title: "The Support Strut",
  mission: "Find the cross-sectional area and compressive normal stress in a rectangular strut.",
  instructions:
    "A machine support strut with a rectangular cross-section is subjected to an axial compressive load $P$ as shown in the diagram.\n\n" +
    "Work through the complete solution: choose the governing relations, identify the stress type, then calculate the cross-sectional area $A$ and the normal stress $\\sigma$.",
  setup: {
    bar: { shape: "rectangle", width: 40, height: 12, length: 1.6, material: "Aluminum" },
    load: { P: -72 },
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
    { path: "bar.width", values: [30, 40, 50, 60] },
    { path: "bar.height", values: [10, 12, 15, 20] },
    { path: "load.P", values: [-45, -60, -72, -90] },
  ],
  solve: {
    steps: ["choices", "answer"],
    choicesName: "Formulas and stress type",
    choices: [
      {
        title: "For a rectangular cross-section with width b and thickness h, the area is…",
        options: [
          { tex: "A = b \\cdot h", correct: true },
          { tex: "A = 2(b + h)", kind: "concept", feedback: "That is the perimeter around the cross-section, not the surface area." },
          { tex: "A = \\tfrac{\\pi}{4} b \\cdot h", kind: "concept", feedback: "The factor $\\pi/4$ belongs to an ellipse or circle, not a rectangle." },
        ],
      },
      {
        title: "Because the axial load pushes inward against the strut, the stress is…",
        options: [
          { tex: "\\text{compressive, } \\sigma < 0", correct: true },
          { tex: "\\text{tensile, } \\sigma > 0", kind: "sign", feedback: "Tensile loads pull away from the body. Pushing into the body is compression." },
          { tex: "\\text{pure shear, } \\tau", kind: "concept", feedback: "Axial loads act perpendicular to the cross-section, creating normal stress $\\sigma$, not shear stress $\\tau$." },
        ],
      },
    ],
    choicesDone: "Area formula and compressive sign established. Now calculate the numerical answers.",
  },
  ask: [
    { quantity: "A", min: 0, precision: 0.1 },
    { quantity: "sigma", precision: 0.1 },
  ],
  hints: [
    "Rectangle area: $A = b \\cdot h$, with b and h from the picture, in $\\text{mm}^2$.",
    "Convert the force to newtons: multiply kN by 1000, keeping its minus sign (compression).",
    "Calculate stress: $\\sigma = P / A$. Since $P$ is compressive (negative), $\\sigma$ is negative.",
  ],
  explanation:
    "First the cross-sectional area, $A = b \\cdot h$. Then the load in newtons, and $\\sigma = P/A$. " +
    "For example, a 40 × 12 mm strut ($A = 480\\,\\text{mm}^2$) under 72 kN of compression carries $\\sigma = -72\\,000/480 = -150.0\\,\\text{MPa}$. " +
    "The negative sign indicates compression.",
};

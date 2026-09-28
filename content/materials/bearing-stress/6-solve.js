// Bearing stress, stage 6 — solve: complete textbook problem on a pinned structural joint.
// Hand check (default numbers): P = 55 kN, t = 14 mm, d = 24 mm.
// A_b = t · d = 14 · 24 = 336.0 mm².
// σ_b = 55 000 / 336.0 = 163.69 MPa.

export default {
  id: "bearing-stress/6-solve",
  challenge: "solve",
  solver: "materials.bearingStress",
  title: "The Gusset Plate Pin",
  mission: "Determine the projected contact area and average bearing stress in a pinned plate connection.",
  instructions:
    "A steel truss tension member of thickness $t$ is attached to a gusset plate with a high-strength cylindrical pin of diameter $d$. " +
    "The connection carries the axial tensile load $P$ shown (the sizes are in the picture).\n\n" +
    "Work through the complete solution: identify the appropriate bearing area formula, and calculate the projected bearing area $A_b$ and the average bearing stress $\\sigma_b$ acting on the plate.",
  setup: {
    joint: { plateThickness: 14, pinDiameter: 24 },
    load: { P: 55 },
  },
  vary: [
    { path: "load.P", values: [35, 42, 49, 55, 60, 65, 70, 80] },
    { path: "joint.plateThickness", values: [10, 12, 14, 15, 16, 18, 20, 22] },
  ],
  solve: {
    steps: ["choices", "answer"],
    choicesName: "Bearing area and governing formulas",
    choices: [
      {
        title: "The contact area used to evaluate bearing stress between the cylindrical pin and plate hole is…",
        options: [
          {
            tex: "A_b = t \\cdot d \\text{ (the rectangular projected area)}",
            correct: true,
          },
          {
            tex: "A = \\tfrac{\\pi}{2} d \\cdot t \\text{ (the curved semicircular surface)}",
            kind: "geometry",
            feedback: "The resultant in the load direction equals the average stress on the projected rectangular area $t \\cdot d$.",
          },
          {
            tex: "A = \\tfrac{\\pi}{4} d^2 \\text{ (the circular pin cross-section)}",
            kind: "concept",
            feedback: "$\\frac{\\pi}{4} d^2$ is the shear cross-section of the pin, not the contact area against the plate.",
          },
        ],
      },
      {
        title: "The average bearing stress in the plate is computed as…",
        options: [
          {
            tex: "\\sigma_b = \\dfrac{P}{A_b} = \\dfrac{P}{t \\cdot d}",
            correct: true,
          },
          {
            tex: "\\sigma_b = \\dfrac{P}{\\tfrac{\\pi}{4} d^2}",
            kind: "concept",
            feedback: "That calculates the shear stress in the pin, not bearing stress on the hole wall.",
          },
          {
            tex: "\\sigma_b = \\dfrac{P \\cdot t}{d}",
            kind: "algebra",
            feedback: "Bearing stress is force divided by area: $\\sigma_b = P / (t \\cdot d)$.",
          },
        ],
      },
    ],
    choicesDone: "Contact geometry and formulas established. Now compute the numerical answers.",
  },
  ask: [
    { quantity: "A_b", precision: 0.1 },
    { quantity: "sigma_b", precision: 0.1 },
  ],
  hints: [
    "Projected bearing area: $A_b = t \\cdot d$.",
    "Convert the load from kN to N: multiply by 1000.",
    "Calculate bearing stress: $\\sigma_b = \\frac{P}{A_b}$ in MPa ($1\\text{ N/mm}^2 = 1\\text{ MPa}$).",
  ],
  explanation:
    "First the projected bearing area, $A_b = t \\cdot d$. Next the load in newtons. Then the average bearing stress, $\\sigma_b = P/A_b$. " +
    "For example, a 14 mm member on a 24 mm pin under 55 kN: $A_b = 336.0\\,\\text{mm}^2$ and $\\sigma_b = 163.7\\,\\text{MPa}$.",
};

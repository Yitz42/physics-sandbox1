// Direct shear, stage 6 — solve: complete textbook problem on a double-shear clevis connection.
// Hand check (default numbers): P = 50 kN, d = 22 mm, double shear (n = 2).
// V = 50 / 2 = 25 kN = 25,000 N.
// A = (π/4)(22)² = 380.13 mm².
// τ = 25,000 / 380.13 = 65.77 MPa.

export default {
  id: "shear-stress/6-solve",
  challenge: "solve",
  solver: "materials.shearStress",
  title: "The Clevis Pin",
  mission: "Determine the shear force per plane, pin area, and average shear stress in a double-shear clevis joint.",
  instructions:
    "A steel clevis joint connects a tension rod to a fixed support bracket using a cylindrical pin. " +
    "The connection carries a tensile load $P = 50\\,\\text{kN}$, and the pin has a diameter $d = 22\\,\\text{mm}$.\n\n" +
    "Work through the complete solution: determine the number of shear planes, select the governing formulas, and compute the shear force $V$, pin area $A$, and shear stress $\\tau$.",
  setup: {
    joint: { type: "clevis", planes: 2, pinDiameter: 22 },
    load: { P: 50 },
  },
  vary: [
    { path: "load.P", values: [30, 40, 50, 60, 70, 75, 80, 90] },
    { path: "joint.pinDiameter", values: [16, 18, 20, 22, 24, 25, 28, 30] },
  ],
  solve: {
    steps: ["choices", "answer"],
    choicesName: "Shear planes and governing formulas",
    choices: [
      {
        title: "Because the pin passes through the central rod and both sides of the bracket, the joint is in…",
        options: [
          { tex: "\\text{double shear, with } V = \\tfrac{P}{2}", correct: true },
          { tex: "\\text{single shear, with } V = P", kind: "concept", feedback: "The bracket holds the pin on BOTH sides of the rod, so the load is shared across TWO shear planes." },
          { tex: "\\text{pure normal tension, with } \\sigma = \\tfrac{P}{A}", kind: "concept", feedback: "The load tries to slice across the pin transversely, creating shear stress, not normal tension." },
        ],
      },
      {
        title: "The average shear stress acting across each circular cross-section is given by…",
        options: [
          { tex: "\\tau = \\dfrac{V}{A} = \\dfrac{P / 2}{\\tfrac{\\pi}{4} d^2}", correct: true },
          { tex: "\\tau = \\dfrac{P}{\\pi d^2}", kind: "concept", feedback: "The cross-sectional area of a circle is (π / 4) d², and the force on each plane is P / 2." },
          { tex: "\\tau = \\dfrac{P \\cdot d}{2A}", kind: "concept", feedback: "Shear stress is shear force divided by area: τ = V / A." },
        ],
      },
    ],
    choicesDone: "Joint mechanics and formulas established. Now calculate the numerical answers.",
  },
  ask: [
    { quantity: "V", precision: 0.1 },
    { quantity: "A", precision: 0.1 },
    { quantity: "tau", precision: 0.1 },
  ],
  hints: [
    "First find the shear force per plane: $V = P / 2$.",
    "Calculate pin area: $A = \\frac{\\pi}{4} d^2$.",
    "Convert $V$ to newtons ($1\\text{ kN} = 1000\\text{ N}$) and divide by $A$ in $\\text{mm}^2$ to get $\\tau$ in MPa.",
  ],
  explanation:
    "First determine the shear force per plane: $V = \\frac{P}{2} = \\frac{50\\,\\text{kN}}{2} = 25\\,\\text{kN} = 25\\,000\\,\\text{N}$. " +
    "Next, compute the pin cross-sectional area: $A = \\frac{\\pi}{4}(22\\,\\text{mm})^2 = 380.1\\,\\text{mm}^2$. " +
    "Finally, calculate the average shear stress: $\\tau = \\frac{V}{A} = \\frac{25\\,000\\,\\text{N}}{380.1\\,\\text{mm}^2} = 65.8\\,\\text{MPa}$.",
};

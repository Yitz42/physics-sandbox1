// Bearing stress, stage 1 — explore: adjust load, plate thickness, and pin diameter.

export default {
  id: "bearing-stress/1-explore",
  challenge: "explore",
  solver: "materials.bearingStress",
  title: "Contact Pressure",
  mission: "Explore how load, plate thickness, and pin diameter govern the projected bearing stress.",
  instructions:
    "When a pin pushes against the side of a hole in a plate, it creates a compressive contact pressure known as **bearing stress** $\\sigma_b$.\n\n" +
    "Because the curved contact surface distributes pressure unevenly, engineering practice uses the **projected contact area**: a flat rectangle of width $d$ (pin diameter) and height $t$ (plate thickness), so $A_b = t \\cdot d$.\n\n" +
    "Adjust the sliders below to see how load $P$, plate thickness $t$, and pin diameter $d$ change the projected area $A_b$ and average bearing stress $\\sigma_b = P / A_b$.",
  setup: {
    joint: { plateThickness: 10, pinDiameter: 18 },
    load: { P: 25 },
  },
  // Predict first (as in statics, owner 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**Double the plate's thickness, same load and pin. The bearing stress…**",
    options: [
      { text: "halves", correct: true },
      { text: "drops to a quarter", feedback: "The bearing area $t \\cdot d$ grows in proportion to t — nothing is squared here." },
      { text: "stays the same", feedback: "A thicker plate gives the pin more to press against: more area, less stress." },
    ],
    explain: "$A_b = t \\cdot d$: twice the thickness is twice the area, so $\\sigma_b = P/A_b$ halves.",
  },
  editable: [
    { path: "load.P", label: "Bearing load P", min: 10, max: 80, step: 5, unit: "kN" },
    { path: "joint.plateThickness", label: "Plate thickness t", min: 6, max: 25, step: 1, unit: "mm" },
    { path: "joint.pinDiameter", label: "Pin diameter d", min: 12, max: 32, step: 1, unit: "mm" },
  ],
  tasks: [
    {
      text: "Increase the load P ≥ 45 kN while keeping plate thickness t = 10 mm to push bearing stress above 200 MPa.",
      check: (v) => v.P >= 45 && v.t <= 10 && v.sigma_b > 200,
    },
    {
      text: "Thicken the plate to t ≥ 20 mm to bring bearing stress down below 90 MPa.",
      check: (v) => v.t >= 20 && v.sigma_b < 90,
    },
    {
      text: "With a heavy load P ≥ 50 kN, choose t and d so that bearing stress stays below 100 MPa.",
      check: (v) => v.P >= 50 && v.sigma_b < 100,
    },
  ],
  hints: [
    "Projected bearing area is a simple rectangle: $A_b = t \\cdot d$.",
    "Average bearing stress is force per projected area: $\\sigma_b = P / A_b$.",
    "Increasing either plate thickness $t$ or pin diameter $d$ expands the contact area and drops the bearing stress.",
  ],
  explanation:
    "Bearing stress $\\sigma_b$ is a compressive contact stress acting between the pin and the inner wall of the hole. " +
    "Instead of integrating the complex radial pressure profile around the half-circle, structural codes use the projected rectangle $A_b = t \\cdot d$. " +
    "Both the plate thickness $t$ and pin diameter $d$ contribute linearly to the bearing area, so doubling either parameter cuts the bearing stress in half.",
};

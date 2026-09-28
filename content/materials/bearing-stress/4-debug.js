// Bearing stress, stage 4 — debug: find the mistake in a student's bearing stress calculation.

export default {
  id: "bearing-stress/4-debug",
  challenge: "debug",
  solver: "materials.bearingStress",
  title: "Projected Area Slip",
  mission: "Find the mistake in a student's bearing stress calculation for a pinned plate connection.",
  instructions:
    "A steel bracket carries a tensile load $P = 40\\,\\text{kN}$ through a pin of diameter $d = 20\\,\\text{mm}$ in a plate of thickness $t = 12\\,\\text{mm}$. " +
    "A student calculated the contact area and bearing stress, but made a mistake on one line.\n\n" +
    "Review each step, click the line where the error begins, and select the correct fix.",
  setup: {
    joint: { plateThickness: 12, pinDiameter: 20 },
    load: { P: 40 },
  },
  debug: {
    view: "steps",
    intro: "The student's solution steps:",
    mutations: [
      { slip: "cylinderArea" },
      { slip: "pinArea" },
      { slip: "noKilo" },
    ],
    notes: {
      "bearing-area": "The bearing area line: check whether the contact area is computed as projected rectangle $A_b = t \\cdot d$.",
      "bearing-stress": "The bearing stress line: check $\\sigma_b = P / A_b$ and unit conversions ($1\\text{ kN} = 1000\\text{ N}$).",
    },
  },
  hints: [
    "Look at the formula used for $A_b$: is it the projected rectangular area $t \\cdot d$, or a curved surface?",
    "Remember: bearing stress is based on the projected rectangle $A_b = t \\cdot d$, NOT the curved half-cylinder $\\frac{\\pi}{2} d t$.",
    "Check the unit conversion: force in kN must be multiplied by 1000 to get newtons before dividing by $\\text{mm}^2$.",
  ],
  explanation:
    "In bearing stress calculations, the curved contact surface of the hole is projected onto a flat plane perpendicular to the load. " +
    "This projected area is a simple rectangle of width $d$ and height $t$: $A_b = t \\cdot d = (12\\,\\text{mm})(20\\,\\text{mm}) = 240\\,\\text{mm}^2$. " +
    "Using the curved half-cylinder area $(\\pi / 2) d t$ or the pin's cross-sectional area $(\\pi / 4) d^2$ are classic student slips.",
};

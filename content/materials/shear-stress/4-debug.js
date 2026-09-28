// Direct shear, stage 4 — debug: find the mistake in a student's double-shear calculation.

export default {
  id: "shear-stress/4-debug",
  challenge: "debug",
  solver: "materials.shearStress",
  title: "Double Shear Oversight",
  mission: "Find the mistake in a student's shear stress calculation for a clevis joint.",
  instructions:
    "A clevis connection carries a tensile load $P = 48\\,\\text{kN}$ with a pin of diameter $d = 20\\,\\text{mm}$ ($n = 2$ shear planes). " +
    "A student calculated the shear force, pin area, and shear stress, but made a mistake on one line.\n\n" +
    "Review each step, click the line where the error begins, and select the correct fix.",
  setup: {
    joint: { type: "clevis", planes: 2, pinDiameter: 20 },
    load: { P: 48 },
  },
  debug: {
    view: "steps",
    intro: "The student's solution steps:",
    mutations: [
      { slip: "forgotDoubleShear" },
      { slip: "noKilo" },
      { slip: "diameterAsRadius" },
    ],
    notes: {
      "shear-force": "The shear force line: check whether single or double shear applies ($V = P$ or $V = P / 2$).",
      "pin-area": "The pin area line: check $A = \\frac{\\pi}{4} d^2$.",
      "shear-stress": "The shear stress line: check $\\tau = V / A$ and unit conversions.",
    },
  },
  hints: [
    "Look at the drawing: the pin connects three plates, which creates two cutting planes (double shear).",
    "In double shear, the load splits: does each plane carry 48 kN or 24 kN?",
    "Check the unit conversions: $1\\,\\text{kN} = 1000\\,\\text{N}$, and $1\\,\\text{N/mm}^2 = 1\\,\\text{MPa}$.",
  ],
  explanation:
    "In double shear, the pin is supported on both sides of the central plate. " +
    "Statics requires the shear force on each cut cross-section to be half the total load: $V = P / 2 = 24\\,\\text{kN}$. " +
    "Forgetting this factor of 2 is one of the most common errors in connection design!",
};

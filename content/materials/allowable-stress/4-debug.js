// Allowable stress, stage 4 — debug: find the mistake in a student's connection capacity calculation.

export default {
  id: "allowable-stress/4-debug",
  challenge: "debug",
  solver: "materials.allowableStress",
  title: "Capacity Calculation Slip",
  mission: "Find the mistake in a student's allowable load calculation for a pinned connection.",
  instructions:
    "An engineer evaluated a clevis connection under tension rod, double-shear pin, and bearing limits. " +
    "A student solved for the individual capacities and overall allowable load, but made a conceptual or calculation error on one line.\n\n" +
    "Review each step, click the line where the error begins, and select the correct fix.",
  setup: {
    rod: { diameter: 22, allowableStress: 120 },
    joint: { planes: 2, pinDiameter: 18, plateThickness: 12, allowableShear: 75, allowableBearing: 180 },
    load: { P: 35 },
  },
  debug: {
    view: "steps",
    intro: "The student's solution steps:",
    mutations: [
      { slip: "tookMaximum" },
      { slip: "forgotDoubleShear" },
      { slip: "noKilo" },
    ],
    notes: {
      "tensile-capacity": "The rod tensile capacity: check $P_{\\text{tension}} = \\sigma_{\\text{allow}} A_{\\text{rod}}$ and unit conversions.",
      "shear-capacity": "The pin shear capacity: check whether single or double shear applies ($n = 1$ or $n = 2$).",
      "bearing-capacity": "The plate bearing capacity: check $P_{\\text{bearing}} = \\sigma_{b,\\text{allow}} (t \\cdot d)$.",
      "allowable-load": "The overall allowable load: check whether the structure is governed by the minimum or maximum limit.",
    },
  },
  hints: [
    "A chain breaks at its weakest link: should the allowable load be the minimum or the maximum of the capacities?",
    "Look at the pin shear line: in double shear, two cross-sections share the load ($P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}}$).",
    "Check unit conversions: stress in MPa times area in $\\text{mm}^2$ gives force in newtons, which must be divided by 1000 to get kN.",
  ],
  explanation:
    "The overall allowable load of an assembly is strictly governed by the smallest allowable load among all possible failure modes: " +
    "$P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$. " +
    "Taking the maximum would mean operating beyond the safe limits of the weaker components, leading to catastrophic failure.",
};

// Normal stress, stage 4 — debug: find the mistake in a student's stress calculation.

export default {
  id: "normal-stress/4-debug",
  challenge: "debug",
  solver: "materials.axialStress",
  title: "Spot the Units Slip",
  mission: "Find the mistake in a student's normal stress calculation.",
  instructions:
    "A solid cylindrical bar of diameter $d = 20\\,\\text{mm}$ carries an axial tensile load $P = 40\\,\\text{kN}$. " +
    "A student calculated the cross-sectional area, converted the load, and found the normal stress. One line is wrong.\n\n" +
    "Compare each line with the physics rules, click the line where the mistake begins, and choose the correct fix.",
  setup: {
    bar: { shape: "circle", diameter: 20, length: 1.5, material: "Steel" },
    load: { P: 40 },
  },
  debug: {
    view: "steps",
    intro: "The student's calculation:",
    mutations: [
      { slip: "diameterAsRadius" },
      { slip: "noKilo" },
      { slip: "perimeter" },
      { slip: "wrongSign" },
    ],
    notes: {
      area: "The area line: check whether $A = \\frac{\\pi}{4} d^2$ was applied correctly.",
      load: "The load line: check the units conversion ($1\\text{ kN} = 1000\\text{ N}$).",
      stress: "The stress line: $\\sigma = P / A$.",
      type: "The stress type: tension (+) or compression (−).",
    },
  },
  hints: [
    "Check the area first: for a round bar with diameter $d = 20\\,\\text{mm}$, is $A = \\frac{\\pi}{4} d^2$ or $\\pi d^2$?",
    "Check the load units: $P = 40\\,\\text{kN}$ must be converted to newtons: $40\\,000\\,\\text{N}$.",
    "Check whether the mistake starts earlier and carries forward to later lines.",
  ],
  explanation:
    "Engineering calculations must be checked step by step. Common traps include using $\\pi d^2$ instead of $\\frac{\\pi}{4} d^2$, " +
    "and forgetting to convert kilonewtons to newtons ($1\\,\\text{kN} = 1000\\,\\text{N}$). Always track your units: $\\text{N} / \\text{mm}^2 = \\text{MPa}$.",
};

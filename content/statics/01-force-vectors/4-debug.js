// Unit 1, stage 4 — debug: a student's resultant equations contain one slip.
// Each new version uses the next mistake in the list (mostly sin/cos swaps,
// the #1 error in this unit, plus a sign error).

export default {
  id: "01-force-vectors/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "Find the Slip",
  mission: "Find and fix the slip in a student's force components.",
  instructions:
    "A student is finding the resultant of $F_1$ and $F_2$. Compare their equations with the picture — look carefully at **which axis each angle is measured from**.",
  setup: {
    analysis: "resultant",
    point: { at: [0, 0], label: "" },
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 300, direction: { angle: 30, from: "+x", toward: "+y" } },
      { id: "F2", symbol: "F_2", magnitude: 200, direction: { angle: 40, from: "+y", toward: "-x" } },
    ],
  },
  vary: [
    { path: "forces.0.magnitude", min: 200, max: 500, step: 50 },
    { path: "forces.0.direction.angle", values: [20, 25, 30, 35, 40] },
    { path: "forces.1.magnitude", min: 150, max: 400, step: 50 },
    { path: "forces.1.direction.angle", values: [25, 30, 35, 40, 50] },
  ],
  debug: {
    view: "equations",
    intro: "Here is the student's work. Exactly one term is wrong.",
    mutations: [
      { kind: "swap", equation: "Rx", term: "F2" },
      { kind: "swap", equation: "Ry", term: "F1" },
      { kind: "sign", equation: "Rx", term: "F2" },
      { kind: "swap", equation: "Ry", term: "F2" },
    ],
    notes: {
      F1: "That term is right in this equation. Remember $F_1$ is measured from the x-axis: $F_1\\cos\\theta$ in x, $F_1\\sin\\theta$ in y.",
      F2: "That term is right in this equation. Remember $F_2$ is measured from the **y**-axis: $F_2\\sin\\theta$ in x, $F_2\\cos\\theta$ in y.",
    },
  },
  hints: [
    "For each force, first ask: which axis is its angle measured from?",
    "$F_2$ is measured from the y-axis, so its **y**-component uses cos and its x-component uses sin.",
    "Then check signs: $F_2$ points up and to the left.",
  ],
  explanation:
    "Always decide sin or cos from the picture: the component along the axis the angle starts from gets cos. " +
    "Here $F_1$ starts from the x-axis ($F_1\\cos$ in x) but $F_2$ starts from the y-axis ($F_2\\cos$ in y). " +
    "A single swapped term changes the resultant a lot, and the error is invisible unless you check each term against the picture.",
};

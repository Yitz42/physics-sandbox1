// Unit 1, stage 4 — debug, in two parts. A student's resultant equations
// contain one slip; each new version uses the next mistake in the list.
//   1. forces given by angles: mostly sin/cos swaps (the #1 error in this
//      unit), plus a sign error;
//   2. forces along cables given by coordinates: the fractions (x_B − x_A)/r
//      swapped, or a sign that doesn't match B − A.

export default {
  id: "01-force-vectors/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "Find the Slip",
  parts: [
    {
      title: "Angles",
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
    },
    {
      title: "Cables from coordinates",
      instructions:
        "Two cables pull on the ring at A. A student found the resultant using the coordinates of A, B and C (in metres). " +
        "Check each fraction against the coordinates: the x-component uses $\\dfrac{x_B - x_A}{r_{AB}}$, and its sign must match which way the cable goes.",
      setup: {
        analysis: "resultant",
        cartesian: true,
        point: { at: [2, 1], label: "A" },
        forces: [
          { id: "T_AB", symbol: "T_{AB}", magnitude: 250, kind: "cable", direction: { points: [[2, 1], [-1, 5]], names: ["A", "B"] } },
          { id: "T_AC", symbol: "T_{AC}", magnitude: 300, kind: "cable", direction: { points: [[2, 1], [6, 4]], names: ["A", "C"] } },
        ],
      },
      vary: [
        { path: "forces.0.magnitude", min: 150, max: 450, step: 25 },
        { path: "forces.1.magnitude", min: 150, max: 450, step: 25 },
        // C: 4 right and 3 up from A, or 3 right and 4 up (both 5 m away).
        { path: "forces.1.direction.points.1", values: [[6, 4], [5, 5]] },
      ],
      debug: {
        view: "equations",
        intro: "Here is the student's work. Exactly one term is wrong.",
        mutations: [
          { kind: "swap", equation: "Rx", term: "T_AB" },
          { kind: "sign", equation: "Ry", term: "T_AC" },
          { kind: "swap", equation: "Ry", term: "T_AC" },
          { kind: "sign", equation: "Rx", term: "T_AB" },
        ],
        notes: {
          T_AB: "That term is right. From A (2, 1) to B (−1, 5): 3 m left and 4 m up, 5 m long — so $-\\tfrac{3}{5}$ in x and $+\\tfrac{4}{5}$ in y.",
          T_AC: "That term is right. Check it: subtract A's coordinates from C's, and divide by the length $r_{AC}$.",
        },
      },
      hints: [
        "Work out each position vector yourself: $\\mathbf{r}_{AB} = (x_B - x_A)\\,\\mathbf{i} + (y_B - y_A)\\,\\mathbf{j}$.",
        "Both cables are 5 m long, so every fraction has 5 on the bottom. Which number goes on top — the change in x or in y?",
        "B is to the LEFT of A, so $T_{AB}$'s x-component must be negative.",
      ],
      explanation:
        "With coordinates there is no angle to get wrong, but two slips are common: putting the change in y where the change in x belongs, " +
        "and signs that don't match the picture. $x_B - x_A$ is negative when B is left of A, and that sign carries straight into the component.",
    },
  ],
  explanation:
    "Always check each term against the picture: which axis the angle is measured from (cos goes there), or which coordinate difference belongs to x and to y — and which way the force points.",
};

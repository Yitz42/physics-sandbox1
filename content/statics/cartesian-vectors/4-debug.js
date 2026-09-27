// Cartesian vectors, stage 4 — debug: a student's resultant of two cables given by
// coordinates has one slip: the fractions (x_B − x_A)/r swapped, or a sign that
// doesn't match B − A. Each new version uses the next mistake in the list.

export default {
  id: "cartesian-vectors/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "Cables from Coordinates",
  mission: "Find the mistake in a student's cable forces worked out from coordinates.",
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
};
